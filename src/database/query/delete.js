module.exports = {
    client () {
        return `DELETE
                FROM "clients"
                WHERE id = $1`
    },
    user () {
        return `DELETE
                FROM "user"
                WHERE id = $1`
    }
    , tracking () {
        return `DELETE
                FROM "tracking"
                WHERE id = $1`
    },
}
