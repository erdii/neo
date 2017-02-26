exports.metaData = {
	name: "trumpsay",
	keyword: "trump",
}

const request = require("request");
const querystring = require("querystring");

const random_url = "https://api.whatdoestrumpthink.com/api/v1/quotes/random";
const personalized_url = "https://api.whatdoestrumpthink.com/api/v1/quotes/personalized";

function buildUrl(query) {
	if (!query) {
		return random_url;
	} else {
		return `${ personalized_url }?${ querystring.stringify({ q: query}) }`
	}
}

exports.plugin = client => ({ query, room, event}) => {
	request.get(buildUrl(query), (err, response) => {
		if (err) {
			console.error(new Date().toLocaleString(), err);
			client.sendTextMessage(room.roomId, "Sorry an error occured");
			return;
		}

		let trumpQuote;

		try {
			const parsed = JSON.parse(response.body);
			trumpQuote = parsed.message;
		} catch (err) {
			console.error(new Date().toLocaleString(), err);
			client.sendTextMessage(room.roomId, "Sorry an error occured");
			return;
		}

		client.sendTextMessage(room.roomId, `Trump says: ${ trumpQuote }`);
	});
}