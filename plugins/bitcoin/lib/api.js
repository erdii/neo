const request = require("request");
const allowedCurrencies = require("./allowedCurrencies");

exports.getCurrentTickerData = function getCurrentTickerData() {
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

exports.getCurrencyInBitcoin = function getCurrencyInBitcoin(currency, amount) {
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

exports.getBalance = function getBalance(address) {
	return new Promise((resolve, reject) => {
		const clean = encodeURIComponent(address);
		request.get(`https://blockchain.info/q/addressbalance/${ clean }?confirmations=6`, (err, response) => {
			if (err) {
				reject(err);
				return;
			}

			switch(response.body) {
				case "Checksum does not validate":
					return reject("wrong address");
				default:
					const balance = parseInt(response.body, 10);
					return resolve(balance);
			}
		});
	});
}