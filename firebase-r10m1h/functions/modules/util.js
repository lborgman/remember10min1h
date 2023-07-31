// const localVer = "0.0.1";

/* @license Copyright 2019 (lennart.borgman@gmail.com) All rights reserved. */

const colors = require('colors'); // Console colors
const admin = require("firebase-admin");
const firestore = admin.firestore();
const util = require("util");
const path = require("path");
// const functions = require('firebase-functions');
const fs = require("fs");

const axios = require("axios");

// https://stackoverflow.com/questions/24378272/
// node-js-how-to-get-the-ip-address-of-http-server-listening-on-a-specific-port/27724073
// console.log(server.adress().adress);

/*
const os = require("os");
// console.log(os.hostname(), os.platform())
const uconsole = {}
if (os.platform() === "NOwin32") {
    console.log("at home win32".bgGreen)
    // console.log(console)
    // console.log(JSON.stringify(os.networkInterfaces(), null, 2).bgRed);

    // https://stackoverflow.com/questions/
    // 45395369/how-to-get-console-log-line-numbers-shown-in-nodejs
    // console.log("here A")
    // console.log("FE2", [].forEach)
    // ['log','warn','error'].forEach(function (methodName) { console.log(methodName) });
    // ['log','warn','error'].forEach(function (methodName) { console.log("uh") });
    const fs = ['log', 'warn', 'error'];

    // ['log','warn','error'].forEach((methodName) => 
    const thisDir = __dirname;
    for (let i = 0, len = fs.length; i < len; i++) {
        const methodName = fs[i]
        // console.log("here 0")
        const originalMethod = console[methodName];
        // console.log(originalMethod);
        // console.log("here 1")
        uconsole[methodName] = (...args) => {
            try {
                throw Error();
            } catch (error) {
                // console.log("here 2")
                originalMethod.apply(
                    console,
                    [
                        (
                            error
                                .stack // Grabs the stack trace
                                .split('\n')[2] // Grabs third line
                                .trim() // Removes spaces
                                .substring(3) // Removes three first characters ("at ")
                                .replace(thisDir, '') // Removes script folder path
                                .replace(/\s\(./, ' at ') // Removes first parentheses and replaces it with " at "
                                .replace(/\)/, '') // Removes last parentheses
                        ),
                        '\n',
                        ...args
                    ]
                );
            }
        };
    }
    // )
    // uconsole.log("NEW console.log?".bgGreen)
    // uconsole.warn("NEW console.warn?".bgYellow)
    // uconsole.error("NEW console.error?".bgRed)
}
*/


function ui(v) { return util.inspect(v, false, 1, true) }

function isJsonVal(val) {
    const type = typeof val;
    if (type === "string") return true;
    if (type === "object") return true;
    if (type === "boolean") return true;
    if (type === "number" && !isNaN(val)) return true;
    return false;
}

exports.generateFirestoreDocId = generateFirestoreDocId;
function generateFirestoreDocId(collName) {
    // https://stackoverflow.com/questions/46844907/firestore-is-it-possible-to-get-the-id-before-it-was-added
    // const db = firebase.firestore();
    // const ref = db.collection('your_collection_name').doc();
    // FIXME: Is this official?
    console.log(`generateFirestoreDocId(${collName})`.bgCyan)
    const secCollRef = firestore.collection(collName);
    const ref = secCollRef.doc();
    return ref.id;
}

exports.addToSecurityLog = addToSecurityLog;
async function addToSecurityLog(secrec) {
    const subject = secrec.subject || "NO SUBJECT"
    try {
        const collName = "security-log";
        const genId = generateFirestoreDocId(collName);
        const time = new Date().toISOString();
        const id = `${time} ${subject} ${genId}`
        const secCollRef = firestore.collection(collName);
        await secCollRef.doc(id).set(secrec);
    } catch (err) {
        console.error(`Could not add to security log: ${err}`)
    }
}


