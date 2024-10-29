// jsonReporter.js
const fs = require('fs');
const path = require('path');

class JsonReporter {
    constructor(globalConfig) {
        this.globalConfig = globalConfig;
        this.results = [];
    }

    onRunComplete(contexts, results) {
        this.results.push(results);
        const jsonFilePath = path.join(__dirname, 'testResults.json');
        fs.writeFileSync(jsonFilePath, JSON.stringify(this.results, null, 2));
    }
}

module.exports = JsonReporter;
