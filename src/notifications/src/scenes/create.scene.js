const { Scenes } = require('telegraf')
const checkDate = require('../checkDate')
const query = require('../query')
const chosenChat = require('./start.scene')

module.exports = async function initCreateScene(client) {
    let message
    let date
    const exchange = new Scenes.BaseScene('createNotification')
    const back = {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Назад', callback_data:'back'}]
            ]
        }
    }
    exchange.enter(async (ctx) => {
        ctx.reply('Введите текст уведомления', back)
    })
    exchange.on('callback_query', ctx => {
        let callbackData = ctx.update.callback_query.data
        callbackData === 'back'
        ? ctx.scene.enter('admin')
        : undefined
    })
    exchange.on('text', async ctx => {
        switch(true) {
            case ctx.session.admin === 'notification': {
                message = ctx.message.text
                ctx.reply('Введите дату, когда вам нужно прислать уведомление. '+
                  'Формат даты: 10.07.2021', back)
                ctx.session.admin = 'default'
                ctx.session.position = 'date'
                break
            }
            case ctx.session.position === 'date': {
                date = ctx.message.text
                if (checkDate.start(date)) {
                    await client.query(
                      query.insert.notifications()
                      , [chosenChat, message, date]
                    )
                    await ctx.reply('Уведомление создано')
                    ctx.scene.enter('admin')
                    ctx.session.position = 'default'
                    break
                }
                ctx.reply('ведите в правильном формате!\n' +
                  'Например: 12.04.2022\n' +
                  'Дата не должна быть раньше сегодняшней!', back)
            }
        }
    })
    return exchange
}
