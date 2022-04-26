const { Telegraf } = require('telegraf')
const { Scenes, session } = require('telegraf')
const initUserChat = require('./src/scenes/userScenes/start.scene')
const adminChat = require('./src/scenes/adminScenes/admin.scene')
const initReport = require('./src/scenes/userScenes/report.scene')
const initTime = require('./src/scenes/userScenes/time.scene')
const initClient = require('./src/scenes/userScenes/client.scene')
const initProject = require('./src/scenes/userScenes/project.scene')
const notification = require('./src/notifications/src/scenes/start.scene')
const initCreateNotification = require('./src/notifications/src/scenes/create.scene')
const google = require('./src/googleDoc/sendReports')                                         // импорт функции для отправки отчета в гугл
const check = require('./src/googleDoc/activityCheck')
const notifications = require('./src/notifications/src/notifications')
require('dotenv').config()
const { Client } = require('pg')
const initNotionTasks = require('./src/scenes/userScenes/notionTasks.scene')

async function start () {
    process.setUncaughtExceptionCaptureCallback(async e => {
        const bot = new Telegraf(process.env.BOT_TOKEN)          // создание объекта bot класса Telegraf в который передается бот токен, который можно получить написав в телеграмме BotFather
        await bot.launch()                                       // запуск бота
        // await bot.telegram.sendMessage(-482104010,
        //   `WST-bot error:\n${e}\n\nБот не работает!!!`)
        await bot.stop()
    })
    const client = new Client(process.env.DATABASE_URL)          // создание объекта client класса Client в который передается путь до базы данных
    client.connect(err => {                               // подключение к базе данных при помощи метода connect
        err                                                      // если ошибка
          ? console.error('database connection error', err.stack)  // вывести что не удалось подключиться к базе с ошибкой
          : console.log('database connected')                      // иначе вывести что подключиться удалось
    })
    const bot = new Telegraf(process.env.BOT_TOKEN)              // cоздание объектра bot класса Telegraf и передачей токена
    let botInfo                                                  // создание переменной botInfo
    bot.telegram.getMe().then(res => {                            // получить освновную информацию о боте при помощи метода getMe
        console.log(res)                                          // вывести полученную информацию в консоль
        botInfo = res                                             // также записать эту информацию в переменную botInfo
    })
    console.log('bot started')                                    // вывести в консоль что бот стартовал
    bot.use(session())                                            // регистрация промежуточного ПО ???
    const stage = new Scenes.Stage([                       // создание объекта stage класса Stage который принимает массив сцен
        await initUserChat(client),                               // вызываем импортированную функцию initUserChat в которую передаем объект client (postgreSql)
        await initNotionTasks(client),
        await initReport(client),                                 // вызываем ипмортированную функцию initReport в которую передаем объект client (postgreSql)
        await initTime(client),                                   // вызываем ипмортированную функцию initTime в которую передаем объект client (postgreSql)
        await initClient(client),                                 // вызываем ипмортированную функцию initClient в которую передаем объект client (postgreSql)
        await initProject(client),                                // вызываем ипмортированную функцию initProject в которую передаем объект client (postgreSql)
        await adminChat.initAdminChat(client),                    // вызываем ипмортированную функцию adminChat.initAdminChat в которую передаем объект client (postgreSql)
        await notification.initStartScene(client),                // вызываем ипмортированную функцию notification.initStartScene в которую передаем объект client (postgreSql)
        await initCreateNotification(client)                      // вызываем ипмортированную функцию initCreateNotification в которую передаем объект client (postgreSql)
    ])
    bot.use(stage.middleware())                            // прослушка всех сцен ???
    // bot.use(async (ctx, next) => {
    //   console.log('middleware start')
    //   if (ctx.chat.id == process.env.ADMIN_CHAT_ID) {
    //     console.log('enter admin from index...')
    //     ctx.scene.enter('admin')
    //   } else {
    //     console.log('enter user from index...')
    //     ctx.scene.enter('user')
    //   }
    // })
    bot.hears('check', async ctx => {            // прослушка текстовых сообщений
        ctx.reply(botInfo)
    })
    bot.command('/start', async (ctx) => {     // прослушка команды старт
        ctx.reply(ctx.chat.id)
        if (String(ctx.chat.id) === process.env.ADMIN_CHAT_ID) {
            console.log('enter admin from index...')
            ctx.scene.enter('admin')
        } else {
            console.log('enter user from index...')
            await check.alert(ctx)
            ctx.scene.enter('user')
        }
    })

    bot.on('text', async ctx => {                          // прослушка введенного текста
         if (String(ctx.chat.id) === process.env.ADMIN_CHAT_ID) {        // если чат равен id админского чата
             console.log('enter admin from index...')                    // вывести в консоль что написал админ
             ctx.scene.enter('admin')                                    // войти в сцену с админом
         } else {                                                        // иначе написал юзер
             console.log('enter user from index...')                     // вывести в консоль что написал юзер
            ctx.scene.enter('user')                                      // войти в сцену юзер
        }
    })
    google.startSendingReports(client)                // вызов функции google.startSendingReports
    check.alert(bot, client)                          // вызов функции check.alert
    google.startSendingAdminReports(bot, client)      // вызов функции google.startSendingAdminReports
    google.startSendingUserReports(bot, client)       // вызов функции google.startSendingUserReports
    try{
        notifications.start(client, bot)              // вызов функции notifications.start
    } catch(e) {
        bot.telegram.sendMessage(process.env.ADMIN_CHAT_ID, e.message, e.messageerror, e)
    }
    bot.telegram.sendMessage(process.env.ADMIN_CHAT_ID, 'WST_TRACKER success started')                // отправить сообщение в админский чат что бот стартовал
    bot.launch()                                                                                           // запуск бота
}
    start()                          // запуск главной функции start
