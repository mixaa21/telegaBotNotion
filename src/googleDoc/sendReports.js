const { GoogleSpreadsheet } = require('google-spreadsheet')
const service_account = require('../../service-account.json')
const cron = require('node-cron')                                     // импорт модуля cron для планирования расписания
const select = require('../database/query/select')
const update = require('../database/query/update')
const functions = require('../scenes/userScenes/sceneFunctions')
const moment = require('moment')
const round = require('../functions/round')
require('dotenv').config()
const days = [
    'Воскресенье',
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота'
]

function getDay () {
    let d, n
    d = new Date()
    n = d.getDay()
    return n
}

Math.round10 = function (value, exp) {
    return round('round', value, exp)
}
module.exports = {
    startSendingAdminReports: async function (bot, client) {
        cron.schedule('0 10 * * 1-5', async () => {                         // запуск фукнции расписания секунды, минуты, часы, день месяца, месяц, день недели
            //     cron.schedule('10,30,50,0 * * * * 1,2,3,4,5', async () => {
            try {
                let n = getDay()
                const usersData = await client.query(select.users())
                  , users = usersData.rows
                let report = ''
                  , reports = []
                let amount = 3
                if (days[n] !== 'Понедельник') {
                    amount = 1
                }
                report += `${moment().subtract(amount, 'days').format('DD.MM.YYYY')}\n`
                for (let i = 0; i < users.length; i++) {
                    reports = await getReport(users[i].spreadsheet_id, users[i].page_id)
                    let time = 0
                    if (!reports[0]) {
                        report += `${users[i].name} - 0 ч.\n`
                    } else {
                        reports.forEach(element => {
                            if (Number(element[2])) {
                                time += Number(element[2])
                                time = Math.round10(time, -2)
                            }
                        })
                        console.log(time)
                        report += `${users[i].name} - ${time} ч.\n`
                    }

                }

                await bot.telegram.sendMessage(process.env.ADMIN_CHAT_ID, report)
            } catch (e) {
                console.error(e, bot)
            }
        }, { 'timezone': 'Europe/Moscow' })
    },
    getAdminReports: async function (bot, client) {
        try {
            let n = getDay()
            const usersData = await client.query(select.users())
              , users = usersData.rows
            let report = ''
              , reports = []
            let amount = 3
            if (days[n] !== 'Понедельник') {
                amount = 1
            }
            report += `${moment().subtract(amount, 'days').format('DD.MM.YYYY')}\n`
            for (let i = 0; i < users.length; i++) {
                reports = await getReport(users[i].spreadsheet_id, users[i].page_id, n)
                let time = 0
                if (!reports[0]) {
                    report += `${users[i].name} - 0 ч.\n`
                } else {
                    reports.forEach(element => {
                        if (Number(element[2])) {
                            time += Number(element[2])
                            time = Math.round10(time, -2)

                        }
                    })
                    report += `${users[i].name} - ${time} ч.\n`
                }

            }

            await bot.telegram.sendMessage(process.env.ADMIN_CHAT_ID, report)
        } catch (e) {
            await functions.error(e, bot)
        }
    },
    startSendingUserReports: async function (bot, client) {
        cron.schedule('0 10 * * 1-5', async () => {
            //     cron.schedule('10,20,30,40,50,0 * * * * 1,2,3,4,5', async () => {
            try {
                let n = getDay()
                const users = await client.query(select.users())
                const idArr = users.rows
                for (const e of idArr) {
                    const userData = await client.query(select.user(), [e.telegram_chat_id])
                      , user = userData.rows[0]
                    let report = ''
                      , reports = []
                    let day = 'Вчера'
                    days[n] === 'Понедельник'
                      ? day = 'В пятницу'
                      : undefined
                    reports = await getReport(user.spreadsheet_id, user.page_id)
                    console.log(reports)
                    let time = 0
                      , link = `https://docs.google.com/spreadsheets/d/${user.spreadsheet_id}/edit#gid=${user.page_id}`
                    if (!reports) {
                        report += `${day} вы не составили ни одного отчёта.\nЧтобы составить отчёт: ${link}`
                    } else {
                        reports.forEach(element => {

                            Number(element[2])
                              ? time += Number(element[2])
                              : undefined
                            time = Math.round10(time, -2)
                        })
                        report += `${day} вы составили отчёты на ${time} ч.\nЧтобы проверить свои отчёты: ${link}`
                    }

                    await bot.telegram.sendMessage(e.telegram_chat_id, report)
                }
            } catch (e) {
                await functions.error(e, bot)
            }
        }, { 'timezone': 'Europe/Moscow' })
    },
    startSendingReports: async function (client) {
        cron.schedule('* * * * 1-5', async () => {
            const usersData = await client.query(select.users())
              , users = usersData.rows
            for (let i = 0; i < users.length; i++) {
                await sendReport(client, users[i].spreadsheet_id, users[i].page_id, users[i].id)
            }

        }, { 'timezone': 'Europe/Moscow' })
    },
    sendReportsNow: async function (client) {
        const usersInfo = await client.query(select.users())
        const users = usersInfo.rows
        for (let i = 0; i < users.length; i++) {
            try {
                await sendReport(client, users[i].spreadsheet_id, users[i].page_id, users[i].id)
            } catch (e) {
                await functions.error(e, bot)
            }
        }

    }
}

