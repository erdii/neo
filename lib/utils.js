const fs = require("fs");
const path = require("path");

exports.toJSON = function(name, data) {
    const filename = path.resolve("./json/", `${name}.json`);
    try {
        const json = JSON.stringify(data, null, "\t");
        fs.writeFileSync(filename, json);
    } catch (err) {
        console.error("could not dump devjson", name, err);
        console.error(data);
    }
}