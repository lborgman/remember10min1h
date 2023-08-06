"use strict";
console.log("here is common.js");

let swVersion;
let theExpanderWay = "setTimeout"; // ok
// theExpanderWay = "await"; // ok
// theExpanderWay = "justAdd"; // no expanding

// https://medium.com/@a7ul/beginners-guide-to-web-push-notifications-using-service-workers-cb3474a17679
// I added a function that can be used to register a service worker.

// https://developer.chrome.com/docs/workbox/handling-service-worker-updates/
let instWorkbox;
async function getWorkbox() {
    if (!instWorkbox) {
        const modWb = await import("https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-window.prod.mjs");
        instWorkbox = new modWb.Workbox("/sw-workbox.js");
    }
    if (instWorkbox) return instWorkbox
}

let FCMtoken;

const themePrimary = ["mdc-theme--primary-bg", "mdc-theme--on-primary"];

async function checkUnusedTags() {
    if (!document.getElementById("page-home")) return;
    const modMdc = await import("util-mdc");

    // Non-existant tags?
    const dbFc4i = await getDbFc4i();
    const allTags = await dbFc4i.getDbTagsArr();
    const divReqTags = document.getElementById("div-search-the-tags");
    const visibleTags = [...divReqTags.querySelectorAll(".tag-in-our-tags")]
    visibleTags.forEach(elt => {
        const tag = elt.textContent.slice(1);
        console.log({ tag });
        if (!allTags.includes(tag)) {
            console.log("Non-existant", tag);
            elt.remove();
        }
    });

}

let divSearchTheTags;
async function updateDivSearchTheTags() {
    const oldTags = [...divSearchTheTags.querySelectorAll("label.tag-in-our-tags")]
        .filter(lbl => {
            const chk = lbl.firstElementChild.checked;
            // console.log({ lbl, chk });
            return chk;
        })
        .map(lbl => lbl.textContent.substr(1));
    const dbFc4i = await getDbFc4i();
    const arrAllTags = await dbFc4i.getDbTagsArr();
    const arrUnusedTags = await dbFc4i.getUnusedTags();
    divSearchTheTags.textContent = "";
    if (arrAllTags.length > arrUnusedTags.length) {
        arrAllTags.forEach(tag => {
            if (arrUnusedTags.includes(tag)) return;
            const checked = oldTags.includes(tag);
            const eltTag = mkEltTagChkbox(tag, checked);
            divSearchTheTags.appendChild(eltTag);
        });
    } else {
        divSearchTheTags.appendChild(mkElt("div", undefined, "(There are currently no tags in use.)"));
    }
    // checkUnusedTags();
    return arrAllTags.length;
}




async function promptForUpdate() {
    const modMdc = await import("util-mdc");
    function hidePrompt() {
        // divPrompt.parentElement.removeChild(divPrompt);
        dlgPrompt.remove();
    }
    const btnSkip = modMdc.mkMDCbutton("Skip", "raised");
    const btnUpdate = modMdc.mkMDCbutton("Update", "raised");

    const wb = await getWorkbox();
    const waitingVersion = await wb.messageSW({ type: 'GET_VERSION' });
    const dlgPrompt = mkElt("dialog", { id: "prompt4update", class: "mdc-card", open }, [
        mkElt("div", undefined, `Update available: ver ${waitingVersion}`),
        mkElt("div", undefined, [btnSkip, btnUpdate])
    ])
    document.body.appendChild(dlgPrompt);
    return new Promise((resolve, reject) => {
        btnSkip.addEventListener("click", evt => {
            hidePrompt();
            resolve(false);
        });
        btnUpdate.addEventListener("click", evt => {
            hidePrompt();
            resolve(true);
        });
    });
}

const divDebug = mkElt("section", { id: "debug-section" });

checkPWA();
async function checkPWA() {
    // https://web.dev/learn/pwa/detection/
    window.addEventListener('DOMContentLoaded', () => {
        let displayMode = 'browser tab';
        const modes = ["fullscreen", "standalone", "minimal-ui", "browser"];
        modes.forEach(m => {
            if (window.matchMedia(`(display-mode: ${m})`).matches) {
                displayMode = m;
                addDebugRow(`matched media: ${displayMode}`)
            }
        });
        /*
        if (window.matchMedia('(display-mode: fullscreen)').matches) {
            displayMode = 'fullscreen';
            addDebugRow(`matched media: ${displayMode}`)
        }
        if (window.matchMedia('(display-mode: standalone)').matches) {
            displayMode = 'standalone';
            addDebugRow(`matched media: ${displayMode}`)
        }
        if (window.matchMedia('(display-mode: minimal-ui)').matches) {
            displayMode = 'minimal-ui';
            addDebugRow(`matched media: ${displayMode}`)
        }
        if (window.matchMedia('(display-mode: browser)').matches) {
            displayMode = 'browser';
            addDebugRow(`matched media: ${displayMode}`)
        }
        */
        // Log launch display mode to analytics
        // console.log('DISPLAY_MODE_LAUNCH:', displayMode);
        addDebugRow(`DISPLAY_MODE_LAUNCH: ${displayMode}`);
    });
    // https://web.dev/get-installed-related-apps/
    const relatedApps = navigator.getInstalledRelatedApps ? await navigator.getInstalledRelatedApps() : [];
    // console.log(`Related apps (${relatedApps.length}):`);
    addDebugRow(`Related apps (${relatedApps.length}):`);
    relatedApps.forEach((app) => {
        console.log(app.id, app.platform, app.url);
        addDebugRow(`${app.id}, ${app.platform}, ${app.url}`);
    });
}
const setupServiceWorker = async () => {
    // const swRegistration = await navigator.serviceWorker.register('/service-worker.js'); //notice the file name
    const wb = await getWorkbox();

    wb.addEventListener("message", errorHandlerAsyncEvent(async evt => {
        console.log("%cwb got message", "font-size: 18px; color: red", { evt });
        // snackbar, broadcastToClients, keepAliveCounter, messageSW
        const msgType = evt.data.type;
        switch (msgType) {
            case "keepAliveCounter":
                const counterValue = evt.data.counterValue;
                console.log({ counterValue });
                const idKA = "keepalive-counter";
                let eltKA = document.getElementById(idKA);
                if (!eltKA) {
                    const s = [
                        "display: inline-block",
                        "background: greenyellow",
                        "height: 1.5rem",
                        "min-width: 5rem",
                        "position: fixed",
                        "right: 5px",
                        "bottom: 5px",
                        "padding: 0.2rem",
                        "font-size: 1rem",
                        "border: 1px solid green"
                    ];
                    const style = s.join(";");
                    eltKA = mkElt("span", { style }, "eltKA");
                    eltKA.id = idKA;
                    document.body.appendChild(eltKA);
                    eltKA.addEventListener("click", evt => {
                        wb.messageSW({ type: "TEST_TIMER", seconds: 0 });
                        console.log("removing soon");
                        eltKA.style.backgroundColor = "red";
                        setTimeout(() => {
                            console.log("removing");
                            eltKA.remove();
                        }, 4000);
                    });
                }
                eltKA.textContent = `${evt.data.counterValue} (${evt.data.total})`;
                break;
            default:
                const modMdc = await import("util-mdc");
                modMdc.mkMDCsnackbar(evt.data.text, 10 * 1000);
        }
    }));

    const showSkipWaitingPrompt = async (event) => {
        // Assuming the user accepted the update, set up a listener
        // that will reload the page as soon as the previously waiting
        // service worker has taken control.
        wb.addEventListener('controlling', () => {
            // At this point, reloading will ensure that the current
            // tab is loaded under the control of the new service worker.
            // Depending on your web app, you may want to auto-save or
            // persist transient state before triggering the reload.
            console.warn("event controlling, doing reload");
            // debugger;
            window.location.reload();
        });

        // When `event.wasWaitingBeforeRegister` is true, a previously
        // updated service worker is still waiting.
        // You may want to customize the UI prompt accordingly.

        // This code assumes your app has a promptForUpdate() method,
        // which returns true if the user wants to update.
        // Implementing this is app-specific; some examples are:
        // https://open-ui.org/components/alert.research or
        // https://open-ui.org/components/toast.research
        const updateAccepted = await promptForUpdate();

        if (updateAccepted) {
            wb.messageSkipWaiting();
        }
    };

    // Add an event listener to detect when the registered
    // service worker has installed but is waiting to activate.
    wb.addEventListener('waiting', (event) => {
        console.warn("event waiting");
        showSkipWaitingPrompt(event);
    });

    wb.addEventListener('activated', async (event) => {
        console.warn("event activated");
        const regSW = await navigator.serviceWorker.getRegistration();
        const swLoc = regSW.active.scriptURL;
        console.log("%cservice worker activated, adding error event listener", "color yellow; font-size: 24px", { regSW });
        regSW.active.addEventListener("error", evt => {
            console.log("%cservice worker activated, error event", "color yellow; font-size: 24px");
        });
        addDebugLocation(swLoc);
    });

    // FIXME: is this supported???
    wb.addEventListener('error', (event) => {
        console.log("%cError from sw", "color:orange; background:black", { error });
    });
    // console.log("%c before getSW sw", "color:red; background:black", { wb });
    wb.getSW().then(sw => {
        // console.log("%cgetSW then", "color:orange; background:black", { sw });
        sw.addEventListener("error", evt => {
            console.log("%cError from getSW sw", "color:red; background:black", { error });
        });
        sw.onerror = (swerror) => {
            console.log("%cError from getSW sw", "color:red; background:black", { swerror });
        }
    }).catch(err => {
        console.log("%cError getSW addEventlistener", "color:red; background: yellow", { err });
    });

    try {
        // const swRegistration = await navigator.serviceWorker.register('/sw-workbox.js'); //notice the file name
        const swRegistration = await wb.register(); //notice the file name
        // https://web.dev/two-way-communication-guide/

        // Can't use wb.messageSW because this goes to the latest registered version, not the active
        // const swVersion = await wb.messageSW({ type: 'GET_VERSION' });
        //
        // But we must check for .controller beeing null
        // (this happens during "hard reload" and when Lighthouse tests).
        // https://www.youtube.com/watch?v=1d3KgacJv1I
        if (navigator.serviceWorker.controller !== null) {
            const messageChannel = new MessageChannel();
            messageChannel.port1.onmessage = (event) => {
                // console.warn("port1.onmessage", event.data);
                saveVersion(event.data);
            };
            navigator.serviceWorker.controller.postMessage({ type: "GET_VERSION" }, [messageChannel.port2]);
        } else {
            addDebugRow(`Service Worker version: controller is null`);
        }

        function saveVersion(ver) {
            swVersion = ver;
            // console.log('Service Worker version:', swVersion);
            addDebugRow(`Service Worker version: ${swVersion}`);
            theSWcacheVersion = swVersion;
        }
        return swRegistration;
    } catch (err) {
        console.warn("Service worker registration failed", { err });
        throw err;
    }
}

// https://web.dev/async-clipboard/
async function isClipboardPermissionStateOk() {
    const modMdc = await import("util-mdc");
    // There seems to be no max number of skipping prompt here.
    // The permissions systems seems like a mess!
    const queryOpts = { name: 'clipboard-read', allowWithoutGesture: false };
    const permissionStatus = await navigator.permissions.query(queryOpts);
    console.log({ permissionStatus });

    switch (permissionStatus.state) {
        case 'granted':
        case 'prompt': // Something seems to have changed 2023-06-29
            return true;
            break;
        // case 'prompt':
        case 'denied':
            // FIX-ME: tell user how to reset
            const aUnblock = mkElt("a", {
                target: "blank",
                href: "https://www.getbeamer.com/help/how-to-unblock-notification-permissions-on-any-browser"
            }, "How to fix it");
            // alert("tell user how to fix");
            const body = mkElt("div", undefined, [
                mkElt("h1", undefined, "Can't read clipboard"),
                mkElt("p", undefined, [
                    "This can be fixed the same way as explained here: ",
                    aUnblock
                ])
            ]);
            modMdc.mkMDCdialogAlert(body);
            return false;
        // debugger;
        default:
            debugger;
            throw Error(`Unknown permission state: ${permissionStatus.state}`);
    }
}