function getStack() {
    try {
        throw Error();
    } catch (e) {
        const arrStack = e.stack.split("\n")
        // arrStack.shift();
        // arrStack.shift();
        arrStack.splice(1, 1);
        const parentDir = path.resolve(__dirname, "..");
        const thisDir = __dirname;
        return arrStack
            .map(val => val.replace(thisDir, ""))
            .map(val => val.replace(parentDir, ""))
            .map(val => val.replace(/^\\s*at /, "  "))
            ;
    }
}
exports.getStack = getStack;

let savedStack;
function saveStack(skipLevels) {
    savedStack = getStack();
    if (skipLevels) {
        for (let i = 0; i <= skipLevels; i++) {
            savedStack.shift();
        }
    }
}
exports.saveStack = saveStack;

function getSavedStack() { return savedStack; }
exports.getSavedStack = getSavedStack;

function saveStackAndThrow(errMsg) {
    saveStack(2);
    throw Error(errMsg);
}
exports.saveStackAndThrow = saveStackAndThrow;

function removeTokensFromObject(obj) {
    // throw Error("dummy dummy dummy dummy")
    const keys = Object.keys(obj)
    for (const key of keys) {
        const val = obj[key];
        if (typeof val === "string") {
            if (val.indexOf("\n") === -1) {
                // console.log("before".bgGreen, obj[key])
                if (val.length > 200) obj[key] = "...";
                // console.log("after".bgRed, obj[key])
            }
        }
    }
}

function respondNNN(response, nnn, respObj, err) {
    console.log(`enter respond ${nnn} ---------------------------`.bgRed)

    const errInsp = util.inspect(err, false, null, true);

    const errInspSplit = errInsp.split("\n");

    const re = new RegExp("at\\s*\\(?.*[\\\\/]");
    const errInspSplitMap = errInspSplit.map(val => val.replace(re, "("));
    respObj.error = errInspSplitMap;
    console.error("respObj.error", respObj.error)

    respondWithAllowOrigin(response, nnn, respObj);
}
function respond500(response, respObj, err) {
    respondNNN(response, 500, respObj, err);
}
function respond400(response, respObj, err) {
    respondNNN(response, 400, respObj, err);
}
exports.respond400 = respond400;
exports.respond500 = respond500;

function respondWithAllowOrigin(response, status, respObj) {
    if (typeof response !== "object") throw Error("typeof response is not object");
    if (typeof status !== "number") throw Error("typeof status is not number");
    if (typeof respObj !== "object") throw Error("typeof resObj is not object");

    try {
        if (typeof respObj === "object") removeTokensFromObject(respObj);
    } catch (err) {
        console.log("respondWithAllowOrigin err", err)
        if (typeof respObj === "object") respObj.respondError = err.toString();
    }
    // console.log("respondWithAllowOrigin", status, answer)
    // https://stackoverflow.com/questions/7042340/error-cant-set-headers-after-they-are-sent-to-the-client
    response.setHeader("Access-Control-Allow-Origin", "*");
    // response.end(JSON.stringify({euroPerMBs2t:euroPerMBs2t()}));

    const answer = respObj.answer;
    if (answer) {
        let notJsonKeyVal = "";
        const astr = JSON.stringify(answer, (k, v) => {
            // console.log("k, v".red, k, v)
            if (!isJsonVal(v)) {
                console.log("NOT VALID".bgRed, k, v);
                notJsonKeyVal += `"${k}":"${v}", `;
            }
            return v;
        });
        console.log({ astr });
        // console.log("notJsonKeyVal".bgBlue, notJsonKeyVal.bgRed)
        if (notJsonKeyVal.length > 0) {
            respObj.error = "JSON is not valid: " + notJsonKeyVal;
            response.status(500).send(respObj);
            response.end();
            return;
        }
    }

    response.status(status).send(respObj);
    response.end();
}
exports.respondWithAllowOrigin = respondWithAllowOrigin;

// exports.promGetUserEmail = async (idToken) => {
exports.promGetUserRecord = async (idToken) => {
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const userRecord = await admin.auth().getUser(uid);
        return userRecord;
    } catch (err) {
        throw Error(err);
    }
}

