import fs from 'fs';

import Component from "./templates/Component.js";

const outputHTMLFile = './test/dist/index.html';

try {
	
	const appRoot = Component();
	let html = appRoot.render({
		minifyHTML: true
	});

	if (process.env['TEST_OUT_DRY'] !== 'true') {
		fs.writeFileSync(outputHTMLFile, html);
		console.log('Written to:', outputHTMLFile)
	}
	else {
		console.log(html);
		console.log('✅ Rendered html ok, length:', html.length);
	}

} catch (error) {
	console.error((error as Error).message);
	process.exit(1);
}
