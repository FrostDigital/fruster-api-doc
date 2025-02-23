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

const ADDITIONAL_PROPERTIES_INTERNAL = "$INTERNAL_ADDITIONAL_PROPERTIES";
const ADDITIONAL_PROPERTIES_OUTPUT = "additionalProperties";

/**
 * NOTE: all tabs and spaces in the strings are there because they should be there 😁
 */
class ServiceClientGenerator {

	/**
	 * @typedef {Object} EndpointConstant
	 *
	 * @property {String} constantName
	 * @property {String} subject
	 * @property {String} functionVariableName
	 */

	/**
	 * @param {Object} options
	 * @param {String} options.serviceName
	 * @param {Array<Object>} options.endpoints
	 * @param {String} options.subjects
	 */
	constructor(options) {
		this.customTypeDefs = {};

		/** @type {Array<Endpoint>} */
		this.endpoints = [];

		/** @type {Array<EndpointConstant>} */
		this.endpointConstants = [];

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

			if (constantsWithSameName.length > 0)
				constant.constantName = constant.constantName + "_" + constantsWithSameName.length;

			this.endpointConstants.push(constant);

			this.endpoints.push(new Endpoint(constantNameCombined, constant.functionVariableName, endpointParameters, description, returnType, endpoint.deprecated, endpoint.subject, endpoint.forwardToHttp));
		});
	}

	// TODO: add toTypescriptClass!

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

${typDefs.map(typeDef => typeDef.split("\t").join("")).join("\n")}
class ${this.className} {

	/**
	 * All endpoints
	 */
	static get endpoints() {

		return {

${this.endpointConstants.map(endpointConstant => `			${endpointConstant.constantName}: "${endpointConstant.subject}"`).join(",\n")}

		};

	}

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

		const parameters = [];
		const properties = getProperties();

		if (!properties)
			return [];

		const propertyKeys = Object.keys(properties);