async function getNotificationPermissions() {
    const start = Date.now();
    const permissionFromPrompt = await Notification.requestPermission();
    const end = Date.now() - start;
    const endLimitMs = 1000;
    const probablyPrompted = end > endLimitMs;
    console.warn({ permissionFromPrompt, notificationPermission: Notification.permission, end, probablyPrompted });


    switch (Notification.permission) {
        case 'granted':
            if (probablyPrompted) {
                // new Notification does not work on Android???
                const regSW = await navigator.serviceWorker.getRegistration();
                if (regSW) {
                    regSW.showNotification("Thanks for allowing notification");
                } else {
                    new Notification("Thanks for allowing notifications");
                }
            }
            return true;
            break;
        case 'denied':
        case 'default':
            if (probablyPrompted) {
                return false;
            } else {
                return Notification.maxActions;
            }
            break;
        default:
            debugger;
    }
}
async function checkNotificationPermissions() {
    const modMdc = await import("util-mdc");
    const grantedNotification = await getNotificationPermissions();

    // console.log({ grantedNotification });
    if (grantedNotification === true) return true;

    const divNotifProbem = mkElt("div", { id: "notifications-not-allowed" });
    divNotifProbem.appendChild(mkElt("h2", undefined, "Notifications must be allowed"));
    const aUnblock = mkElt("a", {
        target: "blank",
        href: "https://www.getbeamer.com/help/how-to-unblock-notification-permissions-on-any-browser"
    }, "How to fix it");
    if (typeof grantedNotification === "number") {
        // https://www.getbeamer.com/help/how-to-unblock-notification-permissions-on-any-browser
        // https://support.google.com/chrome/answer/3220216
        const pBlocked = mkElt("p", undefined, [
            `You have blocked notifications ${grantedNotification} times (or more) and must reset this.`,
            " (", aUnblock, ")"
        ]);
        divNotifProbem.appendChild(pBlocked);
    } else {
        if (Notification.permission === "default") {
            const pReload = mkElt("p", undefined, "Please reload this page and allow notifications.");
            divNotifProbem.appendChild(pReload);
        } else {
            const pBlocked = mkElt("p", undefined, [
                `You have blocked notifications and must reset this.`,
                " (", aUnblock, ")"
            ]);
            divNotifProbem.appendChild(pBlocked);
        }
    }
    // document.body.appendChild(divNotifProbem);
    const dlg = await modMdc.mkMDCdialogAlert(divNotifProbem);
    return false;
}


async function setupForInstall() {
    const modMdc = await import("util-mdc");
    // https://web.dev/customize-install/#criteria
    // Initialize deferredPrompt for use later to show browser install prompt.
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
        // console.log(`'beforeinstallprompt' event was fired.`);
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI notify the user they can install the PWA
        showInstallPromotion();
    });

    window.addEventListener('appinstalled', () => {
        // Hide the app-provided install promotion
        hideInstallPromotion();
        // Clear the deferredPrompt so it can be garbage collected
        deferredPrompt = null;
        // Optionally, send analytics event to indicate successful install
        console.log('PWA was installed');
    });

    const divInstallPromotion = mkElt("dialog", { id: "div-please-install" }, [
        mkElt("h2", undefined, "Please install this app"),
        mkElt("p", undefined, [
            "If you do that you can share from other apps to this app.",
        ]),
        mkElt("p", undefined, ["navigator.platform: ", navigator.platform]),
        mkElt("p", undefined, ["navigator.userAgentData.platform: ", navigator.userAgentData?.platform]),
    ]);
    divInstallPromotion.style.display = "none";
    document.body.appendChild(divInstallPromotion);
    // const btnInstall = mkElt("button", undefined, "Install");
    const btnInstall = modMdc.mkMDCbutton("Install", "raised");
    btnInstall.addEventListener("click", async (evt) => {
        // debugger;
        // divInstallPromotion.style.display = "none";
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        // Optionally, send analytics event with outcome of user choice
        console.log(`User response to the install prompt: ${outcome}`);
        // We've used the prompt, and can't use it again, throw it away
        deferredPrompt = null;
    });

    const btnLater = modMdc.mkMDCbutton("Later", "outlined");
    btnLater.addEventListener("click", (evt) => {
        divInstallPromotion.remove();
    });

    divInstallPromotion.appendChild(btnInstall);
    divInstallPromotion.appendChild(btnLater);
    function hideInstallPromotion() {
        divInstallPromotion.style.display = "none";
    }
    function showInstallPromotion() {
        divInstallPromotion.style.display = null;
    }

}

function addDebugRow(inner) {
    const pRow = mkElt("p", undefined, inner);
    // const divDebug = document.getElementById("debug-section");
    divDebug.appendChild(pRow);
}
function addDebugLocation(loc) {
    const inner = mkElt("a", { href: loc }, loc);
    addDebugRow(inner);
}
async function addDebugDiv() {
    // const parsedUrl = new URL(window.location);
    // const title = parsedUrl.searchParams.get('title');
    // const text = parsedUrl.searchParams.get('text');
    // const url = parsedUrl.searchParams.get('url');
    const regs = await navigator.serviceWorker.getRegistrations();
    addDebugRow(`Registered service workers: ${regs.length}`);
    const loc = location.href;
    addDebugLocation(loc);
    const u = new URL(loc);
    u.pathname = "manifest.json";
    addDebugLocation(u.href);
    addDebugRow(`navigator.userAgentData.platform: ${navigator.userAgentData?.platform}`);
}

let mainMenu;
async function getMenu() {
    const modMdc = await import("util-mdc");
    if (mainMenu) return mainMenu;
    const menu = await mkMenu();
    if (!mainMenu) {
        mainMenu = menu;
        // document.body.appendChild(mainMenu);
        const eltContainer = document.getElementById("menu-container");
        const useExpander = false;
        if (!useExpander) {
            eltContainer.appendChild(mainMenu);
        } else {
            mainMenu.classList.add("expander-content");
            const divExpander = mkElt("div", { id: "main-menu-expander", class: "expander" }, mainMenu);
            eltContainer.appendChild(divExpander);
        }

        const eltToggle = document.getElementById("menu-toggle");
        eltToggle.addEventListener("click", evt => {
            // eltContainer.classList.toggle("open");
            toggleMenu();
        });

        const eltSearchCheck = document.getElementById("header-search-check");
        const iconChecklist = modMdc.mkMDCicon("today");
        iconChecklist.id = "icon-check-beside-search";
        const iconSearch = modMdc.mkMDCicon("search");
        iconSearch.id = "icon-search-beside-check";

        // imgTestSearch = mkElt("img", { class: "icon-sized", src: "/ext/mdc/icon/search.svg" });
        const spanIcons = mkElt("span", { id: "span-checklist-search" }, [
            iconChecklist,
            iconSearch,
            // imgTestSearch,
        ]);
        let eltFocusedBefore;
        const btnReminders = modMdc.mkMDCbutton(spanIcons);
        btnReminders.title = "Reminders";
        eltSearchCheck.appendChild(btnReminders);
        btnReminders.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            // console.warn("clicked search check");
            dialog10min1hour(eltFocusedBefore);
        }));
        btnReminders.addEventListener("focus", errorHandlerAsyncEvent(async evt => {
            // console.log("btnSearchCheck focus", evt, evt.relatedTarget);
            eltFocusedBefore = evt.relatedTarget;
        }));

        const eltBackdrop = document.getElementById("menu-backdrop");
        eltBackdrop.addEventListener("click", evt => {
            // eltContainer.classList.toggle("open");
            toggleMenu();
        });
    }
    return mainMenu;
}
let eltActiveBeforeMenu;
function toggleMenu() {
    const eltContainer = document.getElementById("menu-container");
    if (!eltContainer.classList.contains("open")) eltActiveBeforeMenu = document.activeElement;
    eltContainer.classList.toggle("open");
    const eltExpander = eltContainer.querySelector(".expander");
    eltExpander?.classList.toggle("expanded");
}

function clearMainSection(newPageId) {
    const secMain = document.getElementById("main-section");
    while (secMain.firstElementChild) { secMain.firstElementChild.remove(); }
    document.body.id = newPageId;
    return secMain;
}
async function justShowKey(key) {
    const secMain = clearMainSection("page-show-key");
    const dbFc4i = await getDbFc4i();
    // const db = await dbFc4i.getDb();
    // const keyRec = await db.get(idbStoreName, key);
    const keyRec = await dbFc4i.getDbKey(key);
    if (keyRec) {
        const eltH = mkElt("div", undefined, [
            mkElt("p", undefined, "This is the item linked in the mindmap.")
        ]);
        const eltRem = await mkEltInputRemember(keyRec, eltH);
        secMain.appendChild(eltRem);
    } else {
        secMain.appendChild(mkElt("h2", undefined, "Not found"));
        const pNotFound = mkElt("p", undefined, `Could not find item with key=${key}`);
        secMain.appendChild(mkElt("p", undefined, pNotFound));
    }
}
async function showKeyToRemember(key, timerInfo) {
    const secMain = clearMainSection("page-show-key");
    const dbFc4i = await getDbFc4i();
    const keyRec = await dbFc4i.getDbKey(key);
    console.log({ keyRec });
    const style = [
        "font-size: 1rem",
        "color: wheat",
        "background-color: purple"
    ].join("; ");
    const eltH = mkElt("div", undefined, [
        mkElt("div", {
            // style, class: "mdc-card"
            class: "notification-header mdc-card"
        }, [
            mkElt("p", undefined, [

                "Please try now to rememeber this. ",
                "(Created more than ", `(${timerInfo})`, " ago.)",
            ]),
            mkElt("details", undefined, [
                mkElt("summary", undefined, "Tips for learning"),
                " You can find some tips to help you learn ",
                mkElt("a", {
                    target: "_blank",
                    href: "https://learningcenter.unc.edu/tips-and-tools/enhancing-your-memory/"
                }, "here"),
                ":",
                mkElt("ul", undefined, [
                    mkElt("li", undefined, "Try to understand the information 🤨"),
                    mkElt("li", undefined, "Link it to what you already know (a mindmap 📎?)"),
                    mkElt("li", undefined, "Maybe sleep on it? 🥱"),
                    mkElt("li", undefined, "Test yourself 🤔 (like you are doing now...)"),
                    mkElt("li", undefined, "Repeat (with some time ⏰ between!)"),
                    mkElt("li", undefined, "Write down what you know 📜🖍"),
                    mkElt("li", undefined, "Add tags 🔖"),
                    mkElt("li", undefined, "Use images and mnemonics 🎼🎪🎭"),
                    mkElt("li", undefined, "Keep your body healthy 🐱‍🏍🥦"),
                    mkElt("li", undefined, "Mix the different tips over time ⏰🛠"),
                ]),
            ]),
        ]),
    ]);
    const eltRem = await mkEltInputRemember(keyRec, eltH);
    secMain.appendChild(eltRem);
}
function mkImageThumb(blob) {
    const eltImg = mkElt("span", { class: "image-bg-cover image-thumb-size" });
    const urlBlob = URL.createObjectURL(blob);
    const urlBg = `url(${urlBlob})`;
    // console.log({ blob, urlBlob });
    eltImg.style.backgroundImage = urlBg;
    return eltImg;
}

