import { React } from "../../mod.ts";
import Layout from "./Layout.tsx";

const pets = [
	"cat",
	"dog",
	"hamster",
	"your ex"
];

export default () => {
	return <Layout title="Test title">
		<p class={{ 'added-class': true, 'hidden-class': false }}>
			Nested paragraph here
		</p>
		<ul class={['class-1', 'class-2']}>
			{ pets.map(item => <li>{item}</li>) }
		</ul>
	</Layout>
};
