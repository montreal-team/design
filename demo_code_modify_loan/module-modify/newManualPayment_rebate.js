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

const showListTransaction = () => {
    let listTransactionElement = document.getElementById("listTransaction")
    let html = `
    <tr>
        <th>ORDER NUMBER</th>
        <th>DATE</th>
        <th>AMOUNT</th>
        <th>INTEREST</th>
        <th>BALANCE</th>
    </tr>
    `   
    listTransactionOrigin.forEach((e) => {
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
    showListTransaction,
}