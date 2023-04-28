import moment from "moment"
import Holidays from "date-holidays"

// check if weekend
const isWeekend = (d, m, y) => {
    let day = new Date(y, m - 1, d).getDay()
    return [0, 6].includes(day)
}

// num to string
const nbToStr = (nb) => {
    return nb < 10 ? `0${nb}` : `${nb}`
}

// get date in string format dd/mm/yyyy. input date i unix time number 
export const getDDMMYYYYStr = (date) => {
    let dateObj = new Date(date)
    let yyyy = dateObj.getFullYear()
    let mm = dateObj.getMonth() + 1
    let dd = dateObj.getDate()
    return `${nbToStr(dd)}/${nbToStr(mm)}/${yyyy}`
}

// 
export const getDDMMYYYY = (date) => {
    let dateObj = new Date(date)
    let yyyy = dateObj.getFullYear()
    let mm = dateObj.getMonth() + 1
    let dd = dateObj.getDate()
    return {d: dd, m: mm, y: yyyy}
}

// convert number or string to 2 decimal number
export const toFixed2 = (nb) => {
    return parseFloat(nb) ? parseFloat(nb).toFixed(2) : 0.00
}

// nubmer of weeks by option
export const frequencyObj = {
    "1w": 52,
    "2w": 26,
    "1M": 12,
    "2byM": 26,
}

// number of day between 2 payment sequence date
export const timeReferenceObj = {
    "1w": 7,
    "2w": 14,
    "1M": toFixed2(91.0/3.0),
    "2byM": 14,
}

