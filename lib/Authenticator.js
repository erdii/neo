const sdk = require("matrix-js-sdk");

module.exports = class Authenticator {
    constructor({ config, storageManager }) {
        this.config = config;
        this.storageManager = storageManager;

        // bind some methods to `this`
        for (let fnName of ["getAccessToken", "loadAccessToken", "storeAccessToken"]) {
            this[ fnName ] = this[ fnName ].bind(this);
        }
    }

    getAccessToken() {   
        return this.loadAccessToken()
            .then(token => {
                if (token) return token;

                console.log("no access token yet");
                const server = this.config.get("server");
                const credentials = this.config.get("credentials");

                const serverUrlWithSchema = `${server.schema}${server.host}`;

                let new_token;

                return this.createAccessToken(serverUrlWithSchema, credentials.username, credentials.password)
                    .then(token => {
                        new_token = token;
                        return this.storeAccessToken(token);
                    })
                    .then(() => new_token);
            });
    }


    loadAccessToken() {
        console.log("loading access token");
        return this.storageManager.authGet(
            this.config.get("authenticator.tokenKey")
        )
            .then(token => {
                console.log("loaded access token");
                return token;
            })
            .catch(err => {
                if (err.message !== "ENOVALUE") {
                    throw err;
                }
            })
    }

    storeAccessToken(access_token) {
        console.log("storing access_token");
        return this.storageManager.authSet(
            this.config.get("authenticator.tokenKey"),
            access_token
        );
    }

    createAccessToken(serverUrlWithSchema, username, password) {
        console.log("creating access token for user: %s", username);
        return new Promise((resolve, reject) => {
            sdk.createClient(serverUrlWithSchema)
                .loginWithPassword(username, password, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log("created token");
                        resolve(res.access_token);
                    }
                });
        });
    }
}