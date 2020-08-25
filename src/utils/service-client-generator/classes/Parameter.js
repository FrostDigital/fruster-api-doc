import Utils from "./Utils";
import { ADDITIONAL_PROPERTIES_INTERNAL, typescriptDataTypes, ADDITIONAL_PROPERTIES_OUTPUT } from "../constants";

export default class Parameter {

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
		this.type = type || "any";
		this.description = description;
		this.required = !!required || type && type.toLowerCase && type.toLowerCase().includes("null");
		this.format = format || null;
		this.parameterEnum = parameterEnum;
		this._type = "_Paramter";
	}

	/**
	 * Converts all data to a javascript service client class
	 */
	toTypescriptClass() {
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
			typeString = "any";

		if (this.name === ADDITIONAL_PROPERTIES_INTERNAL)
			this.name = ADDITIONAL_PROPERTIES_OUTPUT;

		if (typescriptDataTypes.includes(typeString))
			typeString = typeString.toLowerCase();

		const description = `	/** ${this.description} */
`;
		let output = `	${Utils.replaceReservedKeyword(this.name)}${!this.required ? "?" : ""}: ${typeString};
`;

		if (this.description)
			output = description + output;

		return output;
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
			typeString = "any";

		if (this.name === ADDITIONAL_PROPERTIES_INTERNAL)
			this.name = ADDITIONAL_PROPERTIES_OUTPUT;

		return `	 * @param {${typeString}${!this.required ? "=" : ""}} param0.${Utils.replaceReservedKeyword(this.name)} ${this.description || ""}`;
	}

}
