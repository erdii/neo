const path = require("path");
const { WebStorageSessionStore } = require("matrix-js-sdk");
const LocalStorage = require("node-localstorage").LocalStorage;

/**
 * provides:
 * * AuthStore: LocalStorage Api Compatible Storage
 * * SessionStore:: WebStorageSessionStore instance for e2e Sessions
 */
module.exports = class StorageManager {
    constructor({ config }) {
        const storagePath = config.get("storagePath");

        const sessionStorePath = path.resolve(
            process.cwd(),
            storagePath,
            "sessions"
        );

        this.sessionStore = new WebStorageSessionStore(
            new LocalStorage(sessionStorePath)
        );

        const authStorePath = path.resolve(
            process.cwd(),
            storagePath,
            "auth"
        );

        this.authStore = new LocalStorage(authStorePath);
    }


    authSet(key, value) {
        return new Promise((resolve, reject) => {
            this.authStore.setItem(
                key,
                JSON.stringify(value)
            );
            resolve();
        });
    }


    authGet(key) {
        return new Promise((resolve, reject) => {
            const storedString = this.authStore.getItem(key);
            if (storedString) {
                resolve(
                    JSON.parse(storedString)
                );
            } else {
                reject(
                    new Error("ENOVALUE")
                );
            }
        });
    }
}