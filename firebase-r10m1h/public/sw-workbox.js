//========== Specific ====================================================
// throw Error("Test worker error");
const SW_VERSION = "0.4.095";
const logColors = "color: green; background: yellow;";
console.log(`%csw-worker-input.js ${SW_VERSION} is here`, logColors + " font-size: 20px;");

// https://stackoverflow.com/questions/61080783/handling-errors-in-async-event-handlers-in-javascript-in-the-web-browser
// Error handling with Async/Await in JS - ITNEXT
// https://itnext.io/error-handling-with-async-await-in-js-26c3f20bc06a
function errorHandlerAsyncEvent(asyncFun) {
    // console.warn("typeof asyncFun", typeof asyncFun);
    return function (evt) {
        asyncFun(evt).catch(err => {
            console.log("handler", err);
            // debugger;
            throw err;
        })
    }
}

const tzMin = new Date().getTimezoneOffset();
const tzMs = tzMin * 60 * 1000;
function toLocalISOString(date) { return new Date(date.getTime() - tzMs).toISOString(); }
function toOurTime(date) { return toLocalISOString(date).slice(0, -8).replace("T", " "); }


// https://www.npmjs.com/package/workbox-sw
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

workbox.setConfig({
    debug: false
});

importScripts("src/js/umd/idb.js");
// importScripts("src/js/db-fc4i.js");
console.log("%cservice-worker.js after import workbox-sw.js, idb.js and db-fc4i.js", logColors);
// setLastSWstatus({ status: "starting SW", when: toOurTime(new Date()) });

// JavaScript timers do not survive SW shutdown. So check to notify here at SW startup:
(async () => {
    return; // Added a button instead
    /*
    const remindersSettings = await getSavedDialogValue();
    console.log({ remindersSettings });
    const checkReminders = remindersSettings?.autoReminders || true;
    if (checkReminders) {
        setTimeout(checkToNotify, 2000);
    }
    */
})();

// https://web.dev/workbox-share-targets/
// Only for POST!
/*
workbox.routing.registerRoute(
    "/share",
    shareTargetHandler,
    "GET"
);
console.warn("service-worker.js after registerRoute /share");
*/

