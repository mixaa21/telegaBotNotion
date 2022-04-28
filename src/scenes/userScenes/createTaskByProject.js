const {Scenes} = require("telegraf");
const reply = require('../../../reply.json')
const select = require("../../database/query/select");
const split = require("../../functions/split");                                        // импортируем replay.json для сообщений


module.exports = async function createTaskByProject(client) {
    const exchange = new Scenes.BaseScene('createTaskByProject')                                // создаем объект exchange класса BaseScene с параметром user
    exchange.enter(async ctx => {
        try {
            const projects = await client.query(select.projects(), [ctx.update.callback_query.data])
            const projectsString = String(projects.rows[0].project)
            const newArray = await split(projectsString, ',', ctx)
            const arr = newArray.map((val) => {
                return [{ text: val, callback_data: val}]
            })
            arr.push([{ text: 'Назад', callback_data: 'back' }])
            const newKeyboard = {
                reply_markup: { inline_keyboard: arr }
            }
            await ctx.reply(reply.project, newKeyboard)
        } catch(e) {
            console.log(e)
        }
    })
    exchange.on("callback_query", async ctx => {
        switch (ctx.update.callback_query.data) {
            case "back":
                ctx.scene.enter("user")
        }
        ctx.session.chosenProject = ctx.update.callback_query.data
        ctx.scene.enter("createTaskByTitle")
    })
    return exchange
}