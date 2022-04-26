const cron = require('node-cron')
const select = require('../database/query/select')
const reply = require('../../reply.json')
const functions = require('../scenes/userScenes/sceneFunctions')

module.exports = {
    alert: async (bot, client) => {
        cron.schedule('0 12,14,16,18,20 * * 1-5', async () => {
            // cron.schedule('10,20,30,40,50,0 * 11 * * 1,2,3,4,5', async () => {
            try {
                let idArr
                const users = await client.query(select.users())
                idArr = users.rows
                idArr.forEach(e => {
                    bot.telegram.sendMessage(e.telegram_chat_id, reply.alert)
                })
            } catch (e) {
                await functions.error(e)
            }
        }, { timezone: 'Europe/Moscow' })
    }
}