async function appendRem(rem, toDiv) {
    const modMdc = await import("util-mdc");
    const card = modMdc.mkMDCcard();
    card.classList.add("subject-card");

    // https://fonts.google.com/icons
    const btnDeleteWastebasket = modMdc.mkMDCiconButton("delete_forever");
    btnDeleteWastebasket.classList.add("mdc-theme--secondary-bg");
    btnDeleteWastebasket.addEventListener("click", errorHandlerAsyncEvent(async evt => {
        deleteEntry(rem.key, card);
    }));

    // const firstImageBlob = null;
    const firstImageBlob = rem.images ? rem.images[0] : null;
    const indStatus = mkStatusIndicator(5, "height");
    // indStatus.mySet(3); // FIX-ME:
    let indVal = rem.confRem;
    // Take care of old values outside of range:
    indVal = Math.max(indVal, 1);
    indVal = Math.min(indVal, 5);
    indStatus.mySet(indVal); // FIX-ME:
    const eltImg = firstImageBlob ? mkImageThumb(firstImageBlob) : "";

    const eltTitle = mkElt("span", { class: "has-title" }, rem.title);
    eltTitle.dataset.keyRecord = rem.key;
    const sumInternal = mkElt("span", { class: "subject-summary-spanx" }, [
        mkElt("div", { class: "for-details-closed subject-summary-span" }, [
            indStatus,
            eltImg,
            eltTitle,
        ]),
        mkElt("div", { class: "for-details-open" }, "Close")
    ]);

    if (firstImageBlob) sumInternal.classList.add("has-image");
    const sum = mkElt("summary", { class: "unsaved-marker" }, [
        sumInternal
    ]);
    const det = mkElt("details", { class: "unsaved-marker-container" }, [sum]);
    det.addEventListener("toggle", async evt => {
        if (det.open) {
            if (det.childElementCount == 1) {
                const eltRem = await mkEltInputRemember(rem);
                det.appendChild(eltRem);
            }
        }
    });
    card.appendChild(det);
    toDiv.appendChild(card);
}
const detsOutput = {}
// let divActiveNewest;
let divActive;
async function displayMatchingReminders(searchFor, minConf, maxConf, requiredTags, cantRefresh) {
    const dbFc4i = await getDbFc4i();
    if (![false, true, undefined].includes(cantRefresh)) {
        console.error(`cantRefresh: ${cantRefresh}`);
        throw Error(`cantRefresh: ${cantRefresh}`);
    }

    if (!divActive) {
        divActive = mkElt("div", { id: "div-active", class: "subjects-list" });
    }
    if (!divActive.isConnected) {
        // divActive.textContent = "";
        const divHome = document.getElementById("div-home");
        divHome.appendChild(divActive);
    }

    const arrActive = []
    arrActive.length = 0;
    const arrActiveDay = []
    arrActiveDay.length = 0;
    const arrActiveWeek = []
    arrActiveWeek.length = 0;
    const arrOld = []
    arrOld.length = 0;

    // const dbFc4i = await getDbFc4i();
    const allMatchingItems = await dbFc4i.getDbMatching(searchFor, minConf, maxConf, requiredTags);
    const allMatchingKeys = allMatchingItems.map(item => item.key).sort();
    const strAllMatchingKeys = allMatchingKeys.join(";");
    const r = allMatchingKeys.sort();
    if (r.join(";") != strAllMatchingKeys) throw Error("allMatchingkeys was not sorted");

    const divSearchBanner = document.getElementById("div-search-banner");
    divSearchBanner.lastSearch = { searchFor, minConf, maxConf, requiredTags }
    if (divSearchBanner.oldKeys == strAllMatchingKeys) return;

    if (cantRefresh && (divSearchBanner.oldKeys)) {
        // FIX-ME: Can't happen now
        throw Error("bad path");
        const btnRefresh = document.getElementById("cant-refresh");
        if (btnRefresh) return;
        const newBtnRefresh = modMdc.mkMDCbutton("Refresh", "raised");
        newBtnRefresh.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            displayMatchingReminders(searchFor, minConf, maxConf, requiredTags);
        }));
        divSearchBanner.appendChild(mkElt("span", undefined, " Outdated! "));
        divSearchBanner.appendChild(newBtnRefresh);
        return;
    }

    async function checkSearchNeedsRefresh() {
        // doSearch(true);
        const last = divSearchBanner.lastSearch;
        const dbFc4i = await getDbFc4i();
        const allMatchingItems = await dbFc4i.getDbMatching(last.searchFor, last.minConf, last.maxConf, last.requiredTags);
        const allMatchingKeys = allMatchingItems.map(rec => rec.key);
        const strKeys = allMatchingKeys.join(";");
        console.log({ allMatchingKeys });
        if (divSearchBanner.oldKeys != strKeys) {
            // refresh"
            const modMdc = await import("util-mdc");
            const btnRefresh = document.getElementById("cant-refresh");
            if (btnRefresh) return;
            const newBtnRefresh = modMdc.mkMDCbutton("Refresh", "raised");
            newBtnRefresh.addEventListener("click", errorHandlerAsyncEvent(async evt => {
                displayMatchingReminders(last.searchFor, last.minConf, last.maxConf, last.requiredTags);
            }));
            // divSearchBanner.appendChild(mkElt("span", undefined, " Outdated! "));
            // divSearchBanner.appendChild(newBtnRefresh);
            eltSearchBanner.textContent = "- ";
            eltSearchBanner.appendChild(mkElt("i", undefined, `Search result outdated `));
            eltSearchBanner.appendChild(newBtnRefresh);
        }
    }
    // FIX-ME: doSave
    const restartRefreshSearchTimer = (() => {
        let tmr;
        return () => {
            clearTimeout(tmr);
            tmr = setTimeout(checkSearchNeedsRefresh, 5 * 1000);
        }
    })();

    const eltSearchBanner = document.getElementById("h3-search-banner")
    eltSearchBanner.checkSearchNeedsRefresh = restartRefreshSearchTimer;
    eltSearchBanner.textContent = "- ";
    eltSearchBanner.appendChild(mkElt("i", undefined,
        `Search result (${allMatchingItems.length} of ${await dbFc4i.countAllReminders()}):`));
    divSearchBanner.style.display = (searchFor == undefined) ? "none" : "block";

    divSearchBanner.oldKeys = strAllMatchingKeys;


    const msNow = new Date().getTime();
    let nNew = 0;
    keyAndTimesOrder.forEach(label => {
        const rec = keyAndTimes[label];
        rec.items.length = 0;
    });

    allMatchingItems.forEach(r => {
        const ts = r.timers;
        dbFc4i.checkTimersOrder(ts);
        const len = ts.length;
        let active = false;
        for (let i = 0; i < len; i++) {
            const timer = ts[i];
            const msWhen = timer.msWhen;
            const msDelay = timer.msDelay;
            active = active || (msWhen > msNow && msDelay > 0);
            // console.log({ timer, msWhen, expired });
        }
        nNew++;
        // FIX-ME: new version
        for (let i = 0, len = keyAndTimesOrder.length; i < len; i++) {
            const partName = keyAndTimesOrder[i];
            const part = keyAndTimes[partName];
            const timeBorder = part.timeBorder;
            if (r.key > timeBorder) {
                part.items.push(r);
                break;
            }
            // FIX-ME: older
        }

        if (active) {
            const rKey = r.key;
            const olderDay = isMoreThanADayAgo(rKey);
            // console.log({ olderDay, rKey });
            if (!olderDay) { arrActive.push(r); return; }
            const olderWeek = isMoreThanAWeekAgo(rKey);
            if (!olderWeek) { arrActiveDay.push(r); return; }
            arrActiveWeek.push(r);
        } else {
            arrOld.push(r);
        }
    });
    // console.log({ allMatchingItems, allMatchingKeys });
    // console.log({ nNew, keyAndTimes });
    // Cut tail
    let cut = true;
    for (let len = keyAndTimesOrder.length, i = len - 1; i >= 0; i--) {
        const label = keyAndTimesOrder[i];
        const rec = keyAndTimes[label];
        const num = rec.items.length;
        // console.log(label, num);
        if (num > 0) cut = false;
        // cut = false;  // FIX-ME:
        rec.cut = cut;
    }

    keyAndTimesOrder.forEach(label => {
        const rec = keyAndTimes[label];
        // console.log({ rec });
        const det = insertOlder(rec.items, label, rec.cut);
        // if (det) det.style.outline = "4px dotted red";
    });

    function insertOlder(arrThatOlder, listTitle, cut) {
        let detThatOlder = detsOutput[listTitle];
        if (cut) {
            if (detThatOlder?.isConnected) { detThatOlder.remove(); }
            return;
        }
        let divThatOlder = detThatOlder?.querySelector(".older-rem-container");
        let itemCounter;
        if (!detThatOlder) {
            divThatOlder = mkElt("div", { class: "xmdc-theme--surface older-rem-container expander-content" });
            const divThatOlderExpander = mkElt("div", { class: "expander" }, divThatOlder);
            itemCounter = mkElt("span", { class: "item-counter" });
            detThatOlder = mkElt("details", { class: "older-rem-list" }, [
                // mkElt("summary", { class: "mdc-theme--primary-bg" }, `${listTitle} (${arrThatOlder.length})`),
                mkElt("summary", { class: "mdc-theme--primary-bg" }, [
                    listTitle,
                    " (",
                    itemCounter,
                    ")"
                ]),
                // divThatOlder
                divThatOlderExpander
            ]);
            detsOutput[listTitle] = detThatOlder;
            // divActive.appendChild(detThatOlder);
        } else {
            itemCounter = detThatOlder.querySelector(".item-counter");
        }
        if (!detThatOlder.isConnected) divActive.appendChild(detThatOlder);
        const strKeys = arrThatOlder.map(obj => obj.key).sort().join(";");
        if (divThatOlder.oldKeys == strKeys) return detThatOlder;
        divThatOlder.oldKeys = strKeys;

        itemCounter.textContent = arrThatOlder.length;
        divThatOlder.textContent = "";
        if (arrThatOlder.length == 0) {
            divThatOlder.appendChild(mkElt("div", { class: "text-on-page-home" }, "No matching items here."));
            return detThatOlder;
        }
        arrThatOlder.forEach(rem => { appendRem(rem, divThatOlder); });
        return detThatOlder;
    }
    // insertOlder(arrActive, "Today");
    // insertOlder(arrActiveDay, "Older than one day");
    // insertOlder(arrActiveWeek, "Older than one week");

}

function getHomeSearchValues() {
    const inpSearch2 = document.getElementById("search-input");
    // if (inpSearch !== inpSearch2) debugger;
    const divSearchSlider2 = document.getElementById("div-search-slider");
    // if (divSearchSlider !== divSearchSlider2) debugger;
    const sliSearchConfidence2 = divSearchSlider2.firstElementChild;
    // if (sliSearchConfidence !== sliSearchConfidence2) debugger;
    const divTagsRequired2 = document.getElementById("div-required-tags");
    // if (divTagsRequired !== divTagsRequired2) debugger;
    return getHomeSearchValuesFromElts(inpSearch2, sliSearchConfidence2, divTagsRequired2);
}
function getHomeSearchValuesFromElts(inpSearch, sliSearchConfidence, divTagsRequired) {
    const strSearch = inpSearch.value;
    const mdcSlider = sliSearchConfidence.myMdc;
    let minRange = mdcSlider?.getValueStart() || 1;
    let maxRange = mdcSlider?.getValue() || 5;
    if (minRange == 1) minRange = 0;
    if (maxRange == 5) maxRange = 7;
    const reqTags = [...divTagsRequired.querySelectorAll(".tag-in-our-tags")]
        .filter(span => {
            const chk = span.firstElementChild;
            const checked = chk.checked;
            // const tag = span.textContent.substr(1);
            return checked;
        })
        .map(span => span.textContent.substr(1));
    return { strSearch, minRange, maxRange, reqTags };
}

async function goHome() {
    const modMdc = await import("util-mdc");
    const secMain = clearMainSection("page-home");

    // for (let key in detsOutput) delete detsOutput[key];
    // divActiveNewest = undefined;

    // const divActiveNewest = mkElt("div", { class: "rem-list" });
    // const divActive = mkElt("div", { class: "subjects-list" }, divActiveNewest);
    // const divOld = mkElt("div", { class: "subjects-list" });

    // const arrActive = [];
    // const arrActiveDay = [];
    // const arrActiveWeek = [];
    // const arrOld = [];
    // const allRem = [];

    // const detsOutput = {};

    const eltSearchBanner = mkElt("h3", { id: "h3-search-banner" });
    const divSearchBanner = mkElt("div", { id: "div-search-banner", class: "text-on-page-home" }, eltSearchBanner);

    // await displayMatchingReminders();





    // const btnSearch = modMdc.mkMDCiconButton("search", "search your items");
    const svgSearch = modMdc.mkMDCsvgIcon("search");
    const btnSearch = modMdc.mkMDCiconButton(svgSearch, "search your items");
    btnSearch.classList.add("mdc-theme--secondary-bg");

    const inpSearch = modMdc.mkMDCtextFieldInput("search-input", "search");
    const fieldSearch = modMdc.mkMDCtextFieldOutlined("Search", inpSearch);
    fieldSearch.id = "field-search";
    inpSearch.addEventListener("input", evt => {
        restartSearchTimer();
    });
    function onChangeSearchSlider() {
        restartSearchTimer();
    }
    let sliSearchConfidence;
    const divSearchSlider = mkElt("div", { id: "div-search-slider", class: "mdc-theme--secondary-bg" }, [
        "Match only items with confidence between:",
    ]);

    divSearchTheTags = mkElt("div", { id: "div-search-the-tags" });
    divSearchTheTags.addEventListener("change", evt => {
        // console.log({ evt });
        restartSearchTimer();
    });

    const dbFc4i = await getDbFc4i();
    const numItems = await dbFc4i.countAllReminders();
    await updateDivSearchTheTags();
    // await checkUnusedTags();



    const divTagsRequired = mkElt("div", { id: "div-required-tags" }, [
        "Require tags: ",
        divSearchTheTags,
    ]);

    function doSearch(cantRefresh) {
        if (![true, false].includes(cantRefresh)) {
            console.error(`cantRefresh: ${cantRefresh}`);
            throw Error(`cantRefresh: ${cantRefresh}`);
        }
        const { strSearch, minRange, maxRange, reqTags } =
            getHomeSearchValues();
        // getHomeSearchValuesFromElts(inpSearch, sliSearchConfidence, divTagsRequired);
        // console.log(`doSearch: ${val}, ${minRange}, ${maxRange}, ${reqTags}`);
        displayMatchingReminders(strSearch, minRange, maxRange, reqTags, cantRefresh);
    }
    const restartSearchTimer = (() => {
        let tmr;
        return () => {
            clearTimeout(tmr);
            tmr = setTimeout(() => doSearch(false), 1000);
        }
    })();

    // restartRefreshSearchTimer



    const homeTitle = mkElt("span", { id: "home-title" }, `Your items (${numItems})`);
    btnSearch.addEventListener("click", errorHandlerAsyncEvent(async evt => {
        divhHome.classList.toggle("is-searching");
        if (!divhHome.classList.contains("is-searching")) {
            displayMatchingReminders();
        } else {
            // div-search-slider
            if (!sliSearchConfidence) {
                sliSearchConfidence = await modMdc.mkMDCslider(1, 5, [1, 5], 1, "Confidence", onChangeSearchSlider, undefined, false);
                divSearchSlider.appendChild(sliSearchConfidence);
                // console.log("adding class search-slider");
                sliSearchConfidence.classList.add("search-slider");
                sliSearchConfidence.classList.add("mdc-my-slider-colors-fix");
                // console.log("adding class search-slider DONE");
            } else {
                // doSearch(false);
            }
            fieldSearch.focus(); // FIX-ME:
            doSearch(false);
        }
    }));
    const hHome = mkElt("div", { id: "h-your-items" }, [
        btnSearch,
        // newbtnSearch,
        mkElt("div", undefined, [fieldSearch, homeTitle,])
    ]);
    const pSearchBroken = mkElt("p", {
        style: "background:green; color:yellow; padding: 10px;",
        class: "mdc-card"
    },
        `Search output is fixed!`
    );
    const divhHome = mkElt("div", { id: "div-h-your-items", class: "mdc-card mdc-theme--secondary-bg" }, [
        hHome, divSearchSlider, divTagsRequired,
        // pSearchBroken
    ]);
    const divHome = mkElt("div", { id: "div-home" }, [
        divhHome,
        divSearchBanner,
        // FIX-ME
        // divActive,
        // divOld
    ]);
    secMain.appendChild(divHome);
    await displayMatchingReminders();
}
function showDebug() {
    const secMain = clearMainSection("page-debug");
    secMain.appendChild(divDebug);
    function checkFontSizes() {
        const pDebug = divDebug.firstElementChild;
        const pDebugFontSize = window.getComputedStyle(pDebug).fontSize;
        const spanTitle = document.getElementById("header-title");
        const titleFontSize = window.getComputedStyle(spanTitle).fontSize;
        addDebugRow(`debug: ${pDebugFontSize}, title: ${titleFontSize}`);
    }
    setTimeout(checkFontSizes, 1000);
}
// function displayIntro() {
// }

