const config = require("../../config");


class SharedUtils {

    constructor() { }

    /**
     * @typedef {Object} ParsedSubject
     * @property {String} method
     * @property {String} url
     */

    /**
     * Parses a subject, picks out the method and transforms to url.
     * 
     * @param {String} subject
     * 
     * @return {ParsedSubject}
     */
    static parseSubjectToAPIUrl(subject) {
        let outputURL = subject;
        outputURL = module.exports.replaceAll(outputURL, ".", "/");
        outputURL = outputURL.replace("http/", "");

        const indexOfFirstSlash = outputURL.indexOf("/");
        const method = outputURL.substring(0, indexOfFirstSlash);

        outputURL = outputURL.substring(indexOfFirstSlash);

        return {
            method: method.toUpperCase(),
            url: outputURL
        };
    }

    /**
 * Replaces all instances of word in string
 * 
 * @param {String} target target string
 * @param {String} search string to be replaced
 * @param {String} replacement string to replace with
 * 
 * @return {String} {target} string with {search} replaced by {replacement}
 */
    static replaceAll(target, search, replacement) {
        return target.split(search).join(replacement);
    }

    /**
     * Adds item to array only if it does not already exist.
     * 
     * @param {Object} object object to add to array
     * @param {Array} array array to add object to
     * 
     * @return {Array}
     */
    static addUnique(object, array) {
        const objectExists = array.find((e, i, a) => {
            const isObject = e.subject === object.subject;

            if (isObject)
                a[i] = object;

            return isObject;
        });

        if (!objectExists) {
            array.push(object);
        }

        return array;
    }

    /**
     * Adds colors to selected words, defined in the config.
     * 
     * @param {String} string 
     */
    static getColorCodedTitle(string) {
        const colorCodedWords = Object.keys(config.colorCodedWords);

        for (let i = 0; i < colorCodedWords.length; i++) {
            string = SharedUtils.replaceAll(string, colorCodedWords[i],
                `<span class="${config.colorCodedWords[colorCodedWords[i]]}">${colorCodedWords[i]}</span>`);
        }

        return string;
    }

}

module.exports = SharedUtils;