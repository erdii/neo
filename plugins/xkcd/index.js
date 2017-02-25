const request = require("request");

exports.metaData = {
	name: "xkcd",
	keyword: "xkcd",
};

exports.plugin = client => ({ query, room, event}) => {
	let name;
	
	getCurrentComicData().then(comic => {
		name = comic.alt;

		const stream = request.get(comic.img);

		return client.uploadContent({
			stream,
			name,
		});
	}).then((url) => {
		const content = {
			msgtype: "m.image",
			body: name,
			url: JSON.parse(url).content_uri,
		};
		return client.sendMessage(room.roomId, content);
	}).catch(err => {
		return client.sendTextMessage(room.roomId, "Error:\n" + err);
	});
};

function getCurrentComicData() {
	return new Promise((resolve, reject) => {
		request.get("https://xkcd.com/info.0.json", (err, response) => {
			if (err) {
				reject(err);
				return;
			}

			resolve(JSON.parse(response.body))
		});
	});
};