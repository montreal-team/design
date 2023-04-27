<script setup>
import { frequencyObj, timeReferenceObj, genTrans, getDateString, genDate, updateDateToTrans, findProcessionData,  findlastValidBalance, createInsertData, updateExistData, createNewData } from "../libs/helper"
import { ref, reactive } from "vue"
const count = ref(0)
const headers = ["orderNb", "date", "installAmount", "interest", "capital", "fees", "balance", "status"]
const textheaders = ["nb", "date", "amount", "interest", "capital", "fees", "balance", "status"]
let validateRebate = ref(false)
const genParm = reactive({
    province: "Quebec",
    firstDate: 5,
    secondDate: 15,
    startPayDate: "01/01/2023",
    amt: 80,
    nb: 6,
    fees: 20,
    freq: 26,
})
const contract = {
    isCreditVariable: true,
    paymentFees: {
        everyWeek: 10,
        everyTwoWeeks: 20,
        twiceAMonth: 20,
        everyMonth: 40,
    }
}
let rebate = {}
let nfsNumber = 0
let revertNumber = 0

let genDateArr = ref(
    genDate({
        firstDate: genParm.firstDate,
        secondDate: genParm.secondDate,
        startPayDate: genParm.startPayDate,
        totalsSeqNb: genParm.nb,
        province: "Quebec",
    })
)

let data = ref(genTrans({ totalsSeqNb: genParm.nb, amt: genParm.amt, fees: genParm.fees, freq: genParm.freq }))
data.value = updateDateToTrans(data.value, genDateArr.value, genParm.firstDate, genParm.secondDate)
const onInit = () => {
    let trans = genTrans({
        firstDate: genParm.firstDate,
        secondDate: genParm.secondDate,
        startPayDate: genParm.startPayDate,
        totalsSeqNb: genParm.nb,
        amt: genParm.amt,
        fees: genParm.fees,
        freq: genParm.freq,
    })
    genDateArr.value = genDate({
        firstDate: genParm.firstDate,
        secondDate: genParm.secondDate,
        startPayDate: genParm.startPayDate,
        totalsSeqNb: genParm.nb,
        province: "Quebec",
    })
    data.value = updateDateToTrans(trans, genDateArr.value, genParm.firstDate, genParm.secondDate)
}
console.log(data.value)

const addRebate = (rebateDate, rebateAmount, contractId = '') => {
    //front end
    const date = rebateDate
    date.split("/")
    let startD = parseInt(date.split("/")[0])
    let startM = parseInt(date.split("/")[1])
    let startY = parseInt(date.split("/")[2])
    rebateDate = new Date(startY, startM - 1, startD, 12, 0, 0).getTime()

    // //BE
    const [...transArr] = data.value
    const rebateLocation = findProcessionData(transArr, rebateDate)
    const validBalance = findlastValidBalance(transArr, rebateLocation)
    let createTrans = createInsertData(`rebate`, validBalance, rebateLocation + 1, rebateAmount, rebateDate, transArr[rebateLocation])
    if (createTrans) {
        // createTrans = await transactionServices.create(createTrans)
        transArr.splice(rebateLocation , 0, createTrans)
        let currBalance = findlastValidBalance(transArr , rebateLocation + 1)
        let newTransArr = updateExistData(transArr, rebateLocation + 1, currBalance)
        let deleteData = data.value.filter(el => !(newTransArr.find(tr => el._id == tr._id) || {})._id) || []
        deleteData.forEach(el => { Object.assign(el, {deleted: true})})
        data.value = newTransArr
        // await transactionServices.updateMultiplesTransaction(newTransArr, {})
        // await transactionServices.updateMultiplesTransaction(deleteData, {})
        let totalOwing = 0
        let currentBalance = 0
        let rebate = 0
        newTransArr.map((el) => {
            if (el.status == 'rebate') {
                rebate += Number(parseFloat(el.installAmount).toFixed(2))
            }   
            if (["pending", "inProgress"].includes(el.status)) {
                    totalOwing += Number(parseFloat(el.installAmount).toFixed(2))
                    currentBalance += Number(parseFloat(el.capital).toFixed(2))
            } 
        })
        // await contractServices.updateById(contractId, { totalOwing: totalOwing, currentBalance: currentBalance, rebate: rebate })
    } else { validateRebate.value = true }
}

