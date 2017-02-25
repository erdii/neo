const convict = require("convict");

const conf = convict({
    env: {
        env: "NODE_ENV",
        doc: "the node execution environment",
        format: ["development", "production", "test"],
        default: "development",
    },

    credentials: {
        username: {
            env: "USER",
            doc: "matrix username",
            format: String,
            default: null,
        },
        password: {
            env: "PASSWORD",
            doc: "matrix password",
            format: String,
            default: null,
        },
        userid: {
            doc: "internal userid variable",
            format: String,
            default: null,
        },
    },

    server: {
        schema: {
            env: "SCHEMA",
            doc: "server schema (http or https)",
            format: [
                "http://",
                "https://",
            ],
            default: "https://",
        },
        host: {
            env: "HOST",
            doc: "matrix host url (without schema)",
            format: String,
            default: null,
        },
        url: {
            doc: "internal variable for the host url 'schema + host'",
            format: String,
            default: null,
        },
    },

    storagePath: {
        env: "STORAGEPATH",
        doc: "folder to store localstorage content",
        format: String,
        default: "./storages",
    },
});

conf.set("server.url", conf.get("server.schema") + conf.get("server.host"));
conf.set("credentials.userid", `@${ conf.get("credentials.username") }:${ conf.get("server.host") }`);

conf.validate({
    strict: true,
});

if (conf.get("env") === "development") {
    console.log(conf.get());
}

module.exports = conf;