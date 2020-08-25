import Utils from "./Utils";
import { typescriptDataTypes } from "../constants";

export default class TypeDefProperty {

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
	 * Converts all data to a typescript service client class
	 */
	toTypescriptClass() {
		let typeString = "";

		if (Array.isArray(this.type)) {
			typeString = this.type
				.filter(type => type !== "null")
				.map(type => Utils.typeToTitleCase(type)).join("|");
		} else if (!this.type || this.type === "" || this.type === "Object")
			typeString = "any";
		else
			typeString = Utils.typeToTitleCase(this.type);

		if (["Integer", "Float"].includes(typeString))
			typeString = "Number";

		if (typescriptDataTypes.includes(typeString))
			typeString = typeString.toLowerCase();

		// return `	 * @property {${typeString}${!this.required ? "=" : ""}} ${this.name} ${this.description || ""}`;
		const description = `	/** ${this.description} */
`;
		let declaration = `	${this.name}${!this.required ? "?" : ""}: ${typeString};`;

		if (this.description)
			declaration = description + declaration;

		return declaration;
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
