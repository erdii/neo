exports.metaData = {
	name: "coin",
	keyword: "coin",
}

exports.plugin = client => ({ query, room, event}) => {
	client.sendTextMessage(room.roomId, `The coin says: ${(
		(Math.random() < 0.5)
		? "Head"
		: "Tail"
	)}`);
};