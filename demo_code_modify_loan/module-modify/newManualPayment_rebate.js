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
    let html = `
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
            <td>${e.installAmount}</td>
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

const addNewManualPayment = () => {
    let listTransaction = listTransactionOrigin
    let numberOfPayment = listTransaction.length
    
    let listTransactionDate = []
    let addNewManualPaymentBtn = document.getElementById("newManualPaymentBtn")
    let removeListTransactionNewBtn = document.getElementById("removeListTransactionNew")
    listTransaction.forEach((e) => {
        listTransactionDate.push(e.date) 
    })
    addNewManualPaymentBtn.addEventListener("click", function() {
        let newManualPaymentAmt = document.getElementById("manualPaymentAmount").value
        let newManualPaymentDate = getDateObj(document.getElementById("manualPaymentDate").value)
        listTransactionDate.push(newManualPaymentDate)
        listTransactionDate.sort(function(a, b) {
            return a - b
        })
        let newManualPaymentDateIndex = listTransactionDate.indexOf(newManualPaymentDate)
        let currBalance = 0
        let singleInterest = 0.29/52
        let interest = 0
        if (newManualPaymentDateIndex == 0) {
            currBalance = 347.2826564653784
        } else if (newManualPaymentDateIndex == numberOfPayment) {
            currBalance = listTransaction[newManualPaymentDateIndex].balance
        } else {
            currBalance = listTransaction[newManualPaymentDateIndex].balance
        }
        interest = currBalance * singleInterest
        listTransaction.push({
            "date": newManualPaymentDate,
            "status": "Manual payment",
            "installAmount": newManualPaymentAmt,
            "balance": currBalance,
            "interest": interest,
            "orderNb": newManualPaymentDateIndex + 1,
            "description": "",
            "deleted": false
        })
        // paymentsDate.forEach((date, idx) => {
        //     let currInterest = balance * singleInterest
        //     let capital = contractCreated.installAmount - currInterest
        //     balance -= capital
        listTransaction.sort((a, b) => {
            if (a.orderNb < b.orderNb) {
                return -1
            } else if (a.orderNb > b.orderNb) {
                return 1
            }
            return -1
        })
        showListTransaction(listTransaction, "listTransactionNew")
    })
    removeListTransactionNewBtn.addEventListener("click", function() {
        let listTransactionNewElement = document.getElementById("listTransactionNew")
        listTransaction = listTransaction.filter(e => e.status != "Manual payment")
        listTransactionNewElement.innerHTML = ""
    })
}

export {
    showListTransaction,
    addNewManualPayment,
}