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
        const { client, config } = this;

        client.on("RoomMember.membership", (...args) => {
            this.invitationHandler(...args);
        });

        client.on("Room.timeline", (...args) => {
            this.messageHandler(...args);
        });

        client.on("RoomState.members", (...args) => {
            this.memberHandler(...args);
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
        const { config, client } = this;

        if (toStartOfTimeline) {
                return; // don't print paginated results
        }

        if (event.getType() !== "m.room.message") {
                return; // only handle messages
        }

        const senderDevice = client.getEventSenderDeviceInfo(event);

        if (senderDevice && senderDevice.verified === 0) {
            const deviceId = senderDevice.deviceId;
            const userId = event.getSender();
            this.trustDevice(userId, deviceId);
        }

        if (event.getTs() < (Date.now() - 2000)) {
            return; // only handle new messages
        }

        const body = (event.getContent().body || "").trim();

        const userShortRegex = new RegExp(
            `^@${config.get("credentials.username")}:?`
        , "g");

        const userLongRegex = new RegExp(
            `^${ config.get("credentials.userid") }:?`
        , "g");

        /* only print messages containing
         * @{user}
         * @{user}:
         * @{full user id}
         * @{full user id}:
         */
        if (!(userShortRegex.test(body) || userLongRegex.test(body))) {
            return;
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

    memberHandler(event, state, member) {
        const { config, client } = this;
        const { membership, userId } = member;

        if (membership !== "join" || userId === config.get("credentials.userid")) {
            return; // we only care about join messages from other users
        }

        const unverifiedUserDevices = client.getStoredDevicesForUser(userId)
            .filter(d => d.verified === 0);

        for (let device of unverifiedUserDevices) {
            const { deviceId } = device;
            this.trustDevice(userId, deviceId);
        }
    }

    trustDevice(userId, deviceId) {
        this.client.setDeviceVerified(userId, deviceId, true);
        console.log("Trusted: User: %s, Device: %s", userId, deviceId);
    }
}