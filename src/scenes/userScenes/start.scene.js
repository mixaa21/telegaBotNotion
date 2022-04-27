const { Scenes, Markup } = require('telegraf')                                              // импортируем telegraf
const reply = require('../../../reply.json')                                        // импортируем replay.json для сообщений
const select = require('../../database/query/select')                               // импортируем модуль запросов к базе данных на выборку
const insert = require('../../database/query/insert')                               // импортируем модуль запросов к базе на вставку
const NotionService = require("../../notion/notionService")


//Проверка на то, зарегистрирован пользователь или нет.
module.exports = async function initUserChat (client) {                             // экспортируем функцию которая принимает в себя объект client (postgreSQL)
    const exchange = new Scenes.BaseScene('user')                                // создаем объект exchange класса BaseScene с параметром user
    async function checkUser (ctx) {
        try {                                                                       // пытаться
            const userInfo = await client.query(select.user(), [ctx.chat.id])       // сделать запрос в базу данных с данными из импортируемой функции select.user() и передать значение id чата
            const user = userInfo.rows[0]                                           // переменная user принимает объект (строку) из таблицы
            if (!user) {                                                            // если user пустой
                console.log('enter registration from start...')                     // вывести в консоль enter registration from start...
                ctx.scene.enter('registration')
            } else if (!user.spreadsheet_id || user.page_id === undefined) {                   // иначе если ???
                await ctx.reply(reply.NotFullRegisted)                                         // вывести сообщение в чат из импортированного модуля reply
            } else {                                                                           // в конечном итоге
                ctx.session.userId = user.id
                ctx.session.userNotionId = user.notion_id
                console.log('enter report from start...')                                      // вывести сообщение в консоль
                ctx.scene.enter('notionTasks')
            }
        } catch (e) {                                                                          // если ошибка
            console.log(e)                                                                     // вывести ошибку
            await ctx.telegram.sendMessage(1444238727, e.message)                        //
            await ctx.reply(reply.error)
            ctx.scene.enter('user')
        }
    }
    exchange.enter(ctx => {
        checkUser(ctx)
    })
    exchange.on("text", ctx => {
        checkUser(ctx)
    })
    return exchange
}
