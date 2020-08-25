import Utils from "./Utils";
import TypeDefProperty from "./TypeDefProperty";

export default class TypeDef {

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

	toTypescriptClass() {
		/** @type {Array<String>} */
		const typeDefProperties = this.properties.map(typeDefProperty => typeDefProperty.toTypescriptClass());

		return `/** ${this.description || ""} */
export interface ${this.name} {
${typeDefProperties.length > 0 ? typeDefProperties.join("\n") : ""}
}
`;
	}

	/**
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
