const allowedCurrencies = require("./lib/allowedCurrencies");
const actionClassifier = require("./lib/actionClassifier");
const api = require("./lib/api");

exports.metaData = {
	name: "bitcoin",
	keyword: "btc",
};

exports.plugin = client => ({ query, room, event }) => {
	handleQuery(client, query, room)
		.catch(err => {
			console.log(err);
			return client.sendTextMessage(room.roomId, "Error:\n" + err);
		});
};

function handleQuery(client, query, room) {
	return Promise.resolve()
		.then(() => actionClassifier.classify(query))
		.then(action => {
			switch(action) {
				case "price": return getPrice(query);
				case "tobtc": return getToBtc(query);
				case "balance": return getBalance(query);
				default: return Promise.resolve("wat?");
			}
		})
		.then(response => {
			return client.sendTextMessage(room.roomId, response);
		});
}

function getPrice(query) {
	return api.getCurrentTickerData()
		.then(ticker => {
			const price = ticker["EUR"].last;
			return "1 BTC = " + price + "€";
		});
}

function getBalance(query) {
	const [action, address] = query.split(" ");
	return api.getBalance(address)
		.then(balance => (
			`Your balance is: ${ balance } satoshis.`
		));
}

function getToBtc(query) {
	return Promise.resolve("TODO: tobtc");
}