module.exports = {
    client () {
        return `DELETE
                FROM "clients"
                WHERE id = $1`
    }
    , tracking () {
        return `DELETE
                FROM "tracking"
                WHERE id = $1`
    },
}