workbox.precaching.precacheAndRoute([{"revision":"0a27a4163254fc8fce870c8cc3a3f94f","url":"404-old.html"},{"revision":"b5df78c5b2ecb906a94b86c230a848ae","url":"about.html"},{"revision":"fda1fca60159dc901e64f8dd189f12d4","url":"css/from-tool-color.css"},{"revision":"facc645a8ad900357a2d9d4fa31102a6","url":"css/jsmind-new.css"},{"revision":"4d9df6c1e980f712b4d2195af66149db","url":"css/rem10m1h.css"},{"revision":"bd963fd76bae3c853ace91e428c59f78","url":"css/sass-colors.css"},{"revision":"126cfe146d29ae5cce68e8354d780d0d","url":"css/var-colors.css"},{"revision":"eaac10c08ed34bf394511bb2274dec5d","url":"ext/DragDropTouch.js"},{"revision":"4b08ad333383bdacae33955042a73f8f","url":"ext/fontawesome/5.13.0/css/all.css"},{"revision":"0cb5a5c0d251c109458c85c6afeffbaa","url":"ext/fontawesome/5.13.0/webfonts/fa-brands-400.svg"},{"revision":"89ffa3aba80d30ee0a9371b25c968bbb","url":"ext/fontawesome/5.13.0/webfonts/fa-regular-400.svg"},{"revision":"ec763292e583294612f124c0b0def500","url":"ext/fontawesome/5.13.0/webfonts/fa-solid-900.svg"},{"revision":"478eea5194bec86d4358fba31383eed6","url":"ext/html2canvas.esm.js"},{"revision":"b881aaa51eb21040e42df885a1d3bc29","url":"ext/jsmind/jsmind-dbg.js"},{"revision":"61aa837134a258ce38f2c0962b8895ec","url":"ext/jsmind/jsmind.css"},{"revision":"2c8f690e20a6a1d0b7be64d1963d83a5","url":"ext/jsmind/new-jsmind.draggable-nodes - Copy.js"},{"revision":"d049c1bab5dca6d7ea76f4fb9edba4bd","url":"ext/jsmind/new-jsmind.draggable-nodes.js"},{"revision":"e70b7d78b6db1de7f1d573f6660af79f","url":"ext/mdc/14.0.0/material-components-web.css"},{"revision":"a35154e0b0e92414a64ce898c5d98682","url":"ext/mdc/6.0.0/material-components-web - css variables.css"},{"revision":"a4270fb7d659c569e7056ad70fa0c53c","url":"ext/mdc/6.0.0/material-components-web.css"},{"revision":"4e09df88279ccb9c6a75d9053922d560","url":"ext/mdc/6.0.0/material-components-web.min.css"},{"revision":"8c609bcdb8a5a8fe5b060813a5ef273b","url":"ext/mdc/6.0.0/material-components-web.min.js"},{"revision":"a67515ac50fd1ccd90f00b9723fed2ab","url":"ext/mdc/icon/account_tree_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"7c13b0c4b4634acb05e29f47ba22fbc9","url":"ext/mdc/icon/add_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"19079ee44cc28a8f4aa79085df6b43c9","url":"ext/mdc/icon/art_track_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"f099d1595ee2083dc19c4170187ae59f","url":"ext/mdc/icon/call_to_action_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"421a64bb862a5dbd29406ee47f86cb89","url":"ext/mdc/icon/close_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"140de23b3640b1d97df2c86f3fcd85f3","url":"ext/mdc/icon/delete_forever_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"4b952b76717d2cf421c474da481e998c","url":"ext/mdc/icon/download_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"adcbc4aa4c6e6cfd0486e67f1e6065c2","url":"ext/mdc/icon/edit_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"df1bb296e47a20eef454162a5b33aa3b","url":"ext/mdc/icon/edit_note_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"4fd4464ebc1d35c4e540b6b03bf47b14","url":"ext/mdc/icon/edit_off_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"600b59d62ba226e75a2768c52c62bc5b","url":"ext/mdc/icon/filter_1_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"28ab1e25e0cc2a6cafca0b45c29b95bd","url":"ext/mdc/icon/handyman_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"280142e1238ae86accb6de4eb02329b9","url":"ext/mdc/icon/label_off_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"1bee0fbd3cc9719ec0417107db7b2a0a","url":"ext/mdc/icon/link_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"98dafa859f34dc9537d9f239805ef730","url":"ext/mdc/icon/photo_library_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"6ec9cefd3164d4822bf40faa1b1a7c0f","url":"ext/mdc/icon/quiz_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"8d5f108d26fd5f2e204e61754b7c5da5","url":"ext/mdc/icon/resize_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"44f0470be62c967cea394095be39b6df","url":"ext/mdc/icon/search_check_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"1721f42ba7fa22af4cfdf22acd323f28","url":"ext/mdc/icon/search_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"04bc137f52b309161670162270d6d154","url":"ext/mdc/icon/search.svg"},{"revision":"57f0909a294bfd1472f478f922e49bb6","url":"ext/mdc/icon/share_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"389a08a39c0d2abb0adebc98a2ffce82","url":"ext/mdc/icon/tag_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"5dcb0dedb32e6fa8f3f20bdcb247a358","url":"ext/mdc/icon/today_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"ef2712a0ffa240aac9e93580e299bedf","url":"ext/mdc/icon/upload_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"6870b30f4574159a8d37f00a7a3c66a3","url":"ext/mdc/icon/visibility_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"6189d886275222aef87a5d27c389cbc5","url":"ext/mdc/icon/visibility_off_FILL0_wght400_GRAD0_opsz48.svg"},{"revision":"5484b1da7b2399bb2c9639f0c4d94e37","url":"ext/mdc/material-components-web.css"},{"revision":"6e6a7e579d05b6b97b7b832e99f9b989","url":"ext/mdc/material-components-web.js"},{"revision":"08b2e16a1840155c6c45f8579610fc3b","url":"ext/mdc/material-components-web.min.css"},{"revision":"c9851a0a80b1bbfa50348ab1030b3fe8","url":"fc4i-mindmaps.html"},{"revision":"ca570c82e8960df9a94c29738f92368a","url":"fc4i/fc4i.html"},{"revision":"80f23fe685a58f0de12acb677453fb25","url":"fc4i/manifest-fc4i.json"},{"revision":"dfa20989ca029c28ebc7d64ab2a18f0a","url":"fc4i/share.html"},{"revision":"49a645b9cb67a6f0556351ac27c0c427","url":"firebase-messaging-sw.js"},{"revision":"ace9992924c825d993f4ac836de5e710","url":"img/fc4i.svg"},{"revision":"f9c0a8964ddad170fcc29efae0ed74da","url":"img/mental-capacity-intelligence-remember-intellect-svgrepo-com.svg"},{"revision":"f1391e89c2b3c14058d2dde65fa52452","url":"img/mindmap-icon.svg"},{"revision":"9bd8852f94be1157746641baea860dd8","url":"img/mm.svg"},{"revision":"dcb2d078873d6ac88cee4cc29ad1a30c","url":"img/mm4i.svg"},{"revision":"f9c0a8964ddad170fcc29efae0ed74da","url":"img/rem10m1h.svg"},{"revision":"4f94eab34045b6797aba6aeed7807ce8","url":"img/share_FILL0_wght400_GRAD0_opsz24.svg"},{"revision":"a7a10e681c632e3ded3cbcf6123e0ac3","url":"img/tl.svg"},{"revision":"c123cb9288733602f7fd8f93442e509d","url":"index.html"},{"revision":"95c8decdc6dda9174458034bd3cfabfe","url":"jsmind-edit.html"},{"revision":"949af51c31680870467266d38dd1c07c","url":"manifest.json"},{"revision":"7359fe0db2417f973f7016d9dd0b4bed","url":"mdc-variables.html"},{"revision":"aeeed6cb85a1a4a2bd487e48c988b91b","url":"mm4i/manifest-mm4i.json"},{"revision":"8c69cc8b82c6f37882d826c08166e4e0","url":"mm4i/mm4i.html"},{"revision":"be305eca755e572faa1d2beca1aad4e0","url":"service-worker.js"},{"revision":"fe2971fc4590ad26345c3bcbd6be0d66","url":"share.html"},{"revision":"0e9b107b2f86df0bd87fe95e203d6a3c","url":"src/acc-colors.js"},{"revision":"f6e2c32679784def6c868e43f27aaed3","url":"src/js/common.js"},{"revision":"dcb9705b6f9448248d0d64dda7df853e","url":"src/js/db-fc4i.js"},{"revision":"415e38de664acad24abbd6bf4740a7f1","url":"src/js/db-mindmaps.js"},{"revision":"54c3499a0115e2e99faf067f0a80cc19","url":"src/js/db.js"},{"revision":"a2c938dd6ba142f2236758095d42c508","url":"src/js/error.js"},{"revision":"eb38616dfed9e02a6acf4976e132249b","url":"src/js/fc4i-importmaps.js"},{"revision":"659e6962f8943a9dfba6a4624eae53e7","url":"src/js/images.js"},{"revision":"752b98bff59330cb64e70e2792ca4eff","url":"src/js/is-displayed.js"},{"revision":"b7f45259dac03c92fb01edb75aa3537f","url":"src/js/jsmind-cust-rend.js"},{"revision":"9bb40500d6dcb37307dabe9d11fc8465","url":"src/js/jsmind-edit-common.js"},{"revision":"7b2fd78e7469d0490ee3d742f49c850c","url":"src/js/jsmind-edit-spec-fc4i.js"},{"revision":"815eb346d617f8db77c8f136c4b24327","url":"src/js/jsmind-edit-spec-jsmindedit.js"},{"revision":"b9e0b7bfca77f89f3496be03a10bb2b3","url":"src/js/jsmindedit-importmaps.js"},{"revision":"99da8711c154ba2db07369ab4e485dd9","url":"src/js/main-rem10m1h.js"},{"revision":"254a39fa3a24f0c6e49679bebd40a258","url":"src/js/mindmap-helpers.js"},{"revision":"6b6f52dc4ff355e87685853bd7d67e85","url":"src/js/mod/color-converter.js"},{"revision":"f1d3a9c61bf452ba228bd2155498559f","url":"src/js/mod/flashcards.js"},{"revision":"3fba95d500043566a8f7aab65743362d","url":"src/js/mod/idb-common.js"},{"revision":"c13978626712fedb25b0791a7b86630a","url":"src/js/mod/mindmap-icons.js"},{"revision":"57db95aa957f39e03dcefffd2a6fbb83","url":"src/js/mod/mod-mindmap-icon.js"},{"revision":"4392a85784fc363e680eb5ed1848570a","url":"src/js/mod/my-svg.js"},{"revision":"968697b7c4553a4f748592dcaeea175f","url":"src/js/mod/pwa.js"},{"revision":"8f4b9b5d8df154adacd9d04376e591cc","url":"src/js/mod/sharing-params.js"},{"revision":"aec424491107c89977d4bf24f60f54cf","url":"src/js/mod/sign-in.js"},{"revision":"4bdc7fb8d8099f3d793804f4e40c5a1f","url":"src/js/mod/start-firebase.js"},{"revision":"867b1970087b8bac15442ce5e014b531","url":"src/js/mod/tasks.js"},{"revision":"87b4667143e6c586553bfe327e20a1f9","url":"src/js/mod/util-mdc.js"},{"revision":"aeee94116d76036e508870c3cd1721e1","url":"src/js/share.js"},{"revision":"becc2fb9a5723b96e3e58f2d93390bec","url":"src/js/umd/idb.js"},{"revision":"59ec73093bca5553653b8d35fa921651","url":"temp.html"},{"revision":"8ab287cb2d85bbda7a29796fd0c346c3","url":"test-login.html"},{"revision":"2d9b3f41d3051476e16ea2b60980b2bb","url":"tl/manifest-tl.json"},{"revision":"d125dd96b0387c28fe530c62b4a1cb58","url":"tl/text-and-link.html"}])
/*
workbox.routing.registerRoute(
    /\.(?:js|css|webp|png|svg|html)$/,
    new workbox.strategies.StaleWhileRevalidate()
);
*/

