import Head from "next/head";
import React from "react";
import { theme } from "../theme/Theme";
import { ThemeProvider } from "styled-components";
import GlobalStyles from "../theme/GlobalStyles";
import StateProvider from "../components/state/StateProvider";
import { useStore } from "../stores/StoreContext";
import { projectName } from "../config";

/** Properties for the document for all pages, such as style tags. Is generated every time a page is rendered */
function MyApp({ Component, pageProps }) {
	return (
		<>
			<ThemeProvider theme={theme}>
				<Head>
					<title>{projectName ? (projectName + " ") : ""}API documentation</title>
				</Head>

				<StateProvider {...pageProps}>
					<Component {...pageProps} />
				</StateProvider>

				<GlobalStyles />
			</ThemeProvider>
		</>
	);
}

export default MyApp;
