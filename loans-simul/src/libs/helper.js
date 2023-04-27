import moment from "moment"
import Holidays from "date-holidays"
export const frequencyObj = {
    "1w": 52,
    "2w": 26,
    "1M": 12,
    "2byM": 26,
}

export const timeReferenceObj = {
    "1w": 7,
    "2w": 14,
    "1M": parseFloat(91 / 3).toFixed(2),
    "2byM": 14,
}

export const paymentFeesObj = {
    "1w": 1,
    "2w": 2,
    "1M": 4,
    "2byM": 2,
}

export const frequencyArr = [
    {
        text: "everyWeek",
        val: "1w",
    },
    {
        text: "everyTwoWeeks",
        val: "2w",
    },
    {
        text: "twiceAMonth",
        val: "2byM",
    },
    {
        text: "everyMonth",
        val: "1M",
    },
]

export const genTrans = ({ intRate = 0.29, freq = 52.0, fees = 0, totalsSeqNb = 1, amt = 0 }) => {
    let singleInt = intRate / freq
    const amount = amt - fees
    let balance = (amount * (1.0 - 1.0 / Math.pow(1.0 + singleInt, totalsSeqNb))) / singleInt
    let trans = []
    let idx = 0
    while (parseFloat(balance).toFixed(2) > 0) {
        console.log(parseFloat(balance).toFixed(2))
        idx++
        let interest = balance * singleInt
        let capital = amt - interest - fees
        balance = balance - capital
        balance = balance < 0 ? 0 : balance
        trans.push({
            orderNb: idx,
            date: "",
            installAmount: amt, interest: parseFloat(interest).toFixed(2),
            capital: parseFloat(capital).toFixed(2),
            fees,
            balance: parseFloat(balance).toFixed(2),
            status: "",
        })
    }
    return trans
}

export const genAdditionalTrans = ({
    orderNbInput = 1,
    balanceInput = 0,
    intRate = 0.29,
    freq = 52.0,
    fees = 0,
    amt = 0,
}) => {
    let singleInt = intRate / freq
    const amount = amt - fees
    let balance = balanceInput
    let trans = []
    let idx = orderNbInput
    /// update code here .....
    // while (parseFloat(balance).toFixed(2) > 0) {
    //     console.log(parseFloat(balance).toFixed(2))
    //     idx++
    //     let interest = balance * singleInt
    //     let capital = amt - interest - fees
    //     balance = balance - capital
    //     balance = balance < 0 ? 0 : balance
    //     trans.push({
    //         orderNb: idx,
    //         date: "",
    //         installAmount: amt,
    //         interest: parseFloat(interest).toFixed(2),
    //         capital: parseFloat(capital).toFixed(2),
    //         fees,
    //         balance: parseFloat(balance).toFixed(2),
    //         status: "",
    //     })
    // }
    return trans
}

const provinceArr = [
    {
        text: "Alberta",
        slugLowerCase: "ab",
    },
    {
        text: "British Columbia",
        slugLowerCase: "bc",
    },
    {
        text: "Manitoba",
        slugLowerCase: "mb",
    },
    {
        text: "New Brunswick",
        slugLowerCase: "nb",
    },
    {
        text: "Newfoundland and Labrador",
        slugLowerCase: "nl",
    },
    {
        text: "Northwest Territories",
        slugLowerCase: "nt",
    },
    {
        text: "Nova Scotia",
        slugLowerCase: "ns",
    },
    {
        text: "Nunavut",
        slugLowerCase: "nu",
    },
    {
        text: "Ontario",
        slugLowerCase: "on",
    },
    {
        text: "Prince Edward Island",
        slugLowerCase: "pe",
    },
    {
        text: "Quebec",
        slugLowerCase: "qc",
    },
    {
        text: "Saskatchewan",
        slugLowerCase: "sk",
    },
    {
        text: "Yukon Territory",
        slugLowerCase: "yt",
    },
]

