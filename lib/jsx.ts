
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

abstract class JSXNode {
	abstract render(): string;
};

class JSXFragmentNode extends JSXNode {

	children: JSXNode[];

	constructor(children?: JSXNode[]) {
		super();
		this.children = children || [];
	};

	render() {
		return this.children.map(item => item.render()).join('');
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
		this.tagname = tagname;

		this.children = selfClosingTags.has(tagname) ? null : children || [];

		for (const key in attributes) {
			const value = attributes[key];
			const isBool = value === true;
			if (!isBool && typeof value !== 'string') continue;
			this.attributes[key] = isBool ? '' : value;
		}
	}

	render() {

		const allAttribs = Object.entries(this.attributes);
		const attribsAsString = allAttribs.length ? ' ' + allAttribs.map(item => `${item[0]}="${item[1]}"`).join(' ') : '';

		return this.children === null ?
			`<${this.tagname}${attribsAsString} />` :
			`<${this.tagname}${attribsAsString}>${this.children.map(item => item.render()).join('')}</${this.tagname}>`;
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

export const JSX = {
	createElement: function (tag: string | Function, attributes: Record<string, string | boolean>) {

		const children = Array.from(arguments).slice(2).map(item => Array.isArray(item) ? item : [item]).flat(2).map(item => typeof item === 'string' ? new JSXTextNode(item) : item);

		if (!tag) {
			return new JSXFragmentNode(children);
		}
		else if (typeof tag === 'function') {
			let temp = tag(attributes, children);
			return temp;
		}
		else if (typeof tag === 'string') {
			return new JSXHTMLNode(tag, attributes, children);
		}
		else {
			throw new Error('what the fuck')
		}
	}
};

export const React = JSX;
export const _jsx = JSX;