async function showIntro() {
    const modMdc = await import("util-mdc");
    const secMain = clearMainSection("page-about");
    secMain.appendChild(
        mkElt("h1", undefined, `About ${visibleAppTitle} (ver ${swVersion})`)
    );
    const pAbout = mkElt("p", undefined,
        `
    Are you like me trying to learn from a lot of different things you find on the internet?
    Then this litte web app is made for you and me.
    `);
    const iconShare = modMdc.mkMDCicon("share");
    iconShare.style.fontSize = "1rem";
    // iconShare.style.verticalAlign = "text-bottom";
    iconShare.style.verticalAlign = "middle";
    const imgStyle = [
        "display: inline-block",
        "width: 1.2rem",
        "height: 1.2rem",
        // "vertical-align: text-bottom",
        "vertical-align: middle",
        "background-image: url(/img/192.png)",
    ]
    const style = imgStyle.join("; ");
    const iconThisApp = mkElt("span", { style, class: "image-bg-cover" });
    const pIdea = mkElt("p", undefined, [
        `
        The idea is that you "share" (`,
        iconShare,
        `) from a web page you find interesting to this app ( `,
        iconThisApp,
        ` ). The link is saved in this app.
        And you can use flashcards and your study notes to learn.
        You can also get daily reminders.
        `
    ]);
    const pKeep = mkElt("p", undefined, [
        `
        Please notice that this link and your notes, etc, is only saved on your device.
        If you want more permanent notes I recommend 
        `,
        mkElt("a", {
            href: "https://9to5google.com/2023/01/31/what-you-can-do-google-keep/",
            target: "_blank"
        }, "Google Keep"),
        "."
    ]);
    const stylesFacebook = [
        "background-color: rgb(24, 119, 242)",
        "color: white",
        "padding: 1rem"
    ];
    const urlImgFb = "/img/f_logo_RGB-White_58.png";
    const arrImgFbStyle = [
        "width: 30px",
        "float: left",
        "margin-right: 10px",
    ];
    const imgFbStyle = arrImgFbStyle.join("; ");
    const imgFb = mkElt("img", { src: urlImgFb, style: imgFbStyle });
    const pFacebook = mkElt("p", { class: "mdc-card", style: stylesFacebook.join(";") }, [
        imgFb,
        `I have created a Facebook group, `,
        mkElt("a", {
            href: "https://www.facebook.com/groups/flashcards4internet",
            target: "_blank",
            style: "color: white"
        }, "Flashcards 4 Internet (web app)"),
        `, where you can comment on this app. Suggestions are very welcome!`

    ]);
    const pTips = mkElt("p", undefined, [
        `I am really no expert on learning, but here are some tips:`
    ]);


    const divContent = mkElt("div", undefined, [
        pAbout,
        pIdea,
        pKeep,
        pFacebook,
        pTips,
    ]);
    secMain.appendChild(divContent);

    // https://www.inc.com/jeff-haden/need-to-learn-faster-neuroscience-says-these-7-memory-retention-skill-acquisition-strategies-work-best.html
    // https://www.hendrix.edu/uploadedFiles/Academics/Faculty_Resources/2016_FFC/Learn%20then%20sleep.pdf

    // https://www.sciencedaily.com/releases/2016/08/160822083446.htm
    const aSleepBetween = mkElt("a", {
        href: "https://www.sciencedaily.com/releases/2016/08/160822083446.htm"
    }, "Sleep makes relearning faster and longer-lasting");
    const aSleepBetweenPdf = mkElt("a", {
        href: "https://www.hendrix.edu/uploadedFiles/Academics/Faculty_Resources/2016_FFC/Learn%20then%20sleep.pdf"
    }, "PDF");
    const divSleepBetween = mkElt("p", undefined, [
        aSleepBetween,
        " (", aSleepBetweenPdf, ")",
    ]);
    // secMain.appendChild(divSleepBetween);

    // https://www.lifehack.org/articles/featured/back-to-basics-reminders.html
    const aLifeHackReminders = mkElt("a", {
        href: "https://www.lifehack.org/articles/featured/back-to-basics-reminders.html"
    }, "The Importance of Reminders (And How to Make a Reminder Work)");
    const divLifeHackReminders = mkElt("p", undefined, [
        aLifeHackReminders,
    ]);
    // secMain.appendChild(divLifeHackReminders);


    // https://www.youtube.com/watch?v=24ecRKfEweU
    const aStuy2hoursAday = mkElt("a", {
        href: "https://www.youtube.com/watch?v=24ecRKfEweU"
    }, "How to Study Only 2 Hours a Day yet STILL Ace your Exams");
    const divStuy2hoursAday = mkElt("p", undefined, [
        aStuy2hoursAday,
    ]);
    // secMain.appendChild(divStuy2hoursAday);

    const ulTips = mkElt("ul", undefined, [
        mkElt("li", undefined, divStuy2hoursAday),
        mkElt("li", undefined, divLifeHackReminders),
        mkElt("li", undefined, divSleepBetween),
    ]);
    secMain.appendChild(ulTips);

    // The dark side
    const pPWA = mkElt("p", undefined, [
        `This app is actually just a web site with two additions
        (made possible by that it is a PWA):`,
        mkElt("div", { style: "margin-top: 10px;" }, "1) You can view it even if you are not online."),
        mkElt("div", undefined, "2) You can 'share' to it."),
    ]);
    const pSecurity = mkElt("p", undefined, [
        `Because this app is just a web site it is just as secure as a web site.
        It can't harm your mobile or computer (more than a web site can).
        `
    ]);
    const pShare = mkElt("p", undefined, [
        `Unfortunately ´share´ to this app can only work on Android with Google Chrome today.
        It is the only case where the technical capabilities are available now.
        But you can still use this app now on for example both on iPhone and Windows. 
        It is just the possibility to 'share' that does not work there.
        `
    ]);
    const divReminders = mkElt("div", undefined, [
        mkElt("p", undefined, [
            `Unfortunately `,
            mkElt("a", {
                href: "https://github.com/beverloo/notification-triggers/issues/7",
                target: "_blank"
            }, "timers for reminders are not yet supported in PWA:s"),
            "."
        ]),
        mkElt("p", undefined, [
            `So I have added a workaround.
            And actually I think works perhaps even better. 😌
            At the top right there is a button.
            Just click that to check for reminders.`,
        ]),
        mkElt("p", undefined,
            mkElt("img", { src: "/img/btn-check-reminders.png", width: "50%" })),
    ]);
    const divDarkSide = mkElt("div", { id: "div-dark-side", class: "mdc-card" }, [
        mkElt("h2", undefined, "The dark side - Technology"),
        pPWA,
        mkElt("h3", undefined, "Good security"),
        pSecurity,
        mkElt("h3", undefined, "Share currently works only on Android"),
        pShare,
        mkElt("h3", { style: "color:red" }, "Reminders - do they work?"),
        divReminders,
    ]);
    secMain.appendChild(divDarkSide);

}

async function showAddedNew(sharedParams) {
    const dbFc4i = await getDbFc4i();
    const secMain = clearMainSection("page-added-new");
    const oldRec = sharedParams?.url ? await dbFc4i.getViaUrl(sharedParams.url) : undefined;
    // console.log({ oldRec });
    let eltInpRem;
    if (oldRec) {
        const eltH = mkElt("div", undefined, [
            mkElt("div", { style: "color:darkred; font-style: italic;" }, "Link matched this old entry!"),
        ])
        // eltInpRem = await mkEltInputRemember(oldRec, "There was already an old entry, showing this");
        eltInpRem = await mkEltInputRemember(oldRec, eltH);
    } else if (sharedParams) {
        eltInpRem = await mkEltInputRemember(sharedParams, mkElt("i", undefined, "Added new from shared link"), true);
    } else {
        eltInpRem = await mkEltInputRemember(undefined, mkElt("i", undefined, "Enter the new url to remember"));
    }
    secMain.appendChild(eltInpRem);
}
async function testLogin() {
    const modSignIn = await import("/src/js/mod/sign-in.js");
    console.log({ modSignIn });
    const i = await modSignIn.signIn();
}

