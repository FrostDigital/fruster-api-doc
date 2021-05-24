import { action, computed, observable, IObservableValue, runInAction } from "mobx";
import BaseStore from "./BaseStore";

export enum FILTER_TYPE {
	SUBJECT = "SUBJECT",
	DOCS = "DOCS",
	SERVICE = "SERVICE",
	PERMISSIONS = "PERMISSIONS"
}

export default class ToolStore extends BaseStore {

	@observable
	private _filter: IObservableValue<string> = observable.box("");

	@observable
	private _filterBy: IObservableValue<FILTER_TYPE> = observable.box(FILTER_TYPE.SUBJECT);

	@observable
	private _nightmode: IObservableValue<boolean> = observable.box(false);

	@observable
	private currentHashState: IObservableValue<string> = observable.box("");

	@action
	resetFilter() {
		runInAction(() => this._filter.set(""));
	}

	@computed
	get filter() {
		return this._filter.get();
	}

	set filter(newValue: string) {
		runInAction(() => {
			this._filter.set(newValue);

			this.rootStore.uiStore.resetOpenEndpointsState();
			this.rootStore.uiStore.resetOpenSchemaState();
		});
	}

	@action
	resetFilterBy() {
		runInAction(() => {
			this.rootStore.uiStore.resetOpenEndpointsState();
			this.rootStore.uiStore.resetOpenSchemaState();
			this._filterBy.set(FILTER_TYPE.SUBJECT);
		});
	}

	@computed
	get filterBy() {
		return this._filterBy.get();
	}

	set filterBy(newValue: FILTER_TYPE) {
		runInAction(() => this._filterBy.set(newValue));
	}

	@computed
	get nightmode() {
		return this._nightmode.get();
	}

	set nightmode(newValue: boolean) {
		runInAction(() => this._nightmode.set(newValue));
	}

	@computed
	get currentHash() {
		return this.currentHashState.get();
	}

	set currentHash(newValue: string) {
		this.currentHashState.set(newValue);
	}

}
