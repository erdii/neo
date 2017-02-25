const sdk = require("matrix-js-sdk");

module.exports = class MatrixClient {
    constructor({ config, handleQuery, credentials, sessionStore }) {
        this.config = config;
        this.handleQuery = handleQuery;
        this.credentials = credentials;
        this.sessionStore = sessionStore;

        this.createClient();
        this.initHandlers();
    }

    createClient() {
        const { config, credentials, sessionStore } = this;

        const baseUrl = config.get("server.url");
        const userId = config.get("credentials.userid");

        this.client = sdk.createClient({
            baseUrl,
            userId,
            sessionStore,
            accessToken: credentials.access_token,
            deviceId: credentials.device_id,
        });
    }

    startClient() {
        this.client.startClient();
    }

    initHandlers() {
        this.client.on("RoomMember.membership", (...args) => {
            this.invitationHandler(...args);
        });

        this.client.on("Room.timeline", (...args) => {
            this.messageHandler(...args);
        });
    }

    invitationHandler(event, member) {
        if (member.membership == "invite" && member.userId === this.config.get("credentials.userid")) {
            this.client.joinRoom(member.roomId).then(() => {
                console.log("auto joined [%s]", member.roomId);
            });
        }
    }

    messageHandler(event, room, toStartOfTimeline) {
        if (toStartOfTimeline) {
                return; // don't print paginated results
        }

        if (event.getType() !== "m.room.message") {
                return; // only print messages
        }

        const timestamp = event.getTs();

        if (timestamp < (Date.now() - 2000)) {
            return; // only print messages 
        }

        const body = (event.getContent().body || "").trim();
        
        const userShortRegex = new RegExp(
            `^@${this.config.get("credentials.username")}:?`
        , "g");

        const userLongRegex = new RegExp(
            `^${ this.config.get("credentials.userid") }:?`
        , "g");

        if (!(userShortRegex.test(body) || userLongRegex.test(body))) {
            return; // only print messages containing @{config.user}
        }

        const query = body
            .replace(userLongRegex, "")
            .replace(userShortRegex, "")
            .trim();

        this.handleQuery({
            client: this.client,
            query,
            room,
            event,
        })
    }
}