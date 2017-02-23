exports.metaData = {
	name: "maps_pics",
	keyword: "maps",
}

const querystring = require("querystring");
const request = require("request");

const validation = require("./validation");

function urlBuilder(lat, lon, type) {
	const queryConfig = {
		size: "600x600",
		maptype: type,
		// center: `${ lat },${ lon }`,
		// zoom: 19,
		markers: [
			`color:red|${ lat },${ lon }`
		],
	}

	return `https://maps.googleapis.com/maps/api/staticmap?${querystring.stringify(queryConfig)}`;
}

function extractUrl(query) {
	return new Promise((resolve, reject) => {
		const [lat, lon, type = "satellite"] = query.split(" ");

		const validationErrors = validation.validateLatLonType(lat, lon, type);

		if (validationErrors.length) {
			reject(validationErrors.join("\n"));
		} else {
			resolve(urlBuilder(lat, lon, type));
		}
	});
}

exports.plugin = client => ({ query, room, event}) => {
	const name = `Map snippet for ${query}`;
	
	extractUrl(query).then((url) => {
		const stream = request.get(url);

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