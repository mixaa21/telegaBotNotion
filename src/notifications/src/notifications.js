const cron = require('node-cron')
const query = require('./query')
const date = require('./checkDate')

module.exports = {
    findNotification: async function(client, ctx) {
        let notifications = (await client.query(query.get.notifications())).rows
         for (let i=0; i<notifications.length; i++) {
             if (date.check(notifications[i]['alert_date'])) {
                 await ctx.telegram.sendMessage(
                  notifications[i]['chat_id'],
                  `Уведомление:\n` +
                  `${notifications[i]['message']}`
                )
             }
         }
    },
    start: async function(client, ctx) {
        // cron.schedule('10,20,30,40,50,0 * * * * 1-5', async () => {
        cron.schedule('0 10 * * *', async () => {
            await this.findNotification(client, ctx)
        },{ timezone: 'Europe/Moscow' })
    }
}
