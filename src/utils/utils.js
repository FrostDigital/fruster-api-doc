require("babel-polyfill");

const uuid = require("uuid");
const path = require("path");
const log = require("fruster-log");

const filePath = path.resolve(`${__dirname}/json-schemas`);
const JsonSchemaCruncher = require("../utils/JsonSchemaCruncher");

const jsf = require("json-schema-faker");

jsf.option({
    requiredOnly: false,
    alwaysFakeOptionals: true,
    failOnInvalidTypes: false
});

jsf.format("uuid", () => uuid.v4());

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
                .then(Utils._deCirlularizeObject)
                .then(prepareSchema)
                .catch(err => {
                    let errorString = err;

                    try {
                        errorString.message = fixErrorOutput(errorString.message);
                        errorString.path = fixErrorOutput(errorString.path);
                        errorString.stack = fixErrorOutput(errorString.stack);
                    } catch (error) { }

                    return {
                        id: schema.id,
                        description: errorString,
                        _error: true, // _error so that it won't conflict with a valid schema
                        sample: errorString.message
                    };

                    function fixErrorOutput(string) {
                        return string.replace(/\\/g, "/").replace(/\"/g, "'").replace(/\n/g, "<br/>");
                    }
                })));

        function prepareSchema(schema) {
            try {
                Utils._setFakerSpecificAttrs(schema);

                if (!schema.sample) {
                    try {
                        schema.sample = jsf(schema);
                    } catch (err) {
                        schema.sample = "Unable to generate sample, most likely due to circular json schema reference structure. See json schema instead";
                    }
                }

                return schema;
            } catch (err) {
                return schema;
            }
        }

        return await Promise.all(schemaPromises)
            .then(schemas => {
                const errors = schemas.filter(result => result && result._error);
                return { schemas, errors };
            });
    }

    /**
     * Converts circular object to a non circular object, since JSON.stringify cannot do this.
     * If this is not done at this step (but rather before sending the data to the client),
     * once react is loaded on frontend, it will start to rerender the whole page 
     * (since then, the the data that was used to generate the page was different to the data sent with the page). 
     * 
     * @param {Object} schema 
     */
    static _deCirlularizeObject(schema) {
        const cache = [];

        const output = JSON.stringify(schema, function (key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    try {
                        return JSON.parse(JSON.stringify(value));
                    } catch (error) { return; }
                }
                cache.push(value);
            }

            return value;
        });

        return JSON.parse(output);
    }

    /**
     * Searches json objects and adds faker specifics.
     * 
     * @param {Object} object 
     * 
     * @return {Void}
     */
    static _setFakerSpecificAttrs(object) {
        try {
            if (object) {
                Object.keys(object).forEach(key => {
                    if (object.hasOwnProperty(key)) {
                        if (object && typeof object[key] === "object")
                            Utils._setFakerSpecificAttrs(object[key]);

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
        } catch (err) {
            log.debug("setFakerSpecificAttrs", err);
        }
    }

}

module.exports = Utils;