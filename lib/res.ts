import { normalize } from "https://deno.land/std@0.205.0/path/mod.ts";

export const collapseWhitespaces = (html: string) => html.replace(/[\t ]+/g, ' ').replace(/[\r\n]/g, '');

export const loadResource = (file: string, root?: string): string => {

	const resourceLoadPath = normalize((root || Deno.cwd() + '/') + file);	

	let content: string;

	try {
		content = Deno.readTextFileSync(resourceLoadPath);
	} catch (_error) {
		throw new Error(`JSX failed to bundle resource: could not read file "${file}"; full path: "${resourceLoadPath}"`);
	}

	return collapseWhitespaces(content);
};