// https://stackoverflow.com/questions/58051656/how-to-send-a-message-from-service-worker-to-a-workbox-class-instances-message
async function broadcastToClients(msg) {
    console.log("broadcaseToClients", { msg });
    const clients = await self.clients.matchAll({ type: 'window' });
    for (const client of clients) {
        client.postMessage(msg);
    }
}

async function shareTargetHandler(evt) {
    console.warn("shareTargetHandler");
    console.warn("shareTargetHandler", { evt }, evt.respondWith);
    // const formData = await evt.request.formData();
    // console.warn({ formData });
    // clients.openWindow("share.html?text=DUMMY-TEXT&title=DUMMY-title&url=DUMMY-url");
    // evt.respondWith(fetch("/share.html&text=dummytext&title=dummytitle&url=dummyurl"));
    // return;
}


async function checkToNotify(matchValues) {
    return;
    const db = await getDb();
    console.log("%cservice-worker", logColors, { idb, db });
    const toNotify = await getToNotifyNow(matchValues);
    console.log("%cservice-worker", logColors, { toNotify });
    const toNot0 = toNotify[0];
    let msg = "No expired reminders found";
    if (toNot0) {
        displayExpiredLongTimeNotification(toNot0);
        msg = "Found expired long time reminder";
    }
    // postMessage
    const data = { text: msg }
    broadcastToClients(data);
}
function displayNotificationFromRecord(expiredRecord, timerInfo) {
    console.log("%cdisplayNotificationFromRecord", logColors, { expiredRecord, timerInfo });
    const title = `(${timerInfo}) ${expiredRecord.title}`;
    const body = expiredRecord.desc;
    const encodedKey = decodeURIComponent(expiredRecord.key);
    const encodedTimerInfo = decodeURIComponent(timerInfo);
    const url = `${location.protocol}//${location.host}/share.html?key=${encodedKey}&timerInfo=${encodedTimerInfo}`;
    console.log("%ckey", "color:red; font-size:20px;", { url });

    const displayed = displayNotification(title, body, url);
    console.log("%cwas displayed", logColors, { displayed });
}

