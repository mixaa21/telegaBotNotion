module.exports = {
    time () {
        return `UPDATE "tracking"
                SET time=$1
                WHERE id = $2`
    },
    client () {                                     /* обновление таблицы tracking аргумента client */
        return `UPDATE "tracking"                   /* обновить таблицу tracking */
                SET client=$1                       /* установить аргумент client таблицы tracking "без клиента" */
                WHERE id = $2`                      /* установить аргумент client таблицы tracking "без клиента" */
    },
    project () {
        return `UPDATE "tracking"
                SET project=$1
                WHERE id = $2`
    },
    title () {
        return `UPDATE "tracking"
                SET title=$1
                WHERE id = $2`
    },
    clientProjects () {
        return `UPDATE "clients"
                SET project=$1
                WHERE id = $2`
    },
    userPage () {
        return `UPDATE "user"
                SET page_id=$1
                WHERE telegram_chat_id = $2`
    },
    userSpreadsheet () {
        return `UPDATE "user"
                SET spreadsheet_id=$1
                WHERE telegram_chat_id = $2`
    },
    skipClients () {
        return `UPDATE "user"
                SET skip_clients=$1
                WHERE telegram_chat_id = $2`
    },
    name () {
        return `UPDATE "user"
                SET name=$1
                WHERE telegram_chat_id = $2`
    },
    clientName () {
        return `UPDATE "clients"
                SET name = $1
                WHERE id = $2`
    },
    sentFlag () {
        return `UPDATE "tracking"
                SET sended_to_google= true
                WHERE user_id = $1`
    },
    visible () {
        return `UPDATE "clients"
                SET visible= true
                WHERE id = $1`
    },
    NotVisible () {
        return `UPDATE "clients"
                SET visible= false
                WHERE id = $1`
    }
}
