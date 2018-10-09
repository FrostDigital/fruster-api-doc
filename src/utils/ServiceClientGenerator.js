const ViewUtils = require("../utils/ViewUtils");
const _ = require("lodash");
const uuid = require("uuid");
const jsf = require("json-schema-faker");

jsf.option({
    requiredOnly: false,
    alwaysFakeOptionals: true,
    failOnInvalidTypes: false
});

jsf.format("uuid", () => uuid.v4());


/** out of class scope-cache */
let cachedServiceClient = {};

class ServiceClientGenerator {

    /**
     * @param {Object} options 
     * @param {String} options.serviceName
     * @param {Array<Object>} options.endpoints
     */
    constructor(options) {
        this.serviceName = options.serviceName;
        this.endpoints = options.endpoints;
        this.customTypeDefs = {};
    }

    static resetCache() {
        cachedServiceClient = {};
    }

    generate() {
        return new Promise(resolve => {
            if (cachedServiceClient[this.serviceName])
                resolve(cachedServiceClient[this.serviceName]);

            resolve(this._generateClientCode());
        });
    }

    _generateClientCode() {
        const className = ViewUtils.replaceAll(_.startCase(this.serviceName), " ", "") + "Client";
        const endpointsBySubject = {};
        const endpoints = this.endpoints.map((endpoint, i, array) => {
            let constant = this._getEndpointConstant(endpoint);

            if (array.includes(constant))
                constant = constant + "2";

            endpointsBySubject[endpoint.subject] = constant;

            return constant;
        });
        const endpointFunctions = this.endpoints.map((endpoint, index) => this._getEndpointFunction(endpoint, endpointsBySubject, className));

        /** Note these strings need this formatting for the output to have the correct format */
        const code = `
const bus = require("fruster-bus");
const FrusterResponse = bus.FrusterResponse;

/**
 * Note: this service client was generated automatically by api doc @ ${new Date().toJSON()}
 */
class ${className}{

    constructor(){ throw "service client shouldn't be instanced"; }

    ${Object.values(this.customTypeDefs).join("\n")}

    /**
     * All endpoints
     */
    static get endpoints(){

        return {

            ${endpoints.join(", \n            ")}

        };

    }
${endpointFunctions.join("\n")}

}

module.exports = ${className};`;

        // @ts-ignore
        cachedServiceClient[this.serviceName] = code;

        console.log("New client code generated!");

        return code;

        return `
        <!DOCTYPE html>
        <html>
            <head>
            <link rel="stylesheet"
                href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/default.min.css">
                <script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js"></script>
                <script>
                document.addEventListener("DOMContentLoaded", function() {
                    hljs.configure({ languages: ["js"] });
                    hljs.highlightBlock(document.getElementsByTagName("pre")[0]);
                  });
                </script>
            </head>
            <body>
            <code>
                <pre>
                    ${code}
                </pre>
            </code>
            </body>
        </html>
        `;
    }

    /**
     * @param {Object} endpoint 
     */
    _getEndpointConstant(endpoint) {
        const constantsServiceName = ViewUtils.replaceAll(this.serviceName, "-", "_").toUpperCase();

        let constantsName = ViewUtils.replaceAll(endpoint.subject.toUpperCase(), "-", "_");
        constantsName = ViewUtils.replaceAll(constantsName, ".", "_");
        constantsName = constantsName.replace(`${constantsServiceName}_`, "");

        return `${constantsName}: "${endpoint.subject}"`;
    }

