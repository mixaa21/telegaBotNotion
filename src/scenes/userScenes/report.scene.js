const { Scenes } = require('telegraf')                                // импортируем telegraf
const functions = require('./sceneFunctions')                         //
const reply = require('../../../reply.json')                          // импортируем reply.json для вывода сообщений пользователю
const NotionService = require("../../notion/notionService")
const convertTaskToUrl = require("../../functions/convertTaskToUrl")


module.exports = async function initTracking (client) {               // экспортируем функцию initTracking
    const exchange = new Scenes.BaseScene('report')
    const notion = new NotionService()
    const textHandler = async (ctx) => {                              // функция текстовый обработчик
        try {
            let tasksArr = await notion.getActiveTasks(ctx.session.userNotionId)
            ctx.session.tasksArr = tasksArr
            let check = false
            taskArr = tasksArr.map((item) => {                                   // обработка элеметов массива clientsArr
                return [{ text: `${item.properties.Name.title[0].plain_text} (${item.properties.Status.select.name})`, callback_data: item.id }]                    // вернуть массив объектов для telegram клавиатуры с параметрами text которые будут отображаться на кнопке и callback_data с передаваемым значением
            })
            ctx.session.taskArr = taskArr
            taskArr.push([{ text: 'Ввести свою', callback_data: 'inputowntask' }])
            taskArr.push([{ text: 'Отменить', callback_data: 'back' }])
            await ctx.reply("Выберите задачу из активных в notion, которую вы выполнили или введите свою", {reply_markup: {inline_keyboard: taskArr}})
        } catch (e) {
            console.log(e)
            await ctx.telegram.sendMessage(1444238727, e.message)
            ctx.reply(reply.error)
        }
    }
    exchange.enter(async (ctx) => {                           // при входе в сцену
        console.log('start report scene')                                        // вывести сообщение в консоль старт репорт сцены
        if (ctx.message) {                                                       // если есть сообщение
            await textHandler(ctx)                                               // вызывать функцию textHandler
        }
    })
    exchange.command('/start', async ctx => {                       // создание промежуточного ПО для обработки указанной команды, если написали /start
        ctx.scene.enter('user')                                                  // запустить сцену user
    })
    exchange.on('callback_query', async ctx => {
        switch (ctx.update.callback_query.data) {
            case 'inputowntask':
                ctx.session.ownTask = true
                await ctx.reply("Введите вашу задачу")
                return
                break
            case 'back':
                ctx.scene.enter('user')
                break
            default:
                ctx.session.tasksArr = ctx.session.tasksArr.filter(item => {
                    return item.id === ctx.update.callback_query.data
                })
                if (ctx.session.taskIsDone) {
                    await notion.updateStatusTask(ctx.update.callback_query.data, "To Check")
                } else {
                    await notion.updateStatusTask(ctx.update.callback_query.data, "In Progress")
                }
                ctx.session.isTaskFromNotion = true
                const notionLink = `https://www.notion.so/${convertTaskToUrl(ctx.session.tasksArr[0].id)}`
                if (ctx.session.tasksArr[0].properties.Client.select && ctx.session.tasksArr[0].properties.Project.select) {
                    await functions.addNewReport(client, ctx.session.userId, ctx.session.tasksArr[0].properties.Name.title[0].plain_text, ctx.session.tasksArr[0].properties.Client.select.name, ctx.session.tasksArr[0].properties.Project.select.name, notionLink)
                } else if (ctx.session.tasksArr[0].properties.Client.select) {
                    await functions.addNewReport(client, ctx.session.userId, ctx.session.tasksArr[0].properties.Name.title[0].plain_text, ctx.session.tasksArr[0].properties.Client.select.name, "Без проекта", notionLink)
                } else if (ctx.session.tasksArr[0].properties.Project.select) {
                    await functions.addNewReport(client, ctx.session.userId, ctx.session.tasksArr[0].properties.Name.title[0].plain_text, "Без клиента", ctx.session.tasksArr[0].properties.Project.select.name, notionLink)
                } else {
                    await functions.addNewReport(client, ctx.session.userId, ctx.session.tasksArr[0].properties.Name.title[0].plain_text, "Без клиента", "Без проекта", notionLink)
                }
                ctx.scene.enter('time')
        }
    })
    exchange.on('text', async ctx => {
        if (ctx.session.ownTask) {
            await functions.addNewReport(client, ctx.session.userId, ctx.message.text)
            ctx.scene.enter('time')
        } else {
            ctx.reply(reply.chooseKey)
        }

    })
    return exchange
}