async function setupFCM() {
    // This is the setup from the documentation:
    // https://firebase.google.com/docs/cloud-messaging/js/client
    // There is a totally different setup on the GitHub project linked from the doc above???
    // https://github.com/firebase/quickstart-js/blob/master/messaging/index.html

    const modAuth = await import('https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js');
    const modApp = await import('https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js');
    const modMessaging = await import('https://www.gstatic.com/firebasejs/9.17.2/firebase-messaging.js');
    const firebaseConfig = {
        apiKey: "AIzaSyABnDkYRuWelljRnJyuc3ip50JyO9Z5lH4",
        authDomain: "rem10m1h.firebaseapp.com",
        projectId: "rem10m1h",
        storageBucket: "rem10m1h.appspot.com",
        messagingSenderId: "85320812355",
        appId: "1:85320812355:web:190a12a6aa4d528ea791f6"
    };
    const app = modApp.initializeApp(firebaseConfig);
    const messaging = modMessaging.getMessaging(app);
    // FCMtoken = await modMessaging.getToken();
    modMessaging.onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);
        // ...
    });
    // Add the public key generated from the console here.
    const publicWebPushKey =
        "BAT5B8BBwFwIggxMmRubj-BQXif_AvsdCbC-lQO--pypKkaO9EOhGw3I2O0UINKadChTq9JCsdZlwQC_6PDeZN8";
    // const token = await modMessaging.getToken(messaging, { vapidKey: publicWebPushKey });
    FCMtoken = await modMessaging.getToken(messaging, { vapidKey: publicWebPushKey });
    console.log({ FCMtoken });
    // debugger;
}
let testShortSwitch = true;
async function testShort() {
    testShortSwitch = true;
}
async function testFCM() {

    const msg = "out test message";

    const paramsObj = {}
    paramsObj.fcmtoken = FCMtoken;
    paramsObj.msg = msg || "no message";
    const paramsName = "testfcm";
    // const url = "/" + paramsName;
    // const result = await fetchParamsJson(url, paramsName, paramsObj)
    const result = await fetchSimpleJson(paramsName, paramsObj)
    console.log("%c Answer testfcm ", "color:yellowgreen; background:black;", result.answer);
    return result.answer.sent;

}
function test4tasks() {
    location.href = "/test-login.html";
}
async function showTestShareLink() {
    location.href = "index.html?text=TEXT&title=TITLE&url=" + encodeURIComponent("https:svt.se");
}
async function add2TestJsMindFc4i() {
    // current get reminders
    // no item sel
    location.href = "fc4i-mindmaps.html";
}
async function showTestJsMindArrayTree() { location.href = "test-jsmind-tree-array.html"; }
async function showTestTarget() {
    location.href = "share?text=TARGETTEXT&title=TARGETTITLE&url=" + encodeURIComponent("https:svt.se");

}
async function showSharedTo() {
    const secMain = clearMainSection("page-shared-to");
}
async function mkMenu() {
    const modMdc = await import("util-mdc");

    const liHome = modMdc.mkMDCmenuItem("Home");
    liHome.addEventListener("click", evt => { goHome(); });

    const liIntro = modMdc.mkMDCmenuItem("About");
    liIntro.addEventListener("click", evt => { showIntro(); })

    const liNew = modMdc.mkMDCmenuItem("New");
    liNew.addEventListener("click", evt => { showAddedNew(); })

    const liShowDebug = modMdc.mkMDCmenuItem("Show debug info");
    liShowDebug.addEventListener("click", evt => { showDebug(); })
    liShowDebug.classList.add("test-item");

    const liTestFCM = modMdc.mkMDCmenuItem("Test FCM");
    liTestFCM.addEventListener("click", evt => { testFCM(); })
    liTestFCM.classList.add("test-item");

    const liTestShort = modMdc.mkMDCmenuItem("Test short timers");
    liTestShort.addEventListener("click", evt => { testShort(); })
    liTestShort.classList.add("test-item");

    const liTestLogin = modMdc.mkMDCmenuItem("Test login");
    liTestLogin.addEventListener("click", evt => { testLogin(); })
    liTestLogin.classList.add("test-item");

    const liTest4tasks = modMdc.mkMDCmenuItem("Test 4 tasks");
    liTest4tasks.addEventListener("click", evt => { test4tasks(); })
    liTest4tasks.classList.add("test-item");

    // const liTestShareLink = modMdc.mkMDCmenuItem("Test /share.html with args");
    // liTestShareLink.addEventListener("click", evt => { showTestShareLink(); })
    // liTestShareLink.classList.add("test-item");

    const liTestShareWithArgs = modMdc.mkMDCmenuItem("Test /share with args");
    liTestShareWithArgs.addEventListener("click", evt => { showTestTarget(); })
    liTestShareWithArgs.classList.add("test-item");

    const liMindmaps = modMdc.mkMDCmenuItem("Mindmaps");
    liMindmaps.addEventListener("click", errorHandlerAsyncEvent(async evt => {
        const modJEfc4i = await import("/src/js/jsmind-edit-spec-fc4i.js");
        modJEfc4i.dialogMindMapsFc4i();
    }));

    const liJsmindEdit = modMdc.mkMDCmenuItem("Jsmind-edit");
    liJsmindEdit.classList.add("test-item");
    liJsmindEdit.addEventListener("click", errorHandlerAsyncEvent(async evt => {
        location.href = "/jsmind-edit.html"
    }));

    // const liTestAdd2JsMind = modMdc.mkMDCmenuItem("test add to JsMind");
    // liTestAdd2JsMind.addEventListener("click", evt => { add2TestJsMindFc4i(); })
    // liTestAdd2JsMind.classList.add("test-item");

    // const liTestJsMindarrayTree = modMdc.mkMDCmenuItem("test JsMind node_array/tree");
    // liTestJsMindarrayTree.addEventListener("click", evt => { showTestJsMindArrayTree(); })
    // liTestJsMindarrayTree.classList.add("test-item");


    const liGetReminders = modMdc.mkMDCmenuItem("Get reminders");
    liGetReminders.addEventListener("click", evt => { OLDdisplayRemindersDialog(); });
    liGetReminders.classList.add("test-item");
    async function OLDdisplayRemindersDialog() {
        const modMdc = await import("util-mdc");
        const dbFc4i = await getDbFc4i();
        let savedValue = await dbFc4i.getSavedDialogValue();
        const initialAutoReminders = savedValue ? savedValue.autoReminders : true;
        let strSavedValue;
        const checkSave = async () => {
            const currentValue = getDialogValue();
            if (JSON.stringify(currentValue) == strSavedValue) return;
            console.log("FIX-ME: save reminders dialog!");
            setSavedDialogValue(currentValue);
            if (currentValue.autoReminders) {
                const wb = await getWorkbox();
                wb.messageSW({ type: "RESTART_AUTO_REMINDERS", msDelay: 200, });
            } else {
                modMdc.mkMDCsnackbar("Automatic check for reminders was turned off", 10 * 1000);
            }
            savedValue = currentValue;
        }

        const restartCheckSave = (() => {
            let tmr;
            const delayMs = 1000;
            return () => {
                console.log("restartCheckSave");
                clearTimeout(tmr);
                tmr = setTimeout(checkSave, delayMs);
            }
        })();
        function getDialogValue() {
            const values = {};
            // const myMdcSwitch = eltSwitchAuto.myMDCswitch;
            const myMdcSwitch = eltSwitchAuto.myMdc;
            const autoReminders = myMdcSwitch.selected;
            values.autoReminders = autoReminders;
            values.time = eltTime.value;
            divWeekDays.querySelectorAll("input").forEach(inp => {
                const wd = inp.dataset.weekday;
                const checked = inp.checked;
                values[wd] = checked;
            });
            values.timers = getTimersBody();
            console.log({ values });
            // debugger;
            return values;
        }
        setTimeout(() => { getDialogValue(); }, 4000);
        const eltTime = mkElt("input", { type: "time" });
        // eltTime.addEventListener("change", evt=>{ console.log("eltTime change", {evt}); });
        const dateNow = new Date();
        const zero2 = (i) => ("00" + i).slice(-2);
        const strTimeNow = `${zero2(dateNow.getHours())}:${zero2(dateNow.getMinutes())}`;
        eltTime.value = strTimeNow;
        if (savedValue) eltTime.value = savedValue.time;
        eltTime.addEventListener("input", evt => {
            console.log("eltTime input", { evt });
            restartCheckSave();
        });
        // const eltDate = mkElt("input", { type: "date" });
        const divWeekDays = mkElt("div", { id: "div-week-days" });
        const arrWeekDays = ["Sun", "Mon", "Tue", "Wen", "Thu", "Fri", "Sat"];
        for (let d = 0; d < arrWeekDays.length; d++) {
            const natChk = modMdc.mkMDCcheckboxInput();
            natChk.dataset.weekday = d;
            const mdcCheckbox = await modMdc.mkMDCcheckboxElt(natChk, arrWeekDays[d]);
            divWeekDays.appendChild(mdcCheckbox);
        }
        const setCheckboxesSavedValues = () => {
            const boxes = divWeekDays.querySelectorAll("input");
            boxes.forEach(box => {
                const iDay = box.dataset.weekday;
                const checked = savedValue[iDay];
                // console.log({checked});
                box.checked = checked;
            })
            // console.log("%csetCheckboxesSavedValues", "background:red; color:yellow", { divWeekDays, boxes });
        }
        if (savedValue) setTimeout(setCheckboxesSavedValues, 500);

        divWeekDays.addEventListener("change", evt => {
            const weekday = evt.target.dataset.weekday;
            const checked = evt.target.checked;
            // console.log("divWeekDays change", { evt, weekday, checked });
            restartCheckSave();
        });
        const divAtTime = mkElt("div", { id: "div-at-time" }, [
            mkElt("span", undefined, "After:"),
            eltTime,
        ]);

        // const initialAutoReminders = savedValue ? savedValue.autoReminders : true;
        const eltSwitchAuto = await modMdc.mkMDCswitch(initialAutoReminders, false);
        /*
        // got no such event
        eltSwitchAuto.addEventListener("change", evt => {
            const myMdc = eltSwitchAuto.myMDCswitch;
            console.log("eltSwitch change", { evt, myMdc});
        });
        */
        eltSwitchAuto.addEventListener("click", evt => {
            const myMdcSwitch = eltSwitchAuto.myMdc;
            const isOn = myMdcSwitch.selected;
            console.log("eltSwitch click", { evt, myMdcSwitch, isOn });
            if (isOn) {
                fieldsetAuto.disabled = false;
            } else {
                fieldsetAuto.disabled = true;
            }
            setAutoRemindersOnHtml(isOn);
            // FIXME: save
            restartCheckSave();
        });

        const divAutoSwitch = mkElt("div", undefined, [
            "Automatic reminders: ",
            eltSwitchAuto,
        ]);

        const fieldsetAuto = mkElt("fieldset", undefined, [
            divAtTime,
            divWeekDays,
        ]);
        // const initialAutoReminders = savedValue ? savedValue.autoReminders : true;
        if (!initialAutoReminders) fieldsetAuto.disabled = true;
        const formAutoDetails = mkElt("form", { class: "mdc-card" }, [
            // mkElt("fieldset", undefined, [ divAtTime, divWeekDays, ])
            mkElt("div", undefined, "(When you start this app.)"),
            fieldsetAuto
        ]);

        const tableTimersBody = mkElt("tbody");
        await setTimersBody(savedValue?.timers || defaultTimers);
        const test = getTimersBody();
        console.log({ test });
        function getTimersBody() {
            const timers = {};
            tableTimersBody.querySelectorAll("tr").forEach(tr => {
                let msDelay = +tr.dataset.msDelay;
                const td1 = tr.firstElementChild;
                const txt = td1.textContent;
                const btnSwitch = tr.querySelector("button");
                const myMdcSwitch = btnSwitch.myMdc;
                const isOn = myMdcSwitch.selected;
                // console.log("getTimersBody", { tr, td1, txt, msDelay, isOn });
                if (!isOn) msDelay = -msDelay;
                timers[txt] = msDelay;
            });
            return timers;
        }
        async function setTimersBody(timersValues) {
            tableTimersBody.extContent = "";
            console.log({ defaultTimers: timersValues });
            for (const [txt, ms] of Object.entries(timersValues)) {
                // console.log({ txt, ms });
                const switchOn = ms > 0;
                const eltSwitch = await modMdc.mkMDCswitch(switchOn, false);
                eltSwitch.addEventListener("click", evt => {
                    const myMdcSwitch = eltSwitch.myMDCswitch;
                    const isOn = myMdcSwitch.selected;
                    // console.log("eltSwitch click", { evt, myMDCswitch, isOn });
                    // if (isOn) { fieldsetAuto.disabled = false; } else { fieldsetAuto.disabled = true; }
                    restartCheckSave();
                });

                const tr = mkElt("tr", undefined, [
                    mkElt("td", undefined, txt),
                    mkElt("td", undefined, eltSwitch),
                ]);
                tr.dataset.msDelay = Math.abs(ms);
                tableTimersBody.appendChild(tr);
            }
        }
        async function mkTimersTable() {
            const thAbout = mkElt("th", { colspan: 2 }, mkElt("i", undefined, "Reminders times out"));
            const tableHeader = mkElt("thead", undefined, [
                mkElt("tr", undefined, [thAbout]),
                mkElt("tr", undefined, [
                    mkElt("th", { class: "timer-length" }, "After"),
                    mkElt("th", undefined, "Active"),
                ])
            ]);
            const tableTimers = mkElt("table", { class: "timers-default-table expander-content" }, [tableHeader, tableTimersBody]);
            // updateTimersTable();
            return tableTimers;
        }
        const tableTimers = await mkTimersTable();
        const sumTimers = mkElt("summary", undefined, "Reminders timing");
        const detTimers = mkElt("details", undefined, [
            sumTimers,
            mkElt("div", { class: "expander" }, tableTimers)
        ]);
        const cardAuto = mkElt("div", { id: "div-time-date", class: "mdc-card" }, [
            // divAutoSwitch,
            // formAutoDetails,
            detTimers,
        ]);

        const btnCheckNow = modMdc.mkMDCbutton("Get now", "raised");
        btnCheckNow.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            askForReminders();
            const modMdc = await import("util-mdc");
            modMdc.mkMDCsnackbar("Looking for expired reminders...");
            closeDialog();
        }));
        const divCheckNow = mkElt("div", undefined, btnCheckNow);

        const pHow = mkElt("p", undefined, [
            `To get reminders you have to ask for it by clicking in the 
            top right corner:`,
        ]);
        const pHowExpired = mkElt("p", undefined, [
            `You will get reminders that are "timed out" and that you
            have not previously clicked on.`
        ]);
        const divHow = mkElt("div", undefined, [
            pHow,
            mkElt("img", { src: "/img/btn-check-reminders.png", width: "50%" }),
            pHowExpired,
        ]);
        // mkElt("img", { src: "/img/btn-check-reminders.png", width: "50%" })
        const body = mkElt("div", { id: "body-dlg-reminders" }, [
            mkElt("header", undefined, "Reminders"),
            // divCheckNow,
            divHow,
            cardAuto,
        ]);
        // export function mkMDCdialog(body, eltActions, fullScreen)
        const dlg = await modMdc.mkMDCdialogAlert(body, "Close");
        const closeDialog = () => dlg.mdc.close();
    }

    const liTestTimer = modMdc.mkMDCmenuItem("Test timer");
    liTestTimer.addEventListener("click", evt => { testTimer(); })
    liTestTimer.classList.add("test-item");

    async function testTimer() {
        const modMdc = await import("util-mdc");
        const inpInt = mkElt("input", { type: "text" });
        inpInt.value = 10;
        const keySubmitted = "TEST_TIMER-submitted"
        const prevSubmitted = localStorage.getItem(keySubmitted);
        let prevSubmittedShow = "(none)";
        if (prevSubmitted) {
            const obj = JSON.parse(prevSubmitted);
            prevSubmittedShow = mkElt("div", undefined, [
                mkElt("div", undefined, `seconds: ${obj.seconds}`),
                mkElt("div", undefined, `time: ${obj.time}`),
            ]);
        }
        const prevDone = await getLastTestTimer();
        console.log({ prevDone });
        let prevDoneShow = "(none)";
        if (prevDone) {
            prevDoneShow = mkElt("div", undefined, [
                mkElt("div", undefined, `seconds: ${prevDone.seconds}`),
                mkElt("div", undefined, `time: ${prevDone.time}`),
                mkElt("div", undefined, `error: ${prevDone.error}`),
            ]);
        }

        const lastSWstatus = await getLastSWstatus();
        console.log({ lastSWstatus });
        let lastSWstatusShow = "(none known)";
        if (lastSWstatus) {
            lastSWstatusShow = mkElt("div", undefined, [
                `${lastSWstatus.status}: ${lastSWstatus.when}`
            ]);
        }

        const body = mkElt("div", undefined, [
            mkElt("h4", undefined, "TEST_TIMER"),
            "Seconds: ", inpInt,
            mkElt("p", undefined, [
                mkElt("div", { style: "font-style: italic" }, "Last submitted:"),
                prevSubmittedShow,
                mkElt("div", { style: "font-style: italic" }, "Last done:"),
                prevDoneShow,
                mkElt("div", { style: "font-style: italic" }, "Last SW status:"),
                lastSWstatusShow,
            ]),
        ]);
        const answer = await modMdc.mkMDCdialogConfirm(body);
        console.log({ answer });
        if (!answer) return;
        const seconds = inpInt.value;
        const wb = await getWorkbox();
        wb.messageSW({ type: "TEST_TIMER", seconds, });
        const time = toOurTime(new Date());
        const valSubmitted = { seconds, time };
        const jsonSubmitted = JSON.stringify(valSubmitted)
        localStorage.setItem(keySubmitted, jsonSubmitted);
    }

    const liStorage = modMdc.mkMDCmenuItem("Check storage");
    liStorage.addEventListener("click", errorHandlerAsyncEvent(async evt => { await checkStorage(); }));
    liStorage.classList.add("test-item");

    const liAskPersistent = modMdc.mkMDCmenuItem("Persistent storage");
    // liAskPersistent.classList.add("test-item");
    liAskPersistent.addEventListener("click", errorHandlerAsyncEvent(async evt => { await askPersistent(); }));
    (async () => {
        const isPersisted = await navigator.storage.persisted();
        if (!isPersisted) { liAskPersistent.style.color = "red"; }
    })();
    async function askPersistent() {
        const isPersisted = await navigator.storage.persisted();
        if (!isPersisted) {
            await doAskPersistent();
        } else {
            await checkStorage();
        }
        async function doAskPersistent() {
            if (isPersisted) {
                checkStorage();
                return;
            }
            let aboutQuota = "";
            if (navigator.storage.estimate) {
                const quota = await navigator.storage.estimate();
                const percentageUsed = (quota.usage / quota.quota) * 100;
                aboutQuota = `(You are currently using ${percentageUsed.toFixed(2)}%
                    of the available space for this site.)`;
            }
            const body = mkElt("div", undefined, [
                mkElt("h2", undefined, "You data in this app may be lost"),
                mkElt("h2", undefined, "NOT READY YET!"),
                mkElt("p", undefined, [
                    `
                    Your data in this app may be lost when your mobile/computer
                    is running out of space.
                    This is very unlikely, but this web browser currently have 
                    your permission to erase data in this app if 
                    available space is becoming very low.
                    `,
                    aboutQuota
                ]),
                mkElt("p", undefined, `
                    You can tell the web browser that it should ask before
                    deleting your data on this site.
                    Do you want to do that?
                `),
            ]);
            const answer = await modMdc.mkMDCdialogConfirm(body, "Yes");
            console.log({ answer });
            if (answer) {
                const pers = await navigator.storage.persist();
                console.log({ pers });
                if (pers) {
                    const isPersisted = await navigator.storage.persisted();
                    if (!isPersisted) return;
                    liAskPersistent.style.color = null;
                    checkStorage();
                }
            }
        }
    }

    async function checkStorage() {
        // https://web.dev/learn/pwa/offline-data/
        /*
            You can also check if persistent storage is already granted
            in the current origin by calling StorageManager.persisted().
            Firefox requests permission from the user to use persistent storage.
            Chromium-based browsers give or deny persistence based on a heuristic
            to determine the importance of the content for the user.
            One criteria for Google Chrome is, for example, PWA installation.
            If the user has installed an icon for the PWA in the operating system,
            the browser may grant persistent storage.
        */

        const body = mkElt("div");

        // navigator.storage.persist is implemented in all relevant browsers
        // Check if site's storage has been marked as persistent
        const isPersisted = await navigator.storage.persisted();
        console.log(`Persisted storage is granted: ${isPersisted}`);
        body.appendChild(mkElt("h2", undefined,
            `Persisted storage is granted: ${isPersisted}`
        ));

        // Request persistent storage for site
        // FIX-ME: Do not do it here. Maybe add a menu entry?
        if (false && !isPersisted) {
            const isPersisted = await navigator.storage.persist();
            console.log(`Persisted storage was granted now: ${isPersisted}`);
            body.appendChild(mkElt("div", undefined,
                `Persisted storage was granted now: ${isPersisted}`
            ));
        }

        // https://web.dev/learn/pwa/offline-data/
        if (navigator.storage.estimate) {
            const quota = await navigator.storage.estimate();
            // quota.usage -> Number of bytes used.
            // quota.quota -> Maximum number of bytes available.
            const percentageUsed = (quota.usage / quota.quota) * 100;
            console.log(`You've used ${percentageUsed}% of the available storage.`);
            body.appendChild(mkElt("p", undefined,
                // `You've used ${percentageUsed}% ${percentageUsed.toFixed(4)}% of the available storage.`
                `You've used ${percentageUsed.toFixed(4)}% of the available storage.`
            ));
            const remaining = quota.quota - quota.usage;
            console.log(`You can write up to ${remaining} more bytes.`);
            body.appendChild(mkElt("p", undefined,
                `You can write up to ${(remaining / 1000 / 1000).toFixed(0)} Mbytes more.`
            ));
        }
        modMdc.mkMDCdialogAlert(body);
    }

    const liTestClipboard = modMdc.mkMDCmenuItem("test clipboard images");
    liTestClipboard.classList.add("test-item");
    liTestClipboard.addEventListener("click", evt => {
        getClipboardImages();
    });

    const liExportImport = modMdc.mkMDCmenuItem("Export/Import and Backup");
    liExportImport.addEventListener("click", evt => { dialogExportImport(); })
    // liExport.classList.add("test-item");

    const liImport = modMdc.mkMDCmenuItem("Test Import");
    liImport.addEventListener("click", evt => { importItems(); })
    liImport.classList.add("test-item");

    // Blobs => base64 (for our images)
    // https://stackoverflow.com/questions/27232604/json-stringify-or-how-to-serialize-binary-data-as-base64-encoded-json
    const blobToBase64 = (blob) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = function () {
                resolve(reader.result);
            };
        });
    };

    // https://dev.to/ionic/converting-a-base64-string-to-a-blob-in-javascript-35kl
    // FIX-ME: rename
    const base64webpToBlob = async (base64Data) => {
        const base64Response = await fetch(base64Data);
        const blob = await base64Response.blob();
        return blob;
    }


    async function importItems(callBackProgress) {
        let theFile;
        if ("NOshowOpenFilePicker" in window) {
            let fileHandle;
            try {
                const opts = {
                    types: [
                        {
                            description: "Exported fc4i files",
                            accept: {
                                "application/json": [".json"]
                            }
                        }
                    ]
                };
                console.log({ opts });
                [fileHandle] = await window.showOpenFilePicker(opts);
                theFile = await fileHandle.getFile();
            } catch (err) {
                console.log({ err });
                if (err.name == "AbortError") return;
                throw err;
            }
        } else {
            // https://web.dev/patterns/files/open-one-or-multiple-files/#using-the-lessinput-type=filegreater-element
            theFile = await new Promise((resolve) => {
                // Append a new `<input type="file" multiple? />` and hide it.
                const input = document.createElement('input');
                input.style.display = 'none';
                input.type = 'file';
                input.accept = ".json";
                document.body.append(input);
                const multiple = false;
                if (multiple) {
                    input.multiple = true;
                }
                // The `change` event fires when the user interacts with the dialog.
                input.addEventListener('change', () => {
                    // Remove the `<input type="file" multiple? />` again from the DOM.
                    input.remove();
                    // If no files were selected, return.
                    if (!input.files) {
                        return;
                    }
                    // Return all files or just one file.
                    resolve(multiple ? Array.from(input.files) : input.files[0]);
                });
                // Show the picker.
                if ('showPicker' in HTMLInputElement.prototype) {
                    input.showPicker();
                } else {
                    input.click();
                }
            });
        }
        const contents = await theFile.text();
        console.log({ contents });
        const objJson = JSON.parse(contents);
        // const objJson = await file.json();
        console.log({ objJson });
        // We have an array
        const importedKeys = [];
        const notImportedKeys = [];
        const arrJson = [...objJson];
        callBackProgress(arrJson.length);
        // const ret = objJson.forEach
        // const ret = arrJson.map
        const ret = [];
        for (let j = 0, len = arrJson.length; j < len; j++) {
            const obj = arrJson[j];
            const key = obj.key;
            const oldObj = await getDbKey(key);
            callBackProgress();
            // FIX-ME: merge?
            if (oldObj) {
                // FIX-ME: which is newest?
                notImportedKeys.push(key);
                // return;
                continue;
            }
            // convert base64webpToBlob;
            const images = obj.images;
            if (images) {
                for (let i = 0, len = images.length; i < len; i++) {
                    const b64 = images[i];
                    const blob = await base64webpToBlob(b64);
                    images[i] = blob;
                }
            }
            // console.log(`Adding ${key}, ${obj.title}`);
            importedKeys.push(key);
            ret.push(setDbKey(key, obj));
        }
        console.log({ ret }, ret);
        const promRes = await Promise.allSettled(ret);
        console.log({ promRes });
        console.log({ importedKeys });
        await showImportResult();
        return importedKeys;

        async function showImportResult() {
            // goHome
            // FIX-ME det-sum
            const divImported = mkElt("div", { class: "div-all-imported" });
            const detImported = mkElt("details", undefined, [
                mkElt("summary", undefined, `Imported (${importedKeys.length})`),
                divImported
            ]);
            const divNotImported = mkElt("div", { class: "div-all-imported" });
            const detNotImported = mkElt("details", undefined, [
                mkElt("summary", undefined, `Not Imported (${notImportedKeys.length})`),
                divNotImported
            ]);
            const sortedImports = importedKeys.sort().reverse();
            for (let j = 0, len = sortedImports.length; j < len; j++) {
                const key = sortedImports[j];
                const rem = await getDbKey(key);
                appendRem(rem, divImported);
            }
            const sortedNotImports = notImportedKeys.sort().reverse();
            for (let j = 0, len = sortedNotImports.length; j < len; j++) {
                const key = sortedNotImports[j];
                const rem = await getDbKey(key);
                appendRem(rem, divNotImported);
            }


            const secMain = clearMainSection("page-imported");
            const eltImportBanner = mkElt("h2", undefined, mkElt("i", undefined, "Import Result"));
            const divHome = mkElt("div", { id: "div-home" }, [
                // divhHome,
                eltImportBanner,
                detImported,
                detNotImported
            ]);
            secMain.appendChild(divHome);

        }
    }

    async function dialogExportImport() {
        const toExport = [];
        const eltsKey = document.querySelectorAll("[data-key-record]");
        // Doubles in elements in listing
        const arrKeys2 = [...eltsKey].map(elt => elt.dataset.keyRecord);
        const setKeys = new Set(arrKeys2);
        const arrKeys = [...setKeys];
        const dbFc4i = await getDbFc4i();
        const numAllItems = await dbFc4i.countAllReminders();
        let pExport;
        const fnPrefix = "fc4i";
        let numItems;
        const h2TitleExport = mkElt("h2", undefined, "Export");
        const h2TitleImport = mkElt("h2", undefined, "Import");
        if (document.getElementById("div-home")) {
            if (arrKeys.length == 0) {
                pExport =
                    mkElt("p", undefined,
                        `No matching items to export.
                    (To change this use search on top of the page.)`
                    );
            } else {
                pExport = mkElt("p", undefined, [
                    // `Export ${arrKeys.length} of ${arrAllItems.length} item(s).`
                    `Export ${arrKeys.length} of ${numAllItems} item(s).`
                ]);
                // if (arrAllItems.length > 1) 
                if (numAllItems > 1) {
                    pExport.appendChild(mkElt("span", undefined,
                        "(To change this use search on top of the page.)"
                    ));
                }
                // fileName = `${fnPrefix}-${arrKeys.length}-of-${arrAll.length}.json`;
                numItems = arrKeys.length;
            }
        } else if (
            document.getElementById("page-added-new")
            ||
            document.getElementById("page-show-key")
        ) {
            if (arrKeys.length != 1) throw Error(`There should be exactly 1 item here`);
            const itemName = document.querySelector(".has-title").textContent;
            pExport = mkElt("p", undefined, `Export item "${itemName}".`);
            numItems = 1;
        } else {
            if (arrKeys.length != 0) throw Error(`There should be no items here`);
            pExport = mkElt("p", undefined, "There are no items to export on this page");
        }
        const divExport = mkElt("div", undefined, [pExport]);
        if (arrKeys.length > 0) {
            const iso = new Date().toISOString().replaceAll(":", "-").replaceAll("-", "").slice(2, -5);
            const fileName = `${fnPrefix}-${numItems}-of-${numAllItems}-${iso}.json`;
            async function mkDownloadButton(addedKey) {
                const fileContent = await getJson4download(addedKey);
                const blob = new Blob([fileContent], { type: 'text/json' });
                const aExportBtn = modMdc.mkMDCbuttonA(
                    URL.createObjectURL(blob),
                    "Export",
                    "raised",
                    modMdc.mkMDCicon("download")
                );
                aExportBtn.setAttribute("download", fileName);
                aExportBtn.addEventListener("NOclick", errorHandlerAsyncEvent(async evt => {
                    // const fileContent = await getJson4download();
                    // const blob = new Blob([fileContent], { type: 'text/json' });
                    // aExportBtn.href = URL.createObjectURL(blob);
                }));
                return aExportBtn;
            }
            // const btnDownload = await mkDownloadButton();
            const pFileName = mkElt("p", undefined, `Download to ${fileName}`);

            divExport.appendChild(pFileName);
            // divExport.appendChild(mkElt("p", undefined, aExportBtn));
            const btnFakeDownload = modMdc.mkMDCbutton("Export", "raised", modMdc.mkMDCicon("download"));

            btnFakeDownload.addEventListener("click", errorHandlerAsyncEvent(async evt => {
                // const btn = evt.target.closest("button");
                const btn = btnFakeDownload;
                const style = getComputedStyle(btn);
                const pb = modMdc.mkMDCprogressBar("Export progress bar", 0, 1, 0)
                const spanExporting = mkElt("span", undefined, "Exporting...");
                const divProgress = mkElt("div", undefined, [
                    spanExporting, pb
                ]);
                divProgress.style.height = style.height;
                // divProgress.style.backgroundColor = "red";
                btn.parentElement.appendChild(divProgress);
                btn.remove();

                let n = 0;
                function addedKey() {
                    pb.mdc.foundation.setProgress(++n / numItems);
                    if (n == numItems) spanExporting.textContent = "Exporting done";
                }
                const btnDownload = await mkDownloadButton(addedKey);
                btnDownload.click();
            }));

            // divExport.appendChild(mkElt("p", undefined, btnDownload));
            divExport.appendChild(mkElt("p", undefined, btnFakeDownload));
        }

        const btnImport = modMdc.mkMDCbutton("Import", "raised", modMdc.mkMDCicon("upload"));
        btnImport.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            const btn = btnImport;
            const style = getComputedStyle(btn);
            const pb = modMdc.mkMDCprogressBar("Import progress bar", 0, 1, 0)
            const spanExporting = mkElt("span", undefined, "Importing...");
            const divProgress = mkElt("div", undefined, [
                spanExporting, pb
            ]);
            divProgress.style.height = style.height;
            // btn.parentElement.appendChild(divProgress);
            // btn.remove();

            let numItems;
            let n = 0;
            function callBackProgress(num) {
                if (num) {
                    numItems = num;
                    btn.parentElement.appendChild(divProgress);
                    btn.remove();
                    return;
                }
                pb.mdc.foundation.setProgress(++n / numItems);
            }
            const imported = await importItems(callBackProgress);
            console.log({ imported });
            dlg.mdc.close();
        }));
        const divImport = mkElt("div", undefined, [
            // test import
            mkElt("p", undefined, "Import exported files."),
            btnImport,
        ]);
        const h2TitleBackup = mkElt("h2", undefined, "Backup");
        const pBackup = mkElt("p", undefined,
            `
            Please use export and import above for backup.
            `
        );
        const body = mkElt("div", undefined, [
            h2TitleExport,
            divExport,
            mkElt("hr"),
            h2TitleImport,
            divImport,
            mkElt("hr"),
            h2TitleBackup,
            pBackup,
        ]);
        const dlg = await modMdc.mkMDCdialogAlert(body, "Close");
        async function getJson4download(funBackKey) {
            for (let i = 0, len = arrKeys.length; i < len; i++) {
                // const t = arrKeys[i];
                // const k = t.dataset.keyRecord;
                const k = arrKeys[i];
                // console.log(k);
                const obj = await getDbKey(k);
                // console.log({ obj });
                const images = obj.images;
                if (images && images.length > 0) {
                    // console.log({ images });
                    for (let j = 0, leni = images.length; j < leni; j++) {
                        const blob = images[j];
                        // blob 64
                        const base64 = await blobToBase64(blob);
                        // console.log({ base64 });
                        images[j] = base64;
                    }
                }
                toExport.push(obj);
                funBackKey();
            }
            // console.log({ toExport });
            // console.log(toExport);
            const json = JSON.stringify(toExport);
            // console.log({ json });
            // const fromJson = JSON.parse(json);
            // console.log({ fromJson });
            return json;
        }

    }

    let arrEntries = [
        liHome,
        liIntro,
        liNew,
        // liGetReminders,
        liMindmaps,
        liAskPersistent,
        liExportImport,
    ];
    const showDebugEntries = true;
    if (showDebugEntries) {
        const liHr = mkElt("hr");
        liHr.classList.add("test-item");
        const liHeaderTests = modMdc.mkMDCmenuItem("Items below are tests");
        liHeaderTests.classList.add("test-item");
        liHeaderTests.style.fontWeight = "bold";
        liHeaderTests.style.fontStyle = "italic";
        arrEntries = arrEntries.concat([
            liHr,
            liHeaderTests,
            liJsmindEdit,
            liTestClipboard,
            // liTestLogin,
            // liTestFCM,
            // liTestShort,
            // liTest4tasks,
            // liTestShareLink,
            // liMindmaps,
            // liTestAdd2JsMind,
            // liTestJsMindarrayTree,
            liTestShareWithArgs,
            // liShowDebug,
            // liTestTimer,
            // liImport,
            // liStorage,
        ]);
    }
    // if (liAskPersistent) { arrEntries.push(liAskPersistent); }
    const ulMenu = modMdc.mkMDCmenuUl(arrEntries);

    const divMenu = modMdc.mkMDCmenuDiv(ulMenu);
    divMenu.id = "main-menu";
    divMenu.classList.add("is-menu-div");
    divMenu.addEventListener("click", evt => {
        toggleMenu();
    });
    return divMenu;
}

