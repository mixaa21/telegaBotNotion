module.exports = {
    start: (str) => {
        let dateReg = /^\d{2}([./-])\d{2}\1\d{4}$/
        if (str) {
            if (str.match(dateReg)) {
                let dd = str.slice(0, 2)
                let mm = str.slice(3, 5)
                let yyyy = str.slice(6, 10)
                let date = mm + '.' + dd + '.' + yyyy
                let newDate = new Date(date)
                if (Date.parse(newDate)) {
                    console.log(1)
                    let newDay = newDate.getDate()
                      , newMonth = newDate.getMonth()
                      , newYear = newDate.getFullYear()
                      , now = new Date()
                      , day = now.getDate()
                      , month = now.getMonth()
                      , year = now.getFullYear()
                    if (
                      newYear > year
                    ) {
                        return true
                    } else if (
                      newYear === year
                      && newMonth > month
                    ) {
                        return true
                    } else if (
                      newYear === year
                      && newMonth === month
                      && newDay >= day
                    ) {
                        return true
                    }
                }
            }
        }
        return false
    },
    check: (date) => {
        if (Date.parse(date)) {
            let newDay = date.getDate()
              , newMonth = date.getMonth()
              , newYear = date.getFullYear()
              , now = new Date()
              , day = now.getDate()
              , month = now.getMonth()
              , year = now.getFullYear()
            if (
              newDay === day
              && newMonth === month
              && newYear === year
            ) {
                return true
            }
        }
        return false
    }
}
