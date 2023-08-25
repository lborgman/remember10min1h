"use strict";
console.log("here is module db-fc4i.js");
if (document.currentScript) throw Error("import .currentScript"); // is module
if (!import.meta.url) throw Error("!import.meta.url"); // is module

// https://github.com/jakearchibald/idb
const dbName = "rem10m1h";
const idbStoreName = "toRepeat";
let ourDb;
async function getDb() {
    if (ourDb) return ourDb;
    ourDb = await idb.openDB(dbName, 6, {
        // upgrade(db, oldVersion, undefined, transaction, event) {
        upgrade(db) {
            console.warn("idb.js upgrade");
            try {
                db.deleteObjectStore(idbStoreName);
            } catch (err) {
                const errCode = err.code;
                const errName = err.name;
                const codeOk = errCode == 8;
                const nameOk = errName == "NotFoundError";
                // https://webplatform.github.io/docs/apis/indexeddb/IDBDatabase/deleteObjectStore/
                console.error("db.deleteObjectStore", { err, errCode, codeOk, errName, nameOk });
                if (!(codeOk && nameOk)) throw Error(`Unknown error in .deleObjectStore, ${errCode}, ${errName}`);
            }
            const store = db.createObjectStore(idbStoreName, {
                keyPath: "key"
            });
            store.createIndex("url", "url");
        },
        terminated() {
            console.warn("idb.js terminated");
        },
    });
    return ourDb;
}
export const getDbKey = async (key) => {
    const db = await getDb();
    const objVal = await db.get(idbStoreName, key);
    // console.log(`get ${key}`, { objVal });
    return objVal;
}
export const setDbKey = async (key, objVal) => {
    const db = await getDb();
    objVal.key = key;
    const res = await db.put(idbStoreName, objVal);
    // console.log(`set ${key}`, { res });
    return res;
}
const countDbKey = async (key) => {
    const db = await getDb();
    const count = await db.count(idbStoreName, key);
    console.log(`count ${key}`, { count });
    return count;
}
export const deleteDbKey = async (key) => {
    const db = await getDb();
    const res = await db.delete(idbStoreName, key);
    return res;
}



const KEY_SHORT_TIMERS = "KEY_SHORT_TIMERS";
async function setShortTimers(objVal) { return setDbKey(KEY_SHORT_TIMERS, objVal); }
async function getShortTimers() { return getDbKey(KEY_SHORT_TIMERS); }
async function countShortTimers() { return countDbKey(KEY_SHORT_TIMERS); }

const KEY_SW_STATUS = "SW_STATUS";
async function setLastSWstatus(objVal) { return setDbKey(KEY_SW_STATUS, objVal); }
async function getLastSWstatus() { return getDbKey(KEY_SW_STATUS); }

const KEY_TEST_TIMER = "TEST_TIMER_done";
async function setLastTestTimer(objVal) { return setDbKey(KEY_TEST_TIMER, objVal); }
async function getLastTestTimer() { return getDbKey(KEY_TEST_TIMER); }

const KEY_REMINDER_DIALOG = "KEY_REMINDER_DIALOG";
async function setSavedDialogValue(objVal) { return setDbKey(KEY_REMINDER_DIALOG, objVal); }
export async function getSavedDialogValue() { return getDbKey(KEY_REMINDER_DIALOG); }

const KEY_TAGS = "KEY_TAGS";
async function setDbTags(objVal) { return setDbKey(KEY_TAGS, objVal); }
async function getDbTags() { return getDbKey(KEY_TAGS); }
export async function setDbTagsArr(arrVal) {
    if (!Array.isArray(arrVal)) {
        console.log({ arrVal });
        throw Error("arrVal is not an array");
    }
    const objVal = { tags: arrVal }
    return setDbTags(objVal);
}
export async function getDbTagsArr() {
    const allTags = await getDbTags();
    const arrVal = allTags?.tags ? allTags.tags : [];
    if (!Array.isArray(arrVal)) {
        console.log({ arrVal });
        throw Error("arrVal is not an array");
    }
    return arrVal;
}

const SPECIAL_KEYS = [
    KEY_SHORT_TIMERS,
    KEY_SW_STATUS,
    KEY_TEST_TIMER,
    KEY_REMINDER_DIALOG,
    KEY_TAGS
];
function isSpecialKey(key) { return SPECIAL_KEYS.includes(key); }

export async function getViaUrl(url) {
    const db = await getDb();
    // const store = db.objectStore(idbStoreName);
    // const indexUrl = store.index("url");
    // return indexUrl.get(url);
    const tx = db.transaction(idbStoreName, 'readwrite');
    const store = tx.objectStore(idbStoreName);
    // const val = (await store.index("url").get('https:svt.se')) || 0;
    const indexUrl = store.index("url");
    // const val = (await indexUrl.get('https:svt.se')) || 0;
    const val = await indexUrl.get(url);
    await tx.done;
    // console.log({ val })
    return val;
}

