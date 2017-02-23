const sdk = require("matrix-js-sdk");

const sessionStore = require("./lib/sessionStore");

const pluginLoader = require("./lib/pluginLoader");

const config = {
	schema: process.env.SCHEMA,
	host: process.env.HOST,
	token: process.env.TOKEN,
	user: process.env.USER,
	id: `@${process.env.USER}:${process.env.HOST}`
};

if (!config.schema) throw new Error("SCHEMA unset");
if (!config.host) throw new Error("HOST unset");
if (!config.token) throw new Error("TOKEN unset");
if (!config.user) throw new Error("USER unset");

const client = sdk.createClient({
	baseUrl: config.schema + config.host,
	accessToken: config.token,
	userId: config.id,
	deviceId: "PAXOQQVLQN",
	sessionStore,
});

// load plugins
pluginLoader.loadPlugins(client);

client.on("RoomMember.membership", (event, member) => {
	if (member.membership == "invite" && member.userId === config.id) {
		client.joinRoom(member.roomId).then(() => {
			console.log("auto joined [%s]", member.roomId);
		});
	}
});

client.on("Room.timeline", (event, room, toStartOfTimeline) => {
	if (toStartOfTimeline) {
			return; // don't print paginated results
	}

	if (event.getType() !== "m.room.message") {
			return; // only print messages
	}

	const timestamp = event.getTs();

	if (timestamp < (Date.now() - 2000)) {
		return; // only print messages 
	}

	const body = (event.getContent().body || "").trim();
	const userRegex = new RegExp(`@${config.user}`, "g");

	if (!userRegex.test(body)) {
		return; // only print messages containing @{config.user}
	}

	const query = body.replace(userRegex, "").trim();

	pluginLoader.handleQuery({
		query,
		room,
		event,
		client,
	});
});

client.startClient();
