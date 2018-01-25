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

		let deref;

		try {
			deref = await $RefParser.dereference(schemaPath, {
				dereference: {
					circular: false
				}
			});
		} catch (err) {
			if (err.name === "ReferenceError") {
				deref = JSON.parse(fs.readFileSync(schemaPath).toString());
				deref.sample = "json schema contains circular $ref pointers and cannot be dereferenced.";
			}
		}

		return deref;
	}

	async buildContext(bundle) {
		await this._writeJsonSchemas(bundle);
	}

	async _writeJsonSchemas(bundle) {
		await fs.ensureDir(this.schemasDir);

		await bundle.map(async (jsonSchema) => {
			const filePath = path.join(this.schemasDir, jsonSchema.id);

			log.debug(filePath);
			return fs.writeJson(filePath, jsonSchema);
		});
	}

}

module.exports = JsonSchemaCruncher;