// frequency name list 
export const freqOptions = [
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


// list of provinces used for holiday days callculation
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

// init object for libs used to determine holidays
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

// find list of next date from start day for the case of twice by month
const findNextDate2byM = (
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
    findNextDate2byM(D, M, Y, F, S, list, totalsSeqNb)
}

// find next date for other case 
const findNextDate = (
    startPaymentD,
    startPaymentM,
    startPaymentY,
    list,
    totalsSeqNb,
    freq = '1w'
) => {
    if (list.length == totalsSeqNb) return
    let startTime = new Date(startPaymentY, startPaymentM - 1, startPaymentD, 12).getTime()
    let nextTime = startTime + timeReferenceObj[freq] * 24*60*60*1000
    let nextDateObj = new Date(nextTime);
    let {d, m, y} = getDDMMYYYY(nextDateObj)
    list.push({ d, m, y})
    findNextDate(d, m, y, list, totalsSeqNb, freq)
}

export const getCaHolidays = (currYear, province) => {
    var provinceLowerCase = ((provinceArr.filter((e) => e.text.toLowerCase() == province.toLowerCase()) || [])[0] || {})
        .slugLowerCase
    let hd = setupHolidayObj(provinceLowerCase)
    let holidays = hd
        .getHolidays(currYear)
        .filter((date) => date.type == "public")
        .map((res) => getDDMMYYYYStr(res.date))
    return holidays
}

// check if holiday
const isHoliday = (d, m, y, province) => {
    return getCaHolidays(y, province).includes(`${nbToStr(d)}/${nbToStr(m)}/${y}`)
}

const findPrevValidDate = ({ d, m, y }, province) => {
    if (isWeekend(d, m, y) || isHoliday(d, m, y, province)) {
        return findPrevValidDate({ d: d - 1, m, y }, province)
    } else {
        return { d, m, y }
    }
}
// find next valid date with check of weekend and holiday for 1 given date
const findValidDate = ({ d, m, y }, province) => {
    // if normal date of current month/year
    if (moment(`${nbToStr(m)}/${nbToStr(d)}/${y}`, "MM/DD/YYYY", true).isValid()) {
        if (isWeekend(d, m, y) || isHoliday(d, m, y, province)) {
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



// generate init transaction, that will be use when create contract
// commonData = { // common data that related to contract info  
//     companyId: 'companyId', 
//     branchId: 'branchId', 
//     clientProfileId: 'clientProfileId', 
//     clientId: 'clientId', 
//     demandId: 'demandId',
//     contractId: 'contractId'
// }
export const genTrans = ({ intRate = 0.29, freq = '1w', fees = 0, totalsSeqNb = 1, amt = 0, commonData = {} }) => {
    
    if (!intRate || totalsSeqNb <1 || !frequencyObj[freq]) return []
    let singleInt = intRate / frequencyObj[freq]
    const amount = amt - fees
    let balance = (amount * (1.0 - 1.0 / Math.pow(1.0 + singleInt, totalsSeqNb))) / singleInt
    let trans = []
    let idx = 0
    while (toFixed2(balance) > 0) {
        idx++
        let interest = balance * singleInt
        let capital = amt - interest - fees
        balance = balance - capital
        balance = balance < 0 ? 0 : balance
        trans.push(
            Object.assign({}, commonData, {
                _id: idx,
                orderNb: idx,
                date: 0,
                installAmount: amt, 
                setupAmount: amt,
                interest: toFixed2(interest),
                capital: toFixed2(capital),
                fees,
                balance: toFixed2(balance),
                status: "in progess"
            })
        )
    }

    return trans
}

// generate date for initial list
export const genDate = ({ freq = '1w', firstDate = 5, secondDate= 15, startPayDate, totalsSeqNb = 1, province }) => {
    let startD = parseInt(startPayDate.split("/")[0])
    let startM = parseInt(startPayDate.split("/")[1])
    let startY = parseInt(startPayDate.split("/")[2])

    let list = []
    if (freq == '2byM') {
        findNextDate2byM(startD, startM, startY, firstDate, secondDate, list, totalsSeqNb)
    } else {
        findNextDate(startD, startM, startY, list, totalsSeqNb, freq)
    }

    let fList = []
    list.forEach((e) => {
        fList.push(findValidDate({ d: e.d, m: e.m, y: e.y }, province))
    })
    fList = fList.map((date) => {
        return new Date(date.y, date.m - 1, date.d, 12).getTime()
    })
    return fList
    
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
    // while (toFixed2(balance) > 0) {
    //     console.log(toFixed2(balance))
    //     idx++
    //     let interest = balance * singleInt
    //     let capital = amt - interest - fees
    //     balance = balance - capital
    //     balance = balance < 0 ? 0 : balance
    //     trans.push({
    //         orderNb: idx,
    //         date: "",
    //         installAmount: amt,
    //         interest: toFixed2(interest),
    //         capital: toFixed2(capital),
    //         fees,
    //         balance: toFixed2(balance),
    //         status: "",
    //     })
    // }
    return trans
}


export const updateDateToTrans = (paymentArr, dateArr) => {
    paymentArr.forEach((e, i) => {e.date = dateArr[i]})
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
        trans = data.find((element) => toFixed2(element.balance) > 0);
        validBalance = Number(trans.balance) + Number(trans.capital)
    } else {
        trans = data.findLast((element, idx) => (element.description != 'deferredPayment') && idx < location);
        validBalance = Number(trans.balance)
    }
    return validBalance
}

export const createInsertData = (status = '', lastBalance, orderNb, installAmount, date, transData) => {
    let interest = toFixed2(Number(lastBalance) * 0.29/frequencyObj[transData.freq])
    const freqName = freqOptions.find((freq) => freq.val == transData.freq)
    let capital = Number(installAmount) -  Number(interest)
    // contract.isCreditVariable ? capital -= transData.fees : ''
    // if (capital +  Number(interest) > Number(lastBalance) || toFixed2(capital) < 0) {
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
        interest: toFixed2(interest),
        capital: toFixed2(capital),
        balance: toFixed2(balance),
    })
}

export const updateExistData = (transArr, updateLocation, currBalance) => {
    let [...newTransArr] = transArr
    newTransArr.forEach((el, idx) => {
        if (toFixed2(currBalance) > 0 && idx >= updateLocation) {
            // const freqName = frequencyArr.find((freq) => freq.val == el.freq)
            let installAmount = el.setupAmount
            let currInterest = Number(currBalance) * 0.29/frequencyObj[el.freq]
            let capital = Number(installAmount) - currInterest - el.fees
            // contract.isCreditVariable ? capital -= el.fees : ''
            // console.log(toFixed2(currBalance) < toFixed2(capital))
            if (Number(toFixed2(currBalance)) < Number(toFixed2(capital)) && el.status != 'stopPayment') {
                capital = currBalance
                currBalance = 0
                installAmount = capital + currInterest + Number(el.fees)
            } else if (el.status != 'stopPayment') {
                currBalance -=  capital
            }
            Object.assign(el, {
                installAmount: toFixed2(installAmount),
                interest: el.status != 'stopPayment' ? toFixed2(currInterest) : 0,
                capital: el.status != 'stopPayment' ? toFixed2(capital) : 0,
                balance: el.status != 'stopPayment' ? toFixed2(currBalance) : 0,
                orderNb: idx + 1,
                date: transArr[idx].date
            })
        } else if (toFixed2(currBalance) <= 0 && idx >= updateLocation && el.status != 'stopPayment') {
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
    while(toFixed2(currBalance) > 0) {
        let installAmount = lastPayment.setupAmount
        let currInterest = Number(currBalance) * 0.29/frequencyObj[lastPayment.freq]
        let capital = Number(installAmount) - currInterest - lastPayment.fees
        if (Number(toFixed2(currBalance)) < Number(toFixed2(capital))) {
            capital = currBalance
            installAmount = Number(capital) + Number(currInterest) + Number(lastPayment.fees)
            currBalance = 0
        } else {
            currBalance -=  capital
        }
        nextDate = getOneTransDateFunc("2byM", lastPayment, 'qc', nextDate)
        newTransArr.push(Object.assign({}, lastPayment, {
            installAmount: toFixed2(installAmount),
            interest: toFixed2(currInterest),
            capital: toFixed2(capital),
            balance: toFixed2(currBalance),
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
