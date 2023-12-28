
const selfClosingTags = new Set<string>([
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr",
	"command",
	"keygen",
	"menuitem",
	"frame"
]);

const reactNamingConventions = new Map<string, string>([
	["className", "class"]
]);

interface RenderProps {
	externalResourcesRoot?: string;
	addDoctype?: boolean;
	convertBrTagsToNewlines?: boolean;
};

abstract class JSXNode {
	abstract render(props?: RenderProps): string;
};

const renderChildren = (children: any[], renderProps?: RenderProps) => {

	const asStrings = children.map(item => {

		if (item instanceof JSXNode)
			return item.render(renderProps);
	
		switch (typeof item) {
			case 'string': return item;
			case 'number': return item.toString();
			case 'object': return JSON.stringify(item);
			case 'boolean': return item ? 'true' : 'false';
			default: return null;
		}
	});

	return asStrings.filter(item => typeof item === 'string').join('');
};

class JSXFragmentNode extends JSXNode {

	children: JSXNode[];

	constructor(children?: JSXNode[]) {
		super();
		this.children = children || [];
	}

	render(renderProps?: RenderProps): string {
		return renderChildren(this.children, renderProps);
	}
};

class JSXTextNode extends JSXNode {

	content: string;

	constructor(text?: string) {
		super();
		this.content = text || '';
	};

	render() {
		return this.content;
	}
};

type JSXElementAttribute = string | boolean | string[] | Record<string, boolean>;

class JSXHTMLNode extends JSXNode {

	children: JSXNode[] | null;
	tagname: string;
	attributes: Record<string, string> = {};

	constructor(tagname: string, attributes?: Record<string, JSXElementAttribute>, children?: JSXNode[]) {

		super();
		this.tagname = tagname.toLowerCase();

		this.children = selfClosingTags.has(this.tagname) ? null : children || [];

		for (const key in attributes) {

			const attrib = attributes[key];
			const applyAttribute = reactNamingConventions.get(key) || key.toLowerCase();
			let applyEntries: string[] = [];

			switch (typeof attrib) {

				case 'object': {

					if (Array.isArray(attrib)) {
						applyEntries = attrib.filter(item => typeof item === 'string' && item?.length);
					} else {
						applyEntries = Object.entries(attrib).filter(item => item[1]).map(item => item[0]);
					}

				} break;

				case 'boolean': {
					if (attrib === true) applyEntries = [''];
				} break;

				case 'string': {
					applyEntries = [attrib];
				} break;
			}

			if (applyEntries.length) {
				this.attributes[applyAttribute] = applyEntries.map(item => item.replaceAll(`"`, `'`)).join(' ');
			}
		}
	}

	render(renderProps?: RenderProps) {

		/**
		 * Check for <br> tag replacement
		 */
		if (this.tagname === 'br' && renderProps?.convertBrTagsToNewlines) {
			return '\r\n';
		}

		/**
		 * Process tag attributes
		 */
		const allAttribs = Object.entries(this.attributes);
		const attribsAsString = allAttribs.length ? (' ' + allAttribs.map(item => `${item[0]}="${item[1]}"`).join(' ')) : '';

		/**
		 * Return void tag
		 */
		if (this.children === null) {
			return `<${this.tagname}${attribsAsString} />`;
		}

		/**
		 * Generate tag with children
		 */
		const tagHTML = `<${this.tagname}${attribsAsString}>${renderChildren(this.children, renderProps)}</${this.tagname}>`;

		/**
		 * Return <html> tag with doctype
		 */
		if (this.tagname === 'html' && renderProps?.addDoctype !== false) {
			return '<!DOCTYPE html>' + tagHTML;
		}

		/**
		 * Return regular tag
		 */
		return tagHTML;
	}
};

declare global {
	namespace JSX {
		interface Element extends JSXNode {}
		interface ElementClass {}
		interface IntrinsicElements {
			[elem: string]: any;
		}
	}
}

export const jsxfactory = {
	Fragment: function (_props: any, children: JSXNode[]) {
		return new JSXFragmentNode(children);
	},
	createElement: function (tag: string | Function, attributes: Record<string, string | boolean>): JSXHTMLNode {

		const children: JSXNode[] = Array.from(arguments).slice(2).map(item => Array.isArray(item) ? item : [item]).flat(2).map(item => typeof item === 'string' ? new JSXTextNode(item) : item);

		if (typeof tag === 'function') {
			let temp = tag(attributes, children);
			return temp;
		}
		else if (typeof tag === 'string') {
			return new JSXHTMLNode(tag, attributes, children);
		}
		
		throw new Error('Unexpected JSX tag type');
	}
};
