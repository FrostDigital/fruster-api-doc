import TypeDefProperty from "./TypeDefProperty";
import Utils from "./Utils";
import ArrayParameter from "./ArrayParameter";
import { typescriptDataTypes } from "../constants";

export default class TypeDefArrayProperty extends TypeDefProperty {

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
		let declaration = `	${this.name}${!this.required ? "?" : ""}: ${typeString}[];`;

		if (this.description)
			declaration = description + declaration;

		return declaration;
	}
}
