const {Scenes} = require("telegraf");
const reply = require('../../../reply.json')
const select = require("../../database/query/select");
const split = require("../../functions/split");
const functions = require("./sceneFunctions");                                        // импортируем replay.json для сообщений
const NotionService = require("../../notion/notionService");                                        // импортируем replay.json для сообщений

module.exports = async function shareTask(client) {
    const exchange = new Scenes.BaseScene('shareTask')                                // создаем объект exchange класса BaseScene с параметром user
    exchange.enter(async ctx => {
        try {
            notion = new NotionService(process.env.DATABASE_WORKSPACE)
            let tasksArr = await notion.getActiveTasks(ctx.session.userNotionId)
            if (tasksArr.length) {
                ctx.session.tasksArr = tasksArr
                taskArr = tasksArr.map((item) => {                                   // обработка элеметов массива clientsArr
                    return [{ text: `${item.properties.Name.title[0].plain_text} (${item.properties.Status.select.name})`, callback_data: item.id }]                    // вернуть массив объектов для telegram клавиатуры с параметрами text которые будут отображаться на кнопке и callback_data с передаваемым значением
                })
                ctx.session.taskArr = taskArr
                taskArr.push([{ text: 'Отменить', callback_data: 'back' }])
                await ctx.reply(reply.chooseTask, {reply_markup: {inline_keyboard: taskArr}})
            } else {
                await ctx.reply(reply.noTasks)
                ctx.scene.enter('user')
            }

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
                ctx.session.tasksArr = ctx.session.tasksArr.filter(item => {
                    return item.id === ctx.update.callback_query.data
                })
                ctx.scene.enter('shareTaskByAssignee')
        }
    })
    exchange.on('text', async ctx => {
        ctx.reply(reply.chooseKey)
    })
    return exchange
}
