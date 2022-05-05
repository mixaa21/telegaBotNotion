const {Scenes} = require("telegraf");
const reply = require('../../../reply.json')
const select = require("../../database/query/select");
const split = require("../../functions/split");
const NotionService = require("../../notion/notionService");                                        // импортируем replay.json для сообщений


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
        if (String(ctx.chat.id) === process.env.ADMIN_CHAT_ID) {        // если чат равен id админского чата
            await ctx.scene.enter("createTaskByAssigne")
        } else {
            notion = new NotionService()
            await notion.createTask(ctx.session.chosenClientname, ctx.session.chosenProject, ctx.session.inputTask, [{id: ctx.session.userNotionId,
                person: {}}])
            await ctx.reply(reply.taskIsCreated)
            ctx.scene.enter('user')                                      // войти в сцену юзер
        }


    })
    return exchange
}