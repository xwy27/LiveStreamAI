const https = require("https");
const Logger = require('../utils/logger');

const URL = "https://api.live.bilibili.com/room/v1/Room/room_init?id=";

async function getRoomId(room) {
    return await new Promise((resolve, reject) => {
        https.get(URL + room, (response) => {
            let res = '';
            // called when a data chunk is received.
            response.on('data', (chunk) => {
                res += chunk;
            });
            // called when the complete response is received.
            response.on('end', () => {
                resolve(JSON.parse(res).data.room_id);
            });
        }).on("error", (error) => {
            reject("Error: " + error.message);
        });
    })
}

let room = async ctx => {
    try {
        let roomId = await getRoomId(ctx.request.query["room"]);
        Logger('resLogger').info(`request: ${ctx.request.queryString}, roomId: ${roomId}`);
        ctx.response.body = {
            roomId: roomId
        };
    } catch(err) {
        Logger('errLogger').error(`request: ${ctx.request.queryString}, err: ${err}`);
    }

}

module.exports = {
    'GET /room': room
}