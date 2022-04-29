const {Scenes} = require("telegraf");
const reply = require('../../../reply.json')
const select = require("../../database/query/select");
const split = require("../../functions/split");
const functions = require("./sceneFunctions");                                        // импортируем replay.json для сообщений
const NotionService = require("../../notion/notionService");                                        // импортируем replay.json для сообщений

module.exports = async function changeTitle(client) {
    const exchange = new Scenes.BaseScene('changeTitle')                                // создаем объект exchange класса BaseScene с параметром user
    const notion = new NotionService()
    exchange.enter(async ctx => {
        try {
            ctx.reply(reply.inputChangeTitle)
        } catch(e) {
            console.log(e)
        }
    })
    exchange.on("text", async ctx => {
        notion.updateNameTask(ctx.session.choosenTask, ctx.message.text)
        ctx.reply(reply.changeTaskIsDone)
        ctx.scene.enter("user")
    })
    return exchange
}