async function getReport (spreadsheet_id, page_id) {
    try {
        let n = getDay()
        const doc = new GoogleSpreadsheet(spreadsheet_id)
        await doc.useServiceAccountAuth({
            client_email: service_account.client_email,
            private_key: service_account.private_key,
        })
        await doc.loadInfo()
        let sheet = doc.sheetsById[page_id]
        if (!sheet) {
            return [0]
        }
        const rows = await sheet.getRows()
        console.log(rows._rawData)
        let daysAgo
        let daysAgoFormat
        let amount = 3
        if (days[n] === 'Понедельник') {
            daysAgo = moment().subtract(amount, 'days').format('DD.MM.YYYY')
            daysAgoFormat = moment().subtract(amount, 'days').format('DD-MM-YYYY')
        } else {
            amount = 1
            daysAgo = moment().subtract(amount, 'days').format('DD.MM.YYYY')
            daysAgoFormat = moment().subtract(amount, 'days').format('DD-MM-YYYY')
        }
        let elements = []
        let data = 'no date'
        rows.forEach(element => {
            if (element._rawData[0]) {
                data = element._rawData[0]
            }
            if (daysAgo === data || daysAgoFormat === data) {
                elements.push(element._rawData)
            }
        })
        let re = /(?=\B(?:\d{3})+(?!\d))/g
        elements.forEach(e => {
            e[2] = e[2].toString().replace(re, ' ').replace(',', '.')
        })
        return elements
    } catch (e) {
        console.log(e)
    }

}

async function sendReport (client, spreadsheet_id, page_id, id) {
    try {
        const doc = new GoogleSpreadsheet(spreadsheet_id)
        await doc.useServiceAccountAuth({
            client_email: service_account.client_email,
            private_key: service_account.private_key,
        })
        await doc.loadInfo()
        let sheet = doc.sheetsById[page_id]
        const trackingInfo = await client.query(select.allTracking(), [id])
        const tracking = trackingInfo.rows
        for (let i = 0; i < tracking.length; i++) {
            try {
                await sheet.setHeaderRow(
                  ['Дата', 'Выполненая работа', 'кол-во часов', 'Клиент', 'Проект','Ссылка на notion']
                )
                await sheet.addRow({
                    'Дата': moment().format('DD.MM.YYYY'),
                    'Выполненая работа': tracking[i].title,
                    'кол-во часов': tracking[i].time,
                    'Клиент': tracking[i].client,
                    'Проект': tracking[i].project,
                    'Ссылка на notion':tracking[i].notion_link,
                })
            } catch (e) {console.log(e)}
            console.log('sent')
            await client.query(update.sentFlag(), [id])
        }

    } catch (e) {
        console.log(e)
    }

}
