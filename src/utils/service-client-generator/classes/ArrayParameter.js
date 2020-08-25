import Utils from "./Utils";
import Parameter from "./Parameter";

export default class ArrayParameter extends Parameter {

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
	/**
	 * Converts all data to a javascript service client class
	 */
	toTypescriptClass() {
		let typeString = this.type;

		return `	${Utils.replaceReservedKeyword(this.name)}${!this.required ? "?" : ""}: ${typeString}[];`;
	}

}
