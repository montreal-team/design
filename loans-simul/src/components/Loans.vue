
<template>
    <h2 class="w-full text-center mt-5">Generate loans</h2>
    <div class="p-3 flex space-x-5 w-full justify-center items-center">
        <label for="province">province</label>
        <input type="text" ref="province" class="border w-32" v-model="genParm.province" />
        <label for="freq">frequency:</label>
        <select class="border w-32" ref="feq" v-model="genParm.freq">
            <option v-for="option in freqOptions" :value="option.val">
                {{ option.text }}
            </option>
        </select>
        <div v-if="genParm.freq == '2byM'">
            <label for="firstDate">firstDate</label>
            <input type="number" ref="firstDate" class="border w-12" v-model="genParm.firstDate" />
            <label for="secondDate">secondDate</label>
            <input type="number" ref="secondDate" class="border w-12" v-model="genParm.secondDate" />
        </div>
        <label for="startPayDate">startPayDate</label>
        <input type="text" ref="startPayDate" class="border w-24" v-model="genParm.startPayDate" />
    </div>

    <div class="p-3 flex space-x-2 w-full justify-center items-center">
        <label for="amt">amount</label>
        <input type="number" ref="amt" class="border w-16" v-model="genParm.amt" />
        <label for="nb">nb:</label>
        <input type="number" ref="nb" class="border w-16" v-model="genParm.nb" />
        <label for="fees">fees:</label>
        <input type="number" ref="fees" class="border w-16" v-model="genParm.fees" />
        <button class="px-2 py-1 border bg-red-200" @click="onInit()">init trans data:</button>
    </div>


    <div v-if="transArrCurr && transArrCurr.length" class="p-3 flex flex-col w-full items-center">
        <div class="flex space-x-2">
            <div v-for="h in textheaders" class="min-w-tab content-start">{{ h }}</div>
        </div>
        <div>
            <div v-for="row in transArrCurr" class="flex space-x-2">
                <div v-for="h in headers" class="min-w-tab content-start">
                    {{ h == "date" ? getDDMMYYYYStr(row[h]) : ['installAmount', 'interest', 'capital', 'balance'].includes(h) ? parseFloat(row[h]).toFixed(2) : row[h] }}
                </div>
            </div>
        </div>
    </div>

    <hr class="mt-10">
    <p v-if="error" class="text-red-500 w-full text-center">{{ error }}</p>

    <div class="p-3 flex space-x-2 w-full justify-center items-center">
        <label for="province">New rebate amount</label>
        <input type="mumber" ref="rebateAmount" class="border w-12" v-model="rebate.amount" />
        <label for="firstDate">rebate date</label>
        <input type="text" ref="rebateDate" class="border w-32" v-model="rebate.date" />
        <button class="px-2 py-1 border bg-red-200" @click="onAddRebate(rebate.date, rebate.amount)">new rebate</button>
        <p v-if="validateRebate" style="color: red">error validate</p>
    </div>
    <div class="p-3 flex space-x-2 w-full justify-center items-center">
        <label for="province">revert  number</label>
        <input type="mumber" ref="rebateAmount" class="border w-12" v-model="revertNumber" />
        <button class="px-2 py-1 border bg-red-200" @click="revertRebate(revertNumber)">revert rebate</button>
    </div>

    <hr>
    <div class="p-3 flex space-x-2 w-full justify-center items-center">
        <label for="province">NSF number</label>
        <input type="mumber" ref="rebateAmount" class="border w-12" v-model="nfsNumber" />
        <button class="px-2 py-1 border bg-red-200" @click="nsfByNumber(nfsNumber)">nsf</button>
    </div>
</template>



<script setup>
import { initData, addNewRebate, getDDMMYYYYStr, freqOptions } from '../libs/helper'
import { ref, reactive } from "vue";

let error = ref('')
const count = ref(0)
const headers = ["orderNb", "date", "setupAmount", "interest", "capital", "fees", "balance", "status"]
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
    freq: '1w',
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

let transArrOrg = ref([])
let transArrCurr = ref([...transArrOrg.value])
const onInit = () => {
    transArrOrg.value = initData(genParm.freq, genParm.nb, genParm.amt, genParm.fees, genParm.firstDate, genParm.secondDate, genParm.startPayDate, genParm.province)
    transArrCurr.value = [...transArrOrg.value]
}
onInit()

async function onAddRebate(rebateDate, rebateAmount, contractId = '')  {
    error.value = ''
    let result = await addNewRebate([...transArrCurr.value], rebateDate, rebateAmount, contractId = '');
    if (result && result.error) {
        error.value = result.error
    }else {
        transArrCurr.value = result
    }
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
