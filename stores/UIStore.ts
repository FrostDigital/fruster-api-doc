import { action, computed, IObservableValue, observable, ObservableMap, runInAction } from "mobx";
import BaseStore from "./BaseStore";

export enum SCHEMA_TYPE {
	REQUEST_SCHEMA = "REQUEST_SCHEMA",
	RESPONSE_SCHEMA = "RESPONSE_SCHEMA"
}

export default class UIStore extends BaseStore {

	@observable
	private _openEndpoints: ObservableMap<string, boolean> = observable.map();

	@observable
	private _openSchema: ObservableMap<string, string> = observable.map();

	@observable
	private _currentModalTabIndex: IObservableValue<number> = observable.box(0);

	@action
	resetOpenEndpointsState() {
		runInAction(() => this._openEndpoints.clear());
	}

	@computed
	isOpen(endpointId: string): boolean {
		return this._openEndpoints.get(endpointId);
	}

	@action
	toggleOpen(endpointId: string) {
		runInAction(() => this._openEndpoints.set(endpointId, !this._openEndpoints.get(endpointId)));
	}

	@action
	open(endpointId: string) {
		runInAction(() => this._openEndpoints.set(endpointId, true));
	}

	@action
	resetOpenSchemaState() {
		runInAction(() => this._openSchema.clear());
	}

	@computed
	getOpenSchemaForEndpoint(endpointId: string): string {
		return this._openSchema.get(endpointId);
	}

	@action
	closeSchemaForEndpoint(endpointId: string) {
		runInAction(() => this._openSchema.set(endpointId, undefined));
	}

	@action
	setOpenSchemaForEndpoint(endpointId: string, schemaId: string) {
		runInAction(() => {
			[...this._openSchema.keys()].forEach(endpoint => this._openSchema.set(endpoint, undefined));

			this._openSchema.set(endpointId, schemaId);
		});
	}

	@computed
	get currentModalTabIndex(): number {
		return this._currentModalTabIndex.get();
	}

	set currentModalTabIndex(index: number) {
		this._currentModalTabIndex.set(index);
	}

}
