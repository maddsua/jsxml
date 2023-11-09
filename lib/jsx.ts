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
};

abstract class JSXNode {
	abstract render(props?: RenderProps): string;
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
		this.tagname = tagname;

		this.children = selfClosingTags.has(tagname) ? null : children || [];

		for (const key in attributes) {
			const value = attributes[key];
			const isBool = value === true;
			if (!isBool && typeof value !== 'string') continue;
			this.attributes[key.toLowerCase()] = isBool ? '' : value.replaceAll(`"`, `'`);
		}
	}

	render(props?: RenderProps) {

		let externalContent: string | null = null;

		if (externalResourceTags.has(this.tagname) && this.attributes['bundle'] !== undefined) {

			if (!this.attributes['src']) throw new Error('An element has bundle attribute but src is not provided');
			externalContent = loadResource(this.attributes['src'], props?.externalResourcesRoot);

			delete this.attributes['src'];
			delete this.attributes['bundle'];
		}

		const allAttribs = Object.entries(this.attributes);
		const attribsAsString = allAttribs.length ? ' ' + allAttribs.map(item => `${item[0]}="${item[1]}"`).join(' ') : '';

		if (this.children === null) {
			return `<${this.tagname}${attribsAsString} />`;
		}

		const innerHTML = externalContent || this.children.map(item => item.render(props)).join('');
		return `<${this.tagname}${attribsAsString}>${innerHTML}</${this.tagname}>`;
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
		return children;
	},
	createElement: function (tag: string | Function, attributes: Record<string, string | boolean>) {

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
