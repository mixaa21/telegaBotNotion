const {Scenes} = require("telegraf");
const reply = require('../../../reply.json')
const select = require("../../database/query/select");
const split = require("../../functions/split");
const NotionService = require("../../notion/notionService");                                        // импортируем replay.json для сообщений

module.exports = async function changeProject(client) {
    const exchange = new Scenes.BaseScene('changeProject')                                // создаем объект exchange класса BaseScene с параметром user
    const notion = new NotionService(process.env.DATABASE_WORKSPACE)
    exchange.enter(async ctx => {
        try {
            if (ctx.session.chosenClientname === "Без клиента") {
                ctx.session.chosenProject = "Без проекта"
                ctx.scene.enter("createTaskByTitle")
                return
            } else {
                const projects = await client.query(select.projects(), [ctx.update.callback_query.data])
                if (!projects.rows[0].project) {
                    ctx.reply(reply.noProject)
                    ctx.session.chosenProject = "Без проекта"
                    ctx.scene.enter("createTaskByTitle")
                } else {
                    const projectsString = String(projects.rows[0].project)
                    const newArray = await split(projectsString, ',', ctx)
                    const arr = newArray.map((val) => {
                        return [{ text: val, callback_data: val}]
                    })
                    arr.push([{ text: 'Без проекта', callback_data: 'noProject' }])
                    arr.push([{ text: 'Назад', callback_data: 'back' }])
                    const newKeyboard = {
                        reply_markup: { inline_keyboard: arr }
                    }
                    await ctx.reply(reply.project, newKeyboard)
                }
            }
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
                notion.updateClientTask(ctx.session.choosenTask, ctx.update.callback_query.data)
                await ctx.reply(reply.changeClient)
                ctx.scene.enter("admin")
        }
    })
    return exchange
}