async function displayExpiredLongTimeNotification(objExpired) {
    const { expiredRecord, expiredTimers } = objExpired;
    // const href = location.href;
    console.log("%cdisplayExpiredLongTimeNotification", logColors, { objExpired, expiredRecord, expiredTimers });
    const timerInfo = expiredTimers[0].txtLength;

    displayNotificationFromRecord(expiredRecord, timerInfo);
    // FIX-ME: Move to db-fc4i.js
    // Save that we have notified:
    const recTimers = expiredRecord.timers;
    // {msDelay, msWhen, txtLength}
    // Change sign of msDelay when notification is sent.
    // There should only be one timer in expiredTimers now
    if (expiredTimers.length !== 1) throw Error('expiredTimers.length !== 1');
    const msDelayNotified = expiredTimers[0].msDelay;
    for (let i = 0; i < recTimers.length; i++) {
        recT = recTimers[i];
        if (recT.msDelay == msDelayNotified) {
            recT.msDelay = -recT.msDelay;
        }
    }
    // const db = await getDb();
    // const res = await db.put(idbStoreName, expiredRecord);
    // console.log("%cService Worker stored notification done", logColors, { res });
    console.log("%cService Worker stored notification done", logColors);
}
self.addEventListener('notificationclick', (evt) => {
    console.log("%cService Worker notificationclick", logColors, { evt });
    if (!evt.notification.data.action) {
        // Was a normal notification click
        console.log('%cNotification Click.', logColors);
        return;
    }
    switch (evt.notification.data.action) {
        case 'display-url':
            const url = evt.notification.data.url;
            console.log(`%cDisplay url ${url}`, logColors);
            clients.openWindow(url);
            break;
        default:
            console.log(`%cUnknown action clicked: '${evt.action}'`, logColors);
            break;
    }
});


