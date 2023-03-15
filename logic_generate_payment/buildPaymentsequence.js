let frequency = {
    every_week: 52,
    every_two_weeks: 26,
    every_month: 12,
    twice_a_month: 26,
};

const buildTransactions = (
    initInsAmt = 0,
    initInsNb = 1,
    rate = 1,
    reimFreq = "every_two_weeks"
) => {

    let fees = 0
    console.log(`sequence || currBalance || amount  || interest  || capital     || fees     || balance ||`)
    console.log('----------------------------------------------------------------------------------------')
    let singleRate = rate / frequency[reimFreq];
    console.log(singleRate, initInsNb, initInsAmt);
    let vf =
        (initInsAmt * (1 - 1 / Math.pow(1 + singleRate, initInsNb))) /
        singleRate;
    let balance = vf;
    for (let i = 1; i <= initInsNb; i++) {
        let currBalance = balance
        let currInt = balance * singleRate;
        let capital = initInsAmt - currInt;
        balance -= capital;
        console.log(`${i < 10? "0" : ''}${i}        || ${parseFloat(currBalance).toFixed(2)}      || ${parseFloat(initInsAmt).toFixed(2)}   ||${parseFloat(currInt).toFixed(2)}       || ${parseFloat(capital).toFixed(2)}       || ${fees}    || ${parseFloat(balance).toFixed(2)} || ${"pending"}`);
    }
        // arr.push(
        //     JSON.stringify({
        //         sequence: i,
        //         installDate: new Date(),
        //         amount: parseFloat(initInsAmt).toFixed(2),
        //         interest: parseFloat(currInt).toFixed(2),
        //         capital: parseFloat(capital).toFixed(2),
        //         balance: parseFloat(balance).toFixed(2),
        //         status: "pending",
        //     })
        // );
    // }
    // return arr;
};

const updateTransaction = (sequences = [], arr = []) => {
    if (sequences && sequences.length && arr && arr.length) {
        // for (let itr = 0; itr < arr.length; itr++) {
        for (let ise = 0; ise < sequence.length; ise++) {
            // if (sequences[ise] == arr[itr].sequence) {
            // }
        }
        // }
    }
};

let amt = 36.57;
let totalOwing = 438.8; // = parseFloat(initInsAmt * initInsNb).toFixed(2);
let initInsNb = 12;
let initInsAmt = parseFloat(totalOwing / initInsNb).toFixed(2);
let rate = 0.29;
let reimFreq = "every_week";

const trans = buildTransactions(initInsAmt, initInsNb, rate, reimFreq);
console.log(trans);
