const select = require('../../database/query/select')       // выбрать из базы
const insert = require('../../database/query/insert')       // вставить в базу

module.exports = {
    error: async function (e, ctx) {                          // функция ошибки
        console.log(e)                                   // вывести ошибку в консоль
        if (ctx) {                                       // если есть контекст
            await ctx.telegram.sendMessage(1444238727, e.message)  //вывести в чат ошибку
        }
    },
    addNewReport: async function (client, user, ctx) {       // функция добавления нового отчета
        try {
            await client.query(insert.newTracking(), [user.id, ctx.message.text])  // вставить в базу данных id юзера и текст сообщения
        } catch (e) {
            await this.error(e, ctx)
        }
    },
    findUserAndTracking: async function (client, ctx) {                        // функция поиска юзера и трекинга из базы данных по id чата
        try {
            let userData = await client.query(select.user(), [ctx.chat.id])      // переменная userData принимает выборку из базы данных по id чата
            let user = userData.rows[0]                                          // извлекаем юзера из массива
            let trackingData = await client.query(select.tracking(), [user.id])  // переменная trackingData принимает выборку из базы данных по user id
            let tracking = trackingData.rows[0]                                  // распарсить данные из массива
            return { user, tracking }                                            // вернуть объект с user и tracking
        } catch (e) {
            await this.error(e, ctx)
        }
    },
    checkPosition: async function (client, ctx) {
        try {
            let _ = await this.findUserAndTracking(client, ctx)
            let tracking = _.tracking
            if (tracking.title) {
                if (tracking.time) {
                    if (tracking.client) {
                        if (tracking.project) {
                            console.log('track already exist!')
                            ctx.scene.enter('report')
                        } else {
                            console.log('(check) project is not found')
                            ctx.scene.enter('project')
                        }
                    } else {
                        console.log('(check) client is not found')
                        ctx.scene.enter('client')
                    }
                } else {
                    console.log('(check) time is not found')
                    ctx.scene.enter('time')
                }
            } else {
                console.log('(check) tracking title is not found')
                ctx.scene.enter('user')
            }
        } catch (e) {
            await this.error(e, ctx)
            ctx.scene.enter('user')
        }
    }
}
