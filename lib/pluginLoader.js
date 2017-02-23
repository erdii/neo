const fs = require("fs");
const path = require("path");

const pluginPath = path.resolve(__dirname, "../plugins");

const pluginModuleSet = new Set();
const pluginFunctionMap = new Map();

function listPlugins() {
    return fs.readdirSync(pluginPath)
        .filter(file => fs.statSync(path.join(pluginPath, file)).isDirectory());
}

exports.loadPlugins = function loadPlugins(client) {
    const plugins = listPlugins();

    for (let pluginName of plugins) {
        const pluginModule = require(
            path.resolve(pluginPath, pluginName)
        );

        pluginModuleSet.add(pluginModule);

        pluginFunctionMap.set(
            pluginModule.metaData.keyword,
            pluginModule.plugin(client)
        );
    }

    console.log("Loaded Plugins:", plugins);
}

exports.handleQuery = function handleQuery({ query, room, event }) {
    const [wantedPlugin, ...tokens] = query.split(" ");

    console.log("wantedPlugin: %s", wantedPlugin);

    const plugin = pluginFunctionMap.get(wantedPlugin);

    if (!plugin) {
        console.warn("TODO: send msg that i don't know this plugin");
        return;
    }

    plugin({
        query: tokens.join(" "),
        room,
        event,
    });
}