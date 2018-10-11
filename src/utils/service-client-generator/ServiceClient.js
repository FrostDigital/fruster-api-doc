const ViewUtils = require("../ViewUtils");
const _ = require("lodash");

class ServiceClient {

    /**
     * @param {Object} options 
     * @param {String} options.serviceName
     * @param {Array<Object>} options.endpoints
     */
    constructor(options) {
        this.customTypeDefs = {};
        this.endpoints = [];
        this.endpointConstants = [];

        this.serviceName = options.serviceName;
        this.className = ViewUtils.replaceAll(_.startCase(this.serviceName), " ", "") + "Client";

        options.endpoints.forEach(endpoint => {
            let constant = this._getEndpointConstant(endpoint);

            if (this.endpointConstants.find(c => c.constantName === constant.constantName))
                constant.constantName = constant.constantName + "_2";

            this.endpointConstants.push(constant);


            let functionVariableName = _.camelCase(endpoint.subject).replace(_.camelCase(this.serviceName), "");
            functionVariableName = functionVariableName[0].toLowerCase() + functionVariableName.substring(1);

            const requestSchema = endpoint.schemas.find(schema => schema.id === endpoint.requestSchema);
            const responseSchema = endpoint.schemas.find(schema => schema.id === endpoint.responseSchema);
            const endpointParameters = this._getEndpointParameters(requestSchema);
            const returnType = this._getEndpointTypeDef(responseSchema);

            this.endpoints.push(new Endpoint(constant.constantName, functionVariableName, endpointParameters, endpoint.docs.description, returnType));
        });
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

        const typeDef = new TypeDef(name, "Object", schema.description, typeDefs);

        this.customTypeDefs[schema.id] = typeDef;

        return name;
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

                parameter = new ArrayParameter(
                    propertyKeys[i],
                    property.type,
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

            parameters.push(parameter);

            if (property.type === "object") {
                const subParams = this._getEndpointParameters(property);

                subParams.forEach(param => {
                    param.name = `${propertyKeys[i]}.${param.name}`;
                    parameters.push(param);
                });
            }
        }

        return parameters;
    }

    /**
     * Gets constant name and subject for an endpoint
     * 
     * @param {Object} endpoint 
     * @param {String} endpoint.subject
     */
    _getEndpointConstant(endpoint) {
        const constantsServiceName = ViewUtils.replaceAll(this.serviceName, "-", "_").toUpperCase();

        let constantName = ViewUtils.replaceAll(endpoint.subject.toUpperCase(), "-", "_");
        constantName = ViewUtils.replaceAll(constantName, ".", "_");
        constantName = constantName.replace(`${constantsServiceName}_`, "");

        return {
            constantName,
            subject: endpoint.subject
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
        this.required = !!parameter.required;
        this._type = "_TypeDefProperty";
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

}

class Endpoint {

    /**
     * @param {String} urlConstant
     * @param {String} endpointName
     * @param {Array<Parameter>} params
     * @param {String} description
     * @param {String} returnType
     */
    constructor(urlConstant, endpointName, params, description, returnType) {
        this.endpointName = endpointName;
        this.urlConstant = urlConstant;
        this.description = description;
        this.returnType = returnType;
        this.params = [
            new Parameter("reqId", "string", "the request id", false)
        ].concat(params);
        this._type = "_Endpoint";
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
        this.required = !!required;
        this._type = "_Paramter";
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

}


// TODO: Temp tester
const fs = require("fs");
const options = JSON.parse(fs.readFileSync("test-data.json").toString());
const serviceClient = new ServiceClient(options);

console.log("");
console.log("");
console.log("==================");
serviceClient.endpoints.forEach(endpoint => {
    endpoint.params.forEach(param => {
        console.log("==================");
        console.log(param.name, param.required);
    });
});
console.log("==================");
console.log("");
console.log("");

fs.writeFileSync("../serviceClient.json", JSON.stringify(serviceClient));