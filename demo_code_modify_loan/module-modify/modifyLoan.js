import trans from "../transactions.json" assert {type: "json"}

const getDateObj = (dateStr, time = "start") => {
    let arr = dateStr.split("/")
    let timeDetail = time == "start" ? "00:00:00" : time == "middle" ? "12:00:00" : "23:59:00"
    let dateObj = new Date(`${arr[1]}/${arr[0]}/${arr[2]} ${timeDetail}`)
    if (arr && arr.length == 3 && arr[0].length == 2 && arr[1].length == 2 && arr[2].length == 4 && dateObj.getTime()) {
        return dateObj.getTime()
    }
    return ""
}
let frequency = {
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
let installAmount = 30
const changeFrequency = () => { 
    let changeFrequencyBtn = document.getElementById("changeFrequencyBtn")
    let removeListTransactionNewBtn = document.getElementById("removeListTransactionNew")
    
    changeFrequencyBtn.addEventListener("click", function() {
        let selectPayment = Number(document.getElementById("selectPayment").value)
        let selectFrequency = document.getElementById("selectFrequency").value
        let startDate1 = getDateObj(document.getElementById("startDate1").value)
        
        modifyLoan(selectPayment, selectFrequency, 30, startDate1)
    })
    removeListTransactionNewBtn.addEventListener("click", function() {
        let listTransactionNewElement = document.getElementById("listTrans")
        listTransaction = listTransaction.filter(e => e.status != "Manual payment")
        listTransactionNewElement.innerHTML = ""
    })
}

const changePayment = () => { 
    let changeFrequencyBtn = document.getElementById("changePaymentBtn")
    
    changeFrequencyBtn.addEventListener("click", function() {
        let paymentAmount = Number(document.getElementById("paymentAmount").value)
        let startDate2 = getDateObj(document.getElementById("startDate2").value)
        let nexTransaction = trans.find(element => element.date >= startDate2);
        
        modifyLoan(nexTransaction.orderNb, '', paymentAmount, '')
    })
}


const modifyLoan = (num = 0, reimFreq = "", initInsAmt = 0, startDate=0) => {
    installAmount = initInsAmt ? initInsAmt : installAmount
    let transactionNum = trans
        .map((el) => {
            return el.orderNb
        })
        .findIndex((el) => el == num)
    let countNum = num
    console.log(num)
    let balance = trans[transactionNum - 1].balance
    let newTrans = trans.filter((el) => el.orderNb < num)
    let nextCapital = 0
    let nextTransaction = {}
    let currDate = startDate ||  trans[transactionNum - 1].date + 86400 * timeReference[reimFreq || trans[transactionNum - 1].nameFreq] * 1000
    do {
        nextTransaction = trans.find(el => el.orderNb == countNum) || nextTransaction
        console.log(nextTransaction)
        let nextInstallAmount = initInsAmt || nextTransaction.installAmount
        let nextFreq = reimFreq || nextTransaction.nameFreq
        nextCapital = nextInstallAmount - (balance * 0.29) / frequency[nextFreq]
        let currInt = (balance * 0.29) / frequency[nextFreq]
        balance -= nextCapital
        newTrans.push({
            orderNb: countNum,
            installAmount: nextInstallAmount,
            interest: currInt,
            description: "",
            balance: balance,
            status: nextTransaction.status,
            deleted: true,
            date: currDate,
        }) 
        countNum++
        nextTransaction = trans.find(el => el.orderNb == countNum) || nextTransaction
        nextInstallAmount = initInsAmt || nextTransaction?.installAmount
        currDate = currDate + 86400 * timeReference[reimFreq|| nextTransaction.nameFreq] * 1000
        nextCapital = nextInstallAmount - (balance * 0.29) / frequency[nextFreq]
    }
    while (balance >= nextCapital);
    if (parseFloat(balance).toFixed(2) > 0.1) {
        let data = nextTransaction || trans[trans.length - 1]
        let currInt = (balance * 0.29) / frequency[data.nameFreq]
        console.log(nextCapital)
        newTrans.push({
            orderNb: countNum,
            installAmount: parseFloat(currInt + balance).toFixed(2),
            interest: currInt,
            description: "",
            balance: 0,
            status: data.status,
            deleted: true,
            date:currDate
        })
    }
    showListTrans(newTrans)
    // console.log(newTrans)
    return newTrans
}

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

const changeData = (num = 0,  initInsAmt = 0) => {
    installAmount = initInsAmt ? initInsAmt : installAmount
    let transactionNum = trans
        .map((el) => {
            return el.orderNb
        })
        .findIndex((el) => el == num)
    let countNum = num
    console.log(transactionNum)
    let balance = trans[transactionNum - 1].balance
    let newTrans = trans.filter((el) => el.orderNb < num)
    let nextCapital = 0
    let nextTransaction = {}
    nextTransaction = trans.find(el => el.orderNb == countNum)
    let nextInstallAmount = initInsAmt || nextTransaction.installAmount
    do {
        nextTransaction = trans.find(el => el.orderNb == countNum)
        // let nextInstallAmount = initInsAmt || nextTransaction.installAmount
        let nextFreq = nextTransaction.nameFreq
        nextCapital = nextInstallAmount - parseFloat((balance * 0.29) / frequency[nextFreq]).toFixed(2)
        let currInt = (balance * 0.29) / frequency[nextFreq]
        balance -= nextCapital
        newTrans.push({
            orderNb: countNum,
            installAmount: nextInstallAmount,
            interest: currInt,
            description: "",
            balance: balance,
            status: nextTransaction.status,
            deleted: true,
        }) 
        countNum++
        nextTransaction = trans.find(el => el.orderNb == countNum)
        nextInstallAmount = nextTransaction? nextTransaction.installAmount : nextInstallAmount
        nextFreq = nextTransaction ? nextTransaction.nameFreq : nextFreq
        nextCapital = nextInstallAmount - parseFloat((balance * 0.29) / frequency[nextFreq]).toFixed(2)
    }
    while (balance >= nextCapital);
    if (parseFloat(balance).toFixed(2) > 0) {
        let data = nextTransaction || trans[trans.length - 1]
        let currInt = (balance * 0.29) / frequency[data.nameFreq]
        console.log(nextCapital)
        newTrans.push({
            orderNb: countNum,
            installAmount: parseFloat(currInt + balance).toFixed(2),
            interest: currInt,
            description: "",
            balance: 0,
            status: data.status,
            deleted: true,
        })
    }
    showListTrans(newTrans)
    console.log(newTrans)
    return {}
}



const showListTrans = (trans) => {
    let listTransactionElement = document.getElementById("listTrans")
    let html = `
    <tr>
        <th>ORDER NUMBER</th>
        <th>DATE</th>
        <th>AMOUNT</th>
        <th>INTEREST</th>
        <th>BALANCE</th>
    </tr>
    `   
    trans.forEach((e) => {
        const transactionElement = `
        <tr>
            <td>#00000${e.orderNb}</td>
            <td>${showUnixToDate(e.date)}</td>
            <td>${e.installAmount}</td>
            <td>${e.interest.toFixed(2)}</td>
            <td>${e.balance.toFixed(2)}</td>
        </tr>`
        html += transactionElement
    })
    listTransactionElement.innerHTML = html
}

export {
    modifyLoan, changeData, changeFrequency, changePayment

}