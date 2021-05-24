import { isBoxedObservable, isObservableMap, isObservable, isObservableSet, runInAction, isObservableArray } from "mobx";
import { RootStore } from "./StoreContext";

/**
 * Base class for Stores which (probably) all stores
 * should extend.
 *
 * BaseStore is responsible for providing rootStore and
 * also exposes convenient methods that can simplify usage
 * in other stores.
 */
class BaseStore {

	protected rootStore: RootStore;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
	}

	setInitialState(initialState: any) {
		if (initialState) {
			runInAction(() => {
				Object.keys(initialState)
					.forEach((key) => {
						if (isObservable(this[key])) {
							const current = this[key];

							if (isObservableMap(current))
								initialState[key].forEach(s => current.set(s[0], s[1]));
							else if (isBoxedObservable(current))
								current.set(initialState[key]);
							else if (isObservableSet(current))
								initialState[key].forEach(s => current.add(s));
							else if (isObservableArray(current))
								initialState[key].forEach(s => current.push(s));
							else
								console.warn("Unimplemented observable type!", current);
						}
					});
			});
		}
	}

	toJS() {
		delete this.rootStore;

		return JSON.parse(JSON.stringify(this, getCircularReplacer()));
	}

}

export default BaseStore;

const getCircularReplacer = () => {
	const seen = new WeakSet();

	return (key, value) => {
		if (typeof value === "object" && value !== null) {
			if (seen.has(value))
				return;

			seen.add(value);
		}

		return value;
	};
};
