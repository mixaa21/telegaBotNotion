module.exports = function convertTaskToUrl (taskId) {
    return taskId.replace(/-/g, ''); // конвертируем id в рабочий для ссылки
}