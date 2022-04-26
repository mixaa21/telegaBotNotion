module.exports = {
    insert: {
        notifications: () => {
            return `INSERT INTO "notifications" (chat_id, message, alert_date) VALUES ($1, $2, $3)`
        }
    },
    get: {
        notifications: () => {
            return `SELECT * FROM "notifications"`
        }
    }
}
