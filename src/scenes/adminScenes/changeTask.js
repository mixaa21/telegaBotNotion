const {Scenes} = require("telegraf");
const NotionService = require("../../notion/notionService");                                        // импортируем replay.json для сообщений

module.exports = async function changeTask(client) {
    const exchange = new Scenes.BaseScene('changeTask')                                // создаем объект exchange класса BaseScene с параметром user
    const notion = new NotionService()
    exchange.enter(async ctx => {
        try {
            let tasksArr = await notion.getAllTasksSortCreateTime()
            ctx.session.tasksArr = tasksArr
            taskArr = tasksArr.map((item) => {                                   // обработка элеметов массива clientsArr
                return [{ text: `${item.properties.Name.title[0].plain_text} (${item.properties.Status.select.name})`, callback_data: item.id }]                    // вернуть массив объектов для telegram клавиатуры с параметрами text которые будут отображаться на кнопке и callback_data с передаваемым значением
            })
            ctx.session.taskArr = taskArr
            taskArr.push([{ text: 'Отменить', callback_data: 'back' }])
            await ctx.reply("Выберите задачу, которую нужно изменить", {reply_markup: {inline_keyboard: taskArr}})
        } catch(e) {
            console.log(e)
        }
    })
    exchange.on("callback_query", async ctx => {
        switch (ctx.update.callback_query.data) {
            case 'back':
                ctx.scene.enter('admin')
                break
            default:
                ctx.session.tasksArr = ctx.session.tasksArr.filter(item => {
                    return item.id === ctx.update.callback_query.data
                })
                ctx.session.choosenTask = ctx.update.callback_query.data
                ctx.scene.enter("changeTaskMenu")
        }
    })
    return exchange
}
