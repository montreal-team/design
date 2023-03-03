import listTransactionOrigin from "../transactions.json" assert {type: "json"}
const showUnixToDate = (dateUnix /*1660701684622"*/, getTime = false) => {
    if (dateUnix) {
        let date = new Date(dateUnix)
        let yyyy = date.getFullYear()
        let mm = (date.getMonth() + 1).toString().padStart(2, "0")
        let dd = date.getDate().toString().padStart(2, "0")
        if (getTime) {
            let hh = date.getHours().toString().padStart(2, "0")
            let min = date.getMinutes().toString().padStart(2, "0")
            let sec = date.getSeconds().toString().padStart(2, "0")
            return `${dd}/${mm}/${yyyy} ${hh}:${min}:${sec}`
        }
        return `${dd}/${mm}/${yyyy}`
    }
    return ""
}

const getDateObj = (dateStr, time = "start") => {
    let arr = dateStr.split("/")
    let timeDetail = time == "start" ? "00:00:00" : time == "middle" ? "12:00:00" : "23:59:00"
    let dateObj = new Date(`${arr[1]}/${arr[0]}/${arr[2]} ${timeDetail}`)
    if (arr && arr.length == 3 && arr[0].length == 2 && arr[1].length == 2 && arr[2].length == 4 && dateObj.getTime()) {
        return dateObj.getTime()
    }
    return ""
}

const showListTransaction = (array, element) => {
    let listTransactionElement = document.getElementById(element)
    let html =
    `
        <tr>
            <th>ORDER NUMBER</th>
            <th>DATE</th>
            <th>AMOUNT</th>
            <th>INTEREST</th>
            <th>BALANCE</th>
            <th>STATUS</th>
        </tr>
    `
    array.forEach((e) => {
        const transactionElement = `
        <tr>
            <td>#00000${e.orderNb}</td>
            <td>${showUnixToDate(e.date)}</td>
            <td>${e.installAmount.toFixed(2)}</td>
            <td>${e.interest.toFixed(2)}</td>
            <td>${e.balance.toFixed(2)}</td>
            <td>${e.status}</td>
        </tr>`
        html += transactionElement
    })
    listTransactionElement.innerHTML = html
}

const frequency = {
    "1w": 52,
    "2w": 26,
    "1M": 12,
    "2byM": 26,
}
const timeReference = {
    "1w": 7,
    "2w": 14,
    "1M": 91 / 3,
    "2byM": 14,
}

const getInsertedPaymentData = (arrOfTransaction, newPaymentAmt, newPaymentDate, statusOfPayment, contractFrequency) => {
    let listTransaction = arrOfTransaction
    let singleInterest = 0.29/frequency[contractFrequency]
    
    let orderNb
    let newPaymentInterest
    let currCapital
    let newPaymentBalance
    let currBalance

    let newPaymentDateObj = newPaymentDate
    let listTransactionDate = [newPaymentDateObj]
    listTransaction.forEach((e) => {
        listTransactionDate.push(e.date)
    })
    listTransactionDate.sort((a, b) => {
        if (a > b) {
            return 1
        } else {
            return -1
        }
    })

    orderNb = listTransactionDate.indexOf(newPaymentDateObj) + 1
    currBalance = listTransaction[orderNb - 2].balance
    newPaymentInterest = currBalance * singleInterest
    currCapital = newPaymentAmt - newPaymentInterest
    newPaymentBalance = currBalance - currCapital

    return {
        date: newPaymentDate,
        orderNb: orderNb,
        installAmount: newPaymentAmt,
        interest: newPaymentInterest,
        balance: newPaymentBalance,
        status: statusOfPayment,
    }
}

const splitArray = (array, condtFunc) => {
    let [pass, fail] = array.reduce(([pass, fail], e) => {
        return condtFunc(e) ? [[...pass, e], fail] : [pass, [...fail, e]]
    }, [[], []])
    return {
        pass: pass,
        fail: fail
    }
}

