import Parameter from "./Parameter";
import TypeDefProperty from "./TypeDefProperty";
import Utils from "./Utils";
import { ADDITIONAL_PROPERTIES_OUTPUT, ADDITIONAL_PROPERTIES_INTERNAL } from "../constants";

export default class Endpoint {

	/**
	 * @param {String} urlConstant
	 * @param {String} endpointName
	 * @param {Array<Parameter>} params
	 * @param {String} description
	 * @param {String|Object|TypeDefProperty} returnType
	 * @param {String} deprecatedReason
	 * @param {String} subject
	 * @param {Object} requestSchema
	 * @param {Object} responseSchema
	 */
	constructor(urlConstant, endpointName, params, description, returnType, deprecatedReason, subject, requestSchema, responseSchema) {
		this.endpointName = endpointName;
		this.urlConstant = urlConstant;
		this.description = description;
		this.returnType = returnType;
		this.deprecatedReason = deprecatedReason;
		this.subject = subject;

		this.params = Utils.sortParams(params);
		/** @type {Array<Parameter>} */
		this.params = [new Parameter("reqId", "string", "the request id", true)].concat(this.params);

		this._type = "_Endpoint";

		this.endpointInterface = "";

		this.requestSchema = requestSchema;
		this.responseSchema = responseSchema;

		this.typeDefName = Utils.toTitleCase(this.endpointName);
	}

	/**
	 * Converts all data to a javascript service client class
	 */
	toTypescriptClass() {
		const functionParams = `${getParamsList(this.params)}`;
		const requestBodyParams = `${getParamsList(this.params.slice(1), true)}`;
		const returnType = `Promise<${this.responseSchema ? this.responseSchema.id : "void"}>`;
		const deprecatedReasonString = this.deprecatedReason ? `	 * @deprecated ${this.deprecatedReason}` : "";
		const frusterBusRequestType = this.requestSchema ? this.requestSchema.id : "void";
		const frusterBusResponseType = this.responseSchema ? this.responseSchema.id : "void";

		let paramsString = this.params.map(param => param.toTypescriptClass()).join("\n").slice(0, -1);

		this.endpointInterface = `
export interface ${this.typeDefName} {
${paramsString}
}`;

		return `	/**
${deprecatedReasonString}
	 *
	 * ${this.description || ""}
	 */
	static async ${this.endpointName}({ ${functionParams} }: ${Utils.toTitleCase(this.endpointName)}): ${returnType} {
		${this.deprecatedReason ? `log.warn("Using deprecated endpoint '${this.endpointName}' : ${this.subject} - ${this.deprecatedReason}")` : ""}
		return (await bus.request<${frusterBusRequestType}, ${frusterBusResponseType}>({
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
