const {Scenes} = require("telegraf");
const reply = require('../../../reply.json')
const select = require("../../database/query/select");
const NotionService = require("../../notion/notionService");                                        // импортируем replay.json для сообщений

module.exports = async function changeClient(client) {
    const exchange = new Scenes.BaseScene('changeClient')                                // создаем объект exchange класса BaseScene с параметром user
    const notion = new NotionService(process.env.DATABASE_WORKSPACE)
    exchange.enter(async ctx => {
        try {
            let clientsData = await client.query(select.clients())
            let clients = clientsData.rows
            if (clients[0] == null) {
                ctx.reply(reply.noClients)
                ctx.session.chosenClientname = "Без клиента"
                ctx.scene.enter("createTaskByProject")
                return
            } else {
                const clientsArr = []
                for (let i = 0; i < clients.length; i++) {
                    clientsArr.push(clients[i].name)
                }
                const arr = clientsArr.map((val) => {
                    return [{ text: val, callback_data: val }]
                })
                arr.push([{ text: 'Без клиента', callback_data: 'noClient' }])
                arr.push([{ text: 'Назад', callback_data: 'back' }])
                const keyboard = {
                    reply_markup: { inline_keyboard: arr }
                }
                await ctx.reply(reply.client, keyboard)
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