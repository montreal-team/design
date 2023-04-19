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
            installAmount: amt,
            interest: parseFloat(interest).toFixed(2),
            capital: parseFloat(capital).toFixed(2),
            fees,
            balance: parseFloat(balance).toFixed(2),
            status: "",
        })
    }
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

    // let startD = startDate.getDate()
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

export const updateDateToTrans = (paymentArr, dateArr) => {
    paymentArr.forEach((e, i) => {
        e.date = dateArr[i]
    })
    console.log(paymentArr)
    console.log(dateArr)
    return paymentArr
}
