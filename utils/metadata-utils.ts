import { requestMany } from "fruster-bus";
import { v4 as uuid } from "uuid";
import { apiRoot } from "../config";
import utils, { addUnique, parseSubjectToAPIUrl, replaceAll } from "../utils/utils";

export let lastCachedDate: Date = new Date();
export let endpointsByType = { http: {}, service: {}, ws: {} };
export let allEndpoints = new Set();
export let lastSchemasWithErrors;

let fetchInProgress = false;

export function resetCache() {
	lastCachedDate = new Date();
	endpointsByType = { http: {}, service: {}, ws: {} };
	allEndpoints = new Set();
	lastSchemasWithErrors = undefined;
}

export async function loadMetadata() {
	console.log("FETCHING FRESH METADATA", lastCachedDate);

	await getMetadataFromServices();

	return {
		endpointsByType,
		lastCachedDate,
		allEndpoints: Array.from(allEndpoints),
		schemasWithErrors: lastSchemasWithErrors
	};;
}

async function getMetadataFromServices() {
	if (fetchInProgress)
		return;

	fetchInProgress = true;

	const responses = await requestMany({
		skipOptionsRequest: true,
		subject: "metadata",
		maxResponses: 10000,
		timeout: 10000,
		message: { reqId: uuid() }
	});

	lastCachedDate = new Date();

	prepareMetadata(responses);

	fetchInProgress = false;
}

async function prepareMetadata(metadataResponses: any) {
	let schemasWithErrors;
	let endpoints = new Set();

	const promises = [];

	metadataResponses.forEach(response => {
		if (!response.from) /** Just in case this happens we don't want the whole page to not load. */
			response.from = { service: "", instanceId: "" };

		const serviceName = response.from && response.from.service === "n/a" ? response.from.instanceId : response.from ? response.from.service : "na";
		const fixedServiceName = serviceName.replace("n/a", "na");

		if (!response.data)
			return;

		const promise = utils.derefJsonSchema(response.data.schemas, fixedServiceName)
			.then((derefResp) => {
				if (!derefResp)
					return;

				const schemas = derefResp.schemas;

				if (derefResp.errors && Object.keys(derefResp.errors).length > 0) {
					if (!schemasWithErrors)
						schemasWithErrors = {};

					schemasWithErrors[fixedServiceName] = []

					for (const error of derefResp.errors) {

						const jsonSchemaForError = response.data.schemas.find(s => s.id === error.id);
						error.schema = jsonSchemaForError;

						schemasWithErrors[fixedServiceName].push(error);
					}
				}

				response.data.exposing.map((object, i) => {
					endpoints.add(object.subject);

					if (object.subject.includes("http")) parseEndpoint(object, 2, "http", schemas, fixedServiceName, response.from.instanceId);
					else if (object.subject.includes("ws")) parseEndpoint(object, 2, "ws", schemas, fixedServiceName, response.from.instanceId);
					else parseEndpoint(object, 0, "service", schemas, fixedServiceName, response.from.instanceId);
				});
			});

		promises.push(promise);
	});

	await Promise.all(promises);

	Object.keys(endpointsByType).forEach(endpointType => sortAfterEndpointName(endpointsByType[endpointType]));

	lastSchemasWithErrors = schemasWithErrors;

	Array.from(endpoints).forEach(item => allEndpoints.add(item));
}

/**
 * Parses an endpoint into a format that can be used by the renderer.
 *
 * @param {Object} object response object
 * @param {Number} splitIndex index of endpoint identifier (http.post.>>user<< for http and >>user-service<<.create-user for service).
 * @param {String} type type of endpoint
 * @param {Array<Object>} schemas schemas for response
 * @param {String} serviceName name of service
 * @param {String} instanceId
 */
function parseEndpoint(object, splitIndex, type, schemas, serviceName, instanceId) {
	if (!object.subject) {
		console.log("Could not parse endpoint; No subject...?", object);
		return;
	}

	const splits = object.subject.split(".");

	if (splits[splitIndex] === "health")
		return;

	object.instanceId = instanceId;
	object.serviceName = serviceName;
	object.schemas = schemas.filter(s => s.id === object.requestSchema || s.id === object.responseSchema);
	object.type = type;
	if (!object.cUrl && object.subject.includes("http"))
		object.cUrl = getCUrlFromEndpoint(object, schemas);

	if (!endpointsByType[type][splits[splitIndex]])
		endpointsByType[type][splits[splitIndex]] = [];

	endpointsByType[type][splits[splitIndex]] = addUnique(object, endpointsByType[type][splits[splitIndex]]);

	// if (!schemasPerService[serviceName])
	//     schemasPerService[serviceName] = schemas;
}

/**
 * Generates a cUrl from an endpoint.
 *
 * @param {Object} endpoint endpoint data
 * @param {Array<Object>} schemas
 */
function getCUrlFromEndpoint(endpoint, schemas) {
	const requestSchema = schemas.find(s => s && s.id === endpoint.requestSchema);
	const parsedSubject = parseSubjectToAPIUrl(endpoint.subject);

	let body;

	/** Adds request body if endpoint has a request schema */
	if (requestSchema)
		body = JSON.stringify(requestSchema.sample);

	/** if endpoint uses wildcard method we use GET since wildcard/star is not a valid cUrl method */
	if (parsedSubject.method === "*")
		parsedSubject.method = "GET";

	let authHeader = " ";

	/** Adds a cookie field if authentication is needed to access endpoint */
	if ((endpoint.permissions && endpoint.permissions.length > 0) || endpoint.mustBeLoggedIn)
		authHeader = " --cookie jwt={{JWT_TOKEN}} ";

	const cUrl = `curl -X ${parsedSubject.method} ${authHeader ? `${authHeader}` : ""} ${body ? `-H "Content-Type: application/json" -d '${body}'` : ""} ${apiRoot + parsedSubject.url}`;

	return replaceAll(cUrl, "  ", " ");
}

/**
 * @param {Object} endpoints
 */
function sortAfterEndpointName(endpoints) {
	if (endpoints) {
		Object.keys(endpoints)
			.forEach(serviceName => {
				endpoints[serviceName] = endpoints[serviceName].sort((a, b) => {
					const aU = a.subject.toUpperCase();
					const bU = b.subject.toUpperCase();

					if (aU > bU) return 1;
					else if (aU < bU) return -1;
					else return 0;
				});
			});
	}
}
