import Parameter from "./Parameter";

import _ from "lodash";


export default class Utils {

	static toTitleCase(string) {
		return _.startCase(string).split(" ").join("");
	}

	static typeToTitleCase(string) {
		string = string.charAt(0).toUpperCase() + string.slice(1);

		let output = "";

		for (let i = 0; i < string.length; i++) {
			const lastChar = i > 0 ? string.charAt(i - 1) : "<";
			const char = string.charAt(i);

			if (!isLetter(lastChar))
				output += char.toUpperCase();
			else
				output += char;
		}

		return output;

		function isLetter(str) {
			return str.length === 1 && !!str.match(/[a-z]/i);
		}
	}

	/**
	 * @param {Array<Parameter>} params
	 * @return {Array<Parameter>}
	 */
	static sortParams(params) {
		return params.sort((a, b) => {
			const aVal = a.required ? 1 : 0;
			const bVal = b.required ? 1 : 0;

			return bVal - aVal;
		});
	}

	static get RESERVED_JAVASCRIPT_KEYWORDS() { return ["abstract", "arguments", "await", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "continue", "debugger", "default", "delete", "do", "double", "else", "enum", "eval", "export", "extends", "false", "final", "finally", "float", "for", "function", "goto", "if", "implements", "import", "in", "instanceof", "int", "interface", "let*", "long", "native", "new", "null", "package", "private", "protected", "public", "return", "short", "static", "super*", "switch", "synchronized", "this", "throw", "throws", "transient", "true", "try", "typeof", "var", "void", "volatile", "while", "with", "yield"]; };

	/**
	 * Replaces reserved keywords with adjusted name to not collide with them.
	 *
	 * @param {String} string
	 * @param {Boolean=} isRequestBody
	 */
	static replaceReservedKeyword(string, isRequestBody = false) {
		if (Utils.RESERVED_JAVASCRIPT_KEYWORDS.includes(string)) {
			if (isRequestBody)
				return `"${string}": ${string}Param`;
			else
				return `${string}Param`;
		} else
			return string;
	};

}