const setupHolidayObj = (provinceLowerCase) => {
    var hd = new Holidays("CA", provinceLowerCase, { languages: "en", types: "public" })
    hd.unsetRule("easter") //remove Easter Sunday rule

    // Familay day
    if (!["ab", "bc", "nb", "on", "sk"].includes(provinceLowerCase)) {
        hd.unsetRule("3rd monday after 02-01")
    }
    if (provinceLowerCase == "nb") {
        hd.setHoliday("3rd monday after 02-01")
    }
    // Easter Monday
    hd.unsetRule("easter 1")
    // Victoria Day
    if (["ns", "pe", "qc"].includes(provinceLowerCase)) {
        hd.unsetRule("monday before 05-25")
    }
    // National Aboriginal Day
    hd.unsetRule("06-21")
    // Civic Holiday
    if (!["nt", "nu"].includes(provinceLowerCase)) {
        hd.unsetRule("monday after 08-01")
    }
    // Gold Cup Parade Day
    hd.unsetRule("3rd friday after 08-01")
    // Saskatchewan Day
    hd.unsetRule("3rd monday after 08-01")
    // National Day for Truth and Reconciliation
    if (!["nl", "pe"].includes(provinceLowerCase)) {
        hd.unsetRule("09-30 since 2021")
    }
    // Thanksgiving
    if (["ns", "pe"].includes(provinceLowerCase)) {
        hd.unsetRule("2nd monday after 10-01")
    }
    // Remembrance Day
    if (["mb", "ns", "on", "qc"].includes(provinceLowerCase)) {
        hd.unsetRule("11-11")
    }
    // Boxing Day
    if (!["ab", "nb", "nl", "nt", "nu", "on"].includes(provinceLowerCase)) {
        hd.unsetRule("12-26")
    }
    return hd
}

// find list of next date from start day for the case of 2 time by month
const findNextDate = (
    startPaymentD,
    startPaymentM,
    startPaymentY,
    firstPaymentDate,
    secondPaymentDate,
    list,
    totalsSeqNb
) => {
    let D = startPaymentD
    let M = startPaymentM
    let Y = startPaymentY
    let F = firstPaymentDate
    let S = secondPaymentDate

    if (list.length == totalsSeqNb) return
    let fArr = [F - D, S - D].filter((e) => e >= 0) || []
    if (fArr.length) {
        let next = D + Math.min(...fArr)
        D = next + 1
        list.push({ d: next, m: M, y: Y })
    } else {
        D = 0
        M += 1
    }
    if (M > 12) {
        M = 1
        Y += 1
    }
    findNextDate(D, M, Y, F, S, list, totalsSeqNb)
}
export const getDateString = (date) => {
    console.log(date)
    let yyyy = new Date(date).getFullYear()
    let mm = new Date(date).getMonth() + 1
    mm = mm < 10 ? `0${mm}` : mm
    let dd = new Date(date).getDate()
    dd = dd < 10 ? `0${dd}` : dd
    return `${dd}/${mm}/${yyyy}`
}
export const getCaHolidays = (currYear, province) => {
    var provinceLowerCase = ((provinceArr.filter((e) => e.text.toLowerCase() == province.toLowerCase()) || [])[0] || {})
        .slugLowerCase
    let hd = setupHolidayObj(provinceLowerCase)
    let holidays = hd
        .getHolidays(currYear)
        .filter((date) => date.type == "public")
        .map((res) => getDateString(res.date))
    return holidays
}

const isWeeken = (d, m, y) => {
    let day = new Date(y, m - 1, d).getDay()
    return [0, 6].includes(day)
}
const isHoliday = (d, m, y, province) => {
    let dStr = d < 10 ? `0${d}` : d
    let mStr = m < 10 ? `0${m}` : m
    return getCaHolidays(y, province).includes(`${dStr}/${mStr}/${y}`)
}

const findPrevValidDate = ({ d, m, y }, province) => {
    if (isWeeken(d, m, y) || isHoliday(d, m, y, province)) {
        return findPrevValidDate({ d: d - 1, m, y }, province)
    } else {
        return { d, m, y }
    }
}
// find next valid date with check of weekend and holiday for 1 given date
const findValidDate = ({ d, m, y }, province) => {
    let dStr = d < 10 ? `0${d}` : d
    let mStr = m < 10 ? `0${m}` : m
    // if normal date of current month/year
    if (moment(`${mStr}/${dStr}/${y}`, "MM/DD/YYYY", true).isValid()) {
        if (isWeeken(d, m, y) || isHoliday(d, m, y, province)) {
            return findValidDate({ d: d + 1, m, y }, province)
        } else {
            return { d, m, y }
        }
    } else {
        // if out of this month/year
        let obj = findPrevValidDate({ d: d - 1, m, y }, province)
        return findValidDate(obj, province)
    }
}

