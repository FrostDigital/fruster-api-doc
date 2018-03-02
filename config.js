module.exports = {

    bus: process.env.BUS || "nats://localhost:4222",

    /** Port to be running webserver on */
    port: parseInt((process.env.PORT || 8080), 10),

    /** The url to the api root, in order to display accurate urls */
    apiRoot: process.env.API_ROOT || "{{host}}",

    /** Project name in order to display the name in the header and title of the page */
    projectName: process.env.PROJECT_NAME || "",

    /** Words to be color coded in service endpoints. Uses the structure {cssClass}:{word},{word};{cssClass}:{word},{word}; */
    colorCodedWords: parseColorCodedWords(process.env.COLOR_CODED_WORDS || "GET:get,find;DELETE:delete,remove,cancel,decline,unregister;POST:create,post,add,generate,approve,resend,send,set,validate,verify,authenticate,decode;PUT:put,update,change")

};

function parseColorCodedWords(string) {
    const output = {};
    const rules = string.split(";");

    rules.forEach(rule => {
        const indexOfColon = rule.indexOf(":");
        const words = rule.substring(indexOfColon + 1).split(",");

        words.forEach(word => {
            output[word] = rule.substring(0, indexOfColon);
        });
    });
    return output;
}