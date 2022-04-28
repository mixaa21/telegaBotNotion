const {Scenes} = require("telegraf");
const reply = require('../../../reply.json')
const select = require("../../database/query/select");
const split = require("../../functions/split");                                        // импортируем replay.json для сообщений


module.exports = async function createTaskByTitle(client) {
    const exchange = new Scenes.BaseScene('createTaskByTitle')                                // создаем объект exchange класса BaseScene с параметром user
    exchange.enter(async ctx => {
        try {
           await ctx.reply(reply.inputTask)
        } catch(e) {
            console.log(e)
        }
    })
    exchange.on("text", async ctx => {
        ctx.session.inputTask = ctx.message.text
        await ctx.scene.enter("createTaskByAssigne")
    })
    return exchange
}