const getQueryParams = (query) => {
    let params = {};
    new URLSearchParams(query).forEach((value, key) => {
        params[key] = value;
    });
    return params;
};

async function setFirstAutoRemindersOnHtml() {
    await promiseDOMready();
    const dbFc4i = await getDbFc4i();
    const recReminders = await dbFc4i.getSavedDialogValue();
    // console.log({ recReminders });
    if (recReminders) setAutoRemindersOnHtml(recReminders.autoReminders);
}
async function setAutoRemindersOnHtml(on) {
    if (on) {
        document.documentElement.classList.remove("auto-reminders-off");
    } else {
        document.documentElement.classList.add("auto-reminders-off");
    }
}

async function deleteEntry(key, card) {
    const modMdc = await import("util-mdc");
    card.style.outline = "4px dotted yellowgreen";
    const dlg = modMdc.mkMDCdialogConfirm("Delete this subject?", "Yes", "No");
    const answer = await dlg;
    console.log({ answer });
    card.style.outline = null;
    if (!answer) return false;

    // const key = rem.key;
    const dbFc4i = await getDbFc4i();
    // const db = await dbFc4i.getDb();
    // const res = await db.delete(idbStoreName, key);
    // const res = await dbFc4i.deleteKey(key);
    const res = await dbFc4i.deleteDbKey(key);
    console.log({ res });
    // transitionend seems to be buggy in Android Chrome 2023-01-01
    // Use timeout instead of transitionend
    const useTransitionend = false;
    if (useTransitionend) {
        card.addEventListener("transitionend", evt => {
            console.log("%ctransitionend event", "color: red;");
            card.remove();
        });
    } else {
        const removeCard = () => {
            console.log("%ctimeout card.remove", "color: red;");
            card.remove();
        }
        setTimeout(removeCard, 1200);
    }
    // Seems like duration is not set before changes sometimes.
    card.style.transitionDuration = "1s";
    setTimeout(() => {
        console.log("%cAdding .removed", "color: red;");
        card.classList.add("removed");
    }, 200);

    // snackbar
    modMdc.mkMDCsnackbar("Deleted entry", 5 * 1000);
    return true;
}

