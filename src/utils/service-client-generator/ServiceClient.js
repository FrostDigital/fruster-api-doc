const ViewUtils = require("../ViewUtils");
const _ = require("lodash");

class ServiceClient {

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
     */
    constructor(options) {
        this.customTypeDefs = {};

        /** @type {Array<Endpoint>} */
        this.endpoints = [];

        /** @type {Array<EndpointConstant>} */
        this.endpointConstants = [];

        this.serviceName = options.serviceName;
        this.className = ViewUtils.replaceAll(Utils.toTitleCase(this.serviceName), " ", "") + "Client";

        options.endpoints.forEach(endpoint => {
            let constant = this._getEndpointConstant(endpoint);

            if (this.endpointConstants.find(c => c.constantName === constant.constantName))
                constant.constantName = constant.constantName + "_2";

            this.endpointConstants.push(constant);



            const requestSchema = endpoint.schemas.find(schema => schema.id === endpoint.requestSchema);
            const responseSchema = endpoint.schemas.find(schema => schema.id === endpoint.responseSchema);
            const endpointParameters = this._getEndpointParameters(requestSchema);
            const returnType = this._getEndpointTypeDef(responseSchema);

            const constantNameCombined = `${this.className}.endpoints.${constant.constantName}`;

            this.endpoints.push(new Endpoint(constantNameCombined, constant.functionVariableName, endpointParameters, endpoint.docs.description, returnType, endpoint.deprecated));
        });
    }

    toJavascriptClass() {
        const typDefs = Object.keys(this.customTypeDefs).map(key => this.customTypeDefs[key].toJavascriptClass());
        const endpoints = this.endpoints.map(endpoint => endpoint.toJavascriptClass());

        return `const bus = require("fruster-bus");
const log = require("fruster-log");

/**
 * Note: this service client was generated automatically by api doc @ ${new Date().toJSON()}
 */
class ${this.className}{

    constructor(){ throw "service client shouldn't be instanced"; }

    /**
     * All endpoints
     */
    static get endpoints(){

        return {

${this.endpointConstants.map(endpointConstant => `            ${endpointConstant.constantName}: "${endpointConstant.subject}"`).join(",\n")}

        };

    }

${typDefs.join("\n")}
${endpoints.join("\n")}
}

module.exports = ${this.className};`;
    }

    /**
     * Gets response typeDef from a schema
     * 
     * @param {Object} schema response schema
     * 
     * @return {String}
     */
    _getEndpointTypeDef(schema) {
        if (!schema)
            return null;

        if (this.customTypeDefs[schema.id])
            return this.customTypeDefs[schema.id];

        const name = schema.id;
        const params = this._getEndpointParameters(schema);
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
            if (schema.items.type)
                type = schema.items.type;
            else
                type = "Object";

            description = schema.items.description;
        } else {
            type = schema.type;
            description = schema.description;
        }

        const typeDef = new TypeDef(name, type, description, typeDefs);

        let output = "";

        if (typeDefs.length > 0) {
            this.customTypeDefs[schema.id] = typeDef;
            output = name;
        }
        else
            output = typeDef.type;

        return output;
    }

    /**
     * Gets endpoint paramters from a schema
     * 
     * @param {Object} schema 
     * 
     * @return {Array<Parameter>}
     */
    _getEndpointParameters(schema) {
        if (!schema)
            return [];

        const parameters = [];
        const properties = schema.properties ? schema.properties : schema.items ? schema.items.properties : {};

        if (!properties)
            return [];

        const propertyKeys = Object.keys(properties);

        for (let i = 0; i < propertyKeys.length; i++) {
            const property = properties[propertyKeys[i]];

            if (!property)
                continue;

            let parameter;

            if (property.type === "array") {
                const subParams = this._getEndpointParameters(property);

                if (subParams.length === 0 && "type" in property.items)
                    subParams.push(new Parameter(
                        propertyKeys[i],
                        property.items.type,
                        property.items.description,
                        false));

                const propertySchema = { ...property, id: `${schema.id}${Utils.toTitleCase(propertyKeys[i])}` }
                const type = this._getEndpointTypeDef(propertySchema);

                parameter = new ArrayParameter(
                    propertyKeys[i],
                    type.name ? type.name : type,
                    property.description,
                    subParams,
                    schema.required ? schema.required.includes(propertyKeys[i]) : true);
            } else {
                parameter = new Parameter(
                    propertyKeys[i],
                    property.type,
                    property.description,
                    schema.required ? schema.required.includes(propertyKeys[i]) : false);
            }

            if (property.type === "object") {
                const subParams = this._getEndpointParameters(property);

                if (!parameter.required && subParams.length > 0) {
                    const propertySchema = { ...property, id: `${schema.id}${Utils.toTitleCase(parameter.name)}` }
                    const type = this._getEndpointTypeDef(propertySchema);

                    parameter = new Parameter(
                        propertyKeys[i],
                        type,
                        property.description,
                        schema.required ? schema.required.includes(propertyKeys[i]) : false);
                } else {
                    subParams.forEach(param => {
                        param.name = `${propertyKeys[i]}.${param.name}`;
                        parameters.push(param);
                    });
                }
            }

            parameters.push(parameter);
        }

        return parameters;
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

        let functionVariableName = _.camelCase(endpoint.subject).replace(_.camelCase(this.serviceName), "");
        functionVariableName = functionVariableName[0].toLowerCase() + functionVariableName.substring(1);

        return {
            constantName,
            subject: endpoint.subject,
            functionVariableName
        };
    }

}