let tmrCheck;

// process.on('uncaughtException', function (err) { console.log("%cuncaughtException in service worker", logColors, { err }); });

let tmrAutoCheck;
const adjustTmrAutoCheck = async () => {
    return;
    // throw Error("adjustTmrAutoCheck ")
    console.log("%cadjustTmrAutoCheck", logColors);
    // const db = await getDb();
    // const keyRec = await db.get(idbStoreName, key);
    const recAutoReminders = await getSavedDialogValue();
    const time = recAutoReminders.time;
    const hr = time.slice(0, 2);
    const mn = time.slice(3, 5);
    const now = new Date();
    const nowTime = `${now.getHours()}:${now.getMinutes()}`;
    const wdToday = now.getDay();
    let waitDays;
    for (let j = 0; j < 7; j++) {
        const wd = (j + wdToday) % 7;
        const wdActive = recAutoReminders[wd];
        if (wdActive) {
            if (j == 0) { if (nowTime > time) continue; }
            waitDays = j;
            break;
        }
    }
    if (tmrAutoCheck) clearTimeout(tmrAutoCheck.tmr);
    tmrAutoCheck = undefined;
    if (waitDays == undefined) {
        broadcastToClients({ text: `Saved your preferences. Will not check for reminders.` })
        return;
    }
    // https://stackoverflow.com/questions/563406/how-to-add-days-to-date
    const dateCheck = new Date(now);
    dateCheck.setDate(dateCheck.getDate() + waitDays);
    dateCheck.setHours(hr);
    dateCheck.setMinutes(mn);
    console.log(`%cCheck at: ${dateCheck}`, "font-size:20px");

    // const delay = dateCheck.getTime() - now.getTime();
    const msDelay = 10 * 1000;

    tmr = setTimeout(checkToNotify, msDelay)
    const isoTime = dateCheck.toISOString();
    tmrAutoCheck = { tmr, isoTime };
    broadcastToClients({ text: `Saved your preferences. Will check for reminders ${toOurTime(dateCheck)}` })
}
const restartAutoCheck = (() => {
    let tmr;
    const delayMs = 2000; // FIXME:
    return (clientPort) => {
        console.log("%crestartCheckAutoCheck", logColors, { clientPort });
        clearTimeout(tmr);
        const promise = new Promise((resolve, reject) => {
            tmr = setTimeout(function () {
                // throw Error("error test 0.5");
                try {
                    // throw new Error('error!');
                    // checkSave();
                    // throw Error("error test 1");
                    adjustTmrAutoCheck();
                    resolve(); // if the previous line didn't always throw

                } catch (e) {
                    reject(e)
                }
            }, 300)
        })
        promise.catch(error => {
            console.log("%checkSave() error)", logColors, { error });
            throw error;
        });
    }
})();

