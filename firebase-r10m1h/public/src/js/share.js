"use strict";
console.log("here is share.js");

// https://developer.chrome.com/articles/web-share-target/
// NOTE: This will currently only work in Chrome on Android!

const secMs = 1000;
const minMs = secMs * 60;
const hourMs = minMs * 60;
const dayMs = hourMs * 24;
const weekMs = dayMs * 7;
const monthMs = dayMs * 30;
const yearMs = dayMs * 365;

const tzMin = new Date().getTimezoneOffset();
const tzMs = tzMin * 60 * 1000;
function toLocalISOString(date) { return new Date(date.getTime() - tzMs).toISOString(); }
function toOurTime(date) { return toLocalISOString(date).slice(0, -8).replace("T", " "); }
const today = toOurTime(new Date()).slice(0, 10);
function isToday(ourTime) { return ourTime.slice(0, 10) == today; }
const tomorrow = toOurTime(new Date(new Date().getTime() + dayMs)).slice(0, 10);
function isTomorrow(ourTime) { return ourTime.slice(0, 10) == tomorrow; }
const yesterday = toOurTime(new Date(new Date().getTime() - dayMs)).slice(0, 10);
function isYesterday(ourTime) { return ourTime.slice(0, 10) == tomorrow; }
function isOlderThan(dateOrString, ms) {
    const thatDate = new Date(dateOrString);
    const now = new Date();
    const msDiff = now - thatDate;
    return msDiff > ms;
}
function isMoreThanAnHourAgo(dateOrString) { return isOlderThan(dateOrString, hourMs); }
function isMoreThanADayAgo(dateOrString) { return isOlderThan(dateOrString, dayMs); }
function isMoreThanAWeekAgo(dateOrString) { return isOlderThan(dateOrString, weekMs); }
function isMoreThanAMonthAgo(dateOrString) { return isOlderThan(dateOrString, monthMs); }

function getTodayBorder() {
    const d = new Date();
    // 6 in the morning, local time. setHours is local time aware!
    d.setHours(6);
    d.setMinutes(0);
    d.setSeconds(0);
    return d.toISOString();
}
function getYesterdayBorder() {
    const d = new Date(new Date().getTime() - dayMs);
    // 6 in the morning, local time. setHours is local time aware!
    d.setHours(6);
    d.setMinutes(0);
    d.setSeconds(0);
    return d.toISOString();
}
function getWeekBorder() {
    const d = new Date(new Date().getTime() - weekMs);
    return d.toISOString();
}
function getMonthBorder() {
    // const d = new Date(new Date().getTime() - monthMs);
    const d = new Date(- monthMs);
    return d.toISOString();
}
function get3MonthBorder() {
    // const d = new Date(new Date().getTime() - 3 * monthMs);
    const d = new Date(- 3 * monthMs);
    return d.toISOString();
}
function getYearBorder() {
    // const d = new Date(new Date().getTime() - yearMs);
    const d = new Date(- yearMs);
    return d.toISOString();
}
function getNoBorder() {
    const d = new Date(- 1000 * yearMs);
    return d.toISOString();
}

const keyAndTimes = {}
const keyAndTimesOrder = [];
const addKeyTime = (label, timeBorder) => {
    keyAndTimes[label] = {
        timeBorder,
        items: [],
        divContainer: mkElt("div", { class: "older-rem-container" }),
    }
    keyAndTimesOrder.push(label);
}
addKeyTime("Today", getTodayBorder());
addKeyTime("Yesterday", getYesterdayBorder());
addKeyTime("Last Week", getWeekBorder());
addKeyTime("Last Month", getMonthBorder());
addKeyTime("Last 3 Months", get3MonthBorder());
addKeyTime("Last Year", getYearBorder());
addKeyTime("Older", getNoBorder());
// console.log({ keyAndTimesOrder });
// console.log({ keyAndTimes });

/*
function dateMidnight() {
    const mn = new Date();
    mn.setHours(24);
    mn.setMinutes(59 + tzMin);
    mn.setUTCSeconds(59);
    return mn;
}
*/
function formatNiceTime(dateWhenTo) {
    const whenOurTime = toOurTime(dateWhenTo);
    let showWhen = whenOurTime;
    if (isToday(whenOurTime)) {
        showWhen = "Today " + whenOurTime.slice(-5);
    } else if (isTomorrow(whenOurTime)) {
        showWhen = "Tomorrow " + whenOurTime.slice(-5);
    } else if (isYesterday(whenOurTime)) {
        showWhen = "Yesterday " + whenOurTime.slice(-5);
    }
    return showWhen;
}


const defaultTimers = {
    "20 seconds": 1000 * 20,
    "10 minutes": -minMs * 10,
    "1 hour": -hourMs,
    "1 day": dayMs,
    "1 week": weekMs,
    "2 months": monthMs * 2,
    "1 year": yearMs,
};

function seconds2ymdhms(sec) {
    const d = new Date(sec * 1000);
    console.log(d.toISOString());
    const yy = d.getUTCFullYear() - 1970;
    const mo = d.getUTCMonth();
    const dd = d.getUTCDate();
    const hh = d.getUTCHours();
    const mi = d.getUTCMinutes();
    const ss = d.getUTCSeconds();
    return { yy, mo, dd, hh, mi, ss }
}
async function askForReminders(onlyMatched) {
    const wb = await getWorkbox();
    const matchValues = onlyMatched ? getHomeSearchValues() : undefined;
    wb.messageSW({ type: "CHECK_NOTIFY", msDelay: 2000, matchValues });
}
async function askForNotifySpecific(key, msDelay, afterMinutes, lbl, isShort) {
    // const msDelay = 10 * 1000;
    // const idEntry = "dummy";
    const wb = await getWorkbox();
    wb.messageSW({ type: "NOTIFY_SPECIFIC", msDelay, key, afterMinutes, lbl, isShort });
}

function dataRecordFieldsUnsaved() {
    return ["text", "title", "url"];
}
function dataRecordFieldsSaved() {
    return ["confRem", "flashcards", "images", "key", "text", "timers", "title", "url"];
}
function dataRecordAbitOldFields() {
    return ["confRem", "images", "key", "text", "timers", "title", "url"];
}
function dataRecordOldFields() {
    return ["images", "key", "text", "timers", "title", "url"];
}
function dataRecordVeryOldFields() {
    return ["key", "text", "timers", "title", "url"];
}
function checkRecordFields(record) {
    const keys = Object.keys(record).sort();
    const isUnsaved = !keys.includes("key");
    const comparewith = isUnsaved ? dataRecordFieldsUnsaved() : dataRecordFieldsSaved();
    const jk = JSON.stringify(keys);
    if (jk === JSON.stringify(comparewith)) return;
    if (jk === JSON.stringify(["confRem", "flashcards", "images", "key", "tags", "text", "timers", "title", "url"])) return;
    if (jk === JSON.stringify(["confRem", "flashcards", "images", "key", "text", "timers", "title", "url"])) return;
    // if (jk === JSON.stringify(["confRem", "images", "key", "tags", "text", "timers", "title", "url"])) return;
    // if (JSON.stringify(keys) === JSON.stringify(dataRecordAbitOldFields())) return;
    if (jk === JSON.stringify(["confRem", "images", "key", "text", "timers", "title", "url"])) return;
    // if (JSON.stringify(keys) === JSON.stringify(dataRecordOldFields())) return;
    if (jk === JSON.stringify(["images", "key", "text", "timers", "title", "url"])) return;
    // if (JSON.stringify(keys) === JSON.stringify(dataRecordVeryOldFields())) return;
    if (jk === JSON.stringify(["key", "text", "timers", "title", "url"])) return;
    throw Error(`Some bad key in record: ${keys}`);
}

