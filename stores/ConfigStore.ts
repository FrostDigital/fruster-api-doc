import { action, computed, IObservableValue, observable } from "mobx";
import BaseStore from "./BaseStore";

export default class ConfigStore extends BaseStore {

	@observable
	private _config: IObservableValue<any> = observable.box({});

	@computed
	get config() {
		return this._config.get();
	}

	set config(config: any) {
		this._config.set(config);
	}

}
