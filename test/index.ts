import Component from "./templates/Component.tsx";

const html = Component();

try {

	let content = html.render({
		externalResourcesRoot: './test/resources/'
	});

	Deno.writeTextFileSync('./test/dist/index.html', content);

} catch (error) {
	console.error(error.message);
}
