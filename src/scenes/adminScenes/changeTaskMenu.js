const {Scenes} = require("telegraf");
const NotionService = require("../../notion/notionService");                                        // импортируем replay.json для сообщений

module.exports = async function changeTaskMenu(client) {
    const exchange = new Scenes.BaseScene('changeTaskMenu')                                // создаем объект exchange класса BaseScene с параметром user
    const notion = new NotionService(process.env.DATABASE_WORKSPACE)
    exchange.enter(async ctx => {
        try {
            let taskArr = []
            taskArr.push([{ text: 'Изменить постановку задачи', callback_data: 'changeTitle' }])
            taskArr.push([{ text: 'Изменить исполнителей', callback_data: 'changeAssignee' }])
            taskArr.push([{ text: 'Изменить статус', callback_data: 'changeStatus' }])
            // taskArr.push([{ text: 'Изменить клиента', callback_data: 'changeClient' }])
            // taskArr.push([{ text: 'Изменить проект', callback_data: 'changeProject' }])
            taskArr.push([{ text: 'Отменить', callback_data: 'back' }])
            await ctx.reply("Выберите, что вы хотите изменить", {reply_markup: {inline_keyboard: taskArr}})
        } catch(e) {
            console.log(e)
        }
    })
    exchange.on("callback_query", async ctx => {
        switch (ctx.update.callback_query.data) {
            case 'back':
                ctx.scene.enter('admin')
                break
            case 'changeTitle':
                ctx.scene.enter("changeTitle")
                break
            case 'changeAssignee':
                ctx.scene.enter("changeAssignee")
                break
            case 'changeStatus':
                ctx.scene.enter("changeStatus")
                break
            case 'changeClient':
                ctx.scene.enter("changeClient")
                break
            case 'changeProject':
                ctx.scene.enter("changeProject")
                break
        }
    })
    return exchange
}
