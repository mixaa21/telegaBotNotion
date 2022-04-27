const { Scenes } = require('telegraf')                                // импортируем telegraf
const functions = require('./sceneFunctions')                         //
const reply = require('../../../reply.json')                          // импортируем reply.json для вывода сообщений пользователю

module.exports = async function initTracking1 (client) {               // экспортируем функцию initTracking
    const exchange = new Scenes.BaseScene('report1')
    const textHandler = async (ctx) => {                              // функция текстовый обработчик
        try {
            console.log('report on text reaction')                    // вывести в консоль отчет о текстовой реакции
            let _ = await functions.findUserAndTracking(client, ctx)   // переменная _ принимает функцию из импортированного объекта functions
            if (_.tracking) {                                           // если трекинг не пустой
                console.log('report founded')                           // вывести отчет найден
                if (!_.tracking.title) {                                // если трекинг тайтл пустой
                    await functions.addNewReport(client, _.user, ctx)   // вызвать функцию addNewReport которая добавляет новый отчет
                    ctx.scene.enter('time')                             // перейти в сцену time
                }
                if (!_.tracking.time) {
                    ctx.scene.enter('time')
                }
                if (!_.tracking.project) {
                    ctx.scene.enter('project')
                }
                if (!_.tracking.client) {
                    ctx.scene.enter('client')
                } else {
                    await functions.addNewReport(client, _.user, ctx)
                    ctx.scene.enter('time')
                }
            } else {
                console.log('no report is not found')
                await functions.addNewReport(client, _.user, ctx)
                ctx.scene.enter('time')
            }
        } catch (e) {
            console.log(e)
            await ctx.telegram.sendMessage(1444238727, e.message)
            ctx.reply(reply.error)
        }
    }
    exchange.enter(async (ctx) => {                           // при входе в сцену
        console.log('start report scene')                                        // вывести сообщение в консоль старт репорт сцены
        if (ctx.message) {                                                       // если есть сообщение
            await textHandler(ctx)                                               // вызывать функцию textHandler
        }
    })
    exchange.command('/start', async ctx => {                       // создание промежуточного ПО для обработки указанной команды, если написали /start
        ctx.scene.enter('user')                                                  // запустить сцену user
    })
    exchange.on('text', textHandler)                                   // если пользователь ввел сообщение, вызвать функцию textHandler
    return exchange
}
