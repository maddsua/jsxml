import { React } from "../../lib/jsx.ts"

interface Props {
	title: string;
};

export default function (props: Props, children: any) {

	console.log(children);

	return <html>
			<head>
				<meta charset="utf-8" />
				<meta http-equiv="X-UA-Compatible" content="IE=edge" />
				<meta name="x-apple-disable-message-reformatting" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>{props.title}</title>
			</head>
			<body>

				{children}

			</body>
	</html>;
};
