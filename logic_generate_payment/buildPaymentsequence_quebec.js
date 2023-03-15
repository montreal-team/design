// to be mofiy here for quebec
let frequency = {
    every_week: 52,
    every_two_weeks: 26,
    every_month: 12,
    twice_a_month: 26,
};

const buildTransactions = (
    loans = 0,
    fees = 20,
    initInsAmt = 0,
    initInsNb = 1,
    rate = 1,
    reimFreq = "every_two_weeks"
) => {
    console.log(`sequence || currBalance || amount  || interest  || capital     || fees     || balance ||`)
    console.log('----------------------------------------------------------------------------------------')
    let singleRate = rate / frequency[reimFreq];
    let balance = loans;
    // console.log(singleRate, initInsNb, initInsAmt);
    // let vf =
    //     (initInsAmt * (1 - 1 / Math.pow(1 + singleRate, initInsNb))) /
    //     singleRate;
    // let balance = vf;
    for (let i = 1; i <= initInsNb; i++) {
        let currBalance = balance;
        let currInt = balance * singleRate;
        let capital = initInsAmt - currInt - fees;
        balance -= capital;
        console.log(`${i < 10? "0" : ''}${i}        || ${parseFloat(currBalance).toFixed(2)}      || ${parseFloat(initInsAmt).toFixed(2)}   ||${parseFloat(currInt).toFixed(2)}       || ${parseFloat(capital).toFixed(2)}       || ${fees}    || ${parseFloat(balance).toFixed(2)} || ${"pending"}`);
    }
};

//  ----------------- for other region ------------------
// let amt = 36.57;
// let totalOwing = 438.8;
// let initInsNb = 13;
// let initInsAmt = parseFloat(totalOwing / initInsNb).toFixed(2);
// let rate = 0.29;
// let reimFreq = "every_week";

//  ----------------- for quebec region ------------------
let amt = 36.57;
let totalOwing = 500;
let loans = 500 // for quebec need to add this
let fees = 20
let initInsNb = 13;
let rate = 0.29;
let initInsAmt = 59.98
// totalOwing/((1- Math.pow((1+rate/52),-initInsNb))/rate)
let reimFreq = "every_week";


buildTransactions(loans,fees, initInsAmt, initInsNb, rate, reimFreq);