async function dialog10min1hour(eltPrevFocused) {
    const modMdc = await import("/src/js/mod/util-mdc.js");
    let key;
    if (document.getElementById("page-home")) {
        if (eltPrevFocused) {
            const eltUnsavedMarker = eltPrevFocused.classList.contains("unsaved-marker-container")
                ?
                eltPrevFocused
                :
                eltPrevFocused.closest(".unsaved-marker-container");
            const eltRem = eltUnsavedMarker?.querySelector(".container-remember");
            key = eltRem?.dataset.key;
        } else {
            /*
            const subjCards = [...document.querySelectorAll(".subject-card:focus-within")];
            if (subjCards.length == 0) throw Error("no items focused");
            if (subjCards.length > 1) throw Error("More than 1 items focused");
            const eltSc = subjCards[0];
            const eltRem = eltSc.querySelector(".container-remember");
            key = eltRem.dataset.key;
            */
        }
    } else {
        const arrEltRem = [...document.querySelectorAll(".container-remember")];
        switch (arrEltRem.length) {
            case 0:
                break;
            case 1:
                const eltRem = arrEltRem[0];
                key = eltRem.dataset.key;
                break;
            default:
                throw Error(`${arrEltRem.length} items, expeced 0 or 1`);
        }
    }
    // console.log({ key });
    const rec = key ? await getDbKey(key) : undefined;
    const title = rec?.title;
    let dlg;

    // btn10s
    let divManual;
    if (key) {
        divManual = await mkDivManualReminders(() => key);
    } else {
        // divManual = mkElt("div", undefined, "NONE SEL");
    }
    const divManualContainer = mkElt("div");

    const btnAsk10min = modMdc.mkMDCbutton("10 min", "outlined");
    btnAsk10min.addEventListener("click", errorHandlerAsyncEvent(async evt => {
        // const msDelay = 1000;
        const msDelay = 1 * minMs;
        // const msDelay = 10 * minMs;
        // sendSpecificReminderRequest(msDelay);
        askForNotifySpecific(key, msDelay);
        const modMdc = await import("/src/js/mod/util-mdc.js");
        modMdc.mkMDCsnackbar("Will send reminder in 10 minutes", 6000);
        dlg.mdc.close();
    }));
    const btnAsk1hour = modMdc.mkMDCbutton("1 hour", "outlined");
    btnAsk1hour.addEventListener("click", errorHandlerAsyncEvent(async evt => {
        // const msDelay = 1000;
        const msDelay = 6 * minMs;
        // const msDelay = 60 * minMs;
        // sendSpecificReminderRequest(msDelay);
        askForNotifySpecific(key, msDelay);
        const modMdc = await import("/src/js/mod/util-mdc.js");
        modMdc.mkMDCsnackbar("Will send reminder in 1 hour", 6000);
        dlg.mdc.close();
    }));

    const inpMinutes = modMdc.mkMDCtextFieldInput("minutes-input", "text");
    inpMinutes.required = true;
    const fieldMinutes = modMdc.mkMDCtextFieldOutlined("After minutes", inpMinutes);
    const btnMinutes = modMdc.mkMDCbutton("Remind", "raised");
    btnMinutes.addEventListener("click", errorHandlerAsyncEvent(async evt => {
        const modMdc = await import("/src/js/mod/util-mdc.js");
        const raw = inpMinutes.value;
        // FIX-ME: Any possible security flaws??
        if (!raw.match(/^[0-9 +/*.()]+$/)) {
            modMdc.mkMDCdialogAlert("Can't compute value.");
            return;
        }
        let minutes;
        try {
            const f = new Function(`"use strict;"; return ${raw}`);
            minutes = f();
        } catch (err) {
            console.error(err);
            modMdc.mkMDCdialogAlert("Sorry, could not compute that.")
            return;
        }
        /*
        if (!inpSeconds.validity.valid) {
            modMdc.mkMDCdialogAlert("Please specify number of seconds to delay reminder.");
            return;
        }
        const seconds = inpSeconds.value;
        */
        const msDelay = 1000 * 60 * minutes;
        // sendSpecificReminderRequest(msDelay);
        askForNotifySpecific(key, msDelay);
        const m = Math.floor(minutes);
        const s = Math.floor((minutes - m) * 60);
        console.log({ m, s });
        modMdc.mkMDCsnackbar(`Will send reminder in ${m}m ${s}s`, 6000);
        dlg.mdc.close();
    }));

    const s = [
        "display: flex",
        "flex-direction: row",
        "gap: 5px"
    ].join(";");
    const divSpecific = mkElt("div", undefined, [
        mkElt("p", undefined, mkElt("b", undefined, title)),
        mkElt("p", { style: s }, [btnAsk10min, btnAsk1hour]),
        mkElt("p", { style: s }, [fieldMinutes, btnMinutes]),
        mkElt("p", { style: "font-style:italic" },
            `NOTICE: If you close this app before you get this
                reminder you will not get it. (See menu "About" for explanation.)`
        ),
    ]);
    // const divMaybeSpecific = mkElt("div");
    if (key) {
        // divMaybeSpecific.appendChild(divSpecific);
        const imgBlob = rec.images[0];
        // function mkImageThumb(blob)
        const eltImg = imgBlob ? mkImageThumb(imgBlob) : "";
        if (eltImg.tagName) eltImg.style.marginRight = "10px";
        divManualContainer.appendChild(mkElt("p", undefined, [
            mkElt("div", undefined, "Item: "),
            eltImg,
            mkElt("b", undefined, title)
        ]));
        divManualContainer.appendChild(divManual);
    } else {
        if (document.querySelector(".container-remember")) {
            divManualContainer.appendChild(mkElt("p", undefined, `No item selected.`));
        } else {
            if (document.getElementById("page-home")) {
                divManualContainer.appendChild(mkElt("p", undefined, `No item selected.`));
            } else {
                divManualContainer.appendChild(mkElt("p", undefined, `No items here.`));
            }
        }
    }
    const isHomePage = !!document.getElementById("page-home");
    const isSearching =
        isHomePage
        &&
        true === document.getElementById("div-h-your-items").classList.contains("is-searching");
    const chkOnlyMatched = modMdc.mkMDCcheckboxInput("chk-only-matched");
    const eltOnlyMatched = await modMdc.mkMDCcheckboxElt(chkOnlyMatched, "Check only matched items");
    const chkLabel = chkOnlyMatched.closest("label");
    console.log({ chkLabel });
    chkLabel.classList.add("mdc-chkbox-label-helper");
    const pOnlyMatched = mkElt("p", undefined, [
        eltOnlyMatched,
    ]);
    if (!isSearching) pOnlyMatched.style.display = "none";
    const btnCheckNow = modMdc.mkMDCbutton("Check now", "raised");
    btnCheckNow.addEventListener("click", errorHandlerAsyncEvent(async evt => {
        const onlyMatched = chkOnlyMatched.checked;
        console.log({ chkOnlyMatched, onlyMatched });
        askForReminders(onlyMatched);
        const modMdc = await import("/src/js/mod/util-mdc.js");
        modMdc.mkMDCsnackbar("Looking for expired reminders...");
        dlg.mdc.close();
    }));
    const body = mkElt("div", { class: "body-reminder-dialog" }, [
        mkElt("h2", undefined, "Long time reminders"),
        pOnlyMatched,
        mkElt("p", undefined, btnCheckNow),
        mkElt("hr"),
        mkElt("h2", undefined, "Short time reminder for item"),
        // divManual,
        divManualContainer,
        // divMaybeSpecific,
        mkElt("hr"),
        mkElt("p", undefined, "Reminders within a day or later works differently:"),
        mkElt("ul", undefined, [
            mkElt("li", undefined,
                `You get a short time reminder for a selected item (within a day)
                by clicking on a button above.`
            ),
            mkElt("li", undefined,
                `Long time reminders (after a day or more)
                are setup automatically for all items.
                (But you have to ask for them!)`
            )
        ]),

    ]);
    dlg = await modMdc.mkMDCdialogAlert(body, "Close");
}

async function mkEltInputRemember(record, headerTitle, saveNewNow) {
    const modMdc = await import("/src/js/mod/util-mdc.js");
    const divPasteImage = mkElt("div", { class: "div-paste-image" });
    function addImageCard(toDiv, blob, extraClass, debugInfo) {
        const btnDeleteImage = modMdc.mkMDCiconButton("delete_forever");
        btnDeleteImage.classList.add("image-delete");
        btnDeleteImage.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            // FIX-ME: ask
            eltImg.remove();
            restartButtonStateTimer();
        }));
        const eltImg = mkElt("span", { class: "image-bg-contain image-bg-size mdc-card" }, btnDeleteImage);
        if (debugInfo) {
            eltImg.style.position = "relative"
            const divDebug = mkElt("div", { class: "div-image-bg-debug" }, debugInfo);
            eltImg.appendChild(divDebug);
        }
        const urlBlob = URL.createObjectURL(blob);
        const urlBg = `url(${urlBlob})`;
        // console.log({ blob, urlBlob });
        eltImg.style.backgroundImage = urlBg;
        eltImg.dataset.urlBlob = urlBlob;
        if (extraClass) eltImg.classList.add(extraClass);
        toDiv.appendChild(eltImg);
        return eltImg;
    }

    if (record) checkRecordFields(record);

    // const eltRemember = mkElt("div", { class: "container-remember mdc-card" });
    const eltRemember = mkElt("div", { class: "container-remember" });
    if (headerTitle !== undefined) {
        const header = mkElt("h2", { class: "unsaved-marker" }, headerTitle);
        eltRemember.classList.add("unsaved-marker-container");
        eltRemember.classList.add("mdc-card");
        eltRemember.appendChild(header);
    }

    const divBannerTitle = mkElt("div", { class: "unsaved-marker has-title" }, "(title)");
    const btnBannerDelete = modMdc.mkMDCiconButton("delete_forever");
    btnBannerDelete.classList.add("mdc-theme--secondary-bg");
    btnBannerDelete.addEventListener("click", errorHandlerAsyncEvent(async evt => {
        handleEvtDeleteRem(evt);
    }));
    const firstImageBlob = record?.images ? record.images[0] : null;
    const eltImg = firstImageBlob ? mkImageThumb(firstImageBlob) : "";
    const divBanner = mkElt("h3", { class: "rem-banner-title" }, [
        eltImg,
        divBannerTitle, btnBannerDelete]);
    if (firstImageBlob) divBanner.classList.add("has-image");
    eltRemember.appendChild(divBanner);

    async function handleEvtDeleteRem(evt) {
        const btn = evt.target;
        const keySaved = getCreatedEltTime();
        const keyCard = btn.closest(".container-remember");
        const subjectCard = btn.closest(".subject-card");
        const didDelete = await deleteEntry(keySaved, keyCard);
        if (!didDelete) return;
        subjectCard?.remove();
    }

    // const divSliConfidence = mkElt("div");

    const sliConfidence = await modMdc.mkMDCslider(1, 5, 1, 1, "Confidence", onChangeSlider, onInputSlider, false);
    // const sliConfidence = await mkSliderInContainer(divSliConfidence, 1, 5, 1, 1, "Confidence", onChangeSlider, onInputSlider, false);

    sliConfidence.classList.add("confidence-slider");
    sliConfidence.classList.add("mdc-my-slider-colors-fix");
    const indStatus = mkStatusIndicator(5, "height");
    waitUntilDisplayed(sliConfidence).then(async () => {
        const mdc = await sliConfidence.myPromMdc;
        mdc.setDisabled(true);
    });

    function onChangeSlider(evt) {
        console.log("onChange", evt);
        const val = sliConfidence.myMdc.getValue();
        indStatus.mySet(val);
        restartButtonStateTimer();
    }

    function onInputSlider(evt) { console.log("onInput", evt); }

    const btnEditConfidence = modMdc.mkMDCiconButton("edit");
    btnEditConfidence.classList.add("btn-edit-item-confidence");
    btnEditConfidence.addEventListener("click", evt => {
        waitUntilDisplayed(sliConfidence).then(async () => {
            const mdc = await sliConfidence.myPromMdc;
            const val = mdc.getValue();
            const q =
                val == 1 ? "Are you now more confident you will remember this?"
                    :
                    (val == 5 ? "Are you now less confident you will remember this?"
                        :
                        "Have your confidence about remembering this changed?"
                    );
            const dlg = modMdc.mkMDCdialogConfirm(q, "yes", "no");
            const yn = await dlg;
            console.log({ yn });
            if (!yn) return;
            function addBtnAgain() {
                btnEditConfidence.style.display = "block"
                mdc.setDisabled(true);
            }
            mdc.setDisabled(false);
            btnEditConfidence.style.display = "none";
            setTimeout(() => { addBtnAgain(); }, 10 * 1000);
        });
    });
    const divStatus = mkElt("div", { class: "div-confidence-status" },
        [indStatus, btnEditConfidence, sliConfidence]
        // [indStatus, btnEditConfidence, divSliConfidence]
    );
    const divSlider = mkElt("div", { class: "mdc-card card-confidence-slider" }, [
        divStatus,
        "Will you remember this next week?",
    ]);
    eltRemember.appendChild(divSlider);
    // We can't wait here because slider is not yet in DOM
    (async () => {
        const mdcSlider = sliConfidence.myMdc || await sliConfidence.myPromMdc;
        let confVal = record?.confRem || 1;
        // FIX-ME:
        confVal = Math.min(confVal, 5);
        confVal = Math.max(confVal, 1);
        mdcSlider.setValue(confVal);
        indStatus.mySet(confVal);
    })();
    // mkdivman

    // const msNow = new Date().getTime();
    const msNow = Date.now();
    function getRecordCreated() {
        if (!record?.key) return;
        const strIsoTime = record.key;
        const date = new Date(strIsoTime);
        return date.getTime();
    }
    const createdMs = getRecordCreated() || msNow;

    // const divManualReminders = await mkDivManualReminders(getCreatedEltTime);
    // eltRemember.appendChild(divManualReminders);

    const thCreated = mkElt("th", { colspan: 3 });
    /*
    function sendSpecificReminderRequest(msDelay) {
        const key = getCreatedEltTime();
        console.log("%csendSpecificReminderRequest", "background: yellow", { msDelay, key });
        // wb.messageSW({ type: "NOTIFY_SPECIFIC", msDelay, key });
        askForNotifySpecific(key, msDelay);
    }
    */

    // const btnManualReminder = modMdc.mkMDCbutton("Remind me", "outlined");
    // btnManualReminder.addEventListener("click", errorHandlerAsyncEvent(async evt => { dialog10min1hour(); }));
    /*
    function mkDivManualReminders() {
        function afterMinutes(minutes) {
            const key = getCreatedEltTime();
            const date10min = new Date(Date.now() + minutes * minMs);
            addShortTimer(key, date10min, minutes);
        }
        const btn10minutes = modMdc.mkMDCbutton("10 min", "raised");
        btn10minutes.style.textTransform = "none";
        btn10minutes.addEventListener("click", errorHandlerAsyncEvent(async evt => { afterMinutes(10); }));
        const btn1hour = modMdc.mkMDCbutton("1 h", "raised");
        btn1hour.style.textTransform = "none";
        btn1hour.addEventListener("click", errorHandlerAsyncEvent(async evt => { afterMinutes(60); }));
        const divManualReminders = (mkElt("div", undefined, [
            // mkElt("p", undefined, ` Remind me about this item after: `),
            mkElt("div", { class: "div-short-buttons" }, [
                mkElt("span", undefined, "Remind me in:"),
                btn10minutes,
                btn1hour,
                // btnManualReminder,
            ])
        ]));
        return divManualReminders;
    }
    */
    // const divOldManualReminders = await mkDivManualReminders(getCreatedEltTime);
    const divHowReminders = mkElt("div", undefined, [
        // divOldManualReminders,
        mkElt("p", undefined, "At the top right there is a button for reminders:"),
        mkElt("p", undefined, mkElt("img", { src: "/img/btn-check-reminders.png", width: "130" })),
    ]);

    const divTimers = mkElt("div", { class: "timers-container" }, [divHowReminders]);
    const icoCallToAction = modMdc.mkMDCicon("call_to_action");
    icoCallToAction.classList.add("mdc-theme--primary");
    const detTimers = mkElt("details", { class: "det-timers mdc-card" }, [
        mkElt("summary", { class: "no-closed-marker" }, [
            icoCallToAction,
            " Reminders"
        ]),
        divTimers
    ]);

    //// Images
    // Iframes can't be used because of CORS
    // Google Photos app can't be used because there is no easy way to get a direct link to an image.
    // However the web version at https://photos.google.com/ can be used.
    // Images on web pages can be long pressed and copied.
    //
    // And here is how to take care of paste (but you can't use Gboard on this):
    // https://htmldom.dev/paste-an-image-from-the-clipboard/
    // Handle the `paste` event
    const divPasteDebug = mkElt("div", { class: "div-paste-debug" }, mkElt("h3", undefined, "paste debug"));
    let debugPasteLineOn = true;
    function debugPasteLine(txt) {
        if (!debugPasteLineOn) return;
        divPasteDebug.appendChild(mkElt("div", undefined, txt));
    }
    function addImageInput() {
        if (record) {
            const images = record.images;
            if (images) {
                images.forEach(imageBlob => {
                    addImageCard(divPasteImage, imageBlob, "blob-to-store");
                });
            }
        }
        // I do not know if this could be useful??
        // document.addEventListener('paste', pasteImageHandler);
        function pasteImageHandler(evt) {
            // modMdc.mkMDCsnackbar("pasteImageHandler", 10 * 1000);
            debugPasteLine("evt 1");
            // Get the data of clipboard
            const clipboardItems = evt.clipboardData.items;
            debugPasteLine("evt 2");
            const items = [].slice.call(clipboardItems).filter(function (item) {
                // Filter the image items only
                return item.type.indexOf('image') !== -1;
            });
            debugPasteLine("evt 3");
            if (items.length === 0) { return; }

            debugPasteLine("evt 4");
            // const item = items[0];
            // On Windows length is 1, but on Android it is 2???
            const item = items[items.length - 1];
            debugPasteLine(`evt 5, items.length=${items.length}, testing length-1`);
            // Get the blob of image
            const fileBlob = item.getAsFile();
            console.log({ fileBlob });
            debugPasteLine("evt 6");

            const target = evt.target;
            console.log({ target });
            const divPaste = target.closest(".div-paste-image");
            // const eltImage = divPaste.querySelector("img");
            // eltImage.src = URL.createObjectURL(fileBlob);
            const iconWastebasket = modMdc.mkMDCicon("delete_forever");
            const btnDelete = modMdc.mkMDCbutton(iconWastebasket);
            btnDelete.classList.add("image-delete");
            const eltBgImage = mkElt("span", { class: "image-bg-cover" }, btnDelete);
            eltBgImage.classList.add("image-bg-size");
            // const bgStyle = eltBgImage.style;
            // bgStyle.width = "200px";
            // bgStyle.height = "200px";
            // bgStyle.display = "inline-block";
            debugPasteLine("evt 7");
            const urlBlobHelper = URL.createObjectURL(fileBlob);
            debugPasteLine("evt 8");
            eltBgImage.style.backgroundImage = `url(${urlBlobHelper})`;
            divPaste.appendChild(eltBgImage);
        }
        const eltInput = mkElt("input", { type: "text" });
        eltInput.addEventListener("paste", pasteImageHandler);

        // If span is used then an <img> is also inserted in that span
        // const eltSpan = mkElt("span", { contenteditable: true }, "Paste image here");
        // eltSpan.addEventListener("paste", pasteImageHandler);

        // eltRemember.appendChild(divPasteImage);
        // eltRemember.appendChild(divPasteDebug);
        return divPasteDebug;
    }

    function mkDivPasteButton() {
        // const btn = modMdc.mkMDCbutton("Add image", "raised");
        // export function mkMDCfab(eltIcon, title, mini, extendTitle) 
        const iconAdd = modMdc.mkMDCicon("add");
        const btn = modMdc.mkMDCfab(iconAdd, "Add Image", true);
        // btn.classList.add("mdc-theme-secondary");
        btn.classList.add("btn-add-image");
        btn.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            debugPasteLine(`addPasteButton event 0`);
            const clipboardAccessOk = await isClipboardPermissionStateOk();
            if (clipboardAccessOk == false) {
                console.warn({ clipboardAccessOk });
                debugger;
                debugPasteLine(`addPasteButton event 1`);
                return;
            }
            debugPasteLine(`addPasteButton event 2`);
            try {
                // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/read
                // https://web.dev/async-clipboard/
                function alertNoImages() {
                    debugPasteLine(`addPasteButton alertNoImages`);
                    const bodyAlert = mkElt("div", { id: "alert-no-images" }, [
                        mkElt("h2", undefined, "No images found on clipboard."),
                        mkElt("details", undefined, [
                            mkElt("summary", undefined, "Why?"),
                            mkElt("p", undefined, [
                                "The clipboard images may have timed out. ",
                                "Or you have not put any images there yet. "
                            ]),
                            mkElt("p", undefined, [
                                mkElt("i", undefined, "Notice: "),
                                "You must put images there, not image links!"
                            ])
                        ]),
                        mkElt("details", undefined, [
                            mkElt("summary", undefined, "How do you get an image to the clipboard? "),
                            mkElt("p", undefined, [
                                "One simple way is to right click on an image in your web browser. ",
                                "(Long press on a mobile.) ",
                            ]),
                            mkElt("p", undefined, [
                                "However if you have an image in for example Google Photos ",
                                "on your Android mobile it is unfortunately not that simple. ",
                                "There is today (in the beginning of 2023) no direct way to ",
                                "put that image on the clipboard. 🤔",
                            ]),
                            mkElt("p", undefined, [
                                "As a reasonably safe alternative I use this app: ",
                                mkElt("a", { href: "https://scrapbook-pwa.web.app/#/images" }, "Scapbook PWA"),
                                " (That app is, like this app you are using now, a PWA. ",
                                "Essentially a web page. ",
                                "With the added capability to show app as targets when you share a link or image.)"
                            ]),
                        ]),
                    ]);
                    modMdc.mkMDCdialogAlert(bodyAlert);
                }

                let clipboardContents;
                debugPasteLine(`addPasteButton 3`);
                try {
                    clipboardContents = await navigator.clipboard.read();
                    debugPasteLine(`addPasteButton 4`);
                } catch (err) {
                    const errName = err.name;
                    const errMessage = err.message
                    debugPasteLine(`addPasteButton 5, ${errName}, ${errMessage}`);
                    console.error(errName, errMessage);
                    if (errName == "NotAllowedError") {
                        modMdc.mkMDCdialogAlert("Please allow reading clipboard");
                        return;
                    }
                    debugPasteLine(`addPasteButton 6`);
                    // Chrome: errMessage == No valid data on clipboard
                    if (errName == "DataError") { alertNoImages(); return; }
                    debugger;
                    alert(`unknown error: ${errName}, ${errMessage}`);
                    return;
                }
                let foundImages = false;
                debugPasteLineOn = true;
                debugPasteLine(`addPasteButton 7`);
                for (const item of clipboardContents) {
                    // if (!item.types.includes('image/png')) { throw new Error('Clipboard contains non-image data.'); }
                    debugPasteLine(`addPasteButton 7a`);
                    const itemTypes = item.types;
                    console.log("addPasteButton 7a", { item, itemTypes });
                    debugPasteLine(`addPasteButton 7a1`);
                    const imageTypes = itemTypes.filter(t => t.startsWith("image/"));
                    const isArray = Array.isArray(imageTypes);
                    console.log({ imageTypes, isArray });
                    const imageTypesLength = imageTypes.length;
                    debugPasteLine(`addPasteButton 7a2, ${imageTypes}, ${typeof imageTypes}, ${isArray}, ${imageTypesLength}`);
                    if (imageTypes.length == 0) {
                        debugPasteLine(`addPasteButton 7b`);
                        continue;
                    }
                    const it0 = imageTypes[0];
                    debugPasteLine(`addPasteButton 7c, ${imageTypes.length}, ${it0}, ${JSON.toString(it0)}`);
                    const blob = await item.getType(imageTypes[0]);
                    debugPasteLine(`addPasteButton 7d, typeof blob=${typeof blob}, ${blob}`);
                    if (blob == null) {
                        // You do not get here on Windows 10, but on Android, 2023-01-16
                        debugPasteLine(`addPasteButton 7d1, blob==null`);
                        continue;
                    }
                    foundImages = true;
                    const img = new Image();
                    img.src = URL.createObjectURL(blob);
                    // const div = btn.closest(".div-images");
                    const toDiv = divPasteImage;
                    await handleIncomingImage(blob, toDiv);
                    async function handleIncomingImage(blobIn, toDiv) {
                        debugPasteLine(`addPasteButton 8, handleIncomingImage`);
                        console.warn({ blobIn });

                        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
                        // Switch to OffscreenCanvas!
                        // https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas
                        // shrink image:
                        // https://stackoverflow.com/questions/70921457/how-can-i-resize-an-image-in-angular-using-the-canvas
                        let lastQuality;
                        async function resizeImage(imageBlob) {
                            return new Promise((resolve) => {
                                const image = new Image();
                                let imageBlobSize;
                                image.onload = async () => {
                                    const natW = image.naturalWidth;
                                    const natH = image.naturalHeight;
                                    console.log({ image, natW, natH });
                                    debugPasteLine(`imageOnload natW: ${natW}, natH: ${natH}`);
                                    const canvas = document.createElement('canvas');
                                    canvas.height = natH;
                                    canvas.width = natW;
                                    const ctx = canvas.getContext('2d');
                                    if (ctx != null) {
                                        // ctx.drawImage(image, 0, 0, 640, 480);  // <-- draw the right image!
                                        ctx.drawImage(image, 0, 0, natW, natH);  // <-- draw the right image!
                                    }
                                    // .toBlog(callback, type, quality)
                                    // const blob = canvas.toDataURL('image/png', 0.5);
                                    // resolve(blob);   // <-- call it here!
                                    let retBlob;
                                    let blobSize = Number.POSITIVE_INFINITY;
                                    const maxBlobSize = 40 * 1000;
                                    let n = 0;
                                    const nMax = 10;
                                    // let quality = 0.5; // FIX-ME: better start value?
                                    let quality = (() => {
                                        // in png, 2 000 000 => const maxBlobSize = 40 * 1000;
                                        // if (imageBlobSize > 2 * 1000 * 1000) return 0.1; // 3s
                                        // if (imageBlobSize > 2 * 1000 * 1000) return 0.07; // 2.5s
                                        // if (imageBlobSize > 2 * 1000 * 1000) return 0.05; // 1.5-2s
                                        if (imageBlobSize > 2 * 1000 * 1000) return 0.04; // < 1s
                                        // png, 400 000
                                        if (imageBlobSize > 400 * 1000) return 0.4;
                                        return 0.5;
                                    })();
                                    while (++n < nMax && blobSize > maxBlobSize) {
                                        // https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas/convertToBlob
                                        retBlob = await new Promise((resolveToBlob) => {
                                            canvas.toBlob(blob => resolveToBlob(blob), 'image/webp', quality);
                                        });
                                        blobSize = retBlob.size;
                                        lastQuality = quality;
                                        console.log({ retBlob, blobSize, quality });
                                        debugPasteLine(`resize-loop  retBlob:${retBlob}, blobSize:${blobSize}, quality:${quality}`);
                                        quality *= 0.7;
                                    }
                                    resolve(retBlob);
                                };
                                imageBlobSize = imageBlob.size;
                                const imageBlobType = imageBlob.type;
                                console.log({ imageBlob, imageBlobSize, imageBlobType });
                                // debugPasteLineOn = true;
                                debugPasteLine(`imageBlob, imageBlobSize: ${imageBlobSize}, imageBlobType: ${imageBlobType} }`);
                                const urlBlobHelper = URL.createObjectURL(imageBlob);
                                // const urlBg = `url(${urlBlobHelper})`;
                                // image.src = imageURL;
                                image.src = urlBlobHelper
                            });
                        }

                        const origSize = blobIn.size;
                        // addImageCard(toDiv, blobIn, undefined, `Original image (not used, ${(origSize / 1000).toFixed()}kB)`);
                        const startDate = new Date();
                        const blobOut = await resizeImage(blobIn);
                        const msElapsed = (new Date()) - startDate;
                        const sizeIn = blobIn.size;
                        const typeIn = blobIn.type;
                        const sizeOut = blobOut.size;
                        const typeOut = blobOut.type;
                        const shrinked = sizeOut / sizeIn;
                        const msg = `${typeIn} (*${shrinked.toFixed(3)}, ${lastQuality.toFixed(3)}q, ${msElapsed}ms) => ${typeOut}, ${(sizeOut / 1000).toFixed()}kB`;
                        console.log(msg);
                        // const eltSnackbar = modMdc.mkMDCsnackbar(msg, 10 * 1000);
                        // eltSnackbar.style.color = "yellow";
                        const eltNewImage = addImageCard(toDiv, blobOut, "blob-to-store", msg);
                        setTimeout(() => {
                            const bcr = eltNewImage.getBoundingClientRect();
                            if (bcr.bottom < window.innerHeight) return;
                            eltNewImage.scrollIntoView({
                                behavior: "smooth",
                                block: "nearest"
                            }, 10);
                        });
                        restartButtonStateTimer();
                    }
                }
                if (!foundImages) { alertNoImages(); return; }
            } catch (err) {
                const errName = err.name;
                const errMessage = err.message
                console.error(errName, errMessage);
                debugPasteLine(`addPasteButton err 1, ${errName}, ${errMessage}`);
            }
        }));
        const divImages = mkElt("div", { class: "div-images" });
        divImages.appendChild(btn);
        divImages.appendChild(divPasteImage);
        const icoArtTrack = modMdc.mkMDCicon("art_track");
        icoArtTrack.classList.add("mdc-theme--primary");
        const icoPhotoLibrary = modMdc.mkMDCicon("photo_library");
        icoPhotoLibrary.classList.add("mdc-theme--primary");
        const icoHasIndicator = mkHasItemsIndicator();
        const sumImages = mkElt("summary", { class: "no-closed-marker" }, [
            // icoArtTrack,
            icoPhotoLibrary,
            " Images ",
            icoHasIndicator
        ]);
        function addImages() {
            if (record) {
                const images = record.images;
                if (images) {
                    images.forEach(imageBlob => {
                        addImageCard(divImages, imageBlob, "blob-to-store");
                    });
                }
            }
        }
        addImages(); // FIX-ME: delay until opening <details>!

        const detImages = mkElt("details", { class: "images-card mdc-card" }, [
            sumImages,
            divImages
        ])
        return detImages;
    }
    function mkHasItemsIndicator() {
        const icoF1 = modMdc.mkMDCicon("filter_1");
        icoF1.classList.add("has-indicator");
        return icoF1;
    }

    async function mkEltTags() {
        const iconTag = modMdc.mkMDCicon("tag");
        iconTag.classList.add("mdc-theme--primary");
        const icoHasIndicator = mkHasItemsIndicator();
        const eltSummary = mkElt("summary", { class: "no-closed-marker" }, [
            iconTag,
            " Tags ",
            icoHasIndicator
        ]);
        const eltOurTags = mkElt("div", { class: "tags-items" });
        const eltTags = mkElt("div", { class: "elt-tags" }, eltOurTags);
        const detTags = mkElt("details", { class: "mdc-card flashcards-card" }, [
            eltSummary, eltTags
        ]);
        function addToOurTags(tag) {
            // FIX-ME
            const eltTag = mkElt("span", { class: "tag-in-our-tags" }, `#${tag}`);
            eltOurTags.appendChild(eltTag);
        }
        function addOurTags() {
            if (record?.tags) {
                record.tags.forEach(async tag => { addToOurTags(tag) });
            }
        }
        addOurTags();
        const btnAdd = mkBtnAddTag();
        function mkBtnAddTag() {
            const iconAdd = modMdc.mkMDCicon("tag");
            const btnFab = modMdc.mkMDCfab(iconAdd, "Add tag", true);
            btnFab.classList.add("fab-add-flashcard");
            btnFab.addEventListener("click", errorHandlerAsyncEvent(async evt => {
                // const eltTag = mkElt("span", undefined, "#tag");
                // eltTags.insertBefore(eltTag, btnFab)
                const ourOldTags = [];
                updateOurOldTags();
                function updateOurOldTags() {
                    console.log("updateOurOldTags");
                    ourOldTags.length = 0;
                    evt.target.closest(".elt-tags")
                        .querySelector(".tags-items")
                        .querySelectorAll(".tag-in-our-tags")
                        .forEach(span => {
                            const tag = span.textContent.substr(1);
                            ourOldTags.push(tag);
                        });
                }
                const divAllTags = mkElt("div", { class: "tags-list" });

                const dbFc4i = await getDbFc4i();
                let arrAllTags = await dbFc4i.getDbTagsArr();
                const arrUnusedTags = await dbFc4i.getUnusedTags();

                const outlineUnused = "4px dotted yellow";
                const btnDeleteUnused =
                    arrUnusedTags.length == 0 ? "" : modMdc.mkMDCbutton("Delete Unused", "outlined");
                if (arrUnusedTags.length != 0)
                    btnDeleteUnused.addEventListener("click", errorHandlerAsyncEvent(async evt => {
                        alert("not ready");
                        async function deleteTag(evt) {
                            console.log("deleteTag", { evt });
                            const btnTag = evt.target;
                            btnTag.style.outline = "2px dotted red";
                            btnTag.style.transition = "opacity 1s, transform 1s";
                            const doDelete = await modMdc.mkMDCdialogConfirm(
                                mkElt("span", undefined, [
                                    ` Delete the unused tag `,
                                    mkElt("b", undefined, `#${btnTag.dataset.tagname}`),
                                    "?"
                                ])
                            );
                            console.log({ doDelete });
                            if (doDelete) {
                                btnTag.style.opacity = 0.5;
                                btnTag.style.scale = 0.1;
                                btnTag.addEventListener("transitionend", errorHandlerAsyncEvent(async evt => {
                                    const tag = btnTag.dataset.tagname;
                                    btnTag.remove();
                                    console.log("transitionend", tag);

                                    // const tags = await getDbTagsArr();
                                    const dbFc4i = await getDbFc4i();
                                    const tags = await dbFc4i.getDbTagsArr();

                                    console.log({ tags });
                                    const newTags = tags.filter(t => t != tag);
                                    console.log({ newTags });
                                    await dbFc4i.setDbTagsArr(newTags);
                                    // nUnused--;
                                    // spanUnused.textContent = `${nUnused}`;
                                    // checkUnusedTags();
                                }));
                            } else {
                                btnTag.style.outline = "unset";
                            }
                        }
                        const divUnused = mkElt("div");
                        arrUnusedTags.forEach(tag => {
                            const icon = modMdc.mkMDCicon("delete_forever");
                            const eltTag = mkElt("button", { class: "tag-in-our-tags tag-button" }, [`#${tag}`, icon]);
                            eltTag.dataset.tagname = tag;
                            eltTag.addEventListener("click", evt => deleteTag(evt));
                            divUnused.appendChild(eltTag);
                        });
                        const pUnused = mkElt("p", undefined, [
                            "Unused tags: ",
                            mkElt("div", undefined, "Click on a tag to delete it.")
                        ]);

                        const body = mkElt("div", undefined, [
                            mkElt("h2", undefined, "Delete unused tags"),
                            pUnused,
                            divUnused,
                        ]);
                        modMdc.mkMDCdialogAlert(body, "close");

                    }));
                const divTheUnusedTags = mkElt("div");
                const sumUnused = mkElt("summary", undefined, "Show unused tags");
                const btnCheckUnused = mkElt("button", undefined, "Check");
                btnCheckUnused.addEventListener("click", evt => refreshUnusedTags());
                const detUnused = mkElt("details", undefined,
                    [sumUnused, divTheUnusedTags, "not ready", btnCheckUnused]);
                // detUnused.style.display = "none";

                const divUnused = mkElt("div", undefined, detUnused);
                async function refreshUnusedTags() {
                    const arrUnusedTags = await dbFc4i.getUnusedTags();
                    console.log("refreshUnusedTags", arrUnusedTags);
                    if (arrUnusedTags.length == 0) {
                        // detUnused.style.display = "none";
                    } else {
                        // delete detUnused.style.display;
                        detUnused.style.display = null;
                    }
                }

                async function refreshArrAllTags() {
                    const dbFc4i = await getDbFc4i();
                    const arrAllTags = await dbFc4i.getDbTagsArr();
                    return arrAllTags;
                }
                arrAllTags.forEach(tag => {
                    const checked = ourOldTags.includes(tag) ? true : false;
                    const unused = arrUnusedTags.includes(tag) ? true : false;
                    const eltTag = mkEltTagChkbox(tag, checked);
                    if (unused) eltTag.style.outline = outlineUnused;
                    divAllTags.appendChild(eltTag);
                });
                const inpNewTag = mkElt("input", { type: "text", id: "inp-new-tag" });
                const btnNewTag = modMdc.mkMDCbutton("Add", "raised");
                btnNewTag.addEventListener("click", errorHandlerAsyncEvent(async evt => {
                    const newTag = inpNewTag.value.trim();
                    if (newTag.length == 0) {
                        inpNewTag.focus();
                        return;
                    }
                    const reName = /^[a-z0-9_-]*$/i;
                    if (!reName.test(newTag)) {
                        await modMdc.mkMDCdialogAlert("Invalid characters (letters, digits, -, _)");
                        inpNewTag.focus();
                        return;
                    };
                    arrAllTags = await refreshArrAllTags();
                    refreshUnusedTags();
                    if (arrAllTags.includes(newTag)) {
                        await modMdc.mkMDCdialogAlert("This tag name already exists");
                        inpNewTag.focus();
                        return;
                    }
                    const eltNewTag = mkEltTagChkbox(newTag, true);
                    divAllTags.appendChild(eltNewTag);
                    arrAllTags.push(newTag);
                    arrAllTags.sort();
                    // const dbFc4i = await getDbFc4i();
                    dbFc4i.setDbTagsArr(arrAllTags);
                    saveAnyTagChanges();
                }));

                divAllTags.addEventListener("change", evt => {
                    console.log("divAllTags", evt);
                    saveAnyTagChanges();
                    setTimeout(refreshUnusedTags, 3000);
                });
                const divNewTag = mkElt("div", { id: "div-new-tag" }, [
                    "New:", inpNewTag, btnNewTag
                ]);
                const body = mkElt("div", { id: "div-change-tags" }, [
                    mkElt("h3", undefined, "Change Tags"),
                    btnDeleteUnused,
                    divAllTags,
                    divNewTag,
                    divUnused,
                ]);
                // const done = await modMdc.mkMDCdialogConfirm(body, "Done", "Cancel");
                await modMdc.mkMDCdialogAlert(body, "Close");
                // if (done) { saveAnyTagChanges(); }
                function saveAnyTagChanges() {
                    const ourNewTags = [];
                    const arrTagChkBox = [...divAllTags.querySelectorAll(".tag-in-our-tags")];
                    for (let i = 0, len = arrTagChkBox.length; i < len; i++) {
                        const span = arrTagChkBox[i];
                        const chk = span.firstElementChild;
                        const checked = chk.checked;
                        const tag = span.textContent.substr(1);
                        // console.log({ span, chk, checked, tag });
                        if (checked) { ourNewTags.push(tag); }
                    };
                    const tagsChanged = JSON.stringify(ourOldTags.sort()) != JSON.stringify(ourNewTags.sort());
                    updateOurOldTags();
                    console.log("saveAnyTagChanges", tagsChanged);
                    if (tagsChanged || true) {
                        eltOurTags.textContent = "";
                        ourNewTags.forEach(tag => addToOurTags(tag));
                        restartButtonStateTimer();
                    }
                }
            }));
            return btnFab;
        }

        eltTags.appendChild(btnAdd);
        return detTags;
    }
    async function mkEltFlashcards() {
        const modFlashcards = await import("/src/js/mod/flashcards.js");
        // const icoQA = modMdc.mkMDCicon("question_answer");
        const icoQA = modMdc.mkMDCicon("quiz");
        icoQA.classList.add("mdc-theme--primary");
        const icoHasIndicator = mkHasItemsIndicator();
        const eltSummary = mkElt("summary", { class: "no-closed-marker" }, [
            icoQA,
            " Flashcards ",
            icoHasIndicator
        ]);
        const eltCards = mkElt("div", { class: "flashcards-items flashcard-small" });
        const detFlashcards = mkElt("details", { class: "mdc-card flashcards-card" }, [
            eltSummary, eltCards
        ]);
        // FIX-ME "open"
        function addOurFlashcards() {
            if (record?.flashcards) {
                record.flashcards.forEach(async fc => {
                    const eltFC = await modFlashcards.mkEltFlashcard();
                    eltFC.mySet(fc.question, fc.answer, fc.conf);
                    eltCards.appendChild(eltFC);
                    // eltFC.myAddSlider();
                });
            }
        }
        addOurFlashcards();
        /*
        detFlashcards.addEventListener("toggle", errorHandlerAsyncEvent(async evt => {
            if (eltCards.childElementCount > 1) return;
            if (detFlashcards.open) { addOurFlashcards(); }
        }));
        */
        const btnAdd = modFlashcards.mkBtnAddFlashcard(eltCards, restartButtonStateTimer);
        eltCards.appendChild(btnAdd);
        // eltRemember.appendChild(eltFlashcards);
        return detFlashcards;
    }

    function mkDetYourNotes() {
        const icoEditNote = modMdc.mkMDCicon("edit_note");
        icoEditNote.classList.add("mdc-theme--primary");
        const sumYN = mkElt("summary", { class: "no-closed-marker" }, [
            icoEditNote,
            " Your notes"
        ]);
        const taDesc = modMdc.mkMDCtextFieldTextarea(undefined, 8, 50);
        taDesc.classList.add("remember-text");
        taDesc.style.resize = "vertical";
        // taDesc.addEventListener("input", evt => { checkForUrl(); });
        convertTaDesc();
        async function convertTaDesc() {
            const idUpdatedGrowWrap = "updated-grow-wrap";
            const eltStyle = document.getElementById(idUpdatedGrowWrap);
            if (!eltStyle) await updateGrowWrap();
            async function updateGrowWrap() {
                await new Promise((resolve, reject) => {
                    const nMax = 300;
                    const msDelay = 10;
                    let n = 0;
                    const tmr = setInterval(() => {
                        if (n++ > nMax) {
                            clearInterval(tmr);
                            console.error("timeout when trying to convert taDesc");
                            reject("timeout when trying to convert taDesc");
                        }
                        if (taDesc.isConnected) {
                            clearInterval(tmr);
                            console.log(`n=${n}, ${nMax}`);
                            resolve();
                        }
                    }, msDelay);
                });
                const cssTaDesc = getComputedStyle(taDesc);
                const strPropAfter = `
                Xcursor: text;
                font-family: Roboto, sans-serif;
                font-style: normal;
                font-weight: 400;
                letter-spacing: 0.15px;
                line-height: 1.5rem;
                margin-bottom: 9px;
                margin-left: 0;
                margin-right: 0;
                margin-top: 23px;
                min-height: 24px;
                min-width: 0;
                padding-bottom: 0;
                padding-left: 16px;
                padding-right: 16px;
                padding-top: 0px;
                text-align: start;
                text-decoration-line: none;
                text-decoration-style: solid;
                text-decoration-thickness: auto;
                text-indent: 0;
                text-rendering: auto;
                text-shadow: none;
                text-transform: none;
                white-space: pre-wrap;
                width: 100%;
                word-spacing: 0;
                `;
                const ma = strPropAfter.matchAll(/^\s*(.*):/gm)
                const arr = [...ma];
                const arrProp = arr.map(m => m[1]);
                let strCss = ".grow-wrap::after {\n";
                arrProp.forEach(nm => {
                    const val = cssTaDesc.getPropertyValue(nm);
                    strCss += `${nm}: ${val};\n`;
                });
                // For MDC:
                strCss += "padding-top: 2rem;\n";
                // strCss += "margin-top: 1rem;\n";
                strCss += "}\n";
                // strCss += ".grow-wrap>textarea { background-color: darkgoldenrod; }\n";
                // console.log({ strCss });
                // console.log(strCss);
                const eltStyle = mkElt("style", { id: idUpdatedGrowWrap }, strCss);
                document.head.appendChild(eltStyle);
            }
        }


        const btnUrl = modMdc.mkMDCiconButton("link");
        btnUrl.classList.add("icon-button-40");
        btnUrl.classList.add(...themePrimary);
        const s = [
            "display: flex",
            "gap: 20px"
        ];
        const divURL = mkElt("div", { style: s.join(";") }, btnUrl);
        divURL.style.marginTop = "10px";

        const btnTest = mkElt("button", undefined, "Test");
        // divURL.appendChild(btnTest);
        const aTest = mkElt("a", {
            href: "https://css-tricks.com/the-cleanest-trick-for-autogrowing-textareas/",
            target: "_blank"
        }, "Test");
        // divURL.appendChild(aTest);

        const ourUrls = [];
        btnUrl.addEventListener("click", evt => {
            checkForUrl();
            const body = mkElt("div");
            const eltYN = mkElt("span", { style: "font-style:italic" }, "Your Notes");
            if (ourUrls.length == 0) {
                body.appendChild(mkElt("h4", undefined, [
                    "Found no links in ", eltYN, "."
                ]));
            } else {
                body.appendChild(mkElt("h4", undefined, [
                    "Found these links in ", eltYN, ":"
                ]));
                ourUrls.forEach(url => {
                    const a = mkElt("a", { href: url }, url);
                    const diva = mkElt("div", { class: "div-a-url" }, a);
                    body.appendChild(mkElt("div", undefined, diva));
                });
            }
            modMdc.mkMDCdialogAlert(body, "Close");
        })
        function checkForUrl() {
            const reHttps = /(?:^|\s)(https:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()\[\]@:%_\+.~#?&\/=]*))(?:$|\s)/g;
            const m = [...taDesc.value.matchAll(reHttps)];
            // btnUrl.disabled = m.length == 0;
            ourUrls.length = 0;
            m.forEach(m2 => { ourUrls.push(m2[1]) });
            console.log("%cHTTPS", "color:red", { m, ourUrls });
        }
        const strDescription = record ? record.text : "";
        const tafDesc = modMdc.mkMDCtextareaField("Your Notes", taDesc, strDescription);

        // const tafDesc = modMdc.mkMDCtextareaField("Your Notes", taDesc);
        // modMdc.mkMDCtextareaGrow(tafDesc);
        // taDesc.value = strDescription;
        btnTest.addEventListener("click", evt => {
            btnTest.disabled = true;
            modMdc.mkMDCtextareaGrow(tafDesc);
        });
        btnTest.disabled = true;
        modMdc.mkMDCtextareaGrow(tafDesc);

        // checkForUrl();

        const detYN = mkElt("details", { class: "mdc-card" }, [sumYN, tafDesc, divURL]);
        return detYN;
    }

    const restartButtonStateTimer = (() => {
        // console.log("%cCreating restartButtonStateTimer function", "background: orange");
        let tmr;
        const timeout = 1000;
        return () => {
            // console.log("%crestarting restartButtonStateTimer", "background: orange");
            clearTimeout(tmr);
            tmr = setTimeout(setButtonStates, timeout);
        }
    })();

    // mkdetyour
    function mkDetMindmaps() {
        const icoMM = modMdc.mkMDCicon("account_tree");
        icoMM.classList.add("mdc-theme--primary");
        const sumMM = mkElt("summary", { class: "no-closed-marker" }, [
            icoMM,
            " Mindmaps"
        ]);
        const divMM = mkDivCustomCopy4Mindmaps();
        // const btnAdd = modFlashcards.mkBtnAddFlashcard(eltCards, restartButtonStateTimer);
        // fab-add-flash
        const eltIcon = modMdc.mkMDCicon("add");
        const btnFab = modMdc.mkMDCfab(eltIcon, "Create new mindmap", true);
        btnFab.classList.add("fab-add-mindmap-1");
        btnFab.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            await createAndShowNewMindmapFc4i();
        }));
        divMM.appendChild(btnFab);
        const detMM = mkElt("details", { class: "mdc-card" }, [sumMM, divMM]);
        return detMM;
    }

    function mkDivCustomCopy4Mindmaps() {
        const btnAdd = modMdc.mkMDCbutton("Copy to", "raised");
        btnAdd.addEventListener("click", evt => {
            const key = btnAdd.closest(".container-remember").dataset.key;
            console.log("clicked add", key);
            const objAdded = addJsmindCopied4Mindmap(key, "fc4i");
            // dialogCustomPaste2Mindmap();
            dialogAdded2CustomClipboard(objAdded);
        });
        const btnFind = modMdc.mkMDCbutton("Find in", "raised");
        btnFind.addEventListener("click", evt => {
            const key = btnFind.closest(".container-remember").dataset.key;
            console.log("clicked find", key);
            // searchMindmaps(key);
            dialogFindInMindMaps(key);
        });
        const div = mkElt("div", undefined, [
            btnAdd,
            btnFind
        ]);
        div.style.display = "flex";
        div.style.gap = "10px";
        div.style.position = "relative";
        return div;
    }

    const divTools = mkElt("div", { id: "div-tools" });
    const icoHandyman = modMdc.mkMDCicon("handyman");
    icoHandyman.classList.add("mdc-theme--secondary");
    icoHandyman.style.fontSize = "unset";
    const detTools = mkElt("details", { class: "mdc-card mdc-theme--primary-bg" }, [
        mkElt("summary", undefined, [
            icoHandyman,
            " Tools to help you remember"
        ]),
        divTools
    ]);
    divTools.appendChild(mkDetYourNotes());
    divTools.appendChild(mkDivPasteButton());
    divTools.appendChild(await mkEltTags());
    divTools.appendChild(mkDetMindmaps());
    divTools.appendChild(await mkEltFlashcards());
    divTools.appendChild(detTimers);
    // divTools.appendChild(mkDivCustomCopy4Mindmaps());

    eltRemember.appendChild(mkEltSource());
    eltRemember.appendChild(detTools);
    // eltRemember.appendChild(addImageInput()); // Old, not used
    await addTimers();
    eltRemember.appendChild(mkDivButtons());

    const myRemember = new ScreenRemember(eltRemember, saveNow);
    if (saveNewNow) {
        // FIX-ME: MutationObserver?
        await new Promise((resolve, reject) => {
            let tmr;
            let n = 0;
            function ready() {
                resolve();
                observer.disconnect();
            }
            function restartTimer() {
                // console.log(`observer callBack restartTimer, ${n}`);
                if (n++ > 100) { ready(); return; }
                clearTimeout(tmr);
                tmr = setTimeout(ready, 100);
            }
            restartTimer();
            function callBack(mutList, observer) {
                restartTimer();
            }
            const observer = new MutationObserver(callBack);
            const config = { childList: true, characterData: true, subtree: true, attributes: true, };
            observer.observe(eltRemember, config);
        });
        saveNow();
    } else {
        myRemember.setSaveButtonState(false);
    }
    eltRemember.addEventListener("input", evt => {
        // console.log("%c eltRemember input event", "color: red;");
        restartButtonStateTimer();
    });
    async function setButtonStates() {
        const currentValue = await myRemember.getPromCurrentValue();
        if (currentValue == undefined) {
        console.log("%csetButtonState, undefined", "color: green", );
            myRemember.setSaveButtonState(false);
            return;
        }
        const initialValue = await myRemember.getPromInitialValue();
        const strCurrent = JSON.stringify(currentValue);
        const strInitial = JSON.stringify(initialValue);
        const somethingToSave = strCurrent != strInitial;
        console.log("%csetButtonState", "color: green", { somethingToSave });
        myRemember.setSaveButtonState(somethingToSave);
    }

    return eltRemember;

    async function saveNow() {
        // restartRefreshSearchTimer();
        const eltSearchBanner = document.getElementById("h3-search-banner")
        eltSearchBanner?.checkSearchNeedsRefresh();

        const keySaved = getCreatedEltTime();
        const key = keySaved || new Date().toISOString();
        const val = await myRemember.getPromCurrentValue();
        val.key = key;
        // https://stackoverflow.com/questions/11876175/how-to-get-a-file-or-blob-from-an-object-url
        const imageUrls = val.images;
        const imageBlobs = [];
        for (let i = 0; i < imageUrls.length; i++) {
            const url = imageUrls[i];
            const blob = await fetch(url).then(r => r.blob());
            console.log({ blob });
            imageBlobs.push(blob);
        }
        val.images = imageBlobs;

        // const db = await getDb();
        // We now use val.key as db key
        // const res = await db.put(idbStoreName, val);
        const dbFc4i = await getDbFc4i();
        const res = await dbFc4i.setDbKey(key, val);
        console.warn("saveNow", { res });
        myRemember.setSaveButtonState(false);
        // FIX-ME: initialval
        myRemember.resetPromInitialValue();
        if (!keySaved) setCreatedEltTime(key);
    }
    function mkDivButtons() {
        const btnSave = modMdc.mkMDCbutton("Save", "raised");
        btnSave.classList.add("save-button");
        const btnDelete = modMdc.mkMDCbutton("Delete", "raised");
        btnDelete.classList.add("mdc-theme--secondary-bg");
        // const btnCancel = modMdc.mkMDCbutton("Cancel", "raised");
        // btnCancel.classList.add("mdc-theme--secondary-bg");


        btnSave.addEventListener("click", async () => {
            console.log("clicked", { myRemember });
            saveNow();
        });
        btnDelete.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            handleEvtDeleteRem(evt);
        }));
        // btnCancel.addEventListener("click", evt => { goHome(); });
        const divButtons = mkElt("div", { class: "input-save-div" }, [btnSave, btnDelete]);
        return divButtons;
    }
    function mkEltSource() {
        const divInputs = mkElt("div", { class: "mdc-card div-source-web-page" }, [
            // divH
        ]);
        const inpURL = modMdc.mkMDCtextFieldInput(undefined, "url");
        inpURL.classList.add("remember-url");
        inpURL.addEventListener("input", evt => {
            divURLlockedValue.textContent = inpURL.value;
        });
        const strUrl = record ? record.url : "";
        const tfURL = modMdc.mkMDCtextField("Link", inpURL, strUrl);

        const aURL = modMdc.mkMDCiconButton("link");
        aURL.classList.add("icon-button-40");
        aURL.classList.add(...themePrimary);
        aURL.addEventListener("click", evt => {
            const url = inpURL.value;
            window.open(url);
        });

        // FIX-ME: move to util-mdc.js
        function setMDCiconButton(iconButton, iconName) {
            if (!iconButton.classList.contains("mdc-icon-button")) {
                console.error("classList does not contain mdc-icon-button", iconButton);
            }
            const lastChild = iconButton.lastChild;
            lastChild.textContent = iconName;
        }

        const btnViewURL = modMdc.mkMDCiconButton("visibility");
        btnViewURL.classList.add("icon-button-40");
        btnViewURL.addEventListener("click", evt => {
            const isDisplayed = !divURLlocked.classList.contains("display-none");
            setURLvisible(!isDisplayed);
        });

        function setURLvisible(on) {
            if (on) {
                divURLlocked.classList.remove("display-none");
            } else {
                divURLlocked.classList.add("display-none");
                setURLeditable(false);
            }
            const newIcon = on ? "visibility" : "visibility_off";
            setMDCiconButton(btnViewURL, newIcon);
        }
        function setURLeditable(on) {
            if (!on) {
                divURLlockedValue.removeAttribute("contenteditable")
                setMDCiconButton(btnEditURL, "edit");
            } else {
                // divURLlockedValue.setAttribute("contenteditable", true)
                divURLlockedValue.setAttribute("contenteditable", "plaintext-only")
                setMDCiconButton(btnEditURL, "edit_off");
            }
        }
        const btnEditURL = modMdc.mkMDCiconButton("edit");
        btnEditURL.classList.add("icon-button-40");
        btnEditURL.addEventListener("click", evt => {
            console.log("clicked btnEditURL");

            // Not sure this is really supported:
            // divURLlockedValue.contentEditable = true;

            // Seems better to use Attribute, works well!
            const isEditable = divURLlockedValue.hasAttribute("contenteditable")
            setURLeditable(!isEditable);
            setURLvisible(true);
        });
        // const divURLright = mkElt("div", { class: "div-url-right-buttons" }, [aURL, btnEditURL]);
        const divURLbtns = mkElt("div", { class: "div-url-top-buttons" }, [aURL, btnViewURL, btnEditURL]);

        const divURLlockedValue = mkElt("div", { class: "div-url-locked-value" }, inpURL.value);
        const divURLlocked = mkElt("div", { class: "div-url-locked display-none" }, [
            divURLlockedValue
        ]);
        // const divURLedit = mkElt("div", {class:"div-url-edit"}, tfURL);
        tfURL.classList.add("tf-url-edit");
        const divURLprotect = mkElt("div", { class: "div-url-protect" }, [divURLlocked, tfURL]);

        // const divURL = mkElt("div", { class: "div-input-url" }, [divURLprotect, divURLright]);
        const eltH = mkElt("h2", undefined, "Item link");
        eltH.style.marginRight = "20px";
        const divURLtop = mkElt("div", { class: "div-url-top" }, [eltH, divURLbtns]);
        // const divURL = mkElt("div", { class: "div-input-url-new" }, [divURLbtns, divURLprotect]);
        const divURL = mkElt("div", { class: "div-input-url-new" }, [divURLprotect]);
        divInputs.appendChild(divURLtop);
        divInputs.appendChild(divURL);


        const inpTitle = modMdc.mkMDCtextFieldInput(undefined, "text");
        inpTitle.classList.add("remember-title");
        const strTitle = record ? record.title : "";

        // const tfTitle = modMdc.mkMDCtextField("Title here", inpTitle, strTitle);
        inpTitle.value = strTitle;
        const tfTitle = modMdc.mkMDCtextFieldOutlined("Title here", inpTitle);
        tfTitle.style.marginTop = "5px";

        divInputs.appendChild(tfTitle);
        if (strTitle.length > 0) divBannerTitle.textContent = strTitle;
        if (record) {
            const key = record.key;
            if (key) {
                if (key.length != 24) throw Error(`Not ISO time-date: ${key}`);
                divBannerTitle.dataset.keyRecord = key;
            }
        }
        inpTitle.addEventListener("input", evt => {
            divBannerTitle.textContent = inpTitle.value;
            const detContainer = divBanner.closest("details.unsaved-marker-container");
            if (!detContainer) return;
            const eltAnotherTitle = detContainer.querySelector(".has-title");
            if (!eltAnotherTitle) return;
            eltAnotherTitle.textContent = inpTitle.value;
        });

        const taDesc = modMdc.mkMDCtextFieldTextarea(undefined, 4, 50);
        taDesc.classList.add("remember-text");
        const strDescription = record ? record.text : "";
        const tafDesc = modMdc.mkMDCtextareaField("Your Description", taDesc, strDescription);
        // divInputs.appendChild(tafDesc);

        return divInputs;
    }

    function getCreatedEltTime() {
        return thCreated.dataset.createdIso;
    }
    function setCreatedEltTime(keyCreated) {
        if (keyCreated) {
            eltRemember.dataset.key = keyCreated;
            thCreated.innerText = "";
            // divCreated.appendChild(mkElt("div", undefined, keyCreated));
            thCreated.dataset.createdIso = keyCreated;
            const dateCreated = new Date(keyCreated);
            thCreated.appendChild(mkElt("div", undefined, `Created: ${formatNiceTime(dateCreated)}`));
        } else {
            thCreated.appendChild(mkElt("span", undefined, "Not saved yet."));
        }
    }

    async function addTimers() {
        setCreatedEltTime(record?.key);

        function fetchSavedTimers() {
            if (!record?.timers) return;
            const saved = {};
            record.timers.forEach(savedTimer => {
                const msDelay = savedTimer.msDelay;
                const txtLength = savedTimer.txtLength;
                saved[txtLength] = msDelay;
            });
            return saved;
        }
        const getDefaultTimersForNew = () => {
            const forNew = {}
            Object.entries(defaultTimers).forEach(ent => {
                if (ent[1] > 0) forNew[ent[0]] = ent[1];
            });
            return forNew;
        }
        const savedTimers = fetchSavedTimers();
        // const ourTimers = savedTimers || defaultTimers;
        const ourTimers = savedTimers || getDefaultTimersForNew();

        thCreated.colspan = 3;
        const tableHeader = mkElt("thead", undefined, [
            mkElt("tr", undefined, [thCreated]),
            mkElt("tr", undefined, [
                mkElt("th", { class: "timer-length" }, "Reminder after"),
                mkElt("th", { class: "timer-when" }, "Will be at"),
                mkElt("th", undefined, "Done?"),
            ])
        ]);

        const tableBody = mkElt("tbody");
        const tableTimers = mkElt("table", { class: "timers-table" }, [tableHeader, tableBody]);

        // tableTimers.appendChild(tableBody);
        const msNow = new Date().getTime();
        for (const [strKey, msDelay] of Object.entries(ourTimers)) {
            const dateWhenTo = new Date(createdMs + Math.abs(msDelay));
            const isExpired = msNow > dateWhenTo.getTime();
            const isNotified = msDelay < 0;
            const showWhen = formatNiceTime(dateWhenTo);

            // const iconBasket = "🗑";
            const iconBasket = modMdc.mkMDCicon("delete_forever");
            // const iconBasket = mkElt("span", {class:"material-icons"}, "delete_outline");
            const btnDelete = modMdc.mkMDCbutton(iconBasket);
            btnDelete.classList.add("wastebasket-button");
            btnDelete.addEventListener("click", async evt => {
                const tr = btnDelete.closest("tr");
                deleteTimerDialog(tr);
            })
            async function deleteTimerDialog(tr) {
                tr.style.outline = "4px dotted yellowgreen";
                const dlg = modMdc.mkMDCdialogConfirm("Delete this timer?", "Yes", "No");
                const answer = await dlg;
                console.log({ answer });
                tr.style.outline = "";
                if (answer) {
                    tr.remove();
                    // setButtonStates();
                    saveNow();
                }
            }
            const inpDone = modMdc.mkMDCcheckboxInput();
            const chkDone = await modMdc.mkMDCcheckboxElt(inpDone);
            if (isNotified) inpDone.checked = true;
            const tableRow = mkElt("tr", { class: "remember-timer" }, [
                mkElt("td", { class: "remember-timer-length" }, strKey),
                mkElt("td", { class: "remember-timer-when" }, showWhen),
                mkElt("td", undefined, chkDone),
                // mkElt("td", undefined, btnDelete),
            ]);
            tableBody.appendChild(tableRow);
            if (isExpired) { tableRow.classList.add("timer_expired"); }
            if (isNotified) { tableRow.classList.add("timer_notified"); }
            tableRow.dataset.msDelay = msDelay;
            tableRow.dataset.msWhen = dateWhenTo.getTime();
        }
        const sumTable = mkElt("summary", undefined, "Advanced");
        const detTable = mkElt("details", undefined, [
            sumTable,
            tableTimers,
        ])
        divTimers.appendChild(detTable);
    }

}

