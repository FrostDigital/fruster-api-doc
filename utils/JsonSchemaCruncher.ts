import $RefParser from "json-schema-ref-parser";
import log from "fruster-log";
import path from "path";
import fs from "fs-extra";

class JsonSchemaCruncher {

	private schemasDir: string;

	constructor(tempDir, private serviceName: string) {
		this.schemasDir = path.join(tempDir, serviceName);
	}

	async getSchema(schemaId: string) {
		log.silly("derefing", schemaId);
		const schemaPath = path.join(this.schemasDir, schemaId);

		// @ts-ignore
		return await $RefParser.dereference(schemaPath, {
			dereference: { circular: true }
		});
	}

	async buildContext(bundle: any) {
		await this._writeJsonSchemas(bundle);
	}

	async _writeJsonSchemas(bundle: any) {
		await fs.ensureDir(this.schemasDir);

		await bundle.map(async (jsonSchema) => {
			if (this.schemasDir && jsonSchema.id) {
				const filePath = path.join(this.schemasDir, jsonSchema.id);

				log.silly(filePath);
				return fs.writeJson(filePath, jsonSchema);
			} else {
				log.error("Error while writing json; this.schemasDir:", this.schemasDir, ", jsonSchema.id:", jsonSchema.id);
			}
		}).filter(p => !!p);
	}

}

export default JsonSchemaCruncher;