		for (let i = 0; i < propertyKeys.length; i++) {
			const property = properties[propertyKeys[i]];

			if (!property)
				continue;

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

module.exports = ServiceClientGenerator;

class TypeDef {

	/**
	 * @param {String} name
	 * @param {String} type
	 * @param {String} description
	 * @param {Array<TypeDefProperty>} properties
	 */
	constructor(name, type, description, properties) {
		this.name = Utils.toTitleCase(name);
		this.type = type;
		this.description = description;
		this.properties = properties;
		this._type = "_TypeDef";
	}

	/**s
	 * Converts all data to a javascript service client class
	 */
	toJavascriptClass() {
		const typeDefProperties = this.properties.map(typeDefProperty => typeDefProperty.toJavascriptClass());

		return `	/**
	 * @typedef {${Utils.typeToTitleCase(this.type)}} ${this.name} ${this.description || ""}
	 *
${typeDefProperties.length > 0 ? typeDefProperties.join("\n") : ""}
	 */
`;
	}

}

class TypeDefProperty {

	/**
	 * @param {Object} parameter
	 * @param {String} parameter.name
	 * @param {String} parameter.type
	 * @param {String} parameter.description
	 * @param {Boolean=} parameter.required
	 */
	constructor(parameter) {
		this.name = parameter.name;
		this.type = parameter.type;
		this.description = parameter.description;
		this.required = !!parameter.required || parameter.type && parameter.type.toLowerCase && parameter.type.toLowerCase().includes("null");
		this._type = "_TypeDefProperty";
	}

	/**
	 * Converts all data to a javascript service client class
	 */
	toJavascriptClass() {
		let typeString = "";

		if (Array.isArray(this.type)) {
			typeString = this.type
				.filter(type => type !== "null")
				.map(type => Utils.typeToTitleCase(type)).join("|");
		} else if (!this.type || this.type === "")
			typeString = "Object";
		else
			typeString = Utils.typeToTitleCase(this.type);

		if (["Integer", "Float"].includes(typeString))
			typeString = "Number";

		return `	 * @property {${typeString}${!this.required ? "=" : ""}} ${this.name} ${this.description || ""}`;
	}

}

class TypeDefArrayProperty extends TypeDefProperty {

	/**
	 * @param {Object} parameter
	 * @param {String} parameter.name
	 * @param {String} parameter.type
	 * @param {String} parameter.description
	 * @param {Boolean=} parameter.required
	 */
	constructor(parameter) {
		super(parameter);

		if (parameter instanceof ArrayParameter)
			this.params = parameter.params;

		this._type = "_TypeDefArrayProperty";
	}

	/**
	 * Converts all data to a javascript service client class
	 */
	toJavascriptClass() {
		let typeString = "";

		if (Array.isArray(this.type)) {
			typeString = this.type
				.filter(type => type !== "null")
				.map(type => Utils.typeToTitleCase(type)).join("|");
		} else
			typeString = Utils.typeToTitleCase(this.type);

		let description = this.description;

		if (description === "")
			description = this.params[0].description;

		if (["Integer", "Float"].includes(typeString))
			typeString = "Number";

		return `	 * @property {Array<${typeString}>${!this.required ? "=" : ""}} ${this.name} ${description || ""}`;
	}
}

class Endpoint {

	/**
	 * @param {String} urlConstant
	 * @param {String} endpointName
	 * @param {Array<Parameter>} params
	 * @param {String} description
	 * @param {String|Object|TypeDefProperty} returnType
	 * @param {String} deprecatedReason
	 * @param {String} subject
	 * @param {?} forwardToHttp
	 */
	constructor(urlConstant, endpointName, params, description, returnType, deprecatedReason, subject, forwardToHttp) {
		this.endpointName = endpointName;
		this.urlConstant = urlConstant;
		this.description = description;
		this.returnType = returnType;
		this.deprecatedReason = deprecatedReason;
		this.subject = subject;
		this.forwardToHttp = forwardToHttp;

		this.params = Utils.sortParams(params);
		this.params = [new Parameter("reqId", "string", "the request id", true)].concat(this.params);

		this._type = "_Endpoint";
	}

	/**
	 * Converts all data to a javascript service client class
	 */
	toJavascriptClass() {
		const functionParams = `${getParamsList(this.params)}`;
		const requestBodyParams = `${getParamsList(this.params.slice(1), true)}`;
		const returnType = `Promise<${getReturnType(this.returnType)}>`;
		const deprecatedReasonString = this.deprecatedReason ? `	 * @deprecated ${this.deprecatedReason}` : "";

		return `	/**
${deprecatedReasonString}
	 *
	 * ${this.description || ""}
	 *
	 * @param {Object} param0
${this.params.map(param => param.toJavascriptClass()).join("\n")}
	 *
	 * @return {${returnType}}
	 */
	static async ${this.endpointName}({ ${functionParams} }) {
		${this.deprecatedReason ? `log.warn("Using deprecated endpoint '${this.endpointName}' : ${this.subject}")` : ""}
		return (await bus.request({
			subject: ${this.urlConstant},
			message: {
				reqId${requestBodyParams.length > 0 ? `,
				data: {
					${requestBodyParams}
				}` : ""}
			}
		})).data;
	}
	`;

		/**
		 * @param {Array<Parameter>} params
		 * @param {Boolean=} isRequestBody
		 */
		function getParamsList(params, isRequestBody) {
			return params.filter(param => !param.name.includes(".")).map((param, i) => {
				if (param.name === ADDITIONAL_PROPERTIES_INTERNAL) {
					if (isRequestBody)
						return ` ...${ADDITIONAL_PROPERTIES_OUTPUT}`
					else
						return ` ${ADDITIONAL_PROPERTIES_OUTPUT}`;
				}

				return `${i > 0 ? " " : ""}${Utils.replaceReservedKeyword(param.name, isRequestBody)}`
			});
		}

		/**
		 * @param {String|Object} returnType
		 */
		function getReturnType(returnType) {
			let inputType;

			if (returnType) {
				if (returnType.name)
					inputType = returnType.name;
				else
					inputType = returnType;
			} else
				inputType = "Void";

			return Utils.typeToTitleCase(inputType);
		}
	}

}

class Parameter {

	/**
	 * @param {String} name
	 * @param {String} type
	 * @param {String} description
	 * @param {Boolean=} required
	 * @param {String=} format
	 * @param {Array<String>=} parameterEnum
	 */
	constructor(name, type, description, required, format, parameterEnum) {
		this.name = name;
		this.type = type || "*";
		this.description = description;
		this.required = !!required || type && type.toLowerCase && type.toLowerCase().includes("null");
		this.format = format || null;
		this.parameterEnum = parameterEnum;
		this._type = "_Paramter";
	}

	/**
	 * Converts all data to a javascript service client class
	 */
	toJavascriptClass() {
		let typeString = "";

		if (Array.isArray(this.type)) {
			typeString = this.type
				.filter(type => type !== "null")
				.map(type => {
					if (type === "string" && this.format === "date-time")
						return "Date";
					else
						return type;
				})
				.map(type => Utils.typeToTitleCase(type)).join("|");
		} else {
			if (this.type === "string" && this.format === "date-time")
				typeString = "Date";
			else if (this.type === "string" && !!this.parameterEnum && this.parameterEnum.length)
				typeString = `(${this.parameterEnum.map(e => `"${e}"`).join("|")})`;
			else
				typeString = Utils.typeToTitleCase(this.type);
		}

		if (["Integer", "Float"].includes(typeString))
			typeString = "Number";

		if (typeString === "Any")
			typeString = "*";

		if (this.name === ADDITIONAL_PROPERTIES_INTERNAL)
			this.name = ADDITIONAL_PROPERTIES_OUTPUT;

		return `	 * @param {${typeString}${!this.required ? "=" : ""}} param0.${Utils.replaceReservedKeyword(this.name)} ${this.description || ""}`;
	}

}

class ArrayParameter extends Parameter {

	/**
	 * @param {String} name
	 * @param {String} type
	 * @param {String} description
	 * @param {Array<Parameter>} params
	 * @param {Boolean=} required
	 */
	constructor(name, type, description, params, required) {
		super(name, type, description, required);
		this.params = params;
		this.required = !params.filter(p => !p.required) || required;
		this._type = "_ArrayParamter";
	}

	/**
	 * Converts all data to a javascript service client class
	 */
	toJavascriptClass() {
		let typeString = Utils.typeToTitleCase(this.type);

		if (["Integer", "Float"].includes(typeString))
			typeString = "Number";

		return `	 * @param {Array<${typeString}>${!this.required ? "=" : ""}} param0.${this.name} ${this.description || ""}`;
	}

}

class Utils {

	static toTitleCase(string) {
		return _.startCase(string).split(" ").join("");
	}

	static typeToTitleCase(string) {
		if (typeof string === "object")
			return string.name;

		string = string.charAt(0).toUpperCase() + string.slice(1);

		let output = "";

		for (let i = 0; i < string.length; i++) {
			const lastChar = i > 0 ? string.charAt(i - 1) : "<";
			const char = string.charAt(i);

			if (!isLetter(lastChar))
				output += char.toUpperCase();
			else
				output += char;
		}

		return output;

		function isLetter(str) {
			return str.length === 1 && !!str.match(/[a-z]/i);
		}
	}

	/**
	 * @param {Array<Parameter>} params
	 * @return {Array<Parameter>}
	 */
	static sortParams(params) {
		return params.sort((a, b) => {
			const aVal = a.required ? 1 : 0;
			const bVal = b.required ? 1 : 0;

			return bVal - aVal;
		});
	}

	static get RESERVED_JAVASCRIPT_KEYWORDS() { return ["abstract", "arguments", "await", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "continue", "debugger", "default", "delete", "do", "double", "else", "enum", "eval", "export", "extends", "false", "final", "finally", "float", "for", "function", "goto", "if", "implements", "import", "in", "instanceof", "int", "interface", "let*", "long", "native", "new", "null", "package", "private", "protected", "public", "return", "short", "static", "super*", "switch", "synchronized", "this", "throw", "throws", "transient", "true", "try", "typeof", "var", "void", "volatile", "while", "with", "yield"]; };

	/**
	 * Replaces reserved keywords with adjusted name to not collide with them.
	 *
	 * @param {String} string
	 * @param {Boolean=} isRequestBody
	 */
	static replaceReservedKeyword(string, isRequestBody = false) {
		if (Utils.RESERVED_JAVASCRIPT_KEYWORDS.includes(string)) {
			if (isRequestBody)
				return `"${string}": ${string}Param`;
			else
				return `${string}Param`;
		} else
			return string;
	};

}
