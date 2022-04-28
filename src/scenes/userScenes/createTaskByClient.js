const {Scenes} = require("telegraf");
const reply = require('../../../reply.json')
const select = require("../../database/query/select");
const split = require("../../functions/split");                                        // импортируем replay.json для сообщений


module.exports = async function createTaskByClient(client) {
    const exchange = new Scenes.BaseScene('createTaskByClient')                                // создаем объект exchange класса BaseScene с параметром user
    exchange.enter(async ctx => {
        try {
            let clientsData = await client.query(select.clients())
            let clients = clientsData.rows
            const clientsArr = []
            for (let i = 0; i < clients.length; i++) {
                clientsArr.push([clients[i].name, clients[i].id])
            }
            const arr = clientsArr.map((val) => {
                return [{ text: val[0], callback_data: val[1] }]
            })
            arr.push([{ text: 'Назад', callback_data: 'back' }])
            ctx.session.chosenClientname = arr
            if (clientsArr[0] == null) {
                ctx.reply(reply.noClients, keyboard)
                return
            }
            const keyboard = {
                reply_markup: { inline_keyboard: arr }
            }
            await ctx.reply(reply.client, keyboard)
        } catch(e) {
            console.log(e)
        }
    })
    exchange.on("callback_query", async ctx => {
        switch (ctx.update.callback_query.data) {
            case "back":
                ctx.scene.enter("user")
        }
        ctx.session.chosenClientname = ctx.session.chosenClientname.filter(item => {
            return item[0].callback_data == ctx.update.callback_query.data
        })
        ctx.session.chosenClientname = ctx.session.chosenClientname[0][0].text
        ctx.scene.enter("createTaskByProject")
    })
    return exchange
}