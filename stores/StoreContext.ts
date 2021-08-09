import React from "react";
import FetchClient from "../clients/FetchClient";
import { API_ROOT } from "../config";
import EndpointStore from "./EndpointStore";
import ToolStore from "./ToolStore";
import UIStore from "./UIStore";
import FilterStore from "./FilterStore";
import ConfigStore from "./ConfigStore";

export class RootStore {

	fetchClient: FetchClient;

	endpointStore: EndpointStore;

	filterStore: FilterStore;

	toolStore: ToolStore;

	uiStore: UIStore;

	configStore: ConfigStore;

	constructor(initialState: any = {}) {
		if (process.browser)
			this.fetchClient = new FetchClient();
		else
			this.fetchClient = new FetchClient({ apiRoot: API_ROOT }, initialState.jwtCookie);

		this.endpointStore = new EndpointStore(this);
		this.endpointStore.setInitialState(initialState.endpointStore);

		this.filterStore = new FilterStore(this);
		this.filterStore.setInitialState(initialState.filterStore);

		this.toolStore = new ToolStore(this);
		this.toolStore.setInitialState(initialState.toolStore);

		this.uiStore = new UIStore(this);
		this.uiStore.setInitialState(initialState.uiStore);

		this.configStore = new ConfigStore(this);
		this.configStore.setInitialState(initialState.configStore);
	}

}

export const rootStore = new RootStore({});

const StoreContext = React.createContext(rootStore);

export default StoreContext;

export const useStore = () => React.useContext(StoreContext);
