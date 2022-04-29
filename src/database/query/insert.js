module.exports = {
    user () {
        return `INSERT INTO "user" (name, telegram_chat_id, mail, notion_id)          /* добавить в таблицу user имя пользователя, id и mail который он ввел */
                VALUES ($1, $2, $3, $4)`                                     /* судя по всему переданные значения */
    }
    , title () {
        return `INSERT INTO "tracking" (title)
                VALUES ($1)`
    }
    , newTracking () {
        return `INSERT INTO "tracking" (user_id, title, client, project, notion_link)
                VALUES ($1, $2, $3, $4, $5)`
    },
    addTask () {
    return `INSERT INTO "notion_tasks" (id, title, client, project, status)
                VALUES ($1, $2, $3, $4, $5)`
}
    , client () {
        return `INSERT INTO "clients" (name)
                VALUES ($1)`
    }
}
