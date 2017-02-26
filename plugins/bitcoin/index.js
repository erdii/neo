exports.metaData = {
	name: "bitcoin",
	keyword: "btc",
}

const request = require("request");

function getCurrentTickerData() {
	return new Promise((resolve, reject) => {
		request.get("https://blockchain.info/de/ticker", (err, response) => {
			if (err) {
				reject(err);
				return;
			}

			resolve(JSON.parse(response.body));
		});
	});
}

function getCurrencyInBitcoin(currency, amount) {
	return new Promise((resolve, reject) => {
		if (!allowedCurrencies.includes(currency)) {
			return reject("currency not found try:\n" + allowedCurrencies.join("\n"));
		}

		request.get(`https://blockchain.info/tobtc?currency=${ currency }&value=${ amount }`, (err, response) => {
			if (err) {
				reject(err);
				return;
			}

			resolve(response.body);
		});
	});
}

const allowedCurrencies = ["AUD", "BRL", "CAD", "CHF", "CLP", "CNY", "DKK", "EUR", "GBP", "HKD", "ISK", "JPY", "KRW", "NZD", "PLN", "RUB", "SEK", "SGD", "THB", "TWD", "USD"]

function handleQuery(client, query, room) {
	return Promise.resolve()
		.then(() => {
			const tokens = query.split(" ");
		
			if (tokens.length == 0 || tokens.length == 1) {
				return getCurrentTickerData()
					.then(ticker => {
						const currency = allowedCurrencies.includes(query) ? query : "EUR";
						const currencyValues = ticker[currency];
						const { symbol, last } = currencyValues;
						return client.sendTextMessage(room.roomId, `1 BTC = ${ last }${ symbol }`);
					});
			}
			else if (tokens.length === 2) {
				const [_amount, currency] = tokens;
				const amount = parseInt(_amount, 10);
				return getCurrencyInBitcoin(currency, amount)
					.then(btcAmount => {
						return client.sendTextMessage(room.roomId, `${ amount }${ currency } = ${ btcAmount } BTC`)
					});
			}
			else if (tokens.length === 3) {
				const [_amount, _in, currency] = tokens;
				const amount = parseFloat(_amount);

				if (_in !== "in") return; // TODO err msg
				if (!allowedCurrencies.includes(currency)) return; // TODO err msg

				return getCurrentTickerData()
					.then(ticker => {
						const currencyValues = ticker[currency];
						const { symbol, last } = currencyValues;
						return client.sendTextMessage(room.roomId, `${ amount } BTC = ${ last * amount }${ symbol }`);
					});
			}
		});
}

exports.plugin = client => ({ query, room, event }) => {
	handleQuery(client, query, room)
		.catch(err => {
			console.log(err);
			return client.sendTextMessage(room.roomId, "Error:\n" + err);
		});
};