const { Scenes, Markup } = require('telegraf')                                              // импортируем telegraf
const reply = require('../../../reply.json')                                        // импортируем replay.json для сообщений
const select = require('../../database/query/select')                               // импортируем модуль запросов к базе данных на выборку
const insert = require('../../database/query/insert')                               // импортируем модуль запросов к базе на вставку
const NotionService = require("../../notion/notionService")


//Проверка на то, зарегистрирован пользователь или нет.
module.exports = async function initnotionTasks (client) {                             // экспортируем функцию которая принимает в себя объект client (postgreSQL)
    const exchange = new Scenes.BaseScene('notionTasks')                                // создаем объект exchange класса BaseScene с параметром user
    exchange.enter(async ctx => {                                               // событие если вошли в сцену
        try {                                                                       // пытаться
            await ctx.reply('Выберите опцию с клавиатуры ниже', Markup
                .keyboard([
                    ['Вывести задачи, которые мне нужно выполнить'],
                    ['Вывести задачи, которые в процессе'],
                ])
                .oneTime()
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
            switch (ctx.update.message.text) {
                case "Вывести задачи, которые мне нужно выполнить":
                    await ctx.reply(await notion.getTasksToDoByUserId(ctx.session.userNotionId))
                    break
                case 'Вывести задачи, которые в процессе':
                    await ctx.reply(await notion.getTasksInProgressByUserId(ctx.session.userNotionId))
                    break
            }

        } catch (e) {
            console.log(e)
        }

    })
    return exchange
}