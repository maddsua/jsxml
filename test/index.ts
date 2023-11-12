import Component from "./templates/Component.tsx";

const outputHTMLFile = './test/dist/index.html';

try {
	

	const appRoot = Component();
	let html = appRoot.render({
		externalResourcesRoot: './test/resources/'
	});

	
	if (!Deno.env.get('TEST_OUT_DRY')) {
		Deno.writeTextFileSync(outputHTMLFile, html);
		console.log('Written to:', outputHTMLFile)
	}
	else {
		console.log('Rendered html ok, length:', html.length);
	}

} catch (error) {
	console.error(error.message);
}