exports.isAdmin = async (email) => {
    return email === "lennart.borgman@gmail.com";
}

exports.canBeValidEmail = (email) => {
    /*
    From https://www.regular-expressions.info/email.html
    Can't translate this to JavaScript. What is wrong???
    const reStr =
        "\\A(?=[a-z0-9@.!#$%&'*+/=?^_`{|}~-]{6,254}\\z)"
        + "(?=[a-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@)"
        + "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*"
        + "@ (?:(?=[a-z0-9-]{1,63}\\.)[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+"
        + "(?=[a-z0-9-]{1,63}\\z)[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\z";
    const re = new RegExp(reStr);
    */
    // https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}


// exports.copyJsonObject = obj => { return JSON.parse(JSON.stringify(obj)); }

// From functions to public!
let webJsonIf;
exports.getWebJsonIf = () => {
    console.log("enter getWebJsonIf");
    if (webJsonIf) return webJsonIf;
    let txtPub, txtFun;
    // let mtimePub, mtimeFun;
    let okSame = false;
    const absPathFun = path.resolve(__dirname, "./webjsonif.mjs");
    console.log({ absPathFun });
    try {
        txtFun = fs.readFileSync(absPathFun, "utf8");
        // const statFun = fs.statSync(absPathFun);
        // mtimeFun = statFun.mtime;
        // console.log({ mtimeFun }, mtimeFun);
        // const mtimeMsFun = statFun.mtimeMs;
        // console.log({ mtimeMsFun });
    } catch (err) {
        console.log("err", err);
        txtFun = "";
    }

    // https://stackoverflow.com/questions/53185426/how-to-detect-if-environment-is-development-or-production-with-firebase-cloud-fu
    const envInEmul = process.env["FUNCTIONS_EMULATOR"];
    const isString = typeof envInEmul === "string";
    const inEmul = envInEmul === "true" || envInEmul === true;
    // const inEmul = false;
    console.log("new", { envInEmul, isString, inEmul });
    if (inEmul) {
        try {
            const absPathPub = path.resolve(__dirname, "../../public/js/msj/webjsonif.mjs");
            // console.log({ absPathPub });
            txtPub = fs.readFileSync(absPathPub, "utf8");
            okSame = (txtFun === txtPub);
        } catch (err) {
            okSame = true;
        }
        if (!okSame) {
            console.log("trying to fix server webJsonIf.mjs copy".red)
            fs.writeFileSync(absPathFun, txtPub)
            okSame = true;
            console.log("fixed server webJsonIf.mjs copy".green)
        }
    }

    const lines = txtFun.split(/\r\n/).filter(line => !line.match("NOTJSON"))
    const txtJson = lines.join("\n");
    // console.log({ txtJson });
    // const around705 = txtJson.substring(680);
    // console.log({ around705 });
    let json2;
    try {
        json2 = JSON.parse(txtJson);
    } catch (err) {
        const errTxt = err.toString();
        console.log(errTxt);
        const posTxt = errTxt.replace(/[^\d]/g, "")
        // console.log(posTxt.bgRed)
        const pos = parseInt(posTxt);
        const before = txtJson.substring(pos - 200, pos);
        const fail = txtJson.substring(pos, pos + 1);
        const after = txtJson.substring(pos + 1, pos + 100);
        // console.log(before.bgGreen, fail.bgRed, after.bgGreen)
        console.log(before, fail, after)
        throw err;
    }
    webJsonIf = Object.freeze(json2);
    return webJsonIf;
}

/**
 * Get parameters from the request object, both url and post dito.
 * Sanitize them with path.basename().
 * Check iff those parameters are present.
 * 
 * @param {Request} request
 * @param {Object} wanted, wanted named parameters with value undefined
 * @param {Object} trace, actual parameters
 */
exports.getAndValidateParameters = (request, response, wanted, trace, paramsName) => {
    // console.log("getAndValidateParameters".red, JSON.stringify(wanted).yellow);
    function errResp(answer) {
        console.log("getAndValidateParameters errResp".bgRed, { answer });
        respondWithAllowOrigin(response, 400, {
            badRequestReason: answer,
            // wanted, trace,
        });
        return false;
    }
    function copyVal2trace(val) {
        // FIXME: Why is val null in deployed, but not in localhost???
        if (val === null) return val;
        if (typeof val !== "string") return val;
        if (val.indexOf("\n") !== -1) return val;
        if (val.length > 150) return "...";
        return val;
    }

    // if (!request instanceof Request) throw Error("Parameter 1 is not Request");
    if (typeof wanted !== "object") return errResp("Parameter 2 is not object");

    // Check before
    for (const ent of Object.entries(wanted)) {
        const [k, v] = ent;
        if (v === true) continue;
        if (v === false) continue;
        if (typeof v !== "function") {
            return errResp("Wanted key's value is not true/false/function: " + k + "=" + v);
        }
    }

    // Collect
    trace.q = {}
    // if (typeof val === "string" && val.length > 200) obj[key] = "...";
    function checkAndGet(key, val) {
        // FIXME: function
        // wanted[key] = typeof val !== "string" ? val : path.basename(val);
        if (typeof val !== "string") {
            wanted[key] = val;
        } else {
            if (val.slice(0, 8) === "https://") {
                // FIXME: safe https?
                wanted[key] = new URL(val).href;
            } else {
                // FIXME: Safe?
                // wanted[key] = path.basename(val);
                wanted[key] = val;
            }
        }
    }
    for (const ent of Object.entries(request.query)) {
        const [k, v] = ent;
        if (!Object.prototype.hasOwnProperty.call(wanted, k)) return errResp("Unrecognized q-parameter: " + k);
        trace.where = "q k=" + k + ", v=" + copyVal2trace(v);
        checkAndGet(k, v);
        trace.q[k] = copyVal2trace(v);
    }
    trace.b = {}
    for (const ent of Object.entries(request.body)) {
        const [k, v] = ent;
        if (k === "paramsNameCheck") {
            if (typeof paramsName === "undefined") continue;
            if (v === paramsName) {
                continue;
            }
            // throw Error(`paramsName: ${paramsName} !== ${v}`);
            return errResp(`paramsName: ${paramsName} !== ${v}`);
        }
        if (!Object.prototype.hasOwnProperty.call(wanted, k)) return errResp("Unrecognized b-parameter: " + k);
        trace.where = "b k=" + k + ", v=" + copyVal2trace(v);
        checkAndGet(k, v);
        trace.b[k] = copyVal2trace(v);
    }
    // Check after
    for (const ent of Object.entries(wanted)) {
        const [k, v] = ent;
        if (v === true) { return errResp("Parameter " + k + " value is not given"); }
        if (typeof v === "function") {
            const ok = v(undefined);
            if (!ok) { return errResp("Parameter " + k + " must have a value") }
        }
    }
    // trace.where = "Exiting getAndValidateParameters";
    // console.log("exit getAndValidateParameters".green, JSON.stringify(wanted).yellow);
    return true;
}

function throwWStack(msg) {
    saveStack();
    // console.log("savedStack".bgRed, util.inspect(savedStack, { showHidden: false, depth: null, colors: true }));
    throw Error(msg);
}

exports.GT = (a, b) => {
    if (isNaN(a)) throwWStack("a isNaN");
    if (isNaN(b)) throwWStack("b isNaN");
    return a > b;
}

exports.sendFCM = async (fcmToken, data) => {
    // This registration token comes from the client FCM SDKs.
    if (!fcmToken) throw Error("no fcmToken");
    const registrationToken = fcmToken;
    console.log({ registrationToken });

    const message = {
        data: data,
        // token: registrationToken,
        // tokens: [registrationToken],
    };

    // Send a message to the device corresponding to the provided
    // registration token.
    console.log("FCM :::::::: sending message:".yellow, JSON.stringify(message.data));
    try {
        // message.token = registrationToken;
        // const response = await admin.messaging(appId).send(message);

        message.tokens = [registrationToken];
        const response = await admin.messaging().sendMulticast(message);

        console.log(ui(message));

        console.log("FCM :::::::: Successfully sent message:".green, response);
        return true;
    } catch (error) {
        console.log("FCM :::::::: Error sending message:".red, error);
        return false;

    }
}

exports.userExists = userExists;
async function userExists(email) {
    try {
        await admin.auth().getUserByEmail(email);
        return true;
    } catch (err) {
        return false;
    }
}


exports.listCachedFiles = listCachedFiles;
async function listCachedFiles(userEmail) {
    const prefix = "tmpspeech/" + userEmail;
    // const prefix = "tmpspeech"; // ok
    const files = await listFiles(prefix);
    return files;
}


exports.ourGetFiles = ourGetFiles;
async function ourGetFiles(query) {
    console.log("ourGetFiles".bgCyan, query)
    const items = await admin.storage().bucket().getFiles(query);
    console.log("ourGetFiles, got items".bgCyan)
    const files = items[0];
    return files;
}
async function listFiles(prefix) {
    // console.log("util.listFiles ----------------------".bgRed)
    // https://firebase.google.com/docs/storage/web/list-files
    // FIXME: looks like it was the browser side...
    /*
        // Create a reference under which you want to list
        const storageRef = admin.storage().bucket().ref();
        // const storage= admin.storage();
        // const storageRef  = storage.ref();
        const listRef = storageRef.child(prefix);
    
        // try {
    
        // Find all the prefixes and items.
        const res = await listRef.listAll();
        // res.prefixes.forEach(function(folderRef) { });
        // res.items.forEach(function (itemRef) { });
    */

    // https://stackoverflow.com/questions/53757582/firebase-storage-list-files-in-a-specific-directory
    // console.log("prefix".bgGreen, prefix)
    const query = {
        directory: prefix
    };
    const prefixLen = prefix.length + 1;

    const items = await admin.storage().bucket().getFiles(query);
    // console.log("----------------------".bgGreen)
    // console.log(util.inspect(items, false, 1, true))
    const items0 = items[0];
    // console.log("----------------------".bgGreen)
    // console.log(util.inspect(items0, false, 1, true))
    const files = items0.map(itemRef => {
        // console.log("----------------------".bgRed)
        const name = itemRef.name.substring(prefixLen)
        const size = itemRef.metadata.size;
        const updated = itemRef.metadata.updated;
        const mediaLink = itemRef.metadata.mediaLink;
        const rec = { name, size, updated, mediaLink }
        // console.log(util.inspect(rec, false, 1, true));
        return rec;
    }).filter(rec => rec.name.substr(-11) === "-words.json");
    // console.log(util.inspect(files, false, null, true))
    return files;

    // } catch (err) { throw err; }
}

exports.promNetworkSeemsOk = promNetworkSeemsOk;
async function promNetworkSeemsOk() {
    // https://stackoverflow.com/questions/58795113/is-there-some-url-that-does-not-hide-behind-cors
    const notCachedURL = "https://jsonplaceholder.typicode.com/";
    // const resp = await fetch(notCachedURL, { method: "HEAD" })
    console.log("promNetworkSeemsOk before axios.get".bgCyan);
    const resp = await axios({ url: notCachedURL, method: "HEAD" })
    console.log("promNetworkSeemsOk after axios.get".bgCyan);
    const status = resp.status;
    const statusText = resp.statusText;
    console.log("promNetworkSeemsOk ".bgCyan, { statusText }, { status });
    // return resp.ok;
    return status === 200;
}

exports.waitSeconds = waitSeconds;
function waitSeconds(sec) {
    console.log("start wait", sec)
    return new Promise(resolve => {
        function ready() {
            console.log("ready wait", sec)
            resolve(sec);
        }
        setTimeout(ready, sec * 1000);
    })
}

