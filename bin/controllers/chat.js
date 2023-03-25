const { Configuration, OpenAIApi } = require("openai");
const path = require("path")
const { readFileSync, writeFile } = require("fs");
const { dataFile } = require("../config/config");
const { OpenAIKey } = require("../config/key");
const Logger = require("../utils/logger");

const openai = new OpenAIApi(
    new Configuration({ apiKey: OpenAIKey })
);

let chat = async ctx => {
    const user = ctx.request.body.user;
    const text = ctx.request.body.text;
    // TODO: 持久化用户对话历史数据，暂时用json文件存储
    const dbPath = path.resolve(__dirname, dataFile)
    const db = readFileSync(dbPath).toString();
    const historyData = JSON.parse(db);
    const messages = historyData[user] || []
    messages.push({"role": "user", "content": text});
    try {
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            // 角色prompt拼接历史数据
            messages: historyData["ADMIN"].concat(messages),
        });
        messages.push(response["data"]["choices"][0]["message"]);
        Logger("resLogger").info(`user: ${user}, text: ${text}, history: ${JSON.stringify(messages)}`);
        // TODO: 持久化对话数据
        historyData[user] = messages;
        writeFile(dbPath, JSON.stringify(historyData), (err) => { if (err) throw err; });
        ctx.response.body = {
            "msg": response["data"]["choices"][0]["message"]["content"]
        };
        // ctx.response.body = {
        //     "msg": "测试返回"
        // };
    } catch(err) {
        ctx.response.status = 500
        ctx.response.body = {
            "msg": err.message
        }
        Logger("errLogger").error(`user: ${user}, text: ${text}, history: ${JSON.stringify(messages)}, err: ${err}`);
    }
};

module.exports = {
    "POST /chat": chat
}