let tmrKeepalive;
self.addEventListener("message", errorHandlerAsyncEvent(async evt => {
    // FIX-ME: Do something when ping/keyChanged during login???
    // https://github.com/firebase/firebase-js-sdk/issues/1164
    if (evt.data?.eventType == "ping") return;
    if (evt.data?.eventType == "keyChanged") return;

    let msgType = "(NO TYPE)";
    if (evt.data) {
        msgType = evt.data.type;
    }
    console.log("%cservice-worker message", logColors, { evt, msgType });
    if (evt.data) {
        switch (msgType) {
            case "TEST_TIMER":
                const seconds = evt.data.seconds;
                const stop = seconds < 1;
                let msKeepalive = evt.data.interval || 0;
                msKeepalive = Math.max(msKeepalive, 1000);
                const msNowStart = Date.now();
                console.log("%cTEST_TIMER", "color:red", { seconds, msKeepalive });
                const wasRunning = !tmrKeepalive;
                clearInterval(tmrKeepalive);
                tmrKeepalive = undefined;
                if (stop) {
                    sendKeepalive("STOP");
                    return;
                }
                function sendKeepalive(val) {
                    const msElapsed = Date.now() - msNowStart;
                    const sElapsed = Math.floor(msElapsed / 1000);
                    const data = {
                        type: "keepAliveCounter",
                        counterValue: val,
                        total: seconds,
                        sElapsed
                    }
                    try {
                        broadcastToClients(data);
                    } catch (err) {
                        console.log(err);
                    }
                }
                let keepaliveValue = 0;
                sendKeepalive("START");
                tmrKeepalive = setInterval(() => {
                    if (!tmrKeepalive) return;
                    keepaliveValue += Math.floor(msKeepalive / 1000);
                    let sendWhat = keepaliveValue;
                    if (keepaliveValue >= seconds) {
                        sendWhat = "DONE Now";
                        clearInterval(tmrKeepalive);
                        tmrKeepalive = undefined;
                    }
                    console.log("keepalive", keepaliveValue, sendWhat);
                    try {
                        sendKeepalive(sendWhat);
                    } catch (err) {
                        const err4send = `in setIntervall (${sendWhat}): ${err}`;
                        sendKeepalive(err4send);
                    }
                }, msKeepalive);
                function testTimerShow() {
                    clearInterval(tmrKeepalive);
                    const title = `TEST_TIMER seconds=${seconds}`;
                    console.log("%cdisplayNotification", logColors, { title });
                    try {
                        sendKeepalive("DONE");
                        const time = toOurTime(new Date());
                        const obj = { seconds, time };
                        setLastTestTimer(obj);
                    } catch (err) {
                        console.log({ err });
                        localStorage.setItem(keyDone, "error");
                        const err4send = `in DONE: ${err}`;
                        sendKeepalive(err4send);
                    }
                }
                // if (seconds > 0) setTimeout(testTimerShow, seconds * 1000);
                break;
            case "RESTART_AUTO_REMINDERS":
                // throw Error("error test -1");
                // evt.ports[0].postMessage(SW_VERSION);
                const thisClientPort = evt.ports[0];
                // thisClientPort.postMessage("before restartAutoCheck");
                restartAutoCheck(thisClientPort);
                break;
            case "CHECK_NOTIFY":
                const msDelay = evt.data.msDelay;
                const matchValues = evt.data.matchValues;
                console.log("%cservice-worker message", logColors, { matchValues });
                clearTimeout(tmrCheck);
                tmrCheck = setTimeout(() => { checkToNotify(matchValues); }, msDelay)
                break;
            case "NOTIFY_SPECIFIC":
                {
                    return;
                    // const msDelay = evt.data.msDelay;
                    // const lbl = evt.data.lbl;
                    // const key = evt.data.key;
                    // const afterMinutes = evt.data.afterMinutes;
                    // const isShort = evt.data.isShort;
                    const { msDelay, lbl, key, afterMinutes, isShort } = evt.data;
                    console.log("%cservice-worker NOTIFY_SPECIFIC", logColors, { msDelay, key, afterMinutes });
                    const db = await getDb();
                    const keyRec = await db.get(idbStoreName, key);
                    const notifySpecific = () => {
                        // displayNotificationFromRecord(keyRec, `After ${afterMinutes} minutes`);
                        displayNotificationFromRecord(keyRec, `After ${lbl}`);
                        // FIX-ME: consistency, mark long time reminders done here:
                        if (isShort) {
                            deleteShortTimer(key);
                        }
                    }
                    setTimeout(notifySpecific, msDelay);
                }
                break;
            case 'GET_VERSION':
                // https://web.dev/two-way-communication-guide/
                evt.ports[0].postMessage(SW_VERSION);
                break;
            case 'SKIP_WAITING':
                // https://developer.chrome.com/docs/workbox/handling-service-worker-updates/
                self.skipWaiting();
                break;
            default:
                console.error("Unknown message data.type", { evt });
        }
    }
}));


