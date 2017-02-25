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
    .then(authenticator.getCredentials)
    .then((credentials) => {
        matrixClient = new MatrixClient({
            handleQuery: pluginLoader.handleQuery,
            sessionStore: storageManager.sessionStore,
            config,
            credentials,
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