const rememberSelectors = {
    title: "input.remember-title",
    url: "input.remember-url",
    text: "textarea.remember-text",
    timers: "tr.remember-timer",
    // flashcards: ".flashcard-scene",
    flashcards: ".flashcard-scale-wrapper",
};

class ScreenRemember {
    constructor(eltRem, saveNow) {
        this.elt = eltRem;
        this.promInitialValue = this.getPromCurrentValue();
        this.btnSave = eltRem.querySelector("button.save-button");
        this.saveNow = saveNow;
        this.restartSaveNowTimer = (() => {
            let tmr;
            const doSaveNow = () => { this.saveNow(); }
            return () => {
                clearTimeout(tmr);
                console.log("cleared timer doSaveNow");
                tmr = setTimeout(doSaveNow, 1500);
            }
        })();
    }
    getElt() { return this.elt; }
    async getPromInitialValue() { return this.promInitialValue; }
    async resetPromInitialValue() { this.promInitialValue = this.getPromCurrentValue(); }
    async getPromCurrentValue() {
        const values = {};
        const tags = [];
        values.tags = tags;
        this.elt.querySelector(".tags-items")
            .querySelectorAll(".tag-in-our-tags")
            .forEach(eltTag => {
                // console.log({ eltTag });
                tags.push(eltTag.textContent.substr(1));
            });
        // console.log({ tags });
        const eltConfSlider = this.elt.querySelector(".confidence-slider")
        // console.log({ eltConfSlider });
        // await eltConfSlider.myPromMdc;
        // const slider = eltConfSlider.myMdc;
        const slider = eltConfSlider.myMdc || await eltConfSlider.myPromMdc;
        // console.log({ slider });
        values.confRem = slider.getValue();
        // const timers = {};
        const timers = [];
        values.timers = timers;
        const flashcards = [];
        values.flashcards = flashcards;
        for (const [key, val] of Object.entries(rememberSelectors)) {
            const elts = this.elt.querySelectorAll(val);
            if (key == "flashcards") {
                /*
                elts.forEach(fc => {
                    const valCurrentFc = fc.myGet();
                    console.log({ valCurrentFc });
                    flashcards.push(valCurrentFc);
                });
                */
                // To collect values we must wait 
                const arrElts = [...elts];
                for (let i = 0, len = arrElts.length; i < len; i++) {
                    const fc = arrElts[i];
                    const valCurrentFc = await fc.myGet();
                    console.log({ valCurrentFc });
                    flashcards.push(valCurrentFc);
                }
            } else if (key == "timers") {
                // console.log("timers", { elts });
                elts.forEach(tr => {
                    const msDelay = +tr.dataset.msDelay;
                    const msWhen = +tr.dataset.msWhen;
                    // FIX-ME: .innerText does not work when the <details> is not open here
                    // File an issue?
                    // const txtLength = tr.querySelector("td.remember-timer-length").innerText;
                    const txtLength = tr.querySelector("td.remember-timer-length").textContent;
                    if (txtLength == 0) debugger;
                    // const txtWhen = tr.querySelector("td.remember-timer-when").innerText;
                    // console.log({ msDelay, msWhen, txtLength, txtWhen });
                    // timers[ms] = { ms, txtLength, txtWhen, }
                    timers.push({ msDelay, msWhen, txtLength });
                });
            } else {
                values[key] = elts[0].value;
            }
        }
        const textValue = values.text + values.title + values.url;
        if (textValue == "") return;
        const imageElts = this.elt.querySelectorAll(".blob-to-store");
        const imgValue = [...imageElts].map(elt => elt.dataset.urlBlob);
        // console.log(imgValue);
        values.images = imgValue;
        // FIX-ME: replace the imgValue urls with blobs before storing. Or?
        // console.log({ values });
        return values;
    }
    setSaveButtonState(canSave) {
        const container = this.btnSave.closest(".unsaved-marker-container");
        if (canSave) {
            // FIX-ME: btnSave
            this.btnSave.disabled = false;
            this.btnSave.style.opacity = null;
            container.classList.add("not-saved");
            this.restartSaveNowTimer();
        } else {
            this.btnSave.disabled = true;
            this.btnSave.style.opacity = 0.5;
            // No container yet if not on screen
            container?.classList.remove("not-saved");
        }

    }
}