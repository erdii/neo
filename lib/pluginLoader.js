const fs = require("fs");
const path = require("path");

const pluginPath = path.resolve(__dirname, "../plugins");

const pluginModuleSet = new Set();
const pluginFunctionMap = new Map();
const pluginKeywordList = [];

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
        pluginKeywordList.push(pluginModule.metaData.keyword);

        pluginFunctionMap.set(
            pluginModule.metaData.keyword,
            pluginModule.plugin(client)
        );
    }

    console.log("Loaded Plugins:", plugins);
}

exports.handleQuery = function handleQuery({ client, query, room, event }) {
    const [wantedPlugin, ...tokens] = query.split(" ");

    const plugin = pluginFunctionMap.get(wantedPlugin);

    if (!plugin) {
        client.sendTextMessage(room.roomId, `Sorry I dont know the plugin '${ wantedPlugin }'.\nTry one of [${ pluginKeywordList.toString() }]`);
        return;
    }

    plugin({
        query: tokens.join(" "),
        room,
        event,
    });
}