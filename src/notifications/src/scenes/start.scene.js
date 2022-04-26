const { Scenes } = require('telegraf')
const getUsersKeys = require('../../../scenes/adminScenes/admin.scene')
const select = require('../../../database/query/select')
const chatAdmin = require('../../../scenes/adminScenes/admin.scene')
require('dotenv').config()
    let chosenChat = ''
    async function initStartScene(client) {
    const exchange = new Scenes.BaseScene('startNotification')
    const userInfo = await client.query(select.users())
    const users = userInfo.rows
    const uniCode = 'notification'
    exchange.enter(async ctx => {
        try {
            const userKeys = await chatAdmin.getUsersKeys(users, uniCode, ctx)
            userKeys.reply_markup.inline_keyboard.push([{ text: 'В этот чат', callback_data: 'adminChat'+uniCode }])
            if (!userKeys)
                return
            await ctx.reply('Для кого создать уведомление?', userKeys)
            exchange.action('adminChat', async () => {
                chosenChat = process.env.ADMIN_CHAT_ID
            })

        } catch (e) {
            console.log(e)
            await ctx.telegram.sendMessage(1444238727, e)
        }
    })
    for (let i = 0; i < users.length; i++) {
        exchange.action(uniCode + users[i].name, ctx => {
            chosenChat = users[i].telegram_chat_id
            ctx.session.admin = 'notification'
            ctx.scene.enter('createNotification')
        })
    }
    exchange.action(uniCode+'back', ctx => {
        ctx.session.position = 'default'
        ctx.scene.enter('admin')
    })
    exchange.action('adminChat'+uniCode, ctx => {
        ctx.session.position = 'notification'
        ctx.scene.enter('createNotification')
    })
    return exchange
}
module.exports = {initStartScene, chosenChat}
