import Document, {
	DocumentContext,
	Head,
	Html,
	Main,
	NextScript,
} from "next/document";
import { ServerStyleSheet } from "styled-components";

/** Properties for the document for all pages, such as style tags. Is generated once and used for all pages */
class CustomDocument extends Document {
	static async getInitialProps(ctx) {
		/** Styled components initializing, copied from https://github.com/vercel/next.js/blob/master/examples/with-styled-components/pages/_document.js */
		const sheet = new ServerStyleSheet();
		const originalRenderPage = ctx.renderPage

		try {
			ctx.renderPage = () =>
				originalRenderPage({
					enhanceApp: (App) => (props) =>
						sheet.collectStyles(<App {...props} />),
				})

			const initialProps = await Document.getInitialProps(ctx);
			return {
				...initialProps,
				styles: (
					<>
						{initialProps.styles}
						{sheet.getStyleElement()}
					</>
				),
			}
		} finally {
			sheet.seal();
		}
	}

	render() {
		const nightmode = this.props?.__NEXT_DATA__?.props?.pageProps?.nightmode;

		return (
			<Html>
				<Head>
					{this.props.styles}
					<link
						href="./css2.css"
						rel="stylesheet"
					/>

					<link
						href="./index.css"
						rel="stylesheet"
					/>

					<link
						rel="stylesheet"
						href="./googlecode.min.css"
					/>

					<link
						rel="stylesheet"
						href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
					/>

					<script
						dangerouslySetInnerHTML={{
							__html: `
						if (
							!location.origin.includes("localhost") && location.origin.includes("http://")
						)
							location.href = location.origin.replace("http://", "https://");
						`,
						}}
					/>

					<script src="./jquery-3.4.1.slim.min.js" />

				</Head>
				<body
					className={nightmode ? "ready nightmode" : "ready"}
					style={{
						backgroundColor: nightmode ? "#1a1d21 !important" : ""
					}}>
					<Main />
					<NextScript />
					{/* Workaround for NextJS FOUC issue: https://github.com/vercel/next.js/issues/18769 */}
					{/* Empty script tag as chrome bug fix, see https://github.com/vercel/next.js/issues/13058, https://stackoverflow.com/a/42969608/943337 */}
					<script> </script>

					{/* <script
						type="text/javascript"
						src="./json-schema-faker.min.js"
					/> */}

					<script
						type="text/javascript"
						src="./node-docson.min.js"
					/>

					<script src="./bootstrap.min.js" />

				</body>
			</Html>
		);
	}
}

export default CustomDocument;
