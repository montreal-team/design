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
            lastBalance: Number(lastRecord.balance) + Number(lastRecord.capital)
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
    let interest = lastRecord.currInterest
    let capital = amount - interest;
    if (capital > lastRecord.lastBalance) {
        return {error: 'Error ....'}
    }
    return Object.assign({}, lastRecord, {
        status,
        orderNb,
        freq: lastRecord.freq,
        interest,
        capital,
        balance: lastRecord.lastBalance - capital,
        fees: 0,
        setupAmount: amount,
        date
    })
}

// export const updateExistData = (transArr, updateLocation, currBalance) => {
//     let [...newTransArr] = transArr
//     newTransArr.forEach((el, idx) => {
//         if (toFixed2(currBalance) > 0 && idx >= updateLocation) {
//             // const freqName = frequencyArr.find((freq) => freq.val == el.freq)
//             let installAmount = el.setupAmount
//             let currInterest = Number(currBalance) * 0.29/frequencyObj[el.freq]
//             let capital = Number(installAmount) - currInterest - el.fees
//             // contract.isCreditVariable ? capital -= el.fees : ''
//             // console.log(toFixed2(currBalance) < toFixed2(capital))
//             if (Number(toFixed2(currBalance)) < Number(toFixed2(capital)) && el.status != 'stopPayment') {
//                 capital = currBalance
//                 currBalance = 0
//                 installAmount = capital + currInterest + Number(el.fees)
//             } else if (el.status != 'stopPayment') {
//                 currBalance -=  capital
//             }
//             Object.assign(el, {
//                 installAmount: toFixed2(installAmount),
//                 interest: el.status != 'stopPayment' ? toFixed2(currInterest) : 0,
//                 capital: el.status != 'stopPayment' ? toFixed2(capital) : 0,
//                 balance: el.status != 'stopPayment' ? toFixed2(currBalance) : 0,
//                 orderNb: idx + 1,
//                 date: transArr[idx].date
//             })
//         } else if (toFixed2(currBalance) <= 0 && idx >= updateLocation && el.status != 'stopPayment') {
//             newTransArr = newTransArr.filter(de => de._id != el._id)
//         }
//     })
//     return newTransArr
// }

// export const createNewData = (lastPayment) => {
//     let currBalance = lastPayment.balance
//     let nextDate = lastPayment.date
//     let newTransArr = []
//     let nextOrderNb = lastPayment.orderNb + 1
//     while(toFixed2(currBalance) > 0) {
//         let installAmount = lastPayment.setupAmount
//         let currInterest = Number(currBalance) * 0.29/frequencyObj[lastPayment.freq]
//         let capital = Number(installAmount) - currInterest - lastPayment.fees
//         if (Number(toFixed2(currBalance)) < Number(toFixed2(capital))) {
//             capital = currBalance
//             installAmount = Number(capital) + Number(currInterest) + Number(lastPayment.fees)
//             currBalance = 0
//         } else {
//             currBalance -=  capital
//         }
//         nextDate = getOneTransDateFunc("2byM", lastPayment, 'qc', nextDate)
//         newTransArr.push(Object.assign({}, lastPayment, {
//             installAmount: toFixed2(installAmount),
//             interest: toFixed2(currInterest),
//             capital: toFixed2(capital),
//             balance: toFixed2(currBalance),
//             orderNb: nextOrderNb,
//             date: nextDate,
//             fees: 0
//         }))
//         nextOrderNb++
//     }
//     return newTransArr
// }