function pageIsSaved() {
    return document.documentElement.querySelector(".not-saved") == null;
}
/*
window.onbeforeunload = () => {
    // return !pageIsSaved();
    const notSaved = !pageIsSaved();
    console.log("%conbeforeunload", "color:red; font-size: 20px;", {notSaved});
    return notSaved;
}
*/
window.addEventListener("beforeunload", evt => {
    const notSaved = !pageIsSaved();
    console.log("%listener conbeforeunload", "color:red; font-size: 20px;", { notSaved });
    if (notSaved) evt.preventDefault();
});


const visibleAppTitle = "Flashcards 4 Internet";

const mainCommon = async () => {
    // setupFCM();
    setFirstAutoRemindersOnHtml();

    await promiseDOMready();
    const divHeaderTitle = document.getElementById("header-title");
    divHeaderTitle.textContent = visibleAppTitle;
    const divMainHeader = document.getElementById("main-header");
    divMainHeader.classList.add("mdc-theme--primary-bg");
    divMainHeader.classList.add("mdc-theme--on-primary");


    // addEventListener('DOMContentLoaded', (event) => {
    // console.log("before getMenu");
    getMenu();
    addDebugDiv();
    // if (!(await checkNotificationPermissions())) return;
    setupForInstall();
    // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker/error_event
    // let sw = await setupServiceWorker();
    setupServiceWorker();
    // https://developer.chrome.com/articles/web-share-target/, GET
    checkUrlParams();
    function checkUrlParams() {
        // const parsedUrl = new URL(window.location);
        // const searchParams = parsedUrl.searchParams;
        const searchParams = getQueryParams(location.search);
        const keysParams = Object.keys(searchParams);
        const got4compare = JSON.stringify(keysParams.sort());
        const nParams = keysParams.length;
        // console.log({ nParams });
        Object.entries(searchParams).forEach(([key, val]) => {
            addDebugRow(`Param ${key}=${val}`);
        });

        let title = searchParams['title'];
        let text = searchParams['text'];
        let url = searchParams['url'];
        const noUrl = !!!url;
        const textIsUrl = text?.startsWith("https://")
            // https://www.westonlambert.com/glassandstone ??? What is going on at that server?
            || text?.startsWith("http://");
        if (noUrl && textIsUrl) {
            url = text;
            // text = "(missing, contains URL instead)";
            text = "";
        }
        const sharedParams = { text, title, url };
        switch (nParams) {
            case 0:
                addDebugRow(`URL parameters: NONE`);
                (async () => {
                    // const arrAll = [...await getAllReminders()];
                    const dbFc4i = await getDbFc4i();
                    const numItems = await dbFc4i.countAllReminders();
                    if (numItems > 0) {
                        goHome();
                    } else {
                        showIntro();
                    }
                })();
                break;
            case 1:
                const showKey = searchParams["showkey"];
                if (showKey) {
                    justShowKey(showKey);
                    break;
                }
                const key = searchParams['key'];
                const wanted = ["key"];
                if (JSON.stringify(wanted) == got4compare) {
                    showKeyToRemember(key);
                    break;
                }
                // Some Android apps sends only one the text param with the url.
                // 
                if (textIsUrl) {
                    sharedParams.title = "(No title)";
                    showAddedNew(sharedParams);
                    break;
                }
                throw Error(`Bad params (1)`);
                break;
            case 3:
                {
                    addDebugRow(`URL parameters: title: ${title}, text: ${text}, url: ${url}`);
                    const wanted = ["text", "title", "url"];
                    if (JSON.stringify(wanted) != got4compare) throw Error(`Bad params (3)`);
                    showAddedNew(sharedParams);
                }
                break;
            case 2:
                const wanted2 = ["key", "timerInfo"];
                if (JSON.stringify(wanted2) == got4compare) {
                    const key2 = searchParams['key'];
                    const timerInfo = searchParams['timerInfo'];
                    showKeyToRemember(key2, timerInfo);
                    break;
                }

                // This is for handling a bug in the share API:s
                // File an issue here: https://bugs.chromium.org/p/chromium/issues/list?q=share&can=2
                //   Use this as example: https://web-share.glitch.me/
                // Currently we recieve only 2 url parameters. The "url"-parameter is missing
                // and its value is instead given to the "text"-parameter.
                {
                    if (!textIsUrl) {
                        throw Error(`2 params, but "text"-parameter does not start with "https://"`);
                    }
                    showAddedNew(sharedParams);
                }
                break;
            default:
                console.error("Bad number of parameters", { nParams });
        }
    }

    // });

}

