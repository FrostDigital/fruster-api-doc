const fs = require("fs");

class Fixtures {

    /**
     * @return {Array<any>}
     */
    static serviceMetadata() {
        return JSON.parse(fs.readFileSync("./spec/support/metadataFixtures.json").toString());
    }

}

module.exports = Fixtures;