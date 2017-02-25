const sdk = require("matrix-js-sdk");

module.exports = class MatrixClient {
    constructor({ config, handleQuery }) {
        this.config = config;
        this.handleQuery = handleQuery;
        
        this.createClient();
        this.initHandlers();
    }

    createClient() {
        const { config } = this;

        const baseUrl = config.get("server.url");
        const userId = config.get("credentials.userid");
        const accessToken = config.get("credentials.token");

        this.client = sdk.createClient({
            baseUrl,
            accessToken,
            userId,
            // deviceId??? OMFG crypto plz
            // sessionStore??? OMFG crypto plz
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
        const userRegex = new RegExp(`@${this.config.get("credentials.username")}`, "g");

        if (!userRegex.test(body)) {
            return; // only print messages containing @{config.user}
        }

        const query = body.replace(userRegex, "").trim();

        console.log(query);
        
        this.handleQuery({
            client: this.client,
            query,
            room,
            event,
        })
    }
}