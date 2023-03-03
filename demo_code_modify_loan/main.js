import { showListTransaction, addNewManualPayment, addNewRebate, deferPayment } from "./module-modify/newManualPayment_rebate.js"
import transactions from "./transactions.json" assert {type: "json"}
showListTransaction(transactions, "listTransaction")
addNewManualPayment()
addNewRebate()
deferPayment()
import {changeFrequency, changePayment } from "./module-modify/modifyLoan.js"

changeFrequency()
changePayment()
