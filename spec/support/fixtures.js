const fs = require("fs");

class Fixtures {

    /**
     * @return {Array<any>}
     */
    static serviceMetadata() {
        return JSON.parse(fs.readFileSync("./spec/support/metadataFixtures.json").toString());
    }

    /**
     * @return {Array<any>}
     */
    static serviceMetadata2() {
        return JSON.parse(fs.readFileSync("./spec/support/metadataFixtures2.json").toString());
    }

}

module.exports = Fixtures;