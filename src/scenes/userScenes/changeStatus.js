const {Scenes} = require("telegraf");
const reply = require('../../../reply.json')
const select = require("../../database/query/select");
const split = require("../../functions/split");
const functions = require("./sceneFunctions");                                        // импортируем replay.json для сообщений
const NotionService = require("../../notion/notionService");                                        // импортируем replay.json для сообщений

module.exports = async function changeStatus(client) {
    const exchange = new Scenes.BaseScene('changeStatus')                                // создаем объект exchange класса BaseScene с параметром user
    const notion = new NotionService()
    exchange.enter(async ctx => {
        try {
            let taskArr = []
            taskArr.push([{ text: 'Backlog', callback_data: 'Backlog' }])
            taskArr.push([{ text: 'To Do', callback_data: 'To Do' }])
            taskArr.push([{ text: 'In Progress', callback_data: 'In Progress' }])
            taskArr.push([{ text: 'To Check', callback_data: 'To Check' }])
            taskArr.push([{ text: 'Done', callback_data: 'Done' }])
            taskArr.push([{ text: 'Отменить', callback_data: 'back' }])
            await ctx.reply(reply.changeStatus, {reply_markup: {inline_keyboard: taskArr}})
        } catch(e) {
            console.log(e)
        }
    })
    exchange.on("callback_query", async ctx => {
        switch (ctx.update.callback_query.data) {
            case 'back':
                ctx.scene.enter('user')
                break
            default:
                notion.updateStatusTask(ctx.session.choosenTask, ctx.update.callback_query.data)
                await ctx.reply(reply.changeStatusIsDone)
                ctx.scene.enter("user")
        }
    })
    return exchange
}