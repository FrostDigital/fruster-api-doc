const fs = require("fs");

/**
 * @param {String} filename 
 */
function readFile(filename) {
    return JSON.parse(fs.readFileSync(filename).toString());
}

class Fixtures {

    /**
     * @return {Array<any>}
     */
    static serviceMetadata() {
        return readFile("./spec/support/metadataFixtures.json");
    }

    /**
     * @return {Array<any>}
     */
    static serviceMetadata2() {
        return readFile("./spec/support/metadataFixtures2.json");
    }

    /**
     * @return {Array<any>}
     */
    static metadataQueryObject() {
        return readFile("./spec/support/metadataQueryObjectFixture.json");
    }

}

module.exports = Fixtures;