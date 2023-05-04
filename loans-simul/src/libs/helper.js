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

// get unix time from dd/mm/yy
export const getUnixTime = (date) => {
    const dateArr = date.split("/")
    let d = parseInt(dateArr[0])
    let m = parseInt(dateArr[1])
    let y = parseInt(dateArr[2])
    return new Date(y, m - 1, d, 12).getTime()
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
        // let interest = balance * singleInt
        // let capital = amt - interest - fees
        // balance = balance - capital
        // balance = balance < 0 ? 0 : balance
        if (idx == 2) {
            trans.push(
                Object.assign({}, commonData, {
                    _id: idx,
                    orderNb: idx,
                    date: 0,
                    freq,
                    installAmount: amt, 
                    setupAmount: 25,
                    interest: 0,
                    capital: 0,
                    fees,
                    balance: 0,
                    status: "differ"
                })
            )
        } else {
        let interest = balance * singleInt
        let capital = amt - interest - fees
        balance = balance - capital
        balance = balance < 0 ? 0 : balance
        trans.push(
            Object.assign({}, commonData, {
                _id: idx,
                orderNb: idx,
                date: 0,
                freq,
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
    }
    return trans
}

// generate date for initial list when create contract
export const genDate = ({ freq = '1w', firstDate = 5, secondDate= 15, startPayDate, totalsSeqNb = 1, province }) => {
    let startD = parseInt(startPayDate.split("/")[0])
    let startM = parseInt(startPayDate.split("/")[1])
    let startY = parseInt(startPayDate.split("/")[2])
    let listDate = []
    if (freq == '2byM') {
        findNextDate2byM(startD, startM, startY, firstDate, secondDate, listDate, totalsSeqNb)
    } else {
        findNextDate(startD, startM, startY, listDate, totalsSeqNb, freq)
    }
    let validListDate = []
    listDate.forEach((e) => {
        validListDate.push(findValidDate({ d: e.d, m: e.m, y: e.y }, province))
    })
    validListDate = validListDate.map((date) => {
        return new Date(date.y, date.m - 1, date.d, 12).getTime()
    })
    return validListDate
}
// update date list to data list when generate data list for first time (create contract)
export const updateDateToTrans = (paymentArr, dateArr) => {
    paymentArr.forEach((e, i) => {e.date = dateArr[i]})
    return paymentArr
}

// find position to insert rebate data
export const findInsertPosition = (transArr, rebateUnixTime) => {
    return transArr.findIndex((e, i) => e.date >= rebateUnixTime)
}

export const findlastValidBalance = (transArr, idx) => {
    if (idx < 0) return
    let lastIdx = transArr.findIndex((e, i) => toFixed2(e.balance) > 0 && i >= idx)
    if (lastIdx > -1) {
        const {_id, ...lastRecord} =  transArr[lastIdx]
        return {
            freq: lastRecord.freq,
            currInterest: lastRecord.interest, 
            lastBalance: toFixed2( Number(lastRecord.balance) + Number(lastRecord.capital))
        }
    } else {
        lastIdx = transArr.findLastIndex((e, i) => toFixed2(e.balance) > 0 && i < idx)
        const {_id, ...lastRecord} =  transArr[lastIdx]
        return {
            freq: lastRecord.freq,
            currInterest: Number(lastRecord.balance) * 0.29/frequencyObj[lastRecord.freq], 
            lastBalance: Number(lastRecord.balance)
        }
    }
}

export const createInsertData = (orderNb, lastRecord, amount, date, status = '') => {
    let interest = Number(lastRecord.currInterest)
    let capital = Number(amount) - interest;
    if (capital > Number(lastRecord.lastBalance)) {
        throw 'Error ....'
    }
    return Object.assign({}, lastRecord, {
        status,
        orderNb,
        freq: lastRecord.freq,
        interest: toFixed2(interest),
        capital: toFixed2(capital),
        balance: toFixed2(Number(lastRecord.lastBalance) - capital),
        fees: 0,
        setupAmount: amount,
        installAmount: amount,
        date
    })
}



export const initData = (freq, nb, amt, fees, firstDate, secondDate, startPayDate, province="Quebec") => {
    let transArr = genTrans({
        freq,
        totalsSeqNb: nb,
        amt,
        fees
    })
    let dateArr = genDate({
        freq,
        firstDate,
        secondDate,
        startPayDate,
        totalsSeqNb: nb + 1,
        province,
    })
    return updateDateToTrans(transArr, dateArr)
}



export const updateExistData = (transArr, fromIdx, lastBalance) => {
    let balance = Number(lastBalance)
    let idx = fromIdx;
    let tempRecord = {} // user for the case of new record, just get info from last valid record 
    while (toFixed2(balance) > 0) {
        let trans = transArr[idx];
        if (!trans) {
            trans = tempRecord
        }
        if(!(!toFixed2(trans.interest) && !toFixed2(trans.capital) && !toFixed2(trans.balance))) {
            let singleInt = 0.29/frequencyObj[trans.freq];
            let interest = Number(balance) * singleInt;
            let setupAmount = Number(trans.installAmount) // install amount used for calculation.
            if (setupAmount - (interest + trans.fees) > balance) {
                setupAmount = interest + trans.fees + balance
            }
            let capital = Number(setupAmount) - Number(interest) - Number(trans.fees)
            balance -= capital
            balance = balance < 0? 0: balance
            Object.assign( trans, {
                setupAmount: toFixed2(setupAmount),
                interest,
                capital,
                balance: toFixed2(balance),
                orderNb: idx +1,
                date: trans.date
            })
            Object.assign(tempRecord, trans)
        }
        idx++
    }
    return transArr.slice(0, idx)
}

const insertRecord = (transArr, idx, newRecord) => {
    transArr.splice(idx , 0, newRecord)
}
const removeRecord = (transArr, idx) => {
    transArr.splice(idx , 1)
}

export const addNewRebate = async (transArr, rebateDate, rebateAmount, contractId = '') => {
    let rebateUnixTime = getUnixTime(rebateDate)
    const idx = findInsertPosition(transArr, rebateUnixTime)
    if (idx < 0) throw 'Error ...'
    const lastRecord = findlastValidBalance(transArr, idx)
    let createTrans = createInsertData(idx + 1, lastRecord, rebateAmount, rebateUnixTime, 'rebate')
    insertRecord(transArr, idx,createTrans)
    return updateExistData([...transArr], idx + 1, createTrans.balance)
}

export const revertRebate = async (transArr, idx) => {
    let rebateBalance = Number(transArr[idx].balance) + Number(transArr[idx].capital)
    removeRecord(transArr, idx)
    return updateExistData([...transArr], idx, rebateBalance)
}
