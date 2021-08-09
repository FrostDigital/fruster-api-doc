import Head from "next/head";
import React from "react";
import { theme } from "../theme/Theme";
import { ThemeProvider } from "styled-components";
import GlobalStyles from "../theme/GlobalStyles";
import StateProvider from "../components/state/StateProvider";
import { useStore } from "../stores/StoreContext";

/** Properties for the document for all pages, such as style tags. Is generated every time a page is rendered */
function MyApp({ Component, pageProps }) {
	const { configStore } = useStore();
	const { projectName } = configStore.config;

	return (
		<>
			<ThemeProvider theme={theme}>
				<StateProvider {...pageProps}>
					<Component {...pageProps} />
				</StateProvider>

				<GlobalStyles />
			</ThemeProvider>
		</>
	);
}

export default MyApp;
