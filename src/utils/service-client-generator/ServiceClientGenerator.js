import { compile as compileTypescriptInterface } from "json-schema-to-typescript"; // TODO: !
import TypeDef from "./classes/TypeDef";
import Endpoint from "./classes/Endpoint";
import Utils from "./classes/Utils";
import { ADDITIONAL_PROPERTIES_INTERNAL, ADDITIONAL_PROPERTIES_OUTPUT } from "./constants";
import ArrayParameter from "./classes/ArrayParameter";
import TypeDefArrayProperty from "./classes/TypeDefArrayProperty";
import Parameter from "./classes/Parameter";
import TypeDefProperty from "./classes/TypeDefProperty";

const ViewUtils = require("../ViewUtils");
const _ = require("lodash");

/**
 *
 * TODO:
 * special type cases like
 *  "userId": {
 *	"anyOf": [
 *	  {
 *		"description": "The id of the user associated to the log",
 *		"type": "string"
 *	  },
 *	  {
 *		"description": "Ids of the users associated to the log",
 *		"items": {
 *		  "type": "string"
 *		},
 *		"type": "array"
 *	  }
 *	]
 * }
*
*TODO: Make it impossible for two functions to get the same name (This will not happen very often)
*/

/**
 * NOTE: all tabs and spaces in the strings are there because they should be there 😁
 */
