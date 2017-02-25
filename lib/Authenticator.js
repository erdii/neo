const sdk = require("matrix-js-sdk");

module.exports = class Authenticator {
    constructor({ config, storageManager }) {
        this.config = config;
        this.storageManager = storageManager;

        // bind some methods to `this`
        for (let fnName of ["getCredentials", "loadCredentials", "storeCredentials"]) {
            this[ fnName ] = this[ fnName ].bind(this);
        }
    }

    getCredentials() {   
        return this.loadCredentials()
            .then(credentials => {
                if (credentials) return credentials;

                console.log("no credentials yet");

                const serverCfg = this.config.get("server");

                return this.createCredentials(
                    `${serverCfg.schema}${serverCfg.host}`,
                    this.config.get("credentials.username"),
                    this.config.get("credentials.password"))
                    .then(credentials => {
                        return this.storeCredentials(credentials)
                            .then(() => credentials);
                    });
            });
    }


    loadCredentials() {
        console.log("loading credentials");
        return this.storageManager.authGet(
            this.config.get("authenticator.tokenKey"))
            .then(credentials => {
                console.log("loaded credentials");
                return credentials;
            })
            .catch(err => {
                if (err.message !== "ENOVALUE") {
                    throw err;
                }
            })
    }

    storeCredentials(credentials) {
        console.log("storing credentials");
        return this.storageManager.authSet(
            this.config.get("authenticator.tokenKey"),
            credentials
        );
    }

    createCredentials(serverUrlWithSchema, username, password) {
        console.log("logging with user: %s", username);
        return new Promise((resolve, reject) => {
            sdk.createClient(serverUrlWithSchema)
                .loginWithPassword(username, password, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log("logged in");
                        resolve(res);
                    }
                });
        });
    }
}