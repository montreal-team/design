import { showListTransaction, addNewManualPayment } from "./module-modify/newManualPayment_rebate.js"
import transactions from "./transactions.json" assert {type: "json"}
showListTransaction(transactions, "listTransaction")
addNewManualPayment()
