const { Scenes } = require('telegraf')                          // импорт telegraf
const reply = require('../../../reply.json')                    // импорт replay.json с текстами сообщений
const update = require('../../database/query/update')           // импорт запроса на обновление в базе данных
const select = require('../../database/query/select')           // импорт выборки из базы даннызх
const del = require('../../database/query/delete')              // импорт удаления из базы данных
const functions = require('./sceneFunctions')                   // импорт основных функций
const decimalAdjust = require('../../functions/round')          // ???

module.exports = async function initTime (client) {             // экспортируем функцию
    const exchange = new Scenes.BaseScene('time')            // создаем объект exchange класса Scenes.BaseScene с id time
    let timeArr = ['15 минут', '30 минут', '45 минут', '60 минут', 'Другое (в минутах)', 'Отменить']  // создаем массив времени
    exchange.enter(async ctx => {                                // вход в сцену
        ctx.session.scene = 'time'                                   //
        if (ctx.session.scene === 'time') {
            try {
                console.log('enter time scene')
                await ctx.reply(reply.time, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: timeArr[0], callback_data: timeArr[0] }],
                            [{ text: timeArr[1], callback_data: timeArr[1] }],
                            [{ text: timeArr[2], callback_data: timeArr[2] }],
                            [{ text: timeArr[3], callback_data: timeArr[3] }],
                            [{ text: timeArr[4], callback_data: timeArr[4] }],
                            [{ text: timeArr[5], callback_data: timeArr[5] }],
                        ]
                    }
                })
            } catch (e) {
                await functions.error(e, ctx)
            }
        }
    })
    exchange.on('text', async ctx => {                   // если ввели сообщение
        if (ctx.session.scene === 'specialTime') {
            try {
                Math.round10 = function (value, exp) {
                    return decimalAdjust('round', value, exp)
                }
                let idData = await client.query(select.userId(), [ctx.chat.id])
                let trackingId = await client.query(select.trackingId(), [idData.rows[0].id])
                let preTime = Math.round10(ctx.message.text / 60, -1)
                let re = /(?=\B(?:\d{3})+(?!\d))/g
                let time = preTime.toString().replace(re, ' ').replace('.', ',')
                if (Number(ctx.message.text)) {
                    await client.query(update.time(), [time, trackingId.rows[0].id])
                    ctx.scene.enter('client')
                } else {
                    ctx.reply(reply.isNotANumber)
                }
            } catch (e) {
                await functions.error(e, ctx)
            }
        } else {
            ctx.reply(reply.choseTime)
        }
    })
    exchange.on('callback_query', async (ctx) => {                  // если нажата клавиша клавиатуры telegram
        if (ctx.session.scene === 'time') {
            try {
                let callbackData = ctx.update.callback_query.data
                let sessionCheck = false
                for (let i = 0; i < timeArr.length; i++) {
                    if (callbackData === timeArr[i]) {
                        sessionCheck = true
                    }
                }
                let idData = await client.query(select.userId(), [ctx.chat.id])
                let trackingId = await client.query(select.trackingId(), [idData.rows[0].id])
                if (sessionCheck) {
                    if (callbackData === timeArr[4]) {
                        ctx.reply(reply.specialTime)
                        ctx.session.scene = 'specialTime'
                        return
                    }
                    if (callbackData === timeArr[5]) {
                        await client.query(del.tracking(), [trackingId.rows[0].id])
                        ctx.scene.enter('report')
                        await ctx.reply(reply.greetings)
                        return
                    }
                }
                let preTime = callbackData.slice(0, 2) / 60
                let re = /(?=\B(?:\d{3})+(?!\d))/g
                let time = preTime.toString().replace(re, ' ').replace('.', ',')
                if (sessionCheck) {
                    await client.query(update.time(), [time, trackingId.rows[0].id])
                    ctx.scene.enter('client')
                } else {
                    ctx.reply(reply.time)
                }
            } catch (e) {
                await functions.error(e, ctx)
            }
        }
    })
    return exchange
}
