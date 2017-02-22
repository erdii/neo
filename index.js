const request = require("request");
const sdk = require("matrix-js-sdk");
const giphy = require("giphy-api")({
	https: true,
});
const utils = require("./lib/utils");

const config = {
	schema: process.env.SCHEMA,
	host: process.env.HOST,
	token: process.env.TOKEN,
	user: process.env.USER,
	id: `@${process.env.USER}:${process.env.HOST}`
};

console.log(config);

if (!config.schema) throw new Error("SCHEMA unset");
if (!config.host) throw new Error("HOST unset");
if (!config.token) throw new Error("TOKEN unset");
if (!config.user) throw new Error("USER unset");

const client = sdk.createClient({
	baseUrl: config.schema + config.host,
	accessToken: config.token,
	userId: config.id,
});

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

	const sender = event.getSender();
	const query = body.replace(userRegex, "").trim();

	giphy.random(query, (err, res) => {
		if (err) {
			console.error("error");
			console.error(err);
			return;
		}

		let image_url, image_height, image_width;
		
		try {
			image_url = res.data.image_url;
			image_height = res.data.image_height;
			image_width = res.data.image_width;
		} catch (err) {
			console.error("error");
			console.error(err);
			return;
		}

		if (!image_url) {
			client.sendTextMessage(room.roomId, "Sorry nothing found");
			return; // no gif found
		}

		const name = `Random GIF for ${query}`;
		const stream = request.get(image_url);

		client.uploadContent({
			stream,
			name,
		}).then((url) => {
			const content = {
				msgtype: "m.image",
				body: name,
				url: JSON.parse(url).content_uri,
				info: {
					mimetype: "image/gif",
					h: image_height,
					w: image_width,
				},
			};
			return client.sendMessage(room.roomId, content);
		}).catch(err => {
			console.error("error");
			console.error(err);
		});
	});
});

client.startClient();
