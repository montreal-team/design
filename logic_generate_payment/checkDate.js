var moment = require("moment");
let F = 5;
let S = 30;

let startD = 31;
let startM = 1;
let startY = 2023;

let findNext = (D, M, Y, list, paymentsNumber) => {
    if (list.length == paymentsNumber) return;
    let fArr = [F - D, S - D].filter((e) => e >= 0) || [];
    if (fArr.length) {
        let next = D + Math.min(...fArr);
        D = next + 1;
        list.push({ d: next, m: M, y: Y });
    } else {
        D = 0;
        M += 1;
    }
    if (M > 12) {
        M = 1;
        Y += 1;
    }
    findNext(D, M, Y, list, paymentsNumber);
};
let list = [];

findNext(startD, startM, startY, list, 8);

const holiday = [27];
// const holiday = [1, 4, 5];
const wekend = [2, 3, 8, 28, 29];
const findPrev = ({ d, m, y }) => {
    if (holiday.includes(d) || wekend.includes(d)) {
        return findPrev({ d: d - 1, m, y });
    } else {
        return { d, m, y };
    }
};
const checkValid = ({ d, m, y }) => {
    let dStr = d < 10 ? `0${d}` : d;
    let mStr = m < 10 ? `0${m}` : m;
    if (moment(`${mStr}/${dStr}/${y}`, "MM/DD/YYYY", true).isValid()) {
        if (holiday.includes(d) || wekend.includes(d)) {
            return checkValid({ d: d + 1, m, y });
        } else {
            return { d, m, y };
        }
    } else {
        let obj = findPrev({ d: d - 1, m, y });
        return checkValid(obj);
    }
};

console.log("check ===> ", checkValid({ d: 39, m: 2, y: 2023 }));

let fList = [];
list.forEach((e) => {
    fList.push(checkValid({ d: e.d, m: e.m, y: e.y }));
});
console.log(fList);
