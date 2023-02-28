import transaction from "./transactions.json" assert {type: 'json'};
import { modifyLoan } from "./module-modify/modifyLoan.js";

let fakeDB = transaction
console.log(fakeDB)
modifyLoan()
