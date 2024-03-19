
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

const htmlTagSets = {
	telegram: {
		tags: new Set([
			"b",
			"bold",
			"strong",
			"i",
			"em",
			"u",
			"ins",
			"s",
			"strike",
			"del",
			"span",
			"tg-spoiler",
			"a",
			"tg-emoji",
			"code",
			"pre",
			"blockquote",
			"br" //	this one requires "convertBrTagsToNewlines" to be set to "true"
		])
	}
};

const collapseWhitespaces = (html: string) => html.replace(/[\t ]+/g, ' ').replace(/[\r\n]/g, '');

interface RenderProps {
	addDoctype?: boolean;
	convertBrTagsToNewlines?: boolean;
	minifyHTML?: boolean;
	restrictTagSet?: keyof typeof htmlTagSets;
};

abstract class JSXNode {
	abstract render(props?: RenderProps): string;
};

const renderChildren = (children: any[], renderProps?: RenderProps) => {

	const asStrings: (string | undefined)[] = children.map(item => {

		if (item instanceof JSXNode)
			return item.render(renderProps);

		switch (typeof item) {
			case 'string': return item;
			default: {
				if (item !== null && item !== undefined)
					return JSON.stringify(item);
			} break;
		}
	});

	return asStrings.filter(item => item?.length).join('');
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

	render(renderProps?: RenderProps) {
		if (renderProps?.minifyHTML) {
			return collapseWhitespaces(this.content);
		}
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
		 * Check tag set restrictions
		 */
		if (renderProps?.restrictTagSet) {
			const useTagSet = htmlTagSets[renderProps.restrictTagSet];
			if (useTagSet && !useTagSet.tags.has(this.tagname))
				throw new Error(`Tagset "${renderProps.restrictTagSet}" disallows usage of the <${this.tagname}> tag`);
		}

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
