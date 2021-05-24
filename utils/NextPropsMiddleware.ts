import { FrusterNextPageContext } from "../middleware/FrusterNextPageContext";
import { RootStore } from "../stores/StoreContext";

/**
 *  Adds props that should be added to all pages, such as logged in user
 * Allows usage of stores for fetching data in pages
 * 		- Sets auth cookie and inits the client stores automatically using the state after server side rendering is done.
 * Handles redirects when logged out / logged in
 *
 * @param nextFunction function to pass to getServerSideProps
 *
 */
export default function (nextFunction?: (req: FrusterNextPageContext, rootStore: RootStore) => any) {
	const nextFn = nextFunction;

	return async function getServerSideProps(context: FrusterNextPageContext) {
		return await getState(context);
	}

	async function getState(context) {
		const rootStore = new RootStore();

		/** Runs the inputted getServerSideProps function */
		let response = nextFn ? (await nextFn(context, rootStore)) || {} : {};

		if (!response.props)
			response.props = {};

		if (!response.props.state)
			response.props.state = {};

		const storeStates = {};

		/** Sets store state from the stores after getServerSideProps */
		Object.keys(rootStore)
			.forEach(key => {
				if (key.toLowerCase().includes("store"))
					storeStates[key] = rootStore[key].toJS()
			});

		return {
			...response,
			props: {
				...response.props,
				state: {
					...response.props.state,
					...storeStates
				}
			}
		};
	};
}
