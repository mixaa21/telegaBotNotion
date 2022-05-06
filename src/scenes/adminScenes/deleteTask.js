const {Scenes} = require("telegraf");
const reply = require('../../../reply.json')
const select = require("../../database/query/select");
const NotionService = require("../../notion/notionService");                                        // импортируем replay.json для сообщений

module.exports = async function deleteTask(client) {
    const exchange = new Scenes.BaseScene('deleteTask')                                // создаем объект exchange класса BaseScene с параметром user
    const notion = new NotionService(process.env.DATABASE_WORKSPACE)
    exchange.enter(async ctx => {
        arrId = []
        try {
            let tasksArr = await notion.getAllTasksSortStatus()
            ctx.session.tasksArr = tasksArr
            taskArr = tasksArr.map((item) => {                                   // обработка элеметов массива clientsArr
                return [{ text: `${item.properties.Name.title[0].plain_text} (${item.properties.Status.select.name})`, callback_data: item.id }]                    // вернуть массив объектов для telegram клавиатуры с параметрами text которые будут отображаться на кнопке и callback_data с передаваемым значением
            })
            ctx.session.taskArr = taskArr
            taskArr.push([{ text: 'Удалить', callback_data: 'delete' }])
            taskArr.push([{ text: 'Отменить', callback_data: 'back' }])
            await ctx.reply("Выберите задачи, которые нужно удалить", {reply_markup: {inline_keyboard: taskArr}})
        } catch(e) {
            console.log(e)
        }
    })
    exchange.on("callback_query", async ctx => {
        switch (ctx.update.callback_query.data) {
            case 'back':
                ctx.scene.enter('admin')
                break
            case 'delete':
                notion.deleteTask(arrId)
                ctx.reply(reply.deleteTaskIsDone)
                ctx.scene.enter("admin")
                break
            default:
               arrId.push(ctx.update.callback_query.data)
        }
    })
    return exchange
}