const recalculateTransactions = (arrOfTransaction, insertedPayment, contractFrequency) => {
    let listTransaction = arrOfTransaction
    let singleInterest = 0.29/frequency[contractFrequency]

    let currDate = insertedPayment.date
    let currOrderNb = insertedPayment.orderNb + 1
    let currInterest = insertedPayment.balance * singleInterest
    let currCapital
    let currBalance = insertedPayment.balance

    let newTransactionDataArr = []
    let arraySplitted = splitArray(listTransaction, (e) => e.orderNb >= currOrderNb - 1)
    let updateTransactionDataArr = arraySplitted.pass
    let transactionUnchangedArr = arraySplitted.fail.concat(insertedPayment)

    updateTransactionDataArr.forEach((e) => {
        currCapital = e.installAmount - currInterest
        if (currBalance > currCapital) {
            newTransactionDataArr.push({
                date: e.date,
                orderNb: currOrderNb,
                installAmount: e.installAmount,
                interest: currInterest,
                balance: currBalance - currCapital,
                status: e.status,
            })
            currDate = e.date + 86400 * timeReference[contractFrequency] * 1000
            currBalance -= currCapital
            currOrderNb += 1
            currInterest = currBalance * singleInterest
        }
    })
    if ((currBalance - currCapital).toFixed(2) > 0.00) {
        newTransactionDataArr.push({
            date: currDate,
            orderNb: currOrderNb,
            installAmount: currBalance + currInterest,
            interest: currInterest,
            balance: 0,
            status: "pending"
        })
    }
    return {
        newTransactionDataArr: newTransactionDataArr,
        transactionUnchangedArr: transactionUnchangedArr,
    }
}

const addNewManualPayment = () => {
    let listTransaction = listTransactionOrigin
    let addNewManualPaymentBtn = document.getElementById("newManualPaymentBtn")
    let removeListTransactionNewBtn = document.getElementById("removeListTransactionNew")
    
    addNewManualPaymentBtn.addEventListener("click", function() {
        let newManualPaymentAmt = Number(document.getElementById("manualPaymentAmount").value)
        let newManualPaymentDate = getDateObj(document.getElementById("manualPaymentDate").value)

        const newPayment = getInsertedPaymentData(listTransaction, newManualPaymentAmt, newManualPaymentDate, "Manual payment", "1w")
        const arraySplitted = recalculateTransactions(listTransaction, newPayment, "1w")
        listTransaction = arraySplitted.transactionUnchangedArr.concat(arraySplitted.newTransactionDataArr)
        
        showListTransaction(listTransaction, "listTransactionNew")
    })
    removeListTransactionNewBtn.addEventListener("click", function() {
        let listTransactionNewElement = document.getElementById("listTransactionNew")
        listTransaction = listTransactionOrigin
        listTransactionNewElement.innerHTML = ""
    })
}

const addNewRebate = () => {
    let listTransaction = listTransactionOrigin
    let addNewRebateBtn = document.getElementById("newRebateBtn")
    let removeListTransactionNewBtn = document.getElementById("removeListTransactionNew")
    
    addNewRebateBtn.addEventListener("click", function() {
        let newRebateAmt = Number(document.getElementById("rebateAmount").value)
        let newRebateDate = getDateObj(document.getElementById("rebateDate").value)

        const newPayment = getInsertedPaymentData(listTransaction, newRebateAmt, newRebateDate, "Rebate", "1w")
        const arraySplitted = recalculateTransactions(listTransaction, newPayment, "1w")
        listTransaction = arraySplitted.transactionUnchangedArr.concat(arraySplitted.newTransactionDataArr)
        
        showListTransaction(listTransaction, "listTransactionNew")
    })
    removeListTransactionNewBtn.addEventListener("click", function() {
        let listTransactionNewElement = document.getElementById("listTransactionNew")
        listTransaction = listTransactionOrigin
        listTransactionNewElement.innerHTML = ""
    })
}

const deferPayment = () => {
    let listTransaction = listTransactionOrigin
    let paymentOptionsElement = document.getElementById("selectDeferPayment")
    let deferPaymentBtn = document.getElementById("deferPaymentBtn")
    let removeListTransactionNewBtn = document.getElementById("removeListTransactionNew")
    let paymentOptions = ''
    listTransaction.forEach((e) => {
        const html = `<option value="${e.orderNb}">Transaction ${e.orderNb}</option>`
        paymentOptions += html
    })
    paymentOptionsElement.innerHTML = paymentOptions

    deferPaymentBtn.addEventListener("click", function() {
        let paymentOrderNb = Number(paymentOptionsElement.value)
        let deferType = document.getElementById("selectDeferType").value
        
        if (deferType == "chargeImmediately") {
            
        } else {

        }
        const newPayment = getInsertedPaymentData(listTransaction, newRebateAmt, newRebateDate, "Rebate", "1w")
        const arraySplitted = recalculateTransactions(listTransaction, newPayment, "1w")
        listTransaction = arraySplitted.transactionUnchangedArr.concat(arraySplitted.newTransactionDataArr)
        
        showListTransaction(listTransaction, "listTransactionNew")
    })
    removeListTransactionNewBtn.addEventListener("click", function() {
        let listTransactionNewElement = document.getElementById("listTransactionNew")
        listTransaction = listTransactionOrigin
        listTransactionNewElement.innerHTML = ""
    })

}

export {
    showListTransaction,
    addNewManualPayment,
    addNewRebate,
    deferPayment
}