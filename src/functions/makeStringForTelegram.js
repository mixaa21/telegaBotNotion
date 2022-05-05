module.exports = async function makeStringForTelegram(arr) {
    taskArr = arr.map(item => {
        return item.properties.Name.title[0].plain_text
    })
    let tasks = ""
    for (let i = 0; i < taskArr.length; i++) {
        tasks += '\n' + `${i + 1}. ` + taskArr[i]
    }
    return tasks
}