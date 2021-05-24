import React from "react";
import { colorCodedWords as colorCodedWordsConfig } from "../config";

export interface ParsedSubject {
	method: string;
	url: string;
}

class ViewUtils {

	constructor() { }


	/**
	 * Parses a subject, picks out the method and transforms to url.
	 */
	static parseSubjectToAPIUrl(subject: string): ParsedSubject {
		let outputURL = subject;

		outputURL = ViewUtils.replaceAll(outputURL, ".", "/");
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
	 * @return {String} {target} string with {search} replaced by {replacement}
	 */
	static replaceAll(target: string, search: string, replacement: string) {
		if (!target.split)
			return target;

		return target.split(search).join(replacement);
	}

	/**
	 * Adds item to array only if it does not already exist.
	 *
	 * @return {Array}
	 */
	static addUnique(object: any, array: any[]) {
		const objectExists = array.find((endpoint, index, array) => {
			/** Makes sure we do not add the same endpoint twice */
			const isObject = endpoint.subject === object.subject && endpoint.serviceName.split(".")[0] === object.serviceName.split(".")[0];

			if (isObject)
				array[index] = object;

			return isObject;
		});

		if (!objectExists)
			array.push(object);

		return array;
	}

	/**
	 * Adds colors to selected words, defined in the config.
	 */
	static getColorCodedTitle(string: string) {
		if (Array.isArray(string))
			string = string.map(string => string.toString()).join("");
		const colorCodedWords = Object.keys(colorCodedWordsConfig).reverse();

		for (let i = 0; i < colorCodedWords.length; i++) {
			string = ViewUtils.replaceAll(string, colorCodedWords[i],
				`<span class="${colorCodedWordsConfig[colorCodedWords[i]]}">${colorCodedWords[i]}</span>`);
		}

		return <span dangerouslySetInnerHTML={{ __html: string }} />;
	}

	static getStyledUrlParamUrl(url: string, divider: string = "/") {
		const urlParts = url.split(divider).map((part, i) => {
			if (!part.length)
				return;

			if (part.includes(":"))
				return <React.Fragment key={url + i}>/<span className="url-param">{part}</span></React.Fragment >;
			else
				return <React.Fragment key={url + i}>/{part}</React.Fragment >;
		});

		return urlParts;
	}

	static getStyledUrlParamUrlString(url: string, divider: string = "/") {
		const urlParts = url.split(divider).map(part => {
			if (part.includes(":"))
				return `<span class="url-param">${part}</span>`;
			else
				return part;
		});

		return urlParts.join(divider);
	}

	/**
	 * Goes through keys in object (as well as its sub objects and arrays), sorts the keys and reinserts data in sorted order.
	 */
	static sortObject(obj: any) {
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
	 * @return {Array}
	*/
	static sortedForEach(toLoop: any | any[], handler: (obj: any, key?: string, index?: number) => any) {
		if (!toLoop || Object.keys(toLoop).length === 0)
			return [];

		let i = 0;

		return Object.keys(toLoop)
			.sort()
			.map(key => {
				i++;
				return handler(toLoop[key], key, i);
			});
	}

}

export default ViewUtils;
