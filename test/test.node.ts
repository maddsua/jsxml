import fs from 'fs';

import Component from "./templates/Component.js";

const outputHTMLFile = './test/dist/index.html';

try {
	
	const appRoot = Component();
	let html = appRoot.render({
		externalResourcesRoot: './test/resources/'
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
	console.error(error.message);
	process.exit(1);
}