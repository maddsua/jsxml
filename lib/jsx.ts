import { loadResource } from "./res.ts";

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

const externalResourceTags = new Set<string>([
	"script",
	"style"
]);

interface RenderProps {
	externalResourcesRoot?: string;
	addDoctype?: boolean;
	convertBrTagsToNewlines?: boolean;
};

abstract class JSXNode {
	abstract render(props?: RenderProps): string;
};

const renderChildren = (children: any[]) => children.map(item => {
	switch (typeof item) {
		case 'object': return item instanceof JSXNode ? item.render() : JSON.stringify(item);
		case 'string': return item;
		case 'number': return item.toString();
		case 'boolean': return item ? 'true' : 'false';
		default: return null;
	}
}).filter(item => typeof item === 'string').join('');

class JSXFragmentNode extends JSXNode {

	children: JSXNode[];

	constructor(children?: JSXNode[]) {
		super();
		this.children = children || [];
	}

	render(props?: RenderProps): string {
		return renderChildren(this.children);
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

class JSXHTMLNode extends JSXNode {

	children: JSXNode[] | null;
	tagname: string;
	attributes: Record<string, string> = {};

	constructor(tagname: string, attributes?: Record<string, string | boolean>, children?: JSXNode[]) {

		super();
		this.tagname = tagname.toLowerCase();

		this.children = selfClosingTags.has(this.tagname) ? null : children || [];

		for (const key in attributes) {
			const value = attributes[key];
			const isBool = value === true;
			if (!isBool && typeof value !== 'string') continue;
			this.attributes[key.toLowerCase()] = isBool ? '' : value.replaceAll(`"`, `'`);
		}
	}

	render(props?: RenderProps) {

		/**
		 * Check for <br> tag replacement
		 */
		if (this.tagname === 'br' && props?.convertBrTagsToNewlines) {
			return '\r\n';
		}

		/**
		 * Perform external content bundling
		 */
		let externalContent: string | null = null;
		if (externalResourceTags.has(this.tagname) && this.attributes['bundle'] !== undefined) {

			if (!this.attributes['src']) throw new Error('An element has bundle attribute but src is not provided');
			externalContent = loadResource(this.attributes['src'], props?.externalResourcesRoot);

			delete this.attributes['src'];
			delete this.attributes['bundle'];
		}

		/**
		 * Process tag attributes
		 */
		const allAttribs = Object.entries(this.attributes);
		const attribsAsString = allAttribs.length ? ' ' + allAttribs.map(item => `${item[0]}="${item[1]}"`).join(' ') : '';

		/**
		 * Return void tag
		 */
		if (this.children === null) {
			return `<${this.tagname}${attribsAsString} />`;
		}

		/**
		 * Generate tag with children
		 */
		const innerHTML = externalContent || renderChildren(this.children);
		const tagHTML = `<${this.tagname}${attribsAsString}>${innerHTML}</${this.tagname}>`;

		/**
		 * Return <html> tag with doctype
		 */
		if (this.tagname === 'html' && props?.addDoctype !== false) {
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
