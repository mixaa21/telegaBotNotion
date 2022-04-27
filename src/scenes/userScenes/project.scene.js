const { Scenes } = require('telegraf')                        // импортируем телеграмм
const reply = require('../../../reply.json')                  // импорт replay.json с текстами сообщений
const update = require('../../database/query/update')         // импорт запроса в базу на обновление данных
const functions = require('./sceneFunctions')                 // импорт основных функций
const del = require('../../database/query/delete')            // импорт запроса в базу на удаление данных
const select = require('../../database/query/select')         // импорт запроса в базу на выборку
const split = require('../../functions/split')                // ???

module.exports = async function initProject (client) {
    const exchange = new Scenes.BaseScene('project')
    const noProject = reply.noProjectDb
    let arr
    exchange.enter(async ctx => {                  // если вошли в сцену
        ctx.session.scene = 'project'
        try {
            console.log('enter project scene')
            let idData = await client.query(select.userId(), [ctx.chat.id])
            let trackingId = await client.query(select.id(), [idData.rows[0].id])
            let clientData = await client.query(select.client(), [idData.rows[0].id])
            const chosenClient = clientData.rows[0].client
            let projectData = await client.query(select.projectsByName(), [chosenClient])
            if (!projectData.rows[0]) {
                try {
                    await ctx.reply(reply.noProject)
                    await client.query(update.project(), ['Без проекта', trackingId.rows[0].id])
                    await ctx.reply(reply.reportSaved)
                    ctx.scene.enter('user')
                    return
                } catch (e) {
                    await functions.error(e, ctx)
                    return
                }
            }
            const data = projectData.rows[0].project
            let projectsArr = await split(
              String(data)
              , ','
              , ctx
            )
            let test = projectsArr.filter(function () { return true });
            if (data == '' || data == null) {
                try {
                    await ctx.reply(reply.noProject)
                    await client.query(update.project(), ['Без проекта', trackingId.rows[0].id])
                    await ctx.reply(reply.reportSaved)
                    ctx.scene.enter('user')
                    return
                } catch (e) {
                    await functions.error(e, ctx)
                    return
                }
            }
            arr = projectsArr.map((val) => {
                return [{ text: val, callback_data: val }]
            })
            arr.push([{ text: noProject, callback_data: noProject }])
            arr.push([{ text: 'Отменить', callback_data: 'cancel' }])
            await ctx.reply(reply.choseProject, {
                reply_markup: {
                    inline_keyboard:
                    arr
                }
            })
        } catch (e) {
            await functions.error(e, ctx)
        }
    })

    exchange.on('callback_query', async ctx => {                 // если нажали на кнопку
        if (ctx.session.scene === 'project') {
            try {
                let callbackData = ctx.update.callback_query.data
                let idData = await client.query(select.userId(), [ctx.chat.id])
                let trackingId = await client.query(select.id(), [idData.rows[0].id])
                if (callbackData === 'cancel') {
                    await client.query(del.tracking(), [trackingId.rows[0].id])
                    ctx.scene.enter('report')
                    await ctx.reply(reply.greetings)
                    return
                }
                let sessionCheck = false
                let callbackArr = []
                for (let i = 0; i < arr.length; i++) {
                    callbackArr.push(arr[i][0].callback_data)
                    for (let y = 0; y < callbackArr.length; y++) {
                        if (callbackData === callbackArr[y]) {
                            sessionCheck = true
                        }
                    }
                }
                if (callbackData === noProject) {
                    callbackData = noProject
                }
                if (sessionCheck) {
                    await client.query(update.project(), [callbackData, trackingId.rows[0].id])
                    ctx.reply(reply.reportSaved)
                    ctx.scene.enter('user')
                    return
                } else {
                    ctx.reply(reply.project)
                }
            } catch (e) {
                await functions.error(e, ctx)
            }
        }
    })

    exchange.on('text', ctx => {                         // если написали текст
        ctx.telegram.sendMessage(ctx.chat.id, reply.project)
    })

    return exchange
}