export function checkTimersOrder(timers) {
    const len = timers.length;
    for (let i = 1; i < len; i++) {
        const timer = timers[i];
        const prevTimer = timers[i - 1];
        const msDelay = timer.msDelay;
        const prevMsDelay = prevTimer.msDelay;
        if (Math.abs(prevMsDelay) > Math.abs(msDelay)) debugger;
    }
}

export async function get1Reminder(key) {
    const db = await getDb();
    if (isSpecialKey(key)) return;
    return getDbKey(key);
}
export async function countAllReminders() {
    const db = await getDb();
    let num = await db.count(idbStoreName);
    // const numAll = num;
    // if (await getDbKey(KEY_SHORT_TIMERS)) num--;
    // if (await getDbKey(KEY_REMINDER_DIALOG)) num--;
    // if (await getDbKey(KEY_TEST_TIMER)) num--;
    // if (await getDbKey(KEY_SW_STATUS)) num--;
    // if (await getDbKey(KEY_TAGS)) num--;
    for (let i = 0, len = SPECIAL_KEYS.length; i < len; i++) {
        const specialKey = SPECIAL_KEYS[i];
        if (await getDbKey(specialKey)) num--;
    }
    // console.log({num, numAll});
    return num;
}
async function getAllReminders() {
    const db = await getDb();
    const allRecs = await db.getAll(idbStoreName);
    const allReminders = allRecs.filter((rec) => {
        if (isSpecialKey(rec.key)) return false;
        return true;
    });
    return allReminders;
}
async function getToNotifyNow(matchValues) {
    const hasMatchValues = matchValues !== undefined;
    console.log("getToNotifyNow", { matchValues, hasMatchValues });
    // const db = await getDb();
    // getDbMatching(searchFor, minConf, maxConf, requiredTags)
    let allRecs;
    if (!hasMatchValues) {
        allRecs = await getAllReminders();
    } else {
        // const { searchFor, minConf, maxConf, requiredTags } = matchValues;
        // allRecs = await getDbMatching(searchFor, minConf, maxConf, requiredTags);
        const { strSearch, minRange, maxRange, reqTags } = matchValues;
        allRecs = await getDbMatching(strSearch, minRange, maxRange, reqTags);
        const allLen = allRecs.length;
        console.log({ allLen });
    }

    const msNow = new Date().getTime();
    const toNotify = [];
    // FIX-ME: We are only using 1 record now in next step.
    // Get the oldest here!
    allRecs.forEach(r => {
        const ts = r.timers;
        checkTimersOrder(ts);
        const len = ts.length;
        let expired = false;
        const expiredTimers = [];
        for (let i = 0; i < len; i++) {
            const timer = ts[i];
            const msWhen = timer.msWhen;
            const msDelay = timer.msDelay;
            // expired = expired || msWhen < msNow;
            if (msDelay > 0) {
                if (msWhen < msNow) {
                    expired = true;
                    expiredTimers.push(timer);
                    break;
                }
            }
            // console.log({ timer, msWhen, expired });
        }
        // if (expired) toNotify.push(r);
        // if (expired) toNotify.push(r);
        if (expired) {
            const expiredRecord = r;
            let older = true;
            const thisRecTime = expiredTimers[0].msWhen;
            for (let j = 0; j < toNotify.length; j++) {
                const tnRec = toNotify[j];
                // console.log({ tnRec }, tnRec.timers, tnRec.expiredTimers);
                // const tnTime = tnRec.timers[0].msWhen;
                const tnTime = tnRec.expiredTimers[0].msWhen;
                // console.log({ tnTime });
                if (tnTime < thisRecTime) {
                    older = false;
                    break;
                }
            }
            if (older) toNotify.push({ expiredRecord, expiredTimers });
        }
    });
    console.log({ toNotify });
    return toNotify;
}

export async function getDbMatching(searchFor, minConf, maxConf, requiredTags) {
    const allRem = [];
    allRem.length = 0;
    const allRemStored = await getAllReminders();
    const keys = ["text", "title", "url"];
    const searchFor2 = searchFor?.toLocaleLowerCase();
    const searchAll = searchFor2?.split(/ +/).filter(r => r != "-") || [];
    const searchPos = searchAll.filter(r => !r.startsWith("-"));
    const searchNeg = searchAll.filter(r => r.startsWith("-")).map(r => r.slice(1));
    allRemStored.forEach(rem => {
        const remConfRem = rem.confRem;
        const remConf = rem.confRem || 1;
        // console.log("allRemStored", { rem, remConfRem, remConf });

        if (remConf < minConf) return;
        if (remConf > maxConf) return;

        if (requiredTags?.length > 0) {
            const tags = rem.tags;
            if (!tags) return;
            if (tags.length == 0) return;
            if (tags) {
                for (let i = 0, len = requiredTags.length; i < len; i++) {
                    const reqTag = requiredTags[i];
                    if (!tags.includes(reqTag)) return;
                }
            }
        }
        // console.log("INRANGE!");
        if (searchFor == undefined) { allRem.push(rem); return; }
        for (let n of searchNeg) {
            for (let k of keys) {
                const v = rem[k];
                const vLC = v.toLocaleLowerCase();
                if (vLC.indexOf(n) > -1) { return; }
            }
        }
        let hitAllP = true;
        for (let p of searchPos) {
            let hitP = false;
            for (let k of keys) {
                const v = rem[k];
                const vLC = v.toLocaleLowerCase();
                if (vLC.indexOf(p) > -1) { hitP = true; break; }
            }
            if (!hitP) { hitAllP = false; break; }
        }
        if (hitAllP) { allRem.push(rem); return; }
    });

    // const msNow = new Date().getTime();
    allRem.sort(sortObjectBy("key", true)); // newest first
    return allRem;
}


