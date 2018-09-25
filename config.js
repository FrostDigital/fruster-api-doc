module.exports = {

    bus: process.env.BUS || "nats://localhost:4222",

    /** Port to be running webserver on */
    port: parseInt((process.env.PORT || 8080), 10),

    /** The url to the api root, in order to display accurate urls */
    apiRoot: process.env.API_ROOT || "{{host}}",

    /** Project name in order to display the name in the header and title of the page */
    projectName: process.env.PROJECT_NAME || "",

    /** 
     * Words to be color coded in service endpoints. Uses the structure {cssClass}:{word},{word};{cssClass}:{word},{word}; 
     * Note: It goes through this list in reverse order so any extension words should be latter; e.g. `create,created` = it will look for created first and then created. 
    */
    colorCodedWords: parseColorCodedWords(process.env.COLOR_CODED_WORDS ||
        "GET:get,find;DELETE:delete,deleted,remove,removed,cancel,canceled,cancelled,decline,declined,unregister,unregistered;POST:create,created,post,posted,add,added,generate,generated,approve,approved,send,sent,resend,resent,set,validate,validated,verify,verified,authenticate,authenticated,decode,decode;PUT:put,update,updated,change,changed,reset;PUB:pub")

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