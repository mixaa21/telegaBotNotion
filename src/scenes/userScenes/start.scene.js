const { Scenes, Markup } = require('telegraf')                                              // импортируем telegraf
const reply = require('../../../reply.json')                                        // импортируем replay.json для сообщений
const select = require('../../database/query/select')                               // импортируем модуль запросов к базе данных на выборку
const insert = require('../../database/query/insert')                               // импортируем модуль запросов к базе на вставку
const NotionService = require("../../notion/notionService")


//Проверка на то, зарегистрирован пользователь или нет.
module.exports = async function initUserChat (client) {                             // экспортируем функцию которая принимает в себя объект client (postgreSQL)
    const exchange = new Scenes.BaseScene('user')                                // создаем объект exchange класса BaseScene с параметром user
    exchange.enter(async ctx => {                                               // событие если вошли в сцену
        try {                                                                       // пытаться
            const userInfo = await client.query(select.user(), [ctx.chat.id])       // сделать запрос в базу данных с данными из импортируемой функции select.user() и передать значение id чата
            const user = userInfo.rows[0]                                           // переменная user принимает объект (строку) из таблицы
            if (!user) {                                                            // если user пустой
                console.log('enter registration from start...')                     // вывести в консоль enter registration from start...
                await ctx.reply("Здравствуйте, ведите вашу почту, с которой вы регестрировались на notion")
            } else if (!user.spreadsheet_id || user.page_id === undefined) {                   // иначе если ???
                await ctx.reply(reply.NotFullRegisted)                                         // вывести сообщение в чат из импортированного модуля reply
                ctx.session.userNotionId = user.notion_id
                ctx.scene.enter('notionTasks')
            } else {                                                                           // в конечном итоге
                console.log('enter report from start...')                                      // вывести сообщение в консоль
                ctx.scene.enter('report')                                                      // вход в сцену report
            }
        } catch (e) {                                                                          // если ошибка
            console.log(e)                                                                     // вывести ошибку
            await ctx.telegram.sendMessage(1444238727, e.message)                        //
            await ctx.reply(reply.error)
            ctx.scene.enter('user')
        }
    })
    exchange.on("text", async ctx => {
        try {
            await ctx.reply(reply.NotFullRegisted)                                         // вывести сообщение в чат из импортированного модуля reply
            const notion = new NotionService()
            userNotionId = await notion.getUsersByEmail(ctx.update.message.text)
            ctx.session.userNotionId = userNotionId
            await client.query(insert.user(), [ctx.message.from.first_name, ctx.chat.id, ctx.update.message.text, userNotionId])
            ctx.scene.enter('notionTasks')
        } catch (e) {
            console.log(e)
        }

    })
    return exchange
}