// : hsl(0deg 100% 50%); /* red */
// : hsl(84deg 100% 59%); /* greenyellow */
// : hsl(120deg 100% 25%); /* green */
// : hsl(120deg 73% 75%); /* lightgreen */
// : hsl(100deg 100% 40%); /* greenyellow */

// let tp; setTimeout(() =>{ tp = mkStatusIndicator(7, "height", true); tp.mySet(0); document.body.appendChild(tp); }, 1000);

function mkStatusIndicator(steps, direction, test) {
    if (!["height", "width"].includes(direction)) throw Error(`Bad direction: ${direction}`);
    const eltAntiIndicator = mkElt("div", { class: "status-progress-anti" });
    eltAntiIndicator.style.backdropFilter = "grayscale(1) brightness(0.1)";
    const eltCont = mkElt("div", { class: "status-progress" }, eltAntiIndicator);
    eltCont.dataset.maxVal = steps;
    eltCont.style.backgroundColor = "rgb(94, 94, 94);";

    if (test) {
        eltCont.style.height = "50px";
        eltCont.style.width = "5px";
        eltCont.style.position = "fixed";
        eltCont.style.top = "10px";
        eltCont.style.left = "10px";
    }
    eltCont.style.border = "1px solid rgba(128, 128, 128, 0.29)";

    eltCont.mySet = (val) => {
        if (val > steps) throw Error(`progress indicator, val (${val}) > max ${steps}`);
        if (val < 1) throw Error(`progress indicator, val (${val}) < 1`);
        // const indSize = 100 * (steps - val ) / (steps + 1);
        const indSize = 100 * (val - 1) / (steps + 0);
        eltAntiIndicator.style[direction] = `${indSize}%`;
        const hue = val / steps * 100;
        eltCont.style.backgroundColor = `hsl(${hue}deg 100% 50%)`;
        eltCont.dataset.val = val;
    };
    eltCont.myGet = () => eltCont.dataset.val;
    /*
    for (let i = 0; i < steps; i++) {
        const eltStep = mkElt("div");
        eltStep.dataset.stepVal = 0;
        eltCont.appendChild(eltStep);
    }
    */
    return eltCont;
}

function openDetails(eltDetails, eltContainer) {
    if (eltContainer) {
        if (!eltContainer.contains(eltDetails)) throw Error("eltContainer does not contain eltDetails");
    }
    let detContaining = eltDetails;
    let n = 0;
    while (n++ < 10) {
        detContaining.open = true;
        detContaining = detContaining.parentElement.closest("details");
        if (!detContaining) return;
        if (detContaining == eltContainer) continue;
        if (eltContainer && detContaining.contains(eltContainer)) return;
    }
}

function getColorThemeBrowser() {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return "dark";
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return "light";
    return undefined;
}

function mkEltTagChkbox(tag, checked) {
    const chkbox = mkElt("input", { type: "checkbox" });
    chkbox.checked = checked;
    return mkElt("label", { class: "tag-in-our-tags" }, [chkbox, `#${tag}`]);
}

mainCommon();

document.addEventListener("click", errorHandlerAsyncEvent(async evt => {
    let eltMaybeSummary = evt.target;
    if (eltMaybeSummary.tagName != "SUMMARY") eltMaybeSummary = eltMaybeSummary.parentElement;
    if (eltMaybeSummary?.tagName != "SUMMARY") eltMaybeSummary = eltMaybeSummary?.parentElement;
    if (eltMaybeSummary?.tagName != "SUMMARY") eltMaybeSummary = eltMaybeSummary?.parentElement;
    if (eltMaybeSummary?.tagName == "SUMMARY") {
        // console.log("summary");
        const d = eltMaybeSummary.parentElement;
        const isOpen = d.open;
        // console.log({ d, isOpen });
        const e = d.querySelector(".expander");
        if (!e) return;
        if (isOpen) {
            e.classList.remove("expanded");
            // setTimeout(() => e.classList.remove("expanded"), 1000);
        } else {
            // Today: 2023-02-28, Google Chrome Version 110.0.5481.178 (Official Build) (64-bit)
            // "await/setTimeout" works ok.
            // "justAdd" shows no expanding.
            // console.log("theExpanderWay", theExpanderWay);
            switch (theExpanderWay) {
                case "justAdd":
                    e.classList.add("expanded");
                    break;
                case "setTimeout":
                    setTimeout(() => { e.classList.add("expanded"); }, 1);
                    break;
                case "await":
                    await new Promise(resolve => { setTimeout(() => { resolve(); }, 1); });
                    e.classList.add("expanded");
                    break;
                default:
                    throw Error(`Bad expander way: ${theExpanderWay}`);
            }
            /*
            let justAdd = true;
            if (!justAdd) {
                // setTimeout(() => e.classList.add("expanded"), 100);
                try {
                    // const stepMs = 50;
                    // const stepMs = 20;
                    const stepMs = 500;
                    const maxWaitMs = 2000;
                    const now = Date.now();
                    console.log("no before wait4mutations");
                    // const res = await wait4mutations(d, stepMs, { childList: true, subtree: true }, maxWaitMs);
                    // console.log({ res });
                    let res;
                    if (res) {
                        // modMdc.mkMDCsnackbar(`Waited to max ${maxWaitMs} ms)`, 10 * 1000);
                    } else {
                        const elapsed = Date.now() - now;
                        console.log({ elapsed });
                        // modMdc.mkMDCsnackbar(`Waited for mutations ${elapsed} ms (step ${stepMs} ms)`, 10 * 1000);
                    }
                    e.classList.add("expanded");
                } catch (err) {
                    console.log({ err });
                    // modMdc.mkMDCsnackbar(`Error ${err}`, 10 * 1000);
                    modMdc.mkMDCsnackbar(`Error`, 10 * 1000);
                }
            }
            // await and setTimeout both works.
            const useAwait = false;
            if (useAwait) {
                console.log("use await");
                await new Promise(resolve => { setTimeout(() => { resolve(); }, 1); });
                e.classList.add("expanded");
            } else {
                console.log("use setTimeout");
                setTimeout(() => { e.classList.add("expanded"); }, 1);
            }
            */
        }
    }
}));

const checkNotifyShortDelayTest = 5;
const checkNotifyShortDelayProd = 30;
const checkNotifyShortDelay = checkNotifyShortDelayTest;
// const checkNotifyShortDelay = checkNotifyShortDelayProd;
const restartCheckNotifyShort = (() => {
    let tmr;
    // const delayMs = 30 * 1000;
    const delayMs = checkNotifyShortDelay * 1000;
    return (way) => {
        clearTimeout(tmr);
        if (!testShortSwitch) return;
        tmr = setTimeout(checkNotifyShort, delayMs);
    }
})();
async function checkNotifyShort() {
    console.log("%ccheckNotifyShort", "color:red");

    // FIX-ME: move to db-fc4i.js
    const dbFc4i = await getDbFc4i();
    const objNextShort = await dbFc4i.getNextShortTimer();

    if (!objNextShort) return;
    const {
        earliestKey,
        earliestAfterMinutes,
        earliestLbl,
        earliestDateIso,
    } = objNextShort;
    const nowIso = new Date().toISOString();
    console.log({ earliestKey, earliestAfterMinutes, earliestLbl, earliestDateIso, nowIso });
    if (nowIso < earliestDateIso) return;
    askForNotifySpecific(earliestKey, 1000, earliestAfterMinutes, earliestLbl, true);
    // deleteShortTimer(earliestKey);
    const modMdc = await import("util-mdc");
    modMdc.mkMDCsnackbar("checkNotifyShort", 4000);
}

// document.addEventListener("click", evt => restartCheckNotifyShort());
window.addEventListener("load", evt => restartCheckNotifyShort("keydown"));
// window.addEventListener("unload", evt => restartCheckNotifyShort("keydown"));
window.addEventListener("beforeunload", evt => checkNotifyShort("keydown"));
document.addEventListener("keyup", evt => restartCheckNotifyShort("keydown"));
document.addEventListener("mouseup", evt => restartCheckNotifyShort("mousedown"));
document.addEventListener("scroll", evt => restartCheckNotifyShort("scroll"));
document.addEventListener("resize", evt => restartCheckNotifyShort("resize"));
document.addEventListener("touchend", evt => restartCheckNotifyShort("resize"));

async function mkDivManualReminders(getCreatedEltTime) {
    const modMdc = await import("util-mdc");
    function afterMinutes(minutes, lbl) {
        const key = getCreatedEltTime();
        const atDate = new Date(Date.now() + minutes * minMs);
        addShortTimer(key, atDate, minutes, lbl);
        async function checkForShort() {
            console.log("%c new checkForShort", "color:red; background:yellow");
            const shortVal = await getShortTimer(key);
            if (!shortVal) return;
            const myLbl = `${lbl} t`;
            await askForNotifySpecific(key, 0, minutes, myLbl, true);
            // await deleteShortTimer(key);
        }
        // setTimeout(checkForShort, minutes * minMs);
        setTimeout(restartCheckNotifyShort, minutes * minMs);
    }

    function mkShortBtn(lbl, minutes) {
        const btn = modMdc.mkMDCbutton(lbl, "raised");
        // btn.style.textTransform = "none";
        btn.classList.add("btn-short-timer");
        btn.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            // modMdc.mkMDCsnackbar(`Added ${lbl} reminder`, 4000);
            modMdc.mkMDCsnackbar(`Added ${lbl} reminder (NOT READY)`, 4000);
            afterMinutes(minutes, lbl);
        }));
        return btn;
    }
    const btn10Sec = mkShortBtn("10 s", 10 / 60);
    const btn1minutes = mkShortBtn("1 min", 1);
    const btn10minutes = mkShortBtn("10 min", 10);
    const btn1hour = mkShortBtn("1 h", 60);
    const btn4hour = mkShortBtn("4 h", 4 * 60);
    const btnInfo = modMdc.mkMDCiconButton("info", "Info", 30);
    btnInfo.addEventListener("click", errorHandlerAsyncEvent(async evt => {
        const body = mkElt("div", undefined, [
            mkElt("p", undefined, "info"),
        ]);
        const dlg = modMdc.mkMDCdialogAlert(body, "Close");
    }));
    // export function mkMDCiconButton(icon, ariaLabel, sizePx);

    const divManualReminders = (mkElt("div", undefined, [
        // mkElt("p", undefined, ` Remind me about this item after: `),
        mkElt("div", undefined, "Remind me after:"),
        mkElt("div", { class: "div-short-buttons" }, [
            btn10Sec,
            btn1minutes,
            btn10minutes,
            btn1hour,
            btn4hour,
            btnInfo
            // btnManualReminder,
        ])
    ]));
    return divManualReminders;
}


// Clipboard images
async function getClipboardImages() {
    console.log("getClipboardImages");
    const modMdc = await import("util-mdc");

    if (!await isClipboardPermissionStateOk()) {
        return;
    }

    const info = mkElt("div");
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.gap = "10px";
    container.classList.add("thumb-100");
    try {
        const clipboard = await navigator.clipboard.read();
        console.log({ clipboard });
        info.appendChild(mkElt("p", undefined, `Num items: ${clipboard.length}`));
        for (const item of clipboard) {
            console.log({ item });
            for (const type of item.types) {
                // get blob data for item
                const blob = await item.getType(type);
                let newElement;
                // text item
                if (type === 'text/plain') {
                    newElement = document.createElement('p');
                    newElement.style.padding = "4px";
                    newElement.textContent = await blob.text();
                }
                // image item
                if (type.startsWith('image/')) {
                    const eltImg = mkElt("span", { class: "image-bg-contain image-thumb-size" });
                    const urlBlob = URL.createObjectURL(blob);
                    const urlBg = `url(${urlBlob})`;
                    // console.log({ blob, urlBlob });
                    eltImg.style.backgroundImage = urlBg;
                    eltImg.dataset.urlBlob = urlBlob;
                    newElement = mkElt("div", undefined, eltImg);
                }
                // append text or image to document
                if (newElement) {
                    newElement.classList.add("mdc-card");
                    container.appendChild(newElement);
                }
            }
        }
    } catch (err) {
        console.error('Could not read from clipboard', err);
        const errCode = err.code;
        const errName = err.name;
        // alert(`Could not read clipboard, ${err}`);
        const body = mkElt("div", undefined, [
            mkElt("div", undefined, `error.code: ${err.code}`),
            mkElt("div", undefined, `error.name: ${err.name}`),
            mkElt("div", undefined, `error.message: ${err.message}`),
        ]);
        await modMdc.mkMDCdialogAlert(body);
        return;
    }
    const body = mkElt("div", undefined, [info, container]);
    modMdc.mkMDCdialogAlert(body);
}

