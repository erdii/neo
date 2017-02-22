const axios = require("axios");

exports.login = function login({ host, user, password }) {
	return axios.post(`${host}/_matrix/client/api/v1/login`, {
		user,
		password,
		type: "m.login.password",
	})
	.then(response => response.data);
}