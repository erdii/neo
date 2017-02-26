const request = require("request");
const HttpsAgent = require('socks5-https-client/lib/Agent');
const HttpAgent = require('socks5-http-client/lib/Agent');

const defaultConfig = {
	socksHost: "localhost",
	socksPort: 9050,
};

module.exports = function (_config) {
	const config = Object.assign(
		{},
		defaultConfig,
		_config
	);

	return function torifiedRequest(requestOptions) {
		return new Promise((resolve, reject) => {
			const agentClass = (
				requestOptions.url.startsWith("https://")
				? HttpsAgent
				: HttpAgent
			);

			request(Object.assign({}, requestOptions, {
				agentClass,
				agentOptions: config,
			}), function (err, res) {
				if (err) {
					reject(err);
				} else {
					resolve(res.body);
				}
			});
		})
	}
}