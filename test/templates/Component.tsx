import { React } from "../../lib/jsx.ts";
import Layout from "./Layout.tsx";

const pets = [
	"cat",
	"dog",
	"hamster",
	"your ex"
];

export default () => {
	return <Layout title="Test title">
		<p>
			Nexted paragraph here
		</p>
		<ul>
			{ pets.map(item => <li>{item}</li>) }
		</ul>
	</Layout>
};
