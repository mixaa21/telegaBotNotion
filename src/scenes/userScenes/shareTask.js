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
            notion = new NotionService()
            let tasksArr = await notion.getActiveTasks(ctx.session.userNotionId)
            ctx.session.tasksArr = tasksArr
            taskArr = tasksArr.map((item) => {                                   // обработка элеметов массива clientsArr
                return [{ text: item.properties.Name.title[0].plain_text, callback_data: item.id }]                    // вернуть массив объектов для telegram клавиатуры с параметрами text которые будут отображаться на кнопке и callback_data с передаваемым значением
            })
            ctx.session.taskArr = taskArr
            taskArr.push([{ text: 'Отменить', callback_data: 'back' }])
            await ctx.reply("Выберите задачу которой хотите поделиться", {reply_markup: {inline_keyboard: taskArr}})
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
    return exchange
}