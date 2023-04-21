<script setup>
import { frequencyObj, timeReferenceObj, genTrans, getDateString, genDate, updateDateToTrans, findProcessionData,  findlastValidBalance, createInsertData, updateExistData } from "../libs/helper"
import { ref, reactive } from "vue"
const count = ref(0)
const headers = ["orderNb", "date", "installAmount", "interest", "capital", "fees", "balance", "status"]
const textheaders = ["nb", "date", "amount", "interest", "capital", "fees", "balance", "status"]
const genParm = reactive({
    province: "Quebec",
    firstDate: 5,
    secondDate: 15,
    startPayDate: "01/01/2023",
    amt: 80,
    nb: 6,
    fees: 0,
    freq: 26,
})
let rebate = {}

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
data.value = updateDateToTrans(data.value, genDateArr.value)
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
    data.value = updateDateToTrans(trans, genDateArr.value)
}

const addRebate = (rebateData) => {
    //front end
    const date = rebateData.date
    date.split("/")
    let startD = parseInt(date.split("/")[0])
    let startM = parseInt(date.split("/")[1])
    let startY = parseInt(date.split("/")[2])
    const rebateDate = new Date(startY, startM - 1, startD, 12, 0, 0).getTime()

    //BE
    let newData = []
    const dataTrans = [...data.value]
    const rebateLocation = findProcessionData(dataTrans, rebateDate)
    if (rebateLocation < dataTrans.length) {
        // newData = newData.concat(beforeTrans)
        const validBalance = findlastValidBalance(dataTrans, rebateLocation)
        // const createTrans = createInsertData(`rebate`, validBalance, rebateNum, rebateData.amount, rebateDate, dataTrans[rebateNum])
        console.log(rebateLocation, validBalance)
        // newData.splice(newData.length , 0, createTrans)
        // const updateTrans = updateExistData(afterTrans, createTrans.balance, newData.length + 1)
        // newData = newData.concat(updateTrans)
        // data.value = newData
    }
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
                    {{ h == "date" ? getDateString(row[h]) : row[h] }}
                </div>
            </div>
        </div>
    </div>
    <div class="p-3 flex space-x-2 w-full justify-center items-center">
        <label for="province">New rebate amount</label>
        <input type="mumber" ref="rebateAmount" class="border w-12" v-model="rebate.amount" />
        <label for="firstDate">rebate date</label>
        <input type="text" ref="rebateDate" class="border w-32" v-model="rebate.date" />
        <button class="px-2 py-1 border bg-red-200" @click="addRebate(rebate)">rebate</button>
    </div>
</template>
