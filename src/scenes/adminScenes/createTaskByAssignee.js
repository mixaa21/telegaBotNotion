const {Scenes} = require("telegraf");
const reply = require('../../../reply.json')
const select = require("../../database/query/select");
const split = require("../../functions/split");                                        // импортируем replay.json для сообщений
const NotionService = require("../../notion/notionService")


module.exports = async function createTaskByAssigne(client) {
    const exchange = new Scenes.BaseScene('createTaskByAssigne')                                // создаем объект exchange класса BaseScene с параметром user
    exchange.enter(async ctx => {
        try {
            ctx.session.usersArr = []
            const userInfo = await client.query(select.users())
            const users = userInfo.rows
            const usersArr = []
            for (let i = 0; i < users.length; i++) {
                usersArr.push([users[i].name, users[i].notion_id])
            }
            const arr = usersArr.map((val) => {
                return [{ text: val[0], callback_data: val[1] }]
            })
            arr.push([{ text: 'Создать задачу', callback_data: 'create' }])
            arr.push([{ text: 'Назад', callback_data: 'back' }])
            const newKeyboard = {
                reply_markup: { inline_keyboard: arr }
            }
            await ctx.reply(reply.usersName, newKeyboard)
        } catch(e) {
            console.log(e)
        }
    })
    exchange.on("callback_query", async ctx => {
        switch (ctx.update.callback_query.data) {
            case "back":
                ctx.scene.enter("admin")
                break
            case "create":
                notion = new NotionService()
                await notion.createTask(ctx.session.chosenClientname, ctx.session.chosenProject, ctx.session.inputTask, ctx.session.usersArr)
                await ctx.reply(reply.taskIsCreated)
                ctx.scene.enter("admin")
                break
            default:
                ctx.session.usersArr.push({
                    id: ctx.update.callback_query.data,
                    person: {}
                })
        }
    })
    return exchange
}