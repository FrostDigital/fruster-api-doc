const $RefParser = require("json-schema-ref-parser");
const os = require("os");
const fs = require("fs-extra");
const path = require("path");
const log = require("fruster-log");

class JsonSchemaCruncher {

	constructor(tempDir, serviceName) {
		this.serviceName = serviceName;
		this.schemasDir = path.join(tempDir, serviceName);
	}

	async getSchema(schemaId) {
		log.debug("derefing", schemaId);
		const schemaPath = path.join(this.schemasDir, schemaId);

		return await $RefParser.dereference(schemaPath);
	}

	async buildContext(bundle) {
		await this._writeJsonSchemas(bundle);
	}

	async _writeJsonSchemas(bundle) {
		await fs.ensureDir(this.schemasDir);

		await bundle.map(async (jsonSchema) => {
			if (this.schemasDir && jsonSchema.id) {
				const filePath = path.join(this.schemasDir, jsonSchema.id);

				log.debug(filePath);
				return fs.writeJson(filePath, jsonSchema);
			} else {
				log.error("Error while writing json; this.schemasDir:", this.schemasDir, ", jsonSchema.id:", jsonSchema.id);
			}
		}).filter(p => !!p);
	}

}

module.exports = JsonSchemaCruncher;