    /**
     * @param {Object} endpoint 
     */
    _getEndpointFunction(endpoint, endpointConstantsBySubject, className) {
        try {
            const schemas = endpoint.schemas.filter(schema => schema.id === endpoint.requestSchema || schema.id === endpoint.responseSchema);

            let functionVariableName = _.camelCase(endpoint.subject).replace(_.camelCase(this.serviceName), "");
            functionVariableName = functionVariableName[0].toLowerCase() + functionVariableName.substring(1);

            const requestSchema = schemas.find(schema => schema.id === endpoint.requestSchema);

            //TODO: response schemas for return types & custom return types
            const responseSchema = schemas.find(schema => schema.id === endpoint.responseSchema);

            const customDefResponseData = this._getCustomTypeDefFromSchema(responseSchema);

            const parameters = this._getParameterNames(requestSchema);

            /** Docs */
            const description = endpoint.docs ? endpoint.docs.description : "";
            const schemaTypes = this._getSchemaTypes(parameters, requestSchema);

            /** Note these strings need this formatting for the output to have the correct format */
            const code = `/**
     * ${endpoint.deprecated ? "@deprecated " + endpoint.deprecated : description || "no description..."}
     * 
     * @param {String} reqId the request id
${this._getParamDocs(parameters, schemaTypes)}
     *
     * @return {Promise<${customDefResponseData ? responseSchema.id : "FrusterResponse"}>}
     */
    static ${functionVariableName}(reqId${parameters.length > 0 ? ", " : ""}${parameters.join(", ")}){
        return bus.request({
            subject: ${className}.endpoints.${endpointConstantsBySubject[endpoint.subject].split(":")[0]},
            message: {
                reqId, data: { 
                    ${parameters.join(", ")}
                }
            }
        });
    }`;
            return code;
        } catch (err) {
            console.log("error while parsing", endpoint.subject, err);
        }
    }

    _getParameterNames(schema) {
        return Object.keys(schema && schema.sample ? (Array.isArray(schema.sample) ? {} : schema.sample) : {});
    }

    /**
     * @param {Array<String>} parameters 
     * @param {*} schema 
     * @param {String=} parentParam 
     */
    _getSchemaTypes(parameters, schema, parentParam) {
        const paramDocs = {};

        parameters.forEach(param => {
            if (schema && typeof schema === "object") {
                let current;

                try {
                    current = schema.properties ? schema.properties[param] : schema[param];
                } catch (err) {
                    return;
                }

                const isRequired = schema.required ? schema.required.includes(param) : false;
                const description = current.description;
                const items = current.items || current.properties;

                if (!current || typeof current != "object")
                    return;

                // TODO: type can sometimes be an array
                current.type = current.type && (current.type.toLowerCase() === "float" || current.type.toLowerCase() === "integer") ? "Number" : current.type;

                let type = current.type ? Array.isArray(current.type) ? current.type : [current.type] : ["*"];
                type = type.filter(t => t !== "null");

                if (!isRequired)
                    type = type.map(t => t + "=");

                paramDocs[parentParam ? `${parentParam}.${param}` : param] = { param: parentParam ? `${parentParam}.${param}` : param, type, description };

                if (type.includes("array") && items && Object.keys(items).length > 0) {
                    paramDocs[parentParam ? `${parentParam}.${param}` : param].items = this._getSchemaTypes(Object.keys(items), items, parentParam ? `${parentParam}.${param}` : param);
                }
            }
        });

        return paramDocs;
    }

    /**
     * @param {Array} parameters 
     * @param {Object} schemaTypes 
     * @param {String=} paramType 
     */
    _getParamDocs(parameters, schemaTypes, paramType = "param") {
        const docs = [];

        parameters.map(param => {
            const currentParam = schemaTypes[param];
            const backupTypes = currentParam.type;
            let types = currentParam.type.map(type => _.startCase(type));

            if (backupTypes.find(type => type.includes("=")))
                types = types.map(type => type ? type : "Object" + "=");

            docs.push(`     * @${paramType} {${types.join("|")}} ${param} ${currentParam.description || ""}`);

            if (schemaTypes[param].items) {
                const ds = this._getParamDocs(Object.keys(schemaTypes[param].items), schemaTypes[param].items, paramType);
                ds.split("\n").forEach(d => docs.push(d));
            }
        });

        return docs.join("\n");
    }

    _getCustomTypeDefFromSchema(schema) {

        // TODO: If array; do _getCustomTypeDefFromSchema for that
        if (!schema)
            return false;

        const schemaId = schema.id;

        if (this.customTypeDefs[schemaId])
            return this.customTypeDefs[schemaId];

        const parameters = this._getParameterNames(schema);
        const schemaTypes = this._getSchemaTypes(parameters, schema);
        const propertyDocs = this._getParamDocs(parameters, schemaTypes, "property");

        let typeDef = `
        /**
        * @typedef {Object} ${schemaId}`;

        if (propertyDocs.length > 0)
            typeDef += `\n          ${propertyDocs}`;

        typeDef += `\n        * /`;

        if (!this.customTypeDefs[schemaId])
            this.customTypeDefs[schemaId] = typeDef;

        return true;
    }
}

module.exports = ServiceClientGenerator;