const { Scenes } = require('telegraf')                                   // импорт телеграма
const select = require('../../database/query/select')                    // импорт запроса в базу на выборку
const reply = require('../../../reply.json')                             // импорт текстовых сообщений для вывода
const update = require('../../database/query/update')                    // импорт запроса в базу на обновление данных
const del = require('../../database/query/delete')                       // импорт запроса в базу на удаление данных
const functions = require('./sceneFunctions')                            // импорт основных функций
const split = require('../../functions/split')                           // ???
const removeItem = require('../../functions/removeItem')                 // ???

module.exports = async function initTime (client) {
    const exchange = new Scenes.BaseScene('client')
    let arr                                             // создание переменной arr
    exchange.enter(async ctx => {                   // слушаем если вошли в сцену
        ctx.session.scene = 'client'                       // сессия сцены принимает значение клиент ???
        try {
            console.log('enter client scene')                 // печатаем что вошли в client сцену
            let clientsData = await client.query(select.clients())  // выбрать всех видимых клиентов из таблицы clients
            let clients = clientsData.rows                          // распарсить объект клиентов
            let idData = await client.query(select.userId(), [ctx.chat.id])   // получить id юзера по id chat
            let trackingId = await client.query(select.id(), [idData.rows[0].id])   // получить id tracking по idData (точнее userId)
            if (clients[0] === undefined)                                           // если первая строка клиентов неопределена {
                try {
                    await client.query(update.client(), ['Без клиента', trackingId.rows[0].id])       // обновить таблицу tracking вставив без клиента в последний отчет
                    await ctx.reply(reply.noClients)                                                  // вывести сообщение в чат Похоже что сейчас нет ни одного клиента.
                    ctx.scene.enter('project')                                                        // перейти в сцену project
                    return
                } catch (e) {
                    await functions.error(e, ctx)
                    return
                }
            const clientsArr = []      // создать массив клиентов
            const userData = await client.query(select.user(), [ctx.chat.id]) // получить строку пользователя из базы данных по id чата
            if (userData.rows[0] == null || !userData.rows[0]) {                      // если пользователя нет
                try {
                    await client.query(update.client(), ['Без клиента', trackingId.rows[0].id])         // обновить таблицу tracking вставив без клиента в последний отчет
                    ctx.reply(reply.noClients)
                    ctx.scene.enter('project')
                    return
                } catch (e) {
                    await functions.error(e, ctx)
                    return
                }
            }
            if (userData.rows[0].skip_clients != null) {                        // если поле skip_clients не равно null
                let clientsString = userData.rows[0].skip_clients
                let skipClientsArr = await split(clientsString, ',', ctx)
                for (let i = 0; i < clients.length; i++) {
                    clientsArr.push(clients[i].name)
                }
                console.log(skipClientsArr)
                for (let i = 0; i < skipClientsArr.length; i++) {
                    removeItem(clientsArr, skipClientsArr[i])
                }
            } else {                                                          // иначе
                for (let i = 0; i < clients.length; i++) {                    // пробежаться в цикле по массиву clients
                    clientsArr.push(clients[i].name)                          // добавить имя клиента в массив clientsArr
                }
            }
            arr = clientsArr.map((val) => {                                   // обработка элеметов массива clientsArr
                return [{ text: val, callback_data: val }]                    // вернуть массив объектов для telegram клавиатуры с параметрами text которые будут отображаться на кнопке и callback_data с передаваемым значением
            })
            arr.push([{ text: 'Отменить', callback_data: 'cancel' }])         // добавить в массив кнопку отменить
            if (arr[0] === undefined) {                                       // если массив пустой, что невозможно
                try {
                    await client.query(update.client(), ['Без клиента', trackingId.rows[0].id])
                    await ctx.reply(reply.noClients)
                    ctx.scene.enter('project')
                    return
                } catch (e) {
                    await functions.error(e, ctx)
                    return
                }
            }
            await ctx.reply(reply.choseClient, {              // вывесть сообщение "Выберете клиента с которым вы работали"
                reply_markup: {                                    // вывести клавиатуру
                    inline_keyboard:
                    arr,
                }
            })
        } catch (e) {
            await functions.error(e, ctx)
        }
    })

    exchange.on('callback_query', async ctx => {                      // слушаем если выбрали кнопку
        if (ctx.session.scene === 'client') {
            try {
                let sessionCheck = false
                let callbackData = ctx.update.callback_query.data
                let callbackArr = []
                for (let i = 0; i < arr.length; i++) {
                    callbackArr.push(arr[i][0].callback_data)
                    for (let y = 0; y < callbackArr.length; y++) {
                        if (callbackData === callbackArr[y]) {
                            sessionCheck = true
                        }
                    }
                }
                if (sessionCheck) {
                    let idData = await client.query(select.userId(), [ctx.chat.id])
                    let trackingId = await client.query(select.id(), [idData.rows[0].id])
                    if (callbackData === 'cancel') {
                        await client.query(del.tracking(), [trackingId.rows[0].id])
                        ctx.scene.enter('report')
                        await ctx.reply(reply.greetings)
                        return
                    }
                    await client.query(update.client(), [callbackData, trackingId.rows[0].id])
                    ctx.scene.enter('project')
                } else {
                    ctx.reply(reply.client)
                }
            } catch (e) {
                await functions.error(e, ctx)
            }
        }
    })

    exchange.on('text', ctx => {                       // если ввели сообщение
        ctx.telegram.sendMessage(ctx.chat.id, reply.client)
    })

    return exchange
}
