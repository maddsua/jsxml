import { React } from "../../mod.ts";

interface Props {
	title: string;
};

export default function (props: Props, children: any) {

	return <html>
			<head>
				<meta charset="utf-8" />
				<meta http-equiv="X-UA-Compatible" content="IE=edge" />
				<meta name="x-apple-disable-message-reformatting" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>{props.title}</title>
				<style src="/style.css" bundle></style>
				<script src="/script.js" bundle></script>
			</head>
			<body>

				{children}

			</body>
	</html>;
};
