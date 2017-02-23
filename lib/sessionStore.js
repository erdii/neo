const path = require("path");
const { WebStorageSessionStore } = require("matrix-js-sdk");
const LocalStorage = require("node-localstorage").LocalStorage;

module.exports = new WebStorageSessionStore(new LocalStorage(path.resolve(
    process.cwd(),
    "localStorage"
)));