////////////////////////////////////////////////////////////////////////
//========== Common ====================================================



// https://stackoverflow.com/questions/38168276/navigator-serviceworker-controller-is-null-until-page-refresh
// Panic testing!
/*
self.addEventListener("install", (evt) => {
    // console.warn("service-worker install event");
    evt.waitUntil(self.skipWaiting()); // Activate worker immediately
});
*/
// https://stackoverflow.com/questions/70331036/why-service-workers-fetch-event-handler-not-being-called-but-still-worked
self.addEventListener("activate", (evt) => {
    console.warn("service-worker activate event");
    evt.waitUntil(self.clients.claim()); // Become available to all pages
});


// Notification seems to be not available here???
// const greeting = new Notification('Hi, I am web worker');

function displayNotification(title, body, url) {
    // https://stackoverflow.com/questions/29774836/failed-to-construct-notification-illegal-constructor
    const action = "display-url";
    const data = { url, action }
    const tag = "Flashcard 4 Internet";
    const icon = "/img/192.png";
    const options = {
        body, data, tag, icon
        // silent: true,
    }
    if (Notification.permission !== "granted") {
        console.error("Notification requested but not permitted");
        return false;
    }
    console.log("%cdisplayNotification", logColors, { title, options });
    self.registration.showNotification(title, options);
    return true;
}

/*
addEventListener('fetch', (event) => {
    // console.log("our fetch");
    // Prevent the default, and handle the request ourselves.
    event.respondWith((async () => {
        // Try to get the response from a cache.
        const cachedResponse = await caches.match(event.request);
        // Return it if we found one.
        if (cachedResponse) return cachedResponse;
        // If we didn't find a match in the cache, use the network.
        const er = event.request;
        const u = new URL(er.url);
        if (u.hostname == location.hostname) {
            // console.log({ er, u });
        }
        return fetch(event.request);
    })());
});
*/

