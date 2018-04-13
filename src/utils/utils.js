require("babel-polyfill");

const uuid = require("uuid");
const constants = require("../constants");
const path = require("path");
const log = require("fruster-log");
const util = require("util");
const os = require("os");

const filePath = path.resolve(`${__dirname}/json-schemas`);
const JsonSchemaCruncher = require("../utils/JsonSchemaCruncher");

const jsf = require("json-schema-faker");

jsf.option({
    requiredOnly: false,
    alwaysFakeOptionals: true,
    failOnInvalidTypes: false
});

class Utils {

    /**
        * derefs json schemas
        * 
        * @param {Array<Object>} schemas schemas to save to folder
        * 
        * @return {Promise<Object>}
        */
    static async  derefJsonSchema(schemas, serviceName) {
        const jsonSchemaCruncher = new JsonSchemaCruncher(filePath, serviceName);
        await jsonSchemaCruncher.buildContext(schemas);

        const schemaPromises = [];

        schemas.forEach(schema => schemaPromises.push(
            jsonSchemaCruncher.getSchema(schema.id)
                .then(schema => {
                    setFakerSpecificAttrs(schema);

                    if (!schema.sample)
                        schema.sample = jsf(schema);

                    return schema;
                }).catch(err => {
                    let errorString = err;

                    try {
                        errorString.message = fixErrorOutput(errorString.message);
                        errorString.path = fixErrorOutput(errorString.path);
                        errorString.stack = fixErrorOutput(errorString.stack);
                    } catch (error) { }

                    return {
                        id: schema.id,
                        description: errorString,
                        error: true,
                        sample: errorString.message
                    };

                    function fixErrorOutput(string) {
                        return string.replace(/\\/g, "/").replace(/\"/g, "'").replace(/\n/g, "<br/>");
                    }
                })));

        return await Promise.all(schemaPromises)
            .then(schemas => {
                const errors = schemas.filter(result => result.error);
                return { schemas, errors };
            });
    }

}

module.exports = Utils;

/**
 * Searches json objects and adds faker specifics.
 * 
 * @param {Object} object 
 * 
 * @return {Void}
 */
function setFakerSpecificAttrs(object) {
    if (object) {
        Object.keys(object).forEach(key => {
            if (object.hasOwnProperty(key)) {
                if (object && typeof object[key] === "object")
                    setFakerSpecificAttrs(object[key]);

                switch (object[key]) {
                    case "uuid":
                        object["faker"] = "random.uuid";
                        break;
                    case "uri":
                        object["faker"] = "internet.url";
                        break;
                }

                switch (key) {
                    case "email":
                        object[key]["faker"] = "internet.email";
                        break;
                    case "password":
                        object[key]["faker"] = "internet.password";
                        break;

                    case "firstName":
                        object[key]["faker"] = "name.firstName";
                        break;
                    case "middleName":
                        object[key]["faker"] = "name.firstName";
                        break;
                    case "lastName":
                        object[key]["faker"] = "name.lastName";
                        break;
                }
            }
        });
    }
}