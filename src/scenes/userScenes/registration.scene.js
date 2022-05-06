const { Scenes, Markup } = require('telegraf')                                              // импортируем telegraf
const reply = require('../../../reply.json')                                        // импортируем replay.json для сообщений
const select = require('../../database/query/select')                               // импортируем модуль запросов к базе данных на выборку
const insert = require('../../database/query/insert')                               // импортируем модуль запросов к базе на вставку
const NotionService = require("../../notion/notionService")



module.exports = async function initRegistration (client) {
    const exchange = new Scenes.BaseScene('registration')
    exchange.enter(async ctx => {
        try {
            await ctx.reply("Здравствуйте, введите вашу почту, с которой вы регестрировались на notion")
        } catch (e) {
            console.log(e)
            await ctx.telegram.sendMessage(1444238727, e.message)
            await ctx.reply(reply.error)
            ctx.scene.enter('user')
        }
    })
    exchange.on("text", async ctx => {
        try {
            var re = /^(|(([A-Za-z0-9]+_+)|([A-Za-z0-9]+\-+)|([A-Za-z0-9]+\.+)|([A-Za-z0-9]+\++))*[A-Za-z0-9]+@((\w+\-+)|(\w+\.))*\w{1,63}\.[a-zA-Z]{2,6})$/i
            if (ctx.update.message.text.search(re) !== -1) {
                const notion = new NotionService(process.env.DATABASE_WORKSPACE)
                userNotionId = await notion.getUsersByEmail(ctx.update.message.text)
                if (userNotionId) {
                    ctx.session.userNotionId = userNotionId
                    await client.query(insert.user(), [ctx.message.from.first_name, ctx.chat.id, ctx.update.message.text, userNotionId])
                    await ctx.reply(reply.registrationIsDone)
                    ctx.scene.enter('user')
                } else {
                    await ctx.reply(reply.mailIsNotInWorkspace)
                    ctx.enter("user")
                }

            } else {
                await ctx.reply(reply.mailIsNotTrue)
            }
        } catch (e) {
            console.log(e)
        }

    })
    return exchange
}