export const genDate = ({ firstDate, secondDate, startPayDate, totalsSeqNb = 1, province }) => {
    let F = firstDate
    let S = secondDate

    // let startDate = new Date(startPayDate)

    // let startD = startDate.getDate()\
    // let startM = startDate.getMonth() + 1
    // let startY = startDate.getFullYear()
    console.log("startPayDate.split=> ", startPayDate.split("/"))
    let startD = parseInt(startPayDate.split("/")[0])
    let startM = parseInt(startPayDate.split("/")[1])
    let startY = parseInt(startPayDate.split("/")[2])

    console.log(startD, startM, startY)
    let list = []
    findNextDate(startD, startM, startY, firstDate, secondDate, list, totalsSeqNb)

    let fList = []

    list.forEach((e) => {
        fList.push(findValidDate({ d: e.d, m: e.m, y: e.y }, province))
    })
    fList = fList.map((d) => {
        return new Date(d.y, d.m - 1, d.d, 12, 0, 0).getTime()
    })
    return fList
}

export const updateDateToTrans = (paymentArr, dateArr, firstDate = 0, secondDate = 0,) => {
    paymentArr.forEach((e, i) => {
        e._id = (474984668798 + i).toString()
        e.date = dateArr[i]
        e.freq = `2byM`
        e.setupAmount = e.installAmount
        e.firstPayDate = firstDate
        e.secondPayDate = secondDate
    })
    console.log(paymentArr)
    console.log(dateArr)
    return paymentArr
}

export const findProcessionData = (data, date) => {
    const beforeTrans = data.filter(el => new Date(el.date) < date)
    return beforeTrans.length
}

export const findlastValidBalance = (data, location) => {
    let trans = {}
    let validBalance = 0
    if (!location) {
        trans = data.find((element) => parseFloat(element.balance).toFixed(2) > 0);
        validBalance = Number(trans.balance) + Number(trans.capital)
    } else {
        trans = data.findLast((element, idx) => (element.description != 'deferredPayment') && idx < location);
        validBalance = Number(trans.balance)
    }
    return validBalance
}

export const createInsertData = (status = '', lastBalance, orderNb, installAmount, date, transData) => {
    let interest = parseFloat(Number(lastBalance) * 0.29/frequencyObj[transData.freq])
    const freqName = frequencyArr.find((freq) => freq.val == transData.freq)
    let capital = Number(installAmount) -  Number(interest)
    // contract.isCreditVariable ? capital -= transData.fees : ''
    // if (capital +  Number(interest) > Number(lastBalance) || parseFloat(capital).toFixed(2) < 0) {
    //     return
    // }
    // let capital = Number(installAmount) -  Number(interest) - transData.fees
    if (capital +  Number(interest) > Number(lastBalance)) {
        return
    }
    let balance = lastBalance - capital
    balance = balance < 0 ? 0 : balance
    return Object.assign({}, transData, {
        status: status,
        orderNb: orderNb,
        installAmount: installAmount,
        date: date,
        interest: parseFloat(interest),
        capital: parseFloat(capital),
        balance: parseFloat(balance),
    })
}

