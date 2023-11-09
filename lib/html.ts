
export const minifyHTML = (html: string) => html.replace(/[\t ]+/g, ' ').replace(/[\r\n]/g, '');
