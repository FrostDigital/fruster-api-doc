const $RefParser = require("json-schema-ref-parser");
const os = require("os");
const fs = require("fs-extra");
const path = require("path");
const log = require("fruster-log");

class JsonSchemaCruncher {

	constructor(tempDir) {
		this.tempDir = tempDir || os.tmpdir();
	}

	getSchema(schemaId) {
		log.debug("derefing", schemaId);
		const schemaPath = path.join(this.schemasDir, schemaId);
		return $RefParser.dereference(schemaPath);
	}

	async buildContext(serviceName, bundle) {
		await this._writeJsonSchemas(serviceName, bundle);
	}

	async _writeJsonSchemas(serviceName, bundle) {
		this.schemasDir = path.join(this.tempDir, serviceName);

		await fs.ensureDir(this.schemasDir);

		await bundle.map(async (jsonSchema) => {
			const filePath = path.join(this.schemasDir, jsonSchema.id);
			log.debug(filePath);
			return fs.writeJson(filePath, jsonSchema);
		});
	}

}

module.exports = JsonSchemaCruncher;