export const updateExistData = (transArr, updateLocation, currBalance) => {
    let [...newTransArr] = transArr
    newTransArr.forEach((el, idx) => {
        if (parseFloat(currBalance).toFixed(2) > 0 && idx >= updateLocation) {
            // const freqName = frequencyArr.find((freq) => freq.val == el.freq)
            let installAmount = el.setupAmount
            let currInterest = Number(currBalance) * 0.29/frequencyObj[el.freq]
            let capital = Number(installAmount) - currInterest - el.fees
            // contract.isCreditVariable ? capital -= el.fees : ''
            // console.log(parseFloat(currBalance).toFixed(2) < parseFloat(capital).toFixed(2))
            if (Number(parseFloat(currBalance).toFixed(2)) < Number(parseFloat(capital).toFixed(2)) && el.status != 'stopPayment') {
                capital = currBalance
                currBalance = 0
                installAmount = capital + currInterest + Number(el.fees)
            } else if (el.status != 'stopPayment') {
                currBalance -=  capital
            }
            Object.assign(el, {
                installAmount: parseFloat(installAmount),
                interest: el.status != 'stopPayment' ? parseFloat(currInterest) : 0,
                capital: el.status != 'stopPayment' ? parseFloat(capital) : 0,
                balance: el.status != 'stopPayment' ? parseFloat(currBalance) : 0,
                orderNb: idx + 1,
                date: transArr[idx].date
            })
        } else if (parseFloat(currBalance).toFixed(2) <= 0 && idx >= updateLocation && el.status != 'stopPayment') {
            newTransArr = newTransArr.filter(de => de._id != el._id)
        }
    })
    return newTransArr
}

export const createNewData = (lastPayment) => {
    let currBalance = lastPayment.balance
    let nextDate = lastPayment.date
    let newTransArr = []
    let nextOrderNb = lastPayment.orderNb + 1
    while(parseFloat(currBalance).toFixed(2) > 0) {
        let installAmount = lastPayment.setupAmount
        let currInterest = Number(currBalance) * 0.29/frequencyObj[lastPayment.freq]
        let capital = Number(installAmount) - currInterest - lastPayment.fees
        if (Number(parseFloat(currBalance).toFixed(2)) < Number(parseFloat(capital).toFixed(2))) {
            capital = currBalance
            installAmount = Number(capital) + Number(currInterest) + Number(lastPayment.fees)
            currBalance = 0
        } else {
            currBalance -=  capital
        }
        nextDate = getOneTransDateFunc("2byM", lastPayment, 'qc', nextDate)
        newTransArr.push(Object.assign({}, lastPayment, {
            installAmount: parseFloat(installAmount),
            interest: parseFloat(currInterest),
            capital: parseFloat(capital),
            balance: parseFloat(currBalance),
            orderNb: nextOrderNb,
            date: nextDate,
            fees: 0
        }))
        nextOrderNb++
    }
    return newTransArr
}

const getOneTransDateFunc = (
    paymentFrequency = "",
    lastTrans = {},
    province,
    startDate = 0
) => {
    let date = 0
    if (paymentFrequency == "2byM") {
        console.log(lastTrans)
        const firstDate = lastTrans.firstPayDate
        const secondDate = lastTrans.secondPayDate
        const openDate = new Date(startDate).getDate()
        const currDate = new Date(startDate)
        let newDate = 0
        let newMonth = currDate
        const lastDay = new Date(newMonth.getFullYear(), newMonth.getMonth() + 1, 0, 12, 0, 0)
        if (openDate < firstDate || openDate >= secondDate || openDate == lastDay.getDate()) {
            newDate = firstDate
        } else {
            newDate = secondDate
        }
        newDate > lastDay.getDate() ? (newDate = lastDay.getDate()) : ""
        date = new Date(new Date(newMonth).getFullYear(), new Date(newMonth).getMonth(), newDate, 12, 0, 0).getTime()
        let validDate = findValidDate(
            {
                d: new Date(date).getDate(),
                m: new Date(date).getMonth() + 1,
                y: new Date(date).getFullYear(),
            },
            province
        )
        date = new Date(validDate.y, validDate.m - 1, validDate.d, 12, 0, 0).getTime()
    } else {
        const timeRef = timeReferenceObj
        date = startDate ? startDate : lastTrans.date + 86400 * timeRef[paymentFrequency] * 1000
        let validDate = findValidDate(
            {
                d: new Date(date).getDate(),
                m: new Date(date).getMonth() + 1,
                y: new Date(date).getFullYear(),
            },
            province
        )
        date = new Date(validDate.y, validDate.m - 1, validDate.d, 12, 0, 0).getTime()
    }
    return date
}
