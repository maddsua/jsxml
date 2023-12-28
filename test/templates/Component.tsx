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
			Nexted paragraph here
		</p>
		<ul>
			{ pets.map(item => <li>{item}</li>) }
		</ul>
	</Layout>
};
