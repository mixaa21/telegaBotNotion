module.exports = {
    user () {                                                /* выбрать юзера по id чата*/
        return `SELECT *                                     /* выбрать все */
                FROM "user"                                  /* из таблицы user */
                WHERE telegram_chat_id = $1                  /* где telegram_chat_id переданному id  ??? */
                ORDER BY timestamp DESC LIMIT 1`             /* отсортировать по timestamp по убыванию с лимитом в 1 строку */
    },
    userId () {                                              /* получение id юзера */
        return `SELECT id                                    /* выбрать все id */
                FROM "user"                                  /* из таблицы user */
                WHERE telegram_chat_id = $1                  /* где id чата равно переданному значению */
                ORDER BY timestamp DESC LIMIT 1`             /* отсортировать по убыванию и вывести только одну строку */
    },
    users () {
        return `SELECT *
                FROM "user"`
    },
    byTimestamp () {
        return `SELECT *
                FROM "tracking"
                WHERE timestamp >=NOW()- INTERVAL '1' DAY AND user_id=$1
                ORDER BY timestamp DESC`
    },
    tracking () {                                            /* функция трекинг */
        return `SELECT *                                     /* выбрать все */
                FROM "tracking"                              /* из таблицы трекинг */
                WHERE user_id = $1                          /* где user id равен переданному значению */
                ORDER BY timestamp DESC LIMIT 1`            /* отсортировать по убыванию timestamp с лимитом в одну строку */
    },
    client () {
        return `SELECT client
                FROM "tracking"
                WHERE user_id = $1
                ORDER BY timestamp DESC LIMIT 1`
    },
    clients () {                                        /* функция клиенты */
        return `SELECT *                                /* выбрать все */
                FROM "clients"                          /* из таблицы клиенты */
                WHERE visible = true`                   /* где аргумент visible равен true т.е. видимых клиентов */
    },
    inviseClients () {
        return `SELECT *
                FROM "clients"
                WHERE visible = false`
    },
    trackingId () {
        return `SELECT id
                FROM "tracking"
                WHERE user_id = $1
                ORDER BY timestamp DESC LIMIT 1`
    },
    id () {
        return `SELECT id                               /* выбрать все id */
                FROM "tracking"                         /* из таблицы tracking */
                WHERE user_id = $1                      /* где user_id равен переданному значению  */
                ORDER BY timestamp DESC LIMIT 1`        /* отсортировать по убыванию timestamp с лимитом в одну строку */
    },
    clientsById () {
        return `SELECT *
                FROM "clients"
                WHERE id = $1`
    },
    projects () {
        return `SELECT project
                FROM "clients"
                WHERE id = $1`
    },
    projectsByName () {
        return `SELECT project
                FROM "clients"
                WHERE name = $1`
    },
    allTracking () {
        return `SELECT *
                FROM "tracking"
                WHERE sended_to_google = false
                  AND user_id = $1`
    }
}