export async function getUnusedTags() {
    const arrAll = await getDbMatching();
    const arrTags = await getDbTagsArr();
    // console.log({ arrAll, arrTags });
    const objTags = {}
    arrTags.forEach(tag => objTags[tag] = 0);
    // console.log({ objTags });
    arrAll?.forEach(rec => {
        const tags = rec.tags;
        // console.log({ tags });
        tags?.forEach(name => { objTags[name]++ });
    });
    // console.log("result", { objTags });
    const notUsed = [];
    Object.keys(objTags).forEach(k => {
        const v = objTags[k];
        // console.log({ k, v });
        if (v == 0) notUsed.push(k);
    });
    // console.log({ notUsed });
    return notUsed;
}

// async function setShortTimers(objVal) { return setDbKey(KEY_SHORT_TIMERS, objVal); }
// async function getShortTimers() { return getDbKey(KEY_SHORT_TIMERS); }
// async function countShortTimers() { return countDbKey(KEY_SHORT_TIMERS); }
async function anyShortTimers() {
    // debugger;
    const count = await countShortTimers();
    console.log({ count });
    return count > 0;
    // const shorts = await getShortTimers();
    // console.log("any", { shorts });
    // return shorts !== undefined;
}
async function addShortTimer(key, atTime, afterMinutes, lbl) {
    if (!afterMinutes) debugger;
    const oldShortsRec = await getShortTimers();
    const newShortsRec = oldShortsRec || {};
    // Take care of old record format:
    if (!newShortsRec.shorts) newShortsRec.shorts = {}
    const shorts = newShortsRec.shorts;
    const date = new Date(atTime);
    const dateIso = date.toISOString();
    shorts[key] = { dateIso, afterMinutes, lbl };
    console.log("new", { shorts, newShortsRec });
    await setShortTimers(newShortsRec);
}
async function getShortTimer(key) {
    const anyShort = await anyShortTimers();
    if (!anyShort) return;
    const shortsRec = await getShortTimers();
    const shorts = shortsRec.shorts;
    return shorts[key];
}
async function deleteShortTimer(key) {
    // const anyShort = await anyShortTimers();
    // if (!anyShort) return;
    const shortsRec = await getShortTimers();
    console.warn({ shortsRec });
    if (!shortsRec) return;
    const shorts = shortsRec.shorts;
    // if (!shorts[key]) debugger;
    delete shorts[key];
    const isEmpty = Object.keys(shorts).length == 0;
    console.log({ isEmpty, shorts });
    if (isEmpty) {
        const res = await deleteDbKey(KEY_SHORT_TIMERS);
        console.log({ res });
    } else {
        const res = await setShortTimers(shorts);
        console.log({ res });
    }
}
export async function getNextShortTimer() {
    const shortsRec = await getShortTimers();
    const shorts = shortsRec?.shorts;
    // console.log({ shorts });
    if (shorts === undefined) return;
    let earliest;
    let earliestKey;
    let earliestAfterMinutes;
    let earliestLbl;
    let earliestDateIso;
    Object.entries(shorts).forEach(entry => {
        const [key, val] = entry;
        console.log({ key, val });
        const { afterMinutes, dateIso, lbl } = val;
        console.log({ afterMinutes, dateIso });
        if (key == "key") return;
        earliest = earliest || dateIso;
        if (dateIso <= earliest) {
            earliestKey = key;
            earliestAfterMinutes = afterMinutes;
            earliestLbl = lbl;
            earliestDateIso = dateIso;
        }
    });
    return {
        earliestKey,
        earliestAfterMinutes,
        earliestLbl,
        earliestDateIso,
    }
}

// https://stackoverflow.com/questions/979256/sorting-an-array-of-objects-by-property-values
function sortObjectBy(field, reverse, primer) {
    const key = primer ?
        function (x) {
            return primer(x[field])
        } :
        function (x) {
            return x[field]
        };
    reverse = !reverse ? 1 : -1;
    return (a, b) => {
        a = key(a); b = key(b); return reverse * ((a > b) - (b > a));
    }
}

// console.log("END db-fc4i.js");