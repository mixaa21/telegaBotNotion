const { Scenes, Markup } = require('telegraf')                                              // импортируем telegraf
const reply = require('../../../reply.json')                                        // импортируем replay.json для сообщений
const select = require('../../database/query/select')                               // импортируем модуль запросов к базе данных на выборку
const insert = require('../../database/query/insert')                               // импортируем модуль запросов к базе на вставку
const NotionService = require("../../notion/notionService")
const makeStringForTelegram = require("../../functions/makeStringForTelegram")


//Проверка на то, зарегистрирован пользователь или нет.
module.exports = async function initnotionTasks (client) {                             // экспортируем функцию которая принимает в себя объект client (postgreSQL)
    const exchange = new Scenes.BaseScene('notionTasks')                                // создаем объект exchange класса BaseScene с параметром user
    exchange.enter(async ctx => {                                               // событие если вошли в сцену
        try {                                                                       // пытаться
            await ctx.reply(reply.chooseKey, Markup
                .keyboard([
                ['Вывести задачи, которые мне нужно выполнить', 'Вывести задачи, которые в процессе'],
                    ['Затрекать задачу', 'Затрекать выполненную задачу'],
                    ['Поделиться задачей'],
                ])
                .resize()
            )
        } catch (e) {                                                                          // если ошибка
            console.log(e)                                                                     // вывести ошибку
            await ctx.telegram.sendMessage(1444238727, e.message)                        //
            await ctx.reply(reply.error)
        }
    })
    exchange.on("text", async ctx => {
        try {
            const notion = new NotionService()
            let tasks
            switch (ctx.update.message.text) {
                case "Вывести задачи, которые мне нужно выполнить":
                    tasks = await notion.getTasksToDoByUserId(ctx.session.userNotionId)
                    if (tasks.length) {
                        await ctx.reply(await makeStringForTelegram(tasks))
                    } else {
                        await ctx.reply(reply.tasksToDoIsnull)
                    }
                    break
                case 'Вывести задачи, которые в процессе':
                    tasks = await notion.getTasksInProgressByUserId(ctx.session.userNotionId)
                    if (tasks.length){
                        await ctx.reply(await makeStringForTelegram(tasks))
                    } else {
                        await ctx.reply(reply.tasksInProgressIsnull)
                    }
                    break
                case 'Затрекать задачу':
                    ctx.session.taskIsDone = false
                    ctx.scene.enter('report')
                    break
                case 'Затрекать выполненную задачу':
                    ctx.session.taskIsDone = true
                    ctx.scene.enter('report')
                    break
                case 'Создать задачу':
                    ctx.scene.enter('createTaskByClient')
                    break
                case 'Поделиться задачей':
                    ctx.scene.enter('shareTask')
                    break
                default:
                    await ctx.reply(reply.chooseKey)
            }
        } catch (e) {
            console.log(e)
        }
    })
    return exchange
}