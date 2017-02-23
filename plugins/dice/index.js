exports.metaData = {
	name: "dice",
	keyword: "dice",
}

function getRandomInt(min = 1, max = 6) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

exports.plugin = client => ({ query, room, event}) => {
	let result;

	if (!query) {
		result = getRandomInt();
	} else {
		const [ min, max ] = query.split(" ");
		result = getRandomInt(parseInt(min, 10), parseInt(max, 10));
	}

	client.sendTextMessage(room.roomId, `The dice says: ${ result }`);
};