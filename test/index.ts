import Component from "./templates/Component.tsx";

const html = Component();

const content = html.render({
	externalResourcesRoot: './test/resources/'
});

Deno.writeTextFileSync('./test/dist/index.html', content);
