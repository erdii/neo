exports.metaData = {
    name: "giphy",
    keyword: "giphy",
}

const giphy = require("giphy-api")({
	https: true,
});
const request = require("request");

exports.plugin = client => ({ query, room, event}) => {
    console.log("giphy plugin here", query);
    // TODO start promise chain 
    giphy.translate(query, (err, res) => {
		if (err) {
			console.error("error");
			console.error(err);
			return;
		}

		let image_url, image_height, image_width;
		
		try {
			const image = res.data.images.fixed_height;

			image_url = image.url;
			image_height = image.height;
			image_width = image.width;
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
}