module.exports = ServiceClient;

class TypeDef {

    /**
     * @param {String} name 
     * @param {String} type 
     * @param {String} description 
     * @param {Array<TypeDefProperty>} properties 
     */
    constructor(name, type, description, properties) {
        this.name = name;
        this.type = type;
        this.description = description;
        this.properties = properties;
        this._type = "_TypeDef";
    }

    toJavascriptClass() {
        const typeDefProperties = this.properties.map(typeDefProperty => typeDefProperty.toJavascriptClass());

        return `    /**
     * @typedef {${Utils.toTitleCase(this.type)}} ${this.name} ${this.description} 
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
        this.required = !!parameter.required || parameter.type.toLowerCase && parameter.type.toLowerCase().includes("null");
        this._type = "_TypeDefProperty";
    }

    toJavascriptClass() {
        let typeString = "";

        if (Array.isArray(this.type)) {
            typeString = this.type
                .filter(type => type !== "null")
                .map(type => Utils.toTitleCase(type)).join("|");
        } else
            typeString = Utils.toTitleCase(this.type);

        return `     * @property {${typeString}${!this.required ? "=" : ""}} ${this.name} ${this.description}`;
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

    toJavascriptClass() {
        let typeString = "";

        if (Array.isArray(this.type)) {
            typeString = this.type
                .filter(type => type !== "null")
                .map(type => Utils.toTitleCase(type)).join("|");
        } else
            typeString = Utils.toTitleCase(this.type);

        let description = this.description;

        if (description === "")
            description = this.params[0].description;

        return `     * @property {Array<${typeString}${!this.required ? "=" : ""}>} ${this.name} ${description}`;
    }
}

class Endpoint {

    /**
     * @param {String} urlConstant
     * @param {String} endpointName
     * @param {Array<Parameter>} params
     * @param {String} description
     * @param {String} returnType
     * @param {String} deprecatedReason
     */
    constructor(urlConstant, endpointName, params, description, returnType, deprecatedReason) {
        this.endpointName = endpointName;
        this.urlConstant = urlConstant;
        this.description = description;
        this.returnType = returnType;
        this.params = [
            new Parameter("reqId", "string", "the request id", true)
        ].concat(params);
        this.deprecatedReason = deprecatedReason;
        this._type = "_Endpoint";
    }

    toJavascriptClass() {
        const functionParams = `${this.params.filter(param => !param.name.includes(".")).map((param, i) => `${i > 0 ? " " : ""}${param.name}`)}`;
        const returnType = `Promise<${Utils.toTitleCase(this.returnType ? this.returnType.name ? this.returnType.name : this.returnType : "Void")}>`;
        const deprecatedReasonString = this.deprecatedReason ? `     * @deprecated ${this.deprecatedReason}` : "";

        return `    /**
${deprecatedReasonString}
     *
     * ${this.description}
     * 
${this.params.map(param => param.toJavascriptClass()).join("\n")}
     *
     * @return {${returnType}}
     */
    static async ${this.endpointName}(${functionParams}){
        ${this.deprecatedReason ? `log.warn("Using deprecated endpoint ${this.endpointName}")` : ""}
        return (await bus.request({
            subject: ${this.urlConstant},
            message: {
                ${functionParams}
            }
        })).data;
    }
    `;
    }

}

class Parameter {

    /**
     * @param {String} name 
     * @param {String} type 
     * @param {String} description 
     * @param {Boolean=} required 
     */
    constructor(name, type, description, required) {
        this.name = name;
        this.type = type;
        this.description = description;
        this.required = !!required || type.toLowerCase && type.toLowerCase().includes("null");
        this._type = "_Paramter";
    }

    toJavascriptClass() {
        let typeString = "";

        if (Array.isArray(this.type)) {
            typeString = this.type
                .filter(type => type !== "null")
                .map(type => Utils.toTitleCase(type)).join("|");
        } else
            typeString = Utils.toTitleCase(this.type);

        return `     * @param {${typeString}${!this.required ? "=" : ""}} ${this.name} ${this.description}`;
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
        this._type = "_ArrayParamter";
    }

    toJavascriptClass() {
        return `     * @param {Array<${Utils.toTitleCase(this.type)}${!this.required ? "=" : ""}>} ${this.name} ${this.description}`;
    }

}

class Utils {

    static toTitleCase(string) {
        return _.startCase(string).split(" ").join("");
    }

}


// TODO: Temp tester
const fs = require("fs");
const options = JSON.parse(fs.readFileSync("test-data.json").toString());
const serviceClient = new ServiceClient(options);

console.log("==================");
console.log("");
// console.log(serviceClient.toJavascriptClass());
console.log("");

fs.writeFileSync("../serviceClient.json", JSON.stringify(serviceClient));
fs.writeFileSync("../serviceClient-to-string.js", serviceClient.toJavascriptClass());
