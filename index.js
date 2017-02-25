/*
The plan: 
+ load the "config module" which does:
    * parse envvars, etc
* load the "storage module" which does:
    * storage for the authenticator
    * e2e session storage
* load the "authenticator" which does:
    * check if we already have an access token
    * if yes use it
    * if not login with our credentials
    * use the acquired token
* load the all plugins:
    * scan for plugins
    * load them
* spin up the actual client instance and:
    * listen for invitiations:
        * follow them
    * discover new device keys
        * trust them when we see them (?)
    * listen for room messages:
        * if activation criteria are met run a plugin
*/

const StorageManager = require("./lib/StorageManager");
const Authenticator = require("./lib/Authenticator");
const MatrixClient = require("./lib/MatrixClient");
const pluginLoader = require("./lib/pluginLoader");

const config = require("./lib/config");

const storageManager = new StorageManager({
    config,
});

const authenticator = new Authenticator({
    config,
    storageManager,
});

let matrixClient;

Promise.resolve()
    .then(authenticator.getAccessToken)
    .then(token => {
        console.log("Got Token: %s", token);
        config.set("credentials.token", token);
    })
    .then(() => {
        matrixClient = new MatrixClient({
            handleQuery: pluginLoader.handleQuery,
            config,
        });
    })
    .then(() => {
        pluginLoader.loadPlugins(matrixClient.client);
    })
    .then(() => {
        matrixClient.startClient();
    })
    .catch(err => {
        console.error("Fatal:", err);
    });