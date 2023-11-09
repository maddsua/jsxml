import { resolve } from "https://deno.land/std@0.205.0/path/mod.ts";
import { normalize } from "https://deno.land/std@0.205.0/path/normalize.ts";

export const collapseWhitespaces = (html: string) => html.replace(/[\t ]+/g, ' ').replace(/[\r\n]/g, '');

export const loadResource = (file: string, root?: string): string => {
	const resourceLoadPath = normalize((root || Deno.cwd() + '/') + file);	
	const content = Deno.readTextFileSync(resourceLoadPath);
	return collapseWhitespaces(content);
};
