import { action, computed, observable, ObservableMap, runInAction, toJS } from "mobx";
import { Endpoint } from "../models/Endpoint";
import BaseStore from "./BaseStore";

export interface SubjectObject {
	subject: string;
	serviceName: string;
	hidden: boolean;
	group: string;
	type: string;
}

export default class EndpointStore extends BaseStore {

	@observable
	private _endpoints: ObservableMap<string, Endpoint> = observable.map();

	@observable
	private _httpSubjectsByGroup: ObservableMap<string, SubjectObject[]> = observable.map();

	@observable
	private _serviceSubjectsByGroup: ObservableMap<string, SubjectObject[]> = observable.map();

	@observable
	private _wsSubjectsByGroup: ObservableMap<string, SubjectObject[]> = observable.map();

	@observable
	private _schemasWithErrors = observable.box(undefined);

	set endpoints(endpoints: Endpoint[]) {
		runInAction(() => endpoints.forEach(endpoint => this._endpoints.set(this.getEndpointIdentifier(endpoint.serviceName, endpoint.subject), endpoint)));
	}

	@computed
	get endpoints() {
		return [...this._endpoints.values()];
	}

	getEndpointBySubject(serviceName: string, subject: string) {
		return this._endpoints.get(this.getEndpointIdentifier(serviceName, subject));
	}

	@computed
	get allEndpoints() {
		return [...this._endpoints.keys()].map(idSubject => this.getPureSubject(idSubject));
	}

	@action
	setHiddenState(subjectObjs: SubjectObject[]) {
		subjectObjs.forEach(subjectObj => {
			let stateOfChoice;

			if (subjectObj.type === "http")
				stateOfChoice = this._httpSubjectsByGroup;
			else if (subjectObj.type === "service")
				stateOfChoice = this._serviceSubjectsByGroup;
			else if (subjectObj.type === "ws")
				stateOfChoice = this._wsSubjectsByGroup;

			if (!stateOfChoice)
				return;

			const subjectObjectOfChoice = toJS(stateOfChoice.get(subjectObj.group));

			if (subjectObjectOfChoice) {
				subjectObjectOfChoice.forEach((subjectObject, i) => {
					if (subjectObject.serviceName === subjectObj.serviceName && subjectObject.subject === subjectObj.subject && subjectObject.group === subjectObj.group)
						return subjectObjectOfChoice[i].hidden = subjectObj.hidden;
					else
						return true;
				});
			}

			if (stateOfChoice)
				runInAction(() => stateOfChoice.set(subjectObj.group, subjectObjectOfChoice));
		});
	}

	@action
	resetHidden() {
		runInAction(() => {
			[...this._httpSubjectsByGroup.keys()].forEach(group => {
				this._httpSubjectsByGroup.get(group).forEach((s, i) => {
					this._httpSubjectsByGroup.get(group)[i].hidden = false;
				});
			});
		});

		runInAction(() => {
			[...this._serviceSubjectsByGroup.keys()].forEach(group => {
				this._serviceSubjectsByGroup.get(group).forEach((s, i) => {
					this._serviceSubjectsByGroup.get(group)[i].hidden = false;
				});
			});
		});

		runInAction(() => {
			[...this._wsSubjectsByGroup.keys()].forEach(group => {
				this._wsSubjectsByGroup.get(group).forEach((s, i) => {
					this._wsSubjectsByGroup.get(group)[i].hidden = false;
				});
			});
		});
	}

	getHidden(serviceName: string, subject: string) {
		const endpoint = this._endpoints.get(this.getEndpointIdentifier(serviceName, subject));
		return endpoint.hidden;
	}

	set httpSubjectsByGroup(data: any) {
		runInAction(() => {
			Object.keys(data).forEach(group => {
				this._httpSubjectsByGroup.set(group, data[group]);
			});
		});
	}

	@computed
	get httpSubjectsByGroup() {
		const output: { [x: string]: SubjectObject[] } = {};

		[...this._httpSubjectsByGroup.keys()].forEach(group => {
			output[group] = this._httpSubjectsByGroup.get(group).slice();
		});

		return output;
	}

	set serviceSubjectsByGroup(data: any) {
		runInAction(() => {
			Object.keys(data).forEach(group => {
				this._serviceSubjectsByGroup.set(group, data[group]);
			});
		});
	}

	@computed
	get serviceSubjectsByGroup() {
		const output: { [x: string]: SubjectObject[] } = {};

		[...this._serviceSubjectsByGroup.keys()].forEach(group => {
			output[group] = this._serviceSubjectsByGroup.get(group).slice();
		});

		return output;
	}

	set wsSubjectsByGroup(data: any) {
		runInAction(() => {
			Object.keys(data).forEach(group => {
				this._wsSubjectsByGroup.set(group, data[group]);
			});
		});
	}

	@computed
	get wsSubjectsByGroup() {
		const output: { [x: string]: SubjectObject[] } = {};

		[...this._wsSubjectsByGroup.keys()].forEach(group => {
			output[group] = this._wsSubjectsByGroup.get(group).slice();
		});

		return output;
	}

	@computed
	get schemasWithErrors() {
		return this._schemasWithErrors.get();
	}
	@computed
	schemaHasErrors(id: string) {
		const state = this._schemasWithErrors.get();

		if (!state)
			return false;

		return Object.values(state).find((schemas: any) => {
			return schemas.find(schema => schema.id === id);
		});
	}

	set schemasWithErrors(data) {
		this._schemasWithErrors.set(data);
	}

	private getEndpointIdentifier(serviceName, subject) {
		return `${serviceName}>>${subject}`;
	}

	getPureSubject(idSubject: string) {
		return idSubject.split(">>")[1];
	}

}
