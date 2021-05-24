import { Endpoint } from "../models/Endpoint";
import EndpointStore, { SubjectObject } from "../stores/EndpointStore";

export function filterBySubject(valuesToFilterBy: string[], endpointStore: EndpointStore) {
	const endpointStates: SubjectObject[] = [];

	endpointStore.endpoints.forEach((endpoint) => {
		let containsSearchWord = true;

		valuesToFilterBy.forEach(value => {
			if (value !== "")
				containsSearchWord = endpoint.subject.includes(value);
		});

		if (!containsSearchWord)
			endpointStates.push(getSubjectObj(endpoint, true));
		else
			endpointStates.push(getSubjectObj(endpoint, false));
	});

	endpointStore.setHiddenState(endpointStates);
}

export function filterByPermissions(valuesToFilterBy: string[], endpointStore: EndpointStore) {
	const endpointStates: SubjectObject[] = [];

	endpointStore.endpoints.forEach(endpoint => {
		let containsSearchWord = false;

		if (!endpoint.permissions || endpoint.permissions.length === 0) {
			endpointStates.push(getSubjectObj(endpoint, true));
			return;
		}

		endpoint.permissions.forEach(permission => {
			valuesToFilterBy.forEach(value => {
				if (value !== "")
					containsSearchWord = permission.includes(value);
			});
		});

		if (!containsSearchWord)
			endpointStates.push(getSubjectObj(endpoint, true));
		else
			endpointStates.push(getSubjectObj(endpoint, false));
	});

	endpointStore.setHiddenState(endpointStates);
}

export function filterByDocs(valuesToFilterBy: string[], endpointStore: EndpointStore) {
	const endpointStates: SubjectObject[] = [];

	endpointStore.endpoints.forEach(endpoint => {
		const docs = endpoint.docs || {} as any;
		const flatEndpointObj = squishObject(docs);

		/**
		 * Further fields to be possible to search w/ filter by `docs` can be added here,
		 * the key name doesn't matter, just has to be unique but the value is what is used to compare:
		 */
		if (endpoint.deprecated)
			flatEndpointObj.deprecated = "deprecated";

		if (endpoint.pending)
			flatEndpointObj.pending = "pending";

		if (endpoint.requestSchema)
			flatEndpointObj.requestSchema = endpoint.requestSchema;

		if (endpoint.responseSchema)
			flatEndpointObj.responseSchema = endpoint.responseSchema;

		if (docs.errors) {
			Object.keys(docs.errors).forEach(key => {
				flatEndpointObj["_ERROR_CODE_" + key] = key;  // prefix to be sure we are not overwriting anything else
			});
		}

		let comparisonString = "";

		if (flatEndpointObj)
			Object.keys(flatEndpointObj).forEach(key => comparisonString += `${flatEndpointObj[key]}`);

		for (const inputValue of valuesToFilterBy) {
			if (comparisonString.toLowerCase().includes(inputValue.toLowerCase())) {
				endpointStates.push(getSubjectObj(endpoint, false));
				return;
			}
		}

		endpointStates.push(getSubjectObj(endpoint, true));
	});

	endpointStore.setHiddenState(endpointStates);
}

export function filterByService(valuesToFilterBy: string[], endpointStore: EndpointStore) {
	const endpointStates: SubjectObject[] = [];

	endpointStore.endpoints.forEach((endpoint) => {
		for (const inputValue of valuesToFilterBy) {
			if (endpoint.serviceName.toLowerCase().includes(inputValue.toLowerCase())) {
				endpointStates.push(getSubjectObj(endpoint, false));
				return;
			}
		}

		endpointStates.push(getSubjectObj(endpoint, true));
	});

	endpointStore.setHiddenState(endpointStates);
}


export function squishObject(obj: any): any {
	if (!obj) return;

	const clone = Object.assign({}, obj);

	const output = {};

	Object.keys(clone)
		.forEach(key => {
			if (clone[key] && typeof clone[key] === "object") {
				const squishedSubObject = squishObject(clone[key]);

				if (squishedSubObject)
					Object.keys(squishedSubObject)
						.forEach(subObjKey => {
							output[subObjKey] = squishedSubObject[subObjKey];
						});
			} else
				output[key] = clone[key];
		});

	return output;
}

function getSubjectObj(endpoint: Endpoint, hidden: boolean): SubjectObject {
	return {
		group: endpoint.group,
		serviceName: endpoint.serviceName,
		subject: endpoint.subject,
		hidden,
		type: endpoint.type
	};
}
