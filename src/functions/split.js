module.exports = async function (stringToSplit, separator, ctx) {
    try {
        return stringToSplit.split(separator)
    } catch (e) {
        console.log(e)
        await ctx.telegram.sendMessage(1444238727, e.message)
    }
}
