const config = require("../../config");


class ViewUtils {

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
            string = ViewUtils.replaceAll(string, colorCodedWords[i],
                `<span class="${config.colorCodedWords[colorCodedWords[i]]}">${colorCodedWords[i]}</span>`);
        }

        return string;
    }

    /**
     * Goes through keys in object (as well as its sub objects and arrays), sorts the keys and reinserts data in sorted order.
     * 
     * @param {Object} obj object to sort keys for
     */
    static sortObject(obj) {
        if ((obj instanceof Array) || !(obj instanceof Object))
            return obj;

        return sortLayer(obj);

        function sortLayer(layer) {
            const output = {};

            Object.keys(layer).sort().forEach(key => {
                if (!!layer[key] && typeof layer[key] === "object" && !(layer[key] instanceof Array)) {
                    /** If object, loop through another layer */
                    output[key] = sortLayer(layer[key]);
                } else if (!!layer[key] && (layer[key] instanceof Array)) {
                    /**If array; sort array */
                    layer[key].sort();

                    if (typeof layer[key][0] === "object") {
                        /** If array contains objects; loop through and sort each object */
                        const sortedObj = sortLayer(layer[key]);
                        output[key] = [];

                        Object.keys(sortedObj).forEach(sortedObjkey => {
                            /** Add back objects in an array (To prevent result being converted from array to object while using Object.keys) */
                            if (!output[key])
                                output[key] = [];

                            output[key].push(sortedObj[sortedObjkey]);
                        });
                    } else {
                        output[key] = layer[key];
                    }
                } else {
                    output[key] = layer[key];
                }
            });

            return output;
        }
    }

    /**
     * Loops through an object or array.
     *
     * @param {Object | Array} toLoop
     * @param {Function} handler
    */
    static sortedForEach(toLoop, handler) {
        if (!toLoop || Object.keys(toLoop).length === 0)
            return ``;

        let i = 0;

        return Object.keys(toLoop)
            .sort()
            .map(index => {
                i++;
                return handler(toLoop[index], index, i);
            });
    }

}

module.exports = ViewUtils;