const revertRebate = (revertNumber, revertId) => {
    let [...transArr] = data.value
    let newTransArr = []
    const rebateIndex = transArr.findIndex(el => el.orderNb == revertNumber)
    const validBalance = findlastValidBalance(transArr, rebateIndex)
    transArr.splice(rebateIndex, 1)
    newTransArr = updateExistData(transArr, rebateIndex, validBalance)
    const lastPayment = newTransArr.findLast((element) => element.description != 'deferredPayment');
    if (parseFloat(lastPayment.installAmount).toFixed(2) > 0) {
        const newPayment = createNewData(lastPayment)
        console.log(newTransArr)
        newTransArr = newTransArr.concat(newPayment)
    }
    data.value = newTransArr
}

const nsfByNumber = (number) => {
    let [...transArr] = data.value
    const fine = 40
    let objIndex = transArr.findIndex((obj => obj.orderNb == number));
    const obj = transArr[objIndex]
    Object.assign(transArr[objIndex], {installAmount: '0', interest: '0', capital: `-${fine + Number(obj.interest)}`, balance: `${Number(obj.balance) + fine + Number(obj.interest)}`})
    console.log(objIndex)
    let newTransArr = updateExistData(transArr, objIndex + 1, Number(obj.balance) + fine + Number(obj.interest))
    data.value = newTransArr
}
</script>

<template>
    <h2 class="w-full text-center mt-5">Generate loans</h2>
    <div class="p-3 flex space-x-2 w-full justify-center items-center">
        <label for="province">province</label>
        <input type="text" ref="province" class="border w-32" v-model="genParm.province" />
        <label for="firstDate">firstDate</label>
        <input type="number" ref="firstDate" class="border w-12" v-model="genParm.firstDate" />
        <label for="secondDate">secondDate</label>
        <input type="number" ref="secondDate" class="border w-12" v-model="genParm.secondDate" />
        <label for="startPayDate">startPayDate</label>
        <input type="text" ref="startPayDate" class="border w-24" v-model="genParm.startPayDate" />
        <label for="amt">amount</label>
        <input type="number" ref="amt" class="border w-16" v-model="genParm.amt" />
        <label for="nb">nb:</label>
        <input type="number" ref="nb" class="border w-16" v-model="genParm.nb" />
        <label for="fees">fees:</label>
        <input type="number" ref="fees" class="border w-16" v-model="genParm.fees" />
        <label for="freq">frequency:</label>
        <input type="number" ref="feq" class="border w-16" v-model="genParm.freq" />
        <button class="px-2 py-1 border bg-red-200" @click="onInit()">init:</button>
    </div>
    <div class="p-3 flex flex-col w-full items-center">
        <div class="flex space-x-2">
            <div v-for="h in textheaders" class="min-w-tab content-start">{{ h }}</div>
        </div>
        <div>
            <div v-for="row in data" class="flex space-x-2">
                <div v-for="h in headers" class="min-w-tab content-start">
                    {{ h == "date" ? getDateString(row[h]) : ['installAmount', 'interest', 'capital', 'balance'].includes(h) ? parseFloat(row[h]).toFixed(2) : row[h] }}
                </div>
            </div>
        </div>
    </div>
    <div class="p-3 flex space-x-2 w-full justify-center items-center">
        <label for="province">New rebate amount</label>
        <input type="mumber" ref="rebateAmount" class="border w-12" v-model="rebate.amount" />
        <label for="firstDate">rebate date</label>
        <input type="text" ref="rebateDate" class="border w-32" v-model="rebate.date" />
        <button class="px-2 py-1 border bg-red-200" @click="addRebate(rebate.date, rebate.amount)">rebate</button>
        <p v-if="validateRebate" style="color: red">error validate</p>
        <label for="province">revert  number</label>
        <input type="mumber" ref="rebateAmount" class="border w-12" v-model="revertNumber" />
        <button class="px-2 py-1 border bg-red-200" @click="revertRebate(revertNumber)">revert </button>
    </div>
    <div class="p-3 flex space-x-2 w-full justify-center items-center">
        <label for="province">NSF number</label>
        <input type="mumber" ref="rebateAmount" class="border w-12" v-model="nfsNumber" />
        <button class="px-2 py-1 border bg-red-200" @click="nsfByNumber(nfsNumber)">nsf</button>
    </div>
</template>
