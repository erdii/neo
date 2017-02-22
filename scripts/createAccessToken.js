const { login } = require("./lib/registration");

login({
	host: "https://matrix.werise.de",
	user: process.env.USER,
	password: process.env.PASSWORD,
}).then(session => {
	console.log(session);
}).catch(err => {
	console.error(err);
});