// const getOneTransDateFunc = (
//     paymentFrequency = "",
//     lastTrans = {},
//     province,
//     startDate = 0
// ) => {
//     let date = 0
//     if (paymentFrequency == "2byM") {
//         const firstDate = lastTrans.firstPayDate
//         const secondDate = lastTrans.secondPayDate
//         const openDate = new Date(startDate).getDate()
//         const currDate = new Date(startDate)
//         let newDate = 0
//         let newMonth = currDate
//         const lastDay = new Date(newMonth.getFullYear(), newMonth.getMonth() + 1, 0, 12, 0, 0)
//         if (openDate < firstDate || openDate >= secondDate || openDate == lastDay.getDate()) {
//             newDate = firstDate
//         } else {
//             newDate = secondDate
//         }
//         newDate > lastDay.getDate() ? (newDate = lastDay.getDate()) : ""
//         date = new Date(new Date(newMonth).getFullYear(), new Date(newMonth).getMonth(), newDate, 12, 0, 0).getTime()
//         let validDate = findValidDate(
//             {
//                 d: new Date(date).getDate(),
//                 m: new Date(date).getMonth() + 1,
//                 y: new Date(date).getFullYear(),
//             },
//             province
//         )
//         date = new Date(validDate.y, validDate.m - 1, validDate.d, 12, 0, 0).getTime()
//     } else {
//         const timeRef = timeReferenceObj
//         date = startDate ? startDate : lastTrans.date + 86400 * timeRef[paymentFrequency] * 1000
//         let validDate = findValidDate(
//             {
//                 d: new Date(date).getDate(),
//                 m: new Date(date).getMonth() + 1,
//                 y: new Date(date).getFullYear(),
//             },
//             province
//         )
//         date = new Date(validDate.y, validDate.m - 1, validDate.d, 12, 0, 0).getTime()
//     }
//     return date
// }



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
        totalsSeqNb: nb,
        province,
    })
    return updateDateToTrans(transArr, dateArr)
}


export const updateExistData = (transArr, fromIdx, lastBalance) => {
    let balance = Number(lastBalance)
    let idx = fromIdx;
    while (toFixed2(balance) > 0) {
        let trans = transArr[idx];
        let singleInt = 0.29/frequencyObj[trans.freq];
        let interest = Number(balance) * singleInt;
        let setupAmount = Number(trans.setupAmount)
        if (setupAmount - (interest + trans.fees) > balance) {
            setupAmount = interest + trans.fees + balance
        }
        let capital = Number(setupAmount) - interest - trans.fees
        balance -= capital
        balance = balance < 0? 0: balance
        Object.assign(transArr[idx], {
            interest,
            capital,
            balance: toFixed2(balance),
            orderNb: idx + 1,
            date: transArr[idx].date
        })
        idx++
    }
    return transArr.slice(0, idx)
}


export const addNewRebate = async (transArr, rebateDate, rebateAmount, contractId = '') => {
    let rebateUnixTime = getUnixTime(rebateDate)
    const insertPosIdx = findInsertPosition(transArr, rebateUnixTime)
    if (insertPosIdx < 0) return {error: 'Error ...'}
    const lastRecord = findlastValidBalance(transArr, insertPosIdx)
    let createTrans = createInsertData(insertPosIdx + 1, lastRecord, rebateAmount, rebateUnixTime, 'rebate')
    transArr.splice(insertPosIdx , 0, createTrans)
    if (createTrans) {
        if (createTrans.error) {
            return {error: 'Error ...'}
        }
        // update folow trans
        transArr = updateExistData([...transArr], insertPosIdx + 1, createTrans.balance)
    }
    return transArr


    // if (createTrans) {
    //     // createTrans = await transactionServices.create(createTrans)
    //     transArr.splice(rebateLocation , 0, createTrans)
    //     let currBalance = findlastValidBalance(transArr , rebateLocation + 1)
    //     let newTransArr = updateExistData(transArr, rebateLocation + 1, currBalance)
    //     let deleteData = data.value.filter(el => !(newTransArr.find(tr => el._id == tr._id) || {})._id) || []
    //     deleteData.forEach(el => { Object.assign(el, {deleted: true})})
    //     data.value = newTransArr
    //     // await transactionServices.updateMultiplesTransaction(newTransArr, {})
    //     // await transactionServices.updateMultiplesTransaction(deleteData, {})
    //     let totalOwing = 0
    //     let currentBalance = 0
    //     let rebate = 0
    //     newTransArr.map((el) => {
    //         if (el.status == 'rebate') {
    //             rebate += Number(parseFloat(el.installAmount).toFixed(2))
    //         }   
    //         if (["pending", "inProgress"].includes(el.status)) {
    //                 totalOwing += Number(parseFloat(el.installAmount).toFixed(2))
    //                 currentBalance += Number(parseFloat(el.capital).toFixed(2))
    //         } 
    //     })
    //     // await contractServices.updateById(contractId, { totalOwing: totalOwing, currentBalance: currentBalance, rebate: rebate })
    // } else { validateRebate.value = true }
}
