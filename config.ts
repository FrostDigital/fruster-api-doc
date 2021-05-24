/*
 * NATS servers, set multiple if using cluster.
 * Example: `"nats://10.23.45.1:4222,nats://10.23.41.8:4222"`
 */
export const BUS = process.env.BUS || "nats://localhost:4222";

export const API_ROOT = process.env.API_ROOT || "https://ox-api-gateway.c4.fruster.se";

export const PORT = process.env.PORT || 3000;

/** The url to the api root, in order to display accurate urls */
export const apiRoot = process.env.API_ROOT || "{{host}}";

/** Project name in order to display the name in the header and title of the page */
export const projectName = process.env.PROJECT_NAME || "";

/** How often to poll for new metadata, in ms */
export const METADATA_POLL_RATE = Number.parseInt(process.env.METADATA_POLL_RATE || "5000");

/**
 * Words to be color coded in service endpoints. Uses the structure {cssClass}:{word},{word};{cssClass}:{word},{word};
 * Note: It goes through this list in reverse order so any extension words should be latter; e.g. `create,created` = it will look for created first and then created.
*/
export const colorCodedWords = parseColorCodedWords(process.env.COLOR_CODED_WORDS ||
	"GET:get,find;read;DELETE:delete,deleted,remove,removed,cancel,canceled,cancelled,decline,declined,unregister,unregistered,charge,logout;POST:create,created,post,posted,add,added,generate,generated,approve,approved,send,sent,resend,resent,set,validate,validated,verify,verified,authenticate,authenticated,decode,decode,join,subscribe,completed;PUT:put,update,updated,change,changed,reset,refund;PUB:pub,public;DELETE:unsubscribe;FRUSTER:fruster,service");

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
