
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