const { Scenes } = require('telegraf')
const reply = require('../../../reply.json')
const select = require('../../database/query/select')
const insert = require('../../database/query/insert')
const del = require('../../database/query/delete')
const update = require('../../database/query/update')
const google = require('../../googleDoc/sendReports')
const service_account = require('../../../service-account.json')
const split = require('../../functions/split')
const removeItem = require('../../functions/removeItem')
const reports = require('../../googleDoc/sendReports')
const NotionService = require("../../notion/notionService")


//Проверка на то, зарегистрирован пользователь или нет.
async function getUsersKeys (users, uniCode, ctx) {
    try {
        if (users[0] == null, !users[0]) {
            ctx.reply(reply.noUsers)
            return false
        }
        const usersArr = []
        for (let i = 0; i < users.length; i++) {
            usersArr.push(users[i].name)
        }
        let arr = usersArr.map((val) => {
            return [{ text: val, callback_data: uniCode + val }]
        })
        arr.push([{ text: 'Назад', callback_data: 'back' }])
        return { reply_markup: { inline_keyboard: arr } }
    } catch (e) {
        console.log(e)
        await ctx.telegram.sendMessage(1444238727, e)
    }
}
async function initAdminChat (client) {
    const exchange = new Scenes.BaseScene('admin')
    exchange.enter(async ctx => {                   // если вошли в сцену
        try {
            let chosenUser = ''
            let chosenClient = ''
            console.log('enter admin chat...')
            const keyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Клиенты', callback_data: 'clientMenu' }],
                        [{ text: 'Регистрация', callback_data: 'registration' }],
                        [{ text: 'Сменить имя', callback_data: 'newName' }],
                        [{ text: 'Отправить отчёты', callback_data: 'sendReports' }],
                        [{ text: 'Получить отчёт', callback_data: 'getReports' }],
                        [{ text: 'Сотрудники', callback_data: 'userMenu' }],
                        [{ text: 'Уведомления', callback_data: 'notifications' }],
                        [{ text: 'Отправить сообщение', callback_data: 'message' }],
                        [{ text: 'Создать задачу', callback_data: 'createTask' }],
                        [{ text: 'Изменить задачу', callback_data: 'changeTask' }],
                        [{ text: 'Удалить задачу', callback_data: 'deleteTask' }]
                    ],
                },
            }
            const clientsKeyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Список клиентов', callback_data: 'list' }],
                        [{ text: 'Добавить клиента', callback_data: 'newClient' }],
                        [{ text: 'Переименовать клиента', callback_data: 'renameClient'}],
                        [{ text: 'Список проектов', callback_data: 'projectList' }],
                        [{ text: 'Добавить проект', callback_data: 'newProject' }],
                        [{ text: 'Скрыть у всех', callback_data: 'invisibleClient' }],
                        [{ text: 'Вернуть у всех', callback_data: 'showClient' }],
                        [{ text: 'Скрыть для сотрудника', callback_data: 'skipClient' }],
                        [{ text: 'Вернуть для сотрудника', callback_data: 'showSkipClient' }],
                        [{ text: 'Удалить клиента', callback_data: 'deleteClient' }],
                        [{ text: 'Удалить проект', callback_data: 'deleteProject' }],
                        [{ text: 'Назад', callback_data: 'back' }],
                    ]
                }
            }
            const usersKeyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Вывести информацию о сотруднике', callback_data: 'people' }],
                        [{ text: 'Удалить сотрудника', callback_data: 'deleteUser' }],
                        [{ text: 'Забанить сотрудника', callback_data: 'newClient' }],
                        [{ text: 'Назад', callback_data: 'back' }],
                    ]
                }
            }
            exchange.command('/start', async (ctx) => {
                await ctx.reply('Список действий', keyboard)
            })
            async function getClientsKeys (clients, uniCode, ctx) {
                try {
                    if (clients[0] == null, !clients[0]) {
                        ctx.reply(reply.noClients, keyboard)
                        return false
                    }
                    const clientsArr = []
                    for (let i = 0; i < clients.length; i++) {
                        clientsArr.push(clients[i].name)
                    }
                    let arr = clientsArr.map((val) => {
                        return [{ text: val, callback_data: uniCode + val }]
                    })
                    arr.push([{ text: 'Назад', callback_data: 'back' }])
                    return { reply_markup: { inline_keyboard: arr } }
                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            }
            await ctx.reply('Список действий', keyboard)
            const registration = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Заполнить page id', callback_data: 'pageId' }],
                        [{ text: 'Заполнить spreadsheet id', callback_data: 'spreadsheetId' }],
                        [{ text: 'Информация', callback_data: 'info' }],
                        [{ text: 'Назад', callback_data: 'back' }],
                    ],
                },
            }
            const deleteClientKeyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'ДА', callback_data: 'del' }],
                        [{ text: 'НЕТ', callback_data: 'back' }],
                    ],
                },
            }
            const deleteUserKeyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'ДА', callback_data: 'delUser' }],
                        [{ text: 'НЕТ', callback_data: 'back' }],
                    ],
                },
            }
            const registerPageEnd = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Заполнить spreadsheet id', callback_data: 'againSpreadsheetId' }],
                        [{ text: 'Ввести заново', callback_data: 'againPageId' }],
                        [{ text: 'Назад', callback_data: 'back' }],
                    ],
                },
            }
            const registerSpreadsheetEnd = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Заполнить page id', callback_data: 'againPageId' }],
                        [{ text: 'Ввести заново', callback_data: 'againSpreadsheetId' }],
                        [{ text: 'Назад', callback_data: 'back' }],
                    ],
                },
            }
            const back = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Назад', callback_data: 'back' }],
                    ],
                },
            }
            exchange.command('/info', async ctx => {
                try {
                    ctx.reply(service_account.client_email, back)
                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('clientMenu', async ctx => {
                try {
                    ctx.reply('Список действий', clientsKeyboard)
                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('userMenu', async ctx => {
                try {
                    ctx.reply('Список действий', usersKeyboard)
                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('getReports', async ctx => {
                try {
                    await reports.getAdminReports(ctx, client)
                } catch (e) {
                    console.log(e)
                }
            })
            exchange.action('invisibleClient', async ctx => {
                try {
                    const uniCode = 'invisibleClient'
                    const clientsInfo = await client.query(select.clients())
                    const clients = clientsInfo.rows
                    if (clients[0] == null || !clients[0]) {
                        return ctx.reply(reply.noClients, keyboard)
                    }
                    const clientsArr = []
                    for (let i = 0; i < clients.length; i++) {
                        clientsArr.push(clients[i].name)
                    }
                    let arr = clientsArr.map((val) => {
                        return [{ text: val, callback_data: val + uniCode }]
                    })
                    arr.push([{ text: 'Назад', callback_data: 'back' }])
                    const invisibleClient = {
                        reply_markup: { inline_keyboard: arr }
                    }
                    ctx.reply(reply.client, invisibleClient)
                    for (let i = 0; i < clients.length; i++) {
                        exchange.action(clients[i].name + uniCode, async (ctx) => {
                            await client.query(update.NotVisible(), [clients[i].id])
                            ctx.reply(reply.clientIsNotVisible, keyboard)
                            ctx.session.admin = 'default'
                        })
                    }

                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('notifications', async ctx => {
                try {
                    ctx.scene.enter('startNotification')
                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('showClient', async ctx => {
                try {
                    const uniCode = 'showClient'
                    const clientsInfo = await client.query(select.inviseClients())
                    const clients = clientsInfo.rows
                    if (clients[0] == null || !clients[0]) {
                        return ctx.reply(reply.noClients, keyboard)
                    }
                    const clientsArr = []
                    for (let i = 0; i < clients.length; i++) {
                        clientsArr.push(clients[i].name)
                    }
                    let arr = clientsArr.map((val) => {
                        return [{ text: val, callback_data: val + uniCode }]
                    })
                    arr.push([{ text: 'Назад', callback_data: 'back' }])
                    const invisibleClient = {
                        reply_markup: { inline_keyboard: arr }
                    }
                    ctx.reply(reply.client, invisibleClient)
                    for (let i = 0; i < clients.length; i++) {
                        exchange.action(clients[i].name + uniCode, async (ctx) => {
                            await client.query(update.visible(), [clients[i].id])
                            ctx.reply(reply.clientIsVisible, keyboard)
                            ctx.session.admin = 'default'
                        })
                    }

                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('list', async ctx => {
                try {
                    const clients = await client.query(select.clients())
                    if (!clients.rows[0]) {
                        ctx.session.admin = 'default'
                        ctx.reply(reply.noClients, keyboard)
                        return
                    }
                    let listReply = ''
                    for (let i = 0; i < clients.rows.length; i++) {
                        listReply += '\n' + clients.rows[i].name
                    }
                    ctx.reply('Список клиентов:' + listReply, back)
                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('projectList', async ctx => {
                try {
                    const uniCode = 'projectList'
                    let clientsData = await client.query(select.clients())
                    let clients = clientsData.rows
                    const clientsArr = []
                    for (let i = 0; i < clients.length; i++) {
                        clientsArr.push(clients[i].name)
                    }
                    const arr = clientsArr.map((val) => {
                        return [{ text: val, callback_data: val + uniCode }]
                    })
                    arr.push([{ text: 'Назад', callback_data: 'back' }])
                    if (clientsArr[0] == null) {
                        ctx.session.admin = 'default'
                        ctx.reply(reply.noClients, keyboard)
                        return
                    }
                    const keyboard = {
                        reply_markup: { inline_keyboard: arr }
                    }
                    ctx.reply(reply.client, keyboard)
                    clientsData = await client.query(select.clients())
                    clients = clientsData.rows
                    for (let i = 0; i < clients.length; i++) {
                        exchange.action(clients[i].name + uniCode, async () => {
                            const projects = await client.query(select.projects(), [clients[i].id])
                            if (projects.rows[0].project !== null && projects.rows[0].project !== '') {
                                if (projects.rows[0].project[0]) {}
                            } else {
                                ctx.reply(reply.noProject, keyboard)
                                ctx.session.admin = 'default'
                                return
                            }
                            const projectsString = String(projects.rows[0].project)
                            console.log(projectsString)
                            let listReply = ''
                            let newArray = await split(projectsString, ',', ctx)
                            for (let x = 0; x < newArray.length; x++) {
                                listReply += '\n' + newArray[x]
                            }
                            ctx.reply(`Список проектов для ${clients[i].name}:` + listReply, back)
                        })
                    }
                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('againSpreadsheetId', ctx => {
                try {
                    ctx.session.admin = 'spreadsheetId'
                    ctx.reply(reply.enterSpreadsheetId, back)
                } catch (e) {
                    console.log(e)
                    ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('againPageId', ctx => {
                try {
                    ctx.session.admin = 'pageId'
                    ctx.reply(reply.enterPageId, back)
                } catch (e) {
                    console.log(e)
                    ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('people', async ctx => {
                try {
                    const userInfo = await client.query(select.users())
                    const users = userInfo.rows
                    const uniCode = 'people'
                    const userKeys = await getUsersKeys(users, uniCode, ctx)
                    if (!userKeys)
                        return
                    ctx.reply(reply.usersName, userKeys)
                    for (let i = 0; i < users.length; i++) {
                        exchange.action(uniCode + users[i].name, () => {
                            ctx.reply(
                              `Имя сотрудника - ${users[i].name}`
                              + `\nid - ${users[i].id}`
                              + `\n` + `telegram_chat_id - ${users[i].telegram_chat_id}`
                              + `\n` + `page_id - ${users[i].page_id}`
                              + `\n` + `spreadsheet_id - ${users[i].spreadsheet_id}`
                              , back)
                        })
                    }

                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('info', ctx => {
                try {
                    ctx.reply(reply.info, back)
                } catch (e) {
                    console.log(e)
                    ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('sendReports', async ctx => {
                try {
                    await google.sendReportsNow(client)
                    ctx.reply(reply.reports, keyboard)
                } catch (e) {
                    console.log(e)
                    ctx.reply(reply.error, keyboard)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('newClient', ctx => {
                try {
                    ctx.session.admin = 'newClient'
                    ctx.reply(reply.clientName, back)
                } catch (e) {
                    console.log(e)
                    ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('newProject', async ctx => {
                try {
                    ctx.session.admin = 'newProject'
                    const uniCode = 'newProject'
                    let clientsData = await client.query(select.clients())
                    let clients = clientsData.rows
                    const clientsArr = []
                    for (let i = 0; i < clients.length; i++) {
                        clientsArr.push(clients[i].name)
                    }
                    const arr = clientsArr.map((val) => {
                        return [{ text: val, callback_data: val + uniCode }]
                    })
                    arr.push([{ text: 'Назад', callback_data: 'back' }])
                    if (!clientsArr[0] || clientsArr[0] == null) {
                        ctx.session.admin = 'default'
                        ctx.reply(reply.noClients, keyboard)
                        return
                    }
                    const keyboard = {
                        reply_markup: { inline_keyboard: arr }
                    }
                    ctx.reply(reply.client, keyboard)
                    clientsData = await client.query(select.clients())
                    clients = clientsData.rows
                    for (let i = 0; i < clients.length; i++) {
                        exchange.action(clients[i].name + uniCode, () => {
                            chosenClient = clients[i].id
                            ctx.reply(reply.projectName, back)
                        })
                    }
                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('pageId', async ctx => {
                try {
                    const userInfo = await client.query(select.users())
                    const users = userInfo.rows
                    const uniCode = 'page'
                    const userKeys = await getUsersKeys(users, uniCode, ctx)
                    if (!userKeys)
                        return
                    ctx.reply(reply.usersName, userKeys)
                    for (let i = 0; i < users.length; i++) {
                        exchange.action(uniCode + users[i].name, () => {
                            chosenUser = users[i].telegram_chat_id
                            ctx.session.admin = 'pageId'
                            ctx.reply(reply.enterPageId, back)
                        })
                    }

                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('message', async ctx => {
                try {
                    const userInfo = await client.query(select.users())
                    const users = userInfo.rows
                    const uniCode = 'message'
                    const userKeys = await getUsersKeys(users, uniCode, ctx)
                    userKeys.reply_markup.inline_keyboard.push([{ text: 'Сообщение всем', callback_data: 'messageAll' }])
                    if (!userKeys)
                        return
                    ctx.reply(reply.usersName, userKeys)
                    exchange.action('messageAll', async () => {
                        ctx.session.admin = 'messageAll'
                        ctx.reply(reply.enterMessage, back)
                    })
                    for (let i = 0; i < users.length; i++) {
                        exchange.action(uniCode + users[i].name, () => {
                            chosenUser = users[i].telegram_chat_id
                            ctx.session.admin = 'message'
                            ctx.reply(reply.enterMessage, back)
                        })
                    }

                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('createTask', async ctx => {
                try {
                    ctx.scene.enter('createTaskByClient')
                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('changeTask', async ctx => {
                try {
                    ctx.scene.enter('changeTask')
                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('deleteTask', async ctx => {
                try {
                    ctx.scene.enter('deleteTask')
                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('spreadsheetId', async ctx => {
                try {
                    const userInfo = await client.query(select.users())
                    const users = userInfo.rows
                    const uniCode = 'spreadsheetId'
                    const userKeys = await getUsersKeys(users, uniCode, ctx)
                    if (!userKeys)
                        return
                    ctx.reply(reply.usersName, userKeys)
                    for (let i = 0; i < users.length; i++) {
                        exchange.action(uniCode + users[i].name, () => {
                            chosenUser = users[i].telegram_chat_id
                            ctx.session.admin = 'spreadsheetId'
                            ctx.reply(reply.enterSpreadsheetId, back)
                        })
                    }

                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('showSkipClient', async ctx => {
                try {
                    const showUserInfo = await client.query(select.users())
                    const showUsers = showUserInfo.rows
                    let uniCode = 'showSkipClient'
                    const userKeys = await getUsersKeys(showUsers, uniCode, ctx)
                    if (!userKeys)
                        return
                    ctx.reply(reply.usersName, userKeys)
                    for (let i = 0; i < showUsers.length; i++) {
                        exchange.action(uniCode + showUsers[i].name, async () => {
                            chosenUser = showUsers[i].telegram_chat_id
                            ctx.session.admin = 'showSkipClient'
                            const showClientsInfo = await client.query(select.clients())
                            const showClients = showClientsInfo.rows
                            const showUserData = await client.query(select.user(), [chosenUser])
                            if (
                              showUserData.rows[0].skip_clients == null
                                , !showUserData.rows[0].skip_clients
                            ) {
                                return ctx.reply(reply.noClients, keyboard)
                            }
                            let showClientsString = String(showUserData.rows[0].skip_clients)
                            let ShowSkipClientsArr = await split(showClientsString, ',', ctx)
                            let uniCode = 'showSkipClients'
                            let arr = ShowSkipClientsArr.map((val) => {
                                return [{ text: val, callback_data: val + uniCode }]
                            })
                            arr.push([{ text: 'Вернуть всех', callback_data: 'returnAll' }])
                            arr.push([{ text: 'Назад', callback_data: 'back' }])
                            const skipClient = {
                                reply_markup: { inline_keyboard: arr }
                            }
                            ctx.reply(reply.client, skipClient)
                            exchange.action('returnAll', async () => {
                                await client.query(update.skipClients(), ['', chosenUser])
                                chosenUser = ''
                                ctx.session.admin = 'default'
                                return ctx.reply(reply.clientIsVisible, keyboard)
                            })
                            for (let i = 0; i < showClients.length; i++) {
                                exchange.action(showClients[i].name + uniCode, async (ctx) => {
                                    const showUserData = await client.query(select.user(), [chosenUser])
                                    let showClientsString = String(showUserData.rows[0].skip_clients)
                                    let ShowSkipClientsArr = await split(showClientsString, ',', ctx)
                                    removeItem(ShowSkipClientsArr, showClients[i].name)
                                    showClientsString = ''
                                    for (let i = 0; i < ShowSkipClientsArr.length - 1; i++) {
                                        showClientsString += ShowSkipClientsArr[i] + ','
                                    }
                                    showClientsString += ShowSkipClientsArr[ShowSkipClientsArr.length - 1]
                                    if (!ShowSkipClientsArr[0])
                                        showClientsString = '';
                                    await client.query(update.skipClients(), [showClientsString, chosenUser])
                                    chosenUser = ''
                                    ctx.session.admin = 'default'
                                    return ctx.reply(reply.clientIsVisible, keyboard)
                                })
                            }

                        })
                    }

                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('skipClient', async ctx => {
                try {
                    const userInfo = await client.query(select.users())
                    const users = userInfo.rows
                    let uniCode = 'skipClient'
                    const userKeys = await getUsersKeys(users, uniCode, ctx)
                    if (!userKeys)
                        return
                    ctx.reply(reply.usersName, userKeys)
                    for (let i = 0; i < users.length; i++) {
                        exchange.action(uniCode + users[i].name, async () => {
                            chosenUser = users[i].telegram_chat_id
                            ctx.session.admin = 'skipClient'
                            const clientsInfo = await client.query(select.clients())
                            const clients = clientsInfo.rows
                            const userData = await client.query(select.user(), [chosenUser])
                            let clientsString = ''
                            if (userData.rows[0].skip_clients != null) {
                                clientsString = String(userData.rows[0].skip_clients)
                            }
                            let clientsArr = []
                            let skipClientsArr
                            if (clientsString != '') {
                                skipClientsArr = await split(clientsString, ',', ctx)
                            }
                            let skipUniCode = 'skipClients'
                            if (
                              clients[0] == null
                                , !clients[0]
                            ) {
                                return ctx.reply(reply.noClients, keyboard)
                            }
                            for (let i = 0; i < clients.length; i++) {
                                clientsArr.push(clients[i].name)
                            }
                            if (skipClientsArr) {
                                for (let i = 0; i < skipClientsArr.length; i++) {
                                    removeItem(clientsArr, skipClientsArr[i])
                                }
                            }
                            if (!clientsArr[0]) {
                                return ctx.reply(reply.noClients, keyboard)
                            }
                            let arr = clientsArr.map((val) => {
                                return [{ text: val, callback_data: val + skipUniCode }]
                            })
                            arr.push([{ text: 'Назад', callback_data: 'back' }])
                            const skipClient = {
                                reply_markup: { inline_keyboard: arr }
                            }
                            ctx.reply(reply.client, skipClient)
                            for (let i = 0; i < clients.length; i++) {
                                exchange.action(clients[i].name + skipUniCode, async (ctx) => {
                                    const userData = await client.query(select.user(), [chosenUser])
                                    let clientsString = ''
                                    if (userData.rows[0].skip_clients !== null && userData.rows[0].skip_clients != '') {
                                        if (userData.rows[0].skip_clients[0]) {
                                            clientsString = userData.rows[0].skip_clients
                                            clientsString += ',' + clients[i].name
                                        }
                                    } else {
                                        clientsString += clients[i].name
                                    }
                                    console.log(clientsString, 34)
                                    await client.query(update.skipClients(), [clientsString, chosenUser])
                                    chosenUser = ''
                                    ctx.session.admin = 'default'
                                    return ctx.reply(reply.clientIsNotVisible, keyboard)
                                })
                            }

                        })
                    }

                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('newName', async ctx => {
                try {
                    const userData = await client.query(select.users())
                    const users = userData.rows
                    const uniCode = 'newName'
                    const userKeys = await getUsersKeys(users, uniCode, ctx)
                    if (!userKeys)
                        return
                    console.log(userKeys)
                    ctx.reply(reply.usersName, userKeys)
                    for (let i = 0; i < users.length; i++) {
                        exchange.action(uniCode + users[i].name, () => {
                            chosenUser = users[i].telegram_chat_id
                            ctx.session.admin = 'newName'
                            ctx.reply(reply.newName, back)
                        })
                    }

                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('renameClient', async ctx => {
                try {
                    const clientData = await client.query(select.clients())
                    const clients = clientData.rows
                    const uniCode = 'renameClient'
                    const clientsKeys = await getClientsKeys(clients, uniCode, ctx)
                    if (!clientsKeys)
                        return
                    ctx.reply(reply.clientName, clientsKeys)
                    for (let i = 0; i < clients.length; i++) {
                        exchange.action(uniCode + clients[i].name, () => {
                            chosenClient = clients[i].id
                            ctx.session.admin = 'renameClient'
                            ctx.reply(reply.newName, back)
                        })
                    }

                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('del', async ctx => {
                try {
                    await client.query(del.client(), [chosenClient])
                    chosenClient = ''
                    ctx.reply(reply.clientDeleted, keyboard)
                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('delUser', async ctx => {
                try {
                    await client.query(del.user(), [chosenUser])
                    chosenUser = ''
                    ctx.reply(reply.userDeleted, keyboard)
                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('deleteClient', async ctx => {
                try {
                    ctx.session.admin = 'deleteClient'
                    const clientsInfo = await client.query(select.clients())
                    const clients = clientsInfo.rows
                    if (
                      !clients[0]
                        , clients[0] == null
                    ) {
                        return ctx.reply(reply.noClients, keyboard)
                    }
                    const clientsArr = []
                    for (let i = 0; i < clients.length; i++) {
                        clientsArr.push(clients[i].name)
                    }
                    let arr = clientsArr.map((val) => {
                        return [{ text: val, callback_data: val }]
                    })
                    arr.push([{ text: 'Назад', callback_data: 'back' }])
                    const deleteClients = {
                        reply_markup: { inline_keyboard: arr }
                    }
                    ctx.reply(reply.client, deleteClients)
                    for (let i = 0; i < clients.length; i++) {
                        exchange.action(clients[i].name, async (ctx) => {
                            chosenClient = clients[i].id
                            ctx.reply(reply.deleteAlert + clients[i].name, deleteClientKeyboard)
                        })
                    }

                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('deleteProject', async ctx => {
                try {
                    const uniCode = 'deleteProject'
                    const projectUniCode = 'deleteProject2'
                    let clientsData = await client.query(select.clients())
                    let clients = clientsData.rows
                    const clientsArr = []
                    for (let i = 0; i < clients.length; i++) {
                        clientsArr.push(clients[i].name)
                    }
                    const arr = clientsArr.map((val) => {
                        return [{ text: val, callback_data: val + uniCode }]
                    })
                    arr.push([{ text: 'Назад', callback_data: 'back' }])
                    if (
                      clientsArr[0] == null
                        , !clientsArr[0]
                    ) {
                        ctx.session.admin = 'default'
                        ctx.reply(reply.noClients, deleteKeyboard)
                        return
                    }
                    const deleteKeyboard = {
                        reply_markup: { inline_keyboard: arr }
                    }
                    ctx.reply(reply.client, deleteKeyboard)
                    clientsData = await client.query(select.clients())
                    clients = clientsData.rows
                    for (let i = 0; i < clients.length; i++) {
                        exchange.action(clients[i].name + uniCode, async () => {
                            const projects = await client.query(select.projects(), [clients[i].id])
                            if (projects.rows[0].project == null || projects.rows[0].project == '') {
                                ctx.reply(reply.noProject, keyboard)
                                ctx.session.admin = 'default'
                                return
                            }
                            const chosenClient = clients[i].id
                            const projectsString = String(projects.rows[0].project)
                            const newArray = await split(projectsString, ',', ctx)
                            const arr = newArray.map((val) => {
                                return [{ text: val, callback_data: val + projectUniCode }]
                            })
                            arr.push([{ text: 'Удалить все', callback_data: 'ClearAll' }])
                            const newKeyboard = {
                                reply_markup: { inline_keyboard: arr }
                            }
                            arr.push([{ text: 'Назад', callback_data: 'back' }])
                            ctx.reply(reply.project, newKeyboard)
                            exchange.action('ClearAll', async () => {
                                const clientData = await client.query(select.clientsById(), [chosenClient])
                                const clientId = clientData.rows[0].id
                                await client.query(update.clientProjects(), ['', clientId])
                                ctx.reply(reply.projectDeleted, keyboard)
                            })
                            for (let i = 0; i < newArray.length; i++) {

                                exchange.action(newArray[i] + projectUniCode, async () => {
                                    const updatedArray = removeItem(newArray, newArray[i])
                                    console.log(updatedArray)
                                    let toDb = ''
                                    for (let x = 0; x <= updatedArray.length - 2; x++) {
                                        console.log(toDb, 1)
                                        toDb += `${updatedArray[x]},`
                                    }
                                    toDb += `${updatedArray[updatedArray.length - 1]}`
                                    if (!updatedArray[0]) {
                                        toDb = ''
                                    }
                                    const clientData = await client.query(select.clientsById(), [chosenClient])
                                    const clientId = clientData.rows[0].id
                                    await client.query(update.clientProjects(), [toDb, clientId])
                                    ctx.reply(reply.projectDeleted, keyboard)
                                })
                            }
                        })
                    }
                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('deleteUser', async ctx => {
                try {
                    ctx.session.admin = 'deleteUser'
                    const usersInfo = await client.query(select.users())
                    const users = usersInfo.rows
                    if (
                        !users[0]
                            , users[0] == null
                    ) {
                        return ctx.reply(reply.noUsers)
                    }
                    const usersArr = []
                    for (let i = 0; i < users.length; i++) {
                        usersArr.push(users[i].name)
                    }
                    let arr = usersArr.map((val) => {
                        return [{ text: val, callback_data: val }]
                    })
                    arr.push([{ text: 'Назад', callback_data: 'back' }])
                    const deleteUsers = {
                        reply_markup: { inline_keyboard: arr }
                    }
                    ctx.reply(reply.user, deleteUsers)
                    for (let i = 0; i < users.length; i++) {
                        exchange.action(users[i].name, async (ctx) => {
                            chosenUser = users[i].id
                            ctx.reply(reply.deleteAlertUser + users[i].name + " хотите продолжить?", deleteUserKeyboard)
                        })
                    }

                } catch (e) {
                    console.log(e)
                    await ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('registration', ctx => {
                try {
                    ctx.reply(reply.adminKeyboard, registration)
                } catch (e) {
                    console.log(e)
                    ctx.telegram.sendMessage(1444238727, e)
                }
            })
            exchange.action('back', ctx => {
                try {
                    chosenUser = ''
                    chosenClient = ''
                    ctx.session.admin = 'default'
                    ctx.reply(reply.adminKeyboard, keyboard)
                } catch (e) {
                    console.log(e)
                    ctx.telegram.sendMessage(1444238727, e)
                }
            })

            exchange.on('text', async ctx => {
                if (ctx.session.admin == 'newClient') {
                    try {
                        await client.query(insert.client(), [ctx.message.text])
                        ctx.session.admin = 'default'
                        ctx.reply(reply.clientAdded, keyboard)
                    } catch (e) {
                        console.log(e)
                        await ctx.telegram.sendMessage(1444238727, e)
                    }
                }

                if (ctx.session.admin == 'deleteClient') {
                    try {
                        await client.query(del.client(), [ctx.message.text])
                        ctx.session.admin = 'default'
                        ctx.reply(reply.clientDeleted, keyboard)
                    } catch (e) {
                        console.log(e)
                        await ctx.telegram.sendMessage(1444238727, e)
                    }
                }

                if (ctx.session.admin == 'pageId' && Number(ctx.message.text)) {
                    try {
                        await client.query(update.userPage(), [ctx.message.text, chosenUser])
                        ctx.session.admin = 'default'
                        ctx.reply(reply.infoChanged, registerPageEnd)
                    } catch (e) {
                        console.log(e)
                        await ctx.telegram.sendMessage(1444238727, e)
                    }

                } else if (ctx.session.admin == 'pageId') {
                    try {
                        ctx.reply(reply.isNotANumber, back)
                    } catch (e) {
                        console.log(e)
                        await ctx.telegram.sendMessage(1444238727, e)
                    }
                }

                if (ctx.session.admin == 'spreadsheetId') {
                    try {
                        await client.query(update.userSpreadsheet(), [ctx.message.text, chosenUser])
                        ctx.session.admin = 'default'
                        ctx.reply(reply.infoChanged, registerSpreadsheetEnd)
                    } catch (e) {
                        console.log(e)
                        await ctx.telegram.sendMessage(1444238727, e)
                    }
                }

                if (ctx.session.admin == 'newName') {
                    try {
                        await client.query(update.name(), [ctx.message.text, chosenUser])
                        ctx.session.admin = 'default'
                        ctx.reply(reply.infoChanged, keyboard)
                    } catch (e) {
                        console.log(e)
                        await ctx.telegram.sendMessage(1444238727, e)
                    }
                }

                if (ctx.session.admin == 'renameClient') {
                    try {
                        await client.query(update.clientName(), [ctx.message.text, chosenClient])
                        ctx.session.admin = 'default'
                        ctx.reply(reply.infoChanged, keyboard)
                    } catch (e) {
                        console.log(e)
                        await ctx.telegram.sendMessage(1444238727, e)
                    }
                }

                if (ctx.session.admin == 'message') {
                    try {
                        await ctx.telegram.sendMessage(chosenUser, ctx.message.text)
                        ctx.session.admin = 'default'
                        ctx.reply(reply.messageSend, keyboard)
                    } catch (e) {
                        console.log(e)
                        await ctx.telegram.sendMessage(1444238727, e)
                    }
                }
                if (ctx.session.admin == 'messageAll') {
                    try {
                        const users = await client.query(select.users())
                          .then(res => res.rows)
                        for (x of users) {
                            await ctx.telegram.sendMessage(x.telegram_chat_id, ctx.message.text)
                        }
                        ctx.session.admin = 'default'
                        ctx.reply(reply.messageSend, keyboard)
                    } catch (e) {
                        console.log(e)
                        await ctx.telegram.sendMessage(1444238727, e)
                    }
                }

                if (ctx.session.admin == 'newProject') {
                    try {
                        const clientData = await client.query(select.clientsById(), [chosenClient])
                        const clientId = clientData.rows[0].id
                        let projectsString = ''
                        if (clientData.rows[0].project !== null && clientData.rows[0].project !== '') {
                            if (clientData.rows[0].project[0]) {
                                projectsString = clientData.rows[0].project
                                projectsString += ',' + ctx.message.text
                            }
                        } else {
                            projectsString += ctx.message.text
                        }
                        await client.query(update.clientProjects(), [projectsString, clientId])
                        ctx.session.admin = 'default'
                        ctx.reply(reply.projectAdded, keyboard)
                    } catch (e) {
                        console.log(e)
                        await ctx.telegram.sendMessage(1444238727, e)
                    }
                }

            })
        } catch (e) {
            console.log(e)
            await ctx.telegram.sendMessage(1444238727, e)
        }
    })
    return exchange
}
module.exports = {getUsersKeys, initAdminChat}
