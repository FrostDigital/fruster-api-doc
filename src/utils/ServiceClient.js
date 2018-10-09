class ServiceClientGenerator(){

    getServiceClientCode() {
        const className = ViewUtils.replaceAll(_.startCase(this.props.serviceName), " ", "") + "Client";
        const endpointsBySubject = {};
        const endpoints = this.props.endpoints.map((endpoint, index) => {
            const constant = this.getEndpointConstant(endpoint);
            endpointsBySubject[endpoint.subject] = constant;
            return constant;
        });
        const endpointFunctions = this.props.endpoints.map((endpoint, index) => this.getEndpointFunction(endpoint, endpointsBySubject, className));

        /** Note these strings need this formatting for the output to have the correct format */
        const code = `
const bus = require("fruster-bus");

/**
 * Note: this service client was generated automatically by api doc @ ${new Date().toJSON()}
 */
class ${className}{

    constructor(){}

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

        return code;
    }

    /**
     * @param {Object} endpoint 
     */
    getEndpointConstant(endpoint) {
        const endpointSubjectParts = endpoint.subject.split(".");
        const constantName = endpointSubjectParts[endpointSubjectParts.length - 1];

        return `${ViewUtils.replaceAll(constantName.toUpperCase(), "-", "_")}: "${endpoint.subject}"`;
    }

    /**
     * @param {Object} endpoint 
     */
    getEndpointFunction(endpoint, endpointConstantsBySubject, className) {
        try {
            const schemas = endpoint.schemas.filter(schema => schema.id === endpoint.requestSchema || schema.id === endpoint.responseSchema);

            let functionVariableName = _.camelCase(endpoint.subject).replace(_.camelCase(this.props.serviceName), "");
            functionVariableName = functionVariableName[0].toLowerCase() + functionVariableName.substring(1);

            const requestSchema = schemas.find(schema => schema.id === endpoint.requestSchema);

            const parameters = Object.keys(requestSchema && requestSchema.sample ? (Array.isArray(requestSchema.sample) ? {} : requestSchema.sample) : {});

            /** Docs */
            const description = endpoint.docs.description;
            const paramDocs = {};

            parameters.forEach(param => {
                if (requestSchema) {
                    const current = requestSchema.properties[param];
                    const description = current.description;
                    let type = current.type ? Array.isArray(current.type) ? current.type : [current.type] : ["*"];
                    type = type.filter(t => t !== "null");

                    paramDocs[param] = { param, type, description };
                }
            });

            /** Note these strings need this formatting for the output to have the correct format */
            const code = `
    /**
     * ${endpoint.deprecated ? "@deprecated " + endpoint.deprecated : description || "n/a"}
     * 
     * @param {String} reqId the request id
${this.getParamDocs(parameters, paramDocs)}
     */
    ${functionVariableName}(reqId${parameters.length > 0 ? ", " : ""}${parameters.join(", ")}){
        bus.request({
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

    getParamDocs(parameters, paramDocs) {
        const docs = parameters.map(param => {
            const currentParam = paramDocs[param];
            const types = currentParam.type.map(type => _.startCase(type));

            return `     * @param {${types.join("|")}} ${param} ${currentParam.description}`;
        });

        return docs.join("\n");
    }
}

module.exports = ServiceClientGenerator;