module.exports = class ServiceClientGenerator {

	/**
	 * @typedef {Object} EndpointConstant
	 *
	 * @property {String} constantName
	 * @property {String} subject
	 * @property {String} functionVariableName
	 */

	/** @type {Object<String, TypeDef>} */
	customTypeDefs = {};

	/**
	 * @param {Object} options
	 * @param {String} options.serviceName
	 * @param {Array<Object>} options.endpoints
	 * @param {String} options.subjects
	 */
	constructor(options) {
		/** @type {Array<Endpoint>} */
		this.endpoints = [];

		/** @type {Array<EndpointConstant>} */
		this.endpointConstants = [];

		this.jsonSchemas = [];

		this.serviceName = options.serviceName;
		this.className = ViewUtils.replaceAll(Utils.toTitleCase(this.serviceName), " ", "") + "Client";

		const inputtedSubjects = options.subjects.split(",");

		options.endpoints.forEach(endpoint => {
			if (inputtedSubjects && inputtedSubjects.length !== 0 && (!inputtedSubjects.some(s => s === endpoint.subject)))
				return;

			const constant = this._getEndpointConstant(endpoint);
			const requestSchema = endpoint.schemas.find(schema => schema.id === endpoint.requestSchema);
			const responseSchema = endpoint.schemas.find(schema => schema.id === endpoint.responseSchema);
			const endpointParameters = this._getEndpointParameters(requestSchema, undefined, false);
			const returnType = this._getEndpointTypeDef(responseSchema, true);
			const constantNameCombined = `${this.className}.endpoints.${constant.constantName}`;
			const description = endpoint.docs ? endpoint.docs.description : "";
			const constantsWithSameName = this.endpointConstants.filter(c => c.constantName === constant.constantName);

			if (requestSchema)
				this.jsonSchemas.push(requestSchema);

			if (responseSchema)
				this.jsonSchemas.push(responseSchema);

			if (constantsWithSameName.length > 0)
				constant.constantName = constant.constantName + "_" + constantsWithSameName.length;

			this.endpointConstants.push(constant);

			this.endpoints.push(
				new Endpoint(constantNameCombined,
					constant.functionVariableName,
					endpointParameters,
					description,
					returnType,
					endpoint.deprecated,
					endpoint.subject,
					requestSchema,
					responseSchema
				));
		});
	}

	// TODO: Arrays for interfaces
	// TODO: Object to any
	// TODO: CLEAN UP

	/**
 * Converts all data to a typescript service client class
 */
	async toTypescriptClass() {
		/** @type {Array<TypeDef>} */
		const typeDefs = Object.keys(this.customTypeDefs).map(key => this.customTypeDefs[key].toTypescriptClass());
		const endpoints = this.endpoints.map(endpoint => endpoint.toTypescriptClass());

		let typescriptInterfaces = [];
		const uniqueSchemaIds = new Set(this.jsonSchemas.map(schema => schema.id));

		const schemasToConvert = this.jsonSchemas.filter(schema => {
			if (uniqueSchemaIds.has(schema.id)) {
				uniqueSchemaIds.delete(schema.id);
				return true;
			} else
				return false;
		});

		const typescriptSchemas = [];

		for (const schema of schemasToConvert) {
			const typescriptInterface = await compileTypescriptInterface(schema, schema.id, {
				style: {
					singleQuote: false,
					useTabs: true,
					semi: true
				},
				unknownAny: false,
				declareExternallyReferenced: true,
				bannerComment: null
			});

			if (!typescriptInterfaces.find(str => {
				/**
				 * json-schema-to-typescript makes interfaces out of all sub-schemas, like User if UserResponse has `users: User, totalCount: number`
				 * So we have to make sure we don't add them multiple times.
				 *
				 * The generated interface string looks something like:
				 *	//
				 *	/ Request to resend email verification email.
				 *	//
				 *	export interface ResendVerificationEmailRequest {
				 *		//
				 *		/ The email address to resent the verification email to.
				 *		//
				 *		email?: string;
				 *	}
				 *
				 * So splitting on export will create two substrings, one before and one after export.
				 * Splitting on space after that will result in:
				 * 	 - export
				 * 	 - interface
				 * 	 - ResendVerificationEmailRequest
				 *
				 * Which means index 2 of that array will be the name of the interface, we then compare that to the current interface.
				*/
				return typescriptInterface.split("export")[1].split(" ")[2] === str.split("export")[1].split(" ")[2];
			})) {
				typescriptInterfaces.push(typescriptInterface);
				typescriptSchemas.push(typescriptInterface.split("export")[1].split(" ")[2]);
			}
		}

		// @ts-ignore
		this.endpoints.forEach(endpoint => typeDefs.push(endpoint.endpointInterface));

		const classString = `import bus from "fruster-bus";

${typescriptInterfaces.join("\n")}
${typeDefs.filter(def => !typescriptSchemas.includes(def.split("export")[1].split(" ")[2])).join("\n")}

/**
 * Note: this service client was generated automatically by api doc @ ${new Date().toJSON()}
 */
export default class ${this.className} {

	/**
	 * All endpoints
	 */
	static get endpoints() {

		return {

${this.endpointConstants.map(endpointConstant => `			${endpointConstant.constantName}: "${endpointConstant.subject}"`).join(",\n")}

		};

	}


${endpoints.join("\n")}
}`;

		return this._formatTypescript(classString);
	}

	/**
	 * Converts all data to a javascript service client class
	 */
	toJavascriptClass() {
		const typDefs = Object.keys(this.customTypeDefs).map(key => this.customTypeDefs[key].toJavascriptClass());
		const endpoints = this.endpoints.map(endpoint => endpoint.toJavascriptClass());
		const classString = `const bus = require("fruster-bus");

/**
 * Note: this service client was generated automatically by api doc @ ${new Date().toJSON()}
 */
class ${this.className} {

	/**
	 * All endpoints
	 */
	static get endpoints() {

		return {

${this.endpointConstants.map(endpointConstant => `			${endpointConstant.constantName}: "${endpointConstant.subject}"`).join(",\n")}

		};

	}

${typDefs.join("\n")}
${endpoints.join("\n")}
}

module.exports = ${this.className};`;

		return this._formatJavascript(classString);
	}

	/**
	 * Fixes faulty formatting
	 *
	 * @param {String} string
	 * @return {String}
	 */
	_formatTypescript(string) {
		string = string.split("\t/**\n\n").join("\t/**\n"); // removes new empty lines within comment blocks
		string = string.split("\t/**\n	 *\n").join("\t/**\n"); // removes double new lines in comments
		string = string.split("{\n\t\t\n\t\treturn ").join("{\n	\treturn "); // removes new lines before return statement in functions
		string = string.split(ADDITIONAL_PROPERTIES_INTERNAL).join(ADDITIONAL_PROPERTIES_OUTPUT); // replaces the internal naming of additionalProperties to output format
		string = string.split("/**  */\n").join("");  // removes empty comments
		string = string.split("Object;").join("any;"); // TODO: Quick hack to convert type Object to type any

		if (string.includes("log.warn") || string.includes("log.error") || string.includes("log.debug")) // adds fruster-log require if fruster-log is used anywhere
			string = "const log = require(\"fruster-log\");\n" + string;

		return string;
	}

	/**
	 * Fixes faulty formatting
	 *
	 * @param {String} string
	 * @return {String}
	 */
	_formatJavascript(string) {
		string = string.split("\t/**\n\n").join("\t/**\n"); // removes new empty lines within comment blocks
		string = string.split("\t/**\n	 *\n").join("\t/**\n"); // removes double new lines in comments
		string = string.split("{\n\t\t\n\t\treturn ").join("{\n	\treturn "); // removes new lines before return statement in functions
		string = string.split(ADDITIONAL_PROPERTIES_INTERNAL).join(ADDITIONAL_PROPERTIES_OUTPUT); // replaces the internal naming of additionalProperties to output format

		if (string.includes("log.warn") || string.includes("log.error") || string.includes("log.debug")) // adds fruster-log require if fruster-log is used anywhere
			string = "const log = require(\"fruster-log\");\n" + string;

		return string;
	}

	/**
	 * Gets response typeDef from a schema
	 *
	 * @param {Object} schema response schema
	 * @param {Boolean} isEndpointReturn response schema
	 *
	 * @return {String|TypeDefArrayProperty|TypeDefProperty}
	 */
	_getEndpointTypeDef(schema, isEndpointReturn = false) {
		if (!schema)
			return null;

		let outputIsArray = schema.type === "array";

		if (this.customTypeDefs[schema.id]) {
			if (isEndpointReturn)
				if (outputIsArray)
					return `Array<${this.customTypeDefs[schema.id].name}>`;

			return this.customTypeDefs[schema.id];
		}

		const name = schema.id;
		const params = this._getEndpointParameters(schema, undefined, true);
		const typeDefs = params.map(param => {
			if (param instanceof ArrayParameter)
				return new TypeDefArrayProperty(param);
			else if (param instanceof Parameter)
				return new TypeDefProperty(param);
		});

		let type = "";
		let description = "";

		if (!schema.type || schema.type === "")
			type = "Object";
		else if (schema.type === "array") {
			outputIsArray = true;

			if (schema.items && schema.items.type)
				type = schema.items.type;
			else
				type = "Object";

			description = schema.items ? schema.items.description : "";
		} else {
			type = schema.type;
			description = schema.description;
		}

		const typeDef = new TypeDef(name, type, description, typeDefs);

		let output = "";

		if (typeDefs.length > 0) {
			this.customTypeDefs[schema.id] = typeDef;
			output = name;
		} else
			output = typeDef.type;

		if (isEndpointReturn)
			if (outputIsArray)
				return `Array<${output}>`;

		return output;
	}

	/**
	 * Gets endpoint paramters from a schema
	 *
	 * @param {Object} schema
	 * @param {String=} parentKey
	 * @param {Boolean=} isTypeDef
	 *
	 * @return {Array<Parameter>}
	 */
	_getEndpointParameters(schema, parentKey, isTypeDef) {
		if (!schema || !schema.id)
			return [];

		/** @type {Array<Parameter>} */
		const parameters = [];
		const properties = getProperties();

		if (!properties)
			return [];

		const propertyKeys = Object.keys(properties);

		for (let i = 0; i < propertyKeys.length; i++) {
			const property = properties[propertyKeys[i]];

			if (!property)
				continue;

			/** @type {Parameter}*/
			let parameter;

			if (property.type === "array") {
				const subParams = this._getEndpointParameters(property, parentKey + "." + propertyKeys[i], isTypeDef);

				if (subParams.length === 0
					&& property.items
					&& "type" in property.items)
					subParams.push(new Parameter(
						cleanName(propertyKeys[i]),
						property.items.type,
						property.items.description,
						false,
						property.items.format));

				const propertySchema = { ...property, id: `${schema.id}${Utils.toTitleCase(propertyKeys[i])}` }
				const type = this._getEndpointTypeDef(propertySchema, false);

				parameter = new ArrayParameter(
					cleanName(propertyKeys[i]),
					cleanName(type.name ? type.name : type),
					property.description,
					subParams,
					schema.required ? schema.required.includes(propertyKeys[i]) : false);
			} else {
				parameter = new Parameter(
					cleanName(propertyKeys[i]),
					property.type,
					property.description,
					schema.required ? schema.required.includes(propertyKeys[i]) : false,
					property.format,
					property.enum);
			}

			if (property.type === "object") {
				if (!property.id)
					property.id = propertyKeys[i];

				const subParams = this._getEndpointParameters(property, parentKey + "." + propertyKeys[i], isTypeDef);

				if (!parameter.required && subParams.length > 0) {
					const propertySchema = { ...property, id: `${schema.id}${Utils.toTitleCase(parameter.name)}` }
					const type = this._getEndpointTypeDef(propertySchema, false);

					parameter = new Parameter(
						cleanName(propertyKeys[i]),
						cleanName(type),
						property.description,
						schema.required ? schema.required.includes(propertyKeys[i]) : false,
						property.format);
				} else {
					subParams.forEach(param => {
						param.name = cleanName(`${propertyKeys[i]}.${param.name}`);
						parameters.push(param);
					});
				}
			}

			parameters.push(parameter);
		}

		try {
			const hasAdditionalProperties = !!schema.additionalProperties;
			const schemaIsObjectWithNoProperties = (schema.type === "object" && !schema.properties);
			const schemaHasNoDefaultValue = !schema.default; // TODO: add typedefs for default values?
			const schemaIsNotResponseSchema = !schema.id.toLowerCase().includes("response");
			const notSubParam = !parentKey || !parentKey.split("param0.").join("").includes(".");

			if (
				schemaIsNotResponseSchema &&
				(hasAdditionalProperties
					|| (schemaIsObjectWithNoProperties && schemaHasNoDefaultValue)) &&
				notSubParam &&
				!isTypeDef
			) {
				parameters.push(new Parameter(
					ADDITIONAL_PROPERTIES_INTERNAL,
					"Object",
					schemaIsObjectWithNoProperties ? schema.description : "additional optional/custom fields",
					false,
					"property.items.format"));
			}
		} catch (err) {
			// quietly fail if this doesn't work since it's not a big enough error to have everything fail.
		}

		return parameters;

		/**
		 * Cleans names from characters not possible to have in variable names
		 */
		function cleanName(name) {
			const replaceChars = ["/", "[", "]", "{", "}", "-", "(", ")"];

			for (const char of replaceChars)
				name = ViewUtils.replaceAll(name, char, "");

			if (!isNaN(Number.parseInt(name[0])))
				name = "_" + name;

			return name;
		}

		/**
		 * Gets the current properties
		 */
		function getProperties() {
			if (schema.properties)
				return schema.properties;
			else if (schema.items)
				return schema.items.properties;
			else
				return {};
		}
	}

	/**
	 * Gets constant name and subject for an endpoint
	 *
	 * @param {Object} endpoint
	 * @param {String} endpoint.subject
	 *
	 * @return {EndpointConstant}
	 */
	_getEndpointConstant(endpoint) {
		const constantsServiceName = ViewUtils.replaceAll(this.serviceName, "-", "_").toUpperCase();

		let constantName = ViewUtils.replaceAll(endpoint.subject.toUpperCase(), "-", "_");

		constantName = ViewUtils.replaceAll(constantName, ".", "_");
		constantName = constantName.replace(`${constantsServiceName}_`, "");
		constantName = ViewUtils.replaceAll(constantName, ":", "");
		constantName = ViewUtils.replaceAll(constantName, "*", "");

		let functionVariableName = _.camelCase(endpoint.subject).replace(_.camelCase(this.serviceName), "");

		if (functionVariableName[0])
			functionVariableName = functionVariableName[0].toLowerCase() + functionVariableName.substring(1);
		else
			functionVariableName = endpoint.subject;

		return {
			constantName,
			subject: endpoint.subject,
			functionVariableName
		};
	}

}
