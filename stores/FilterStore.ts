import { action } from "mobx";
import BaseStore from "./BaseStore";

export default class FilterStore extends BaseStore {

	@action
	resetFilteredEndpoints() {
		this.rootStore.endpointStore.resetHidden();
	}

	@action
	filterEndpointsBy(filter: string[], filterFunction: Function) {
		filterFunction(filter, this.rootStore.endpointStore);
	}

}
