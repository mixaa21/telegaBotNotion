const {Scenes} = require("telegraf");
const reply = require('../../../reply.json')                                        // импортируем replay.json для сообщений


module.exports = async function createTaskByProject(client) {
    const exchange = Scenes.BaseScene("createTaskByProject")
    exchange.enter(async ctx => {
        try {
            await ctx.reply(reply.project, )
        } catch(e) {
            console.log(e)
        }
    })
}