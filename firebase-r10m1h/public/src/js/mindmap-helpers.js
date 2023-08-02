"use strict";
// FIX-ME: Put minmaps in localStorage for now

console.log("here is mindmap-helpers.js");


// async function getDbMindmaps() { return await import("/src/js/db-mindmaps.js") }
async function getDbMindmaps() { return await import("db-mindmaps") }
async function getDbFc4i() { return await import("/src/js/db-fc4i.js"); }
// async function getJsmindCust() { return await import("/src/js/jsmind-cust-rend.js") }
async function getJsmindCust() { return await import("jsmind-cust-rend"); }
async function getJsmindEditCommon() { return await import("jsmind-edit-common"); }

getJsmindCust();

function OLDthrottleTO(fn, msDelay) {
    let timeoutId;
    return function (...args) {
        if (timeoutId) {
            // return; // original
            clearTimeout(timeoutId); // my own
        }
        timeoutId = setTimeout(() => {
            fn(...args);
            // console.log("throttleTO(fn, delay)");
            timeoutId = null;
        }, msDelay);
    }
}



const throttleSaveMindmap = throttleTO(DBsaveNowThisMindmap, 300);
function DBrequestSaveThisMindmap(jmDisplayed) { throttleSaveMindmap(jmDisplayed); }
async function DBsaveNowThisMindmap(jmDisplayed) {
    const objDataMind = jmDisplayed.get_data("node_array");
    const keyName = objDataMind.meta.name;
    if (!keyName) throw Error("Current mindmap has no meta.key");
    const dbMindmaps = await getDbMindmaps();
    dbMindmaps.DBsetMindmap(keyName, objDataMind);
}

async function getNextMindmapKey() { return "mm-" + new Date().toISOString(); }

let theCustomRenderer;
async function getOurCustomRenderer() {
    theCustomRenderer = theCustomRenderer || await createOurCustomRenderer();
    // if (!theCustomRenderer instanceof CustomRenderer4jsMind) throw Error(`Not a custom renderer`);
    return theCustomRenderer;
}
async function createOurCustomRenderer() {
    console.warn("createOurCustomRenderer");
    // addDebugLog("createOurCustomRenderer");
    const modCustom = await getJsmindCust();
    theCustomRenderer = new modCustom.CustomRenderer4jsMind();
    return theCustomRenderer;
}
function setOurCustomRendererJm(jmDisplayed) {
    theCustomRenderer.setJm(jmDisplayed);
}
async function ourCustomRendererAddProvider(providerRec) {
    const modCustom = await getJsmindCust();
    const prov = new modCustom.providerDetails(providerRec)
    // console.warn("prov", prov);
    // theCustomRenderer.addProvider(prov);
    const custRend = await getOurCustomRenderer();
    custRend.addProvider(prov);
}

function checkType(variable, wantType) {
    const hasType = typeof variable;
    if (hasType != wantType) {
        const msg = `Want type ${wantType}, but got type ${hasType}`;
        throw Error(msg);
    }
}

createOurCustomRenderer();




function OLDshowMindmapFc4i(key) {
    const url = new URL("/fc4i-mindmaps.html", location);
    url.searchParams.set("mindmap", key);
    location.href = url; // FIX-ME:
}
function showMindmap(linkMindmapsPage,key) {
    const url = new URL(linkMindmapsPage, location);
    url.searchParams.set("mindmap", key);
    location.href = url; // FIX-ME:
}

// async function createAndShowNewMindmapFc4i() 
async function createAndShowNewMindmap(linkMindmapsPage) {
    const objDataMind = await dialogCreateMindMap();
    if (!objDataMind) return;
    const keyName = objDataMind.meta.name;
    console.log({ objDataMind, keyName });
    const dbMindmaps = await getDbMindmaps();
    dbMindmaps.DBsetMindmap(keyName, objDataMind);
    // showMindmapFc4i(keyName);
    showMindmap(linkMindmapsPage,keyName);
}

async function getMindmap(key) {
    const dbMindmaps = await getDbMindmaps();
    return dbMindmaps.DBgetMindmap(key);
}

async function dialogCreateMindMap() {
    const modMdc = await import("/src/js/mod/util-mdc.js");
    const dbMindmaps = await getDbMindmaps();

    const title = mkElt("h2", undefined, "Create new mindmap");
    const nextKey = await getNextMindmapKey();
    const pTopicOk = mkElt("p", undefined, "");
    pTopicOk.textContent = "Please input a topic name.";
    const inpRoot = modMdc.mkMDCtextFieldInput(undefined, "text");
    let btnOk;
    const arrAll = await dbMindmaps.DBgetAllMindmaps();
    inpRoot.addEventListener("input", evt => {
        const topic = inpRoot.value.trim();
        // console.log({ topic });
        let valid = true;
        if (topic.length === 0) {
            valid = false;
            pTopicOk.textContent = "Please input a topic name.";
        }
        if (valid) {
            arrAll.forEach(r => {
                if (!valid) return;
                const mm = r.jsmindmap;
                if (mm.format != "node_array") throw Error(`Expected format "node_array": ${mm.format}`);
                const root = mm.data[0];
                if (root.id != "root") throw Error(`Not root: ${root.id}`);
                const oldTopic = root.topic;
                if (valid && (oldTopic === topic)) {
                    valid = false;
                }
            });
            if (!valid) pTopicOk.textContent = "Name exists in another mindmap.";
        }
        btnOk.disabled = !valid;
        if (valid) {
            pTopicOk.textContent = "Name is valid";
        }
    });
    const tfRoot = modMdc.mkMDCtextField("Root node topic name", inpRoot);
    const body = mkElt("div", undefined, [
        title,
        tfRoot,
        pTopicOk,
    ]);
    setTimeout(() => {
        btnOk = title.closest("div.mdc-dialog").querySelector("button");
        console.log({ btnOk });
        btnOk.disabled = true;
    });
    // modMdc.mkMDCdialogConfirm(body, titleOk, titleCancel)
    const res = await modMdc.mkMDCdialogConfirm(body);
    console.log({ res });
    if (res) {
        const rootTopic = inpRoot.value.trim();
        // getEmptyMap(nextKey, rootTopic, author, version, format);
        return getEmptyMap(nextKey.toString(), rootTopic);
    }
}



async function getMindmapsHits(customKey) {
    const dbMindmaps = await getDbMindmaps();
    const provider = "fc4i"; // FIX-ME:
    const searchedTopic = (await getOurCustomRenderer()).customData2jsmindTopic(customKey, provider);
    const promArrMindmaps = (await dbMindmaps.DBgetAllMindmaps())
        .map(m => {
            const mindmap = m.jsmindmap;
            if (mindmap.format != "node_array") {
                console.error("Wrong mindmap format", { mindmap, m })
                throw Error(`Wrong mindmap format: ${mindmap.format} (should be "node_array")`);
            }
            const nodeData = mindmap.data;
            const hits = [];
            m.hits = hits;
            nodeData.forEach(nd => {
                // const strCustom = nd.custom;
                // if (!strCustom) return;
                // const objCustom = JSON.parse(strCustom);
                // console.log({ nd, objCustom });
                // if (objCustom.key == customKey) { hits.push(nd); }
                const topic = nd.topic;
                // FIX-ME: key, provider, better search
                if (topic.search(customKey) > 0) { hits.push(nd); };
                if (topic == searchedTopic) { hits.push(nd); };
            });
            return m;
        })
        .filter(m => m.hits.length > 0);
    return promArrMindmaps;
}




async function pasteCustomClipDialog() {
    const modMdc = await import("/src/js/mod/util-mdc.js");
    const arrClip = fetchJsmindCopied4Mindmap();
    if (!arrClip) debugger;

    let result;
    const info = mkElt("p", undefined, "Link selected node to one of these custom entries:");
    const divPastes = mkElt("div", { id: "jsmind-test-custom-paste" }, info);
    const body = mkElt("div", undefined, [info, divPastes]);
    const arrProm = arrClip.map(async objClip => {
        const div1 = await mkDivOneCustomClip(objClip);
        const thisClip = JSON.parse(JSON.stringify(objClip));
        div1.dataset.clip = JSON.stringify(objClip);
        div1.addEventListener("click", evt => {
            // const clipDataset = evt.target.closest(".jsmind-test-custom-clip").dataset.clip;
            result = thisClip;
            closeDialog();
        });
        return div1;
    });
    const arrElt = await Promise.all(arrProm);
    arrElt.forEach(eltClip => {
        divPastes.appendChild(eltClip);
    });

    const btnCancel = modMdc.mkMDCdialogButton("Cancel", "close");
    const eltActions = modMdc.mkMDCdialogActions([btnCancel]);
    const dlg = await modMdc.mkMDCdialog(body, eltActions);
    function closeDialog() { dlg.mdc.close(); }
    return await new Promise((resolve, reject) => {
        dlg.dom.addEventListener("MDCDialog:closed", errorHandlerAsyncEvent(async evt => {
            const action = evt.detail.action;
            console.log({ action, result });
            resolve(result);
        }));
    });
}

async function mkDivOneCustomClip(objCustomClip) {
    const modMdc = await import("/src/js/mod/util-mdc.js");
    // const keyRec = await get1Reminder(objCustomClip.key); // FIX-ME: provider
    const key = objCustomClip.key;
    const provider = objCustomClip.provider;
    const keyRec = await getOurCustomRenderer().getCustomRec(key, provider);

    const eltTitle = mkElt("span", undefined, keyRec.title)
    const divClipInner = mkElt("div", { class: "jsmind-test-custom-clip-inner" }, eltTitle);
    const divClip = mkElt("div", { class: "mdc-card jsmind-test-custom-clip" }, divClipInner);
    const blob = keyRec.images[0];
    if (blob) {
        const eltBlob = mkElt("span", { class: "image-bg-cover image-thumb-size" });
        const urlBlob = URL.createObjectURL(blob);
        const urlBg = `url(${urlBlob})`;
        eltBlob.style.backgroundImage = urlBg;
        const divBlob = mkElt("div", { class: "dialog-mindmaps-image" }, eltBlob);
        divClipInner.appendChild(divBlob);
    }
    const btnRemove = modMdc.mkMDCiconButton("delete_forever");
    btnRemove.classList.add("upper-left-remove-button");
    btnRemove.addEventListener("click", evt => {
        evt.stopPropagation();
        removeJsmindCopied4Mindmap(objCustomClip);
        divClip.remove();
    });
    divClip.appendChild(btnRemove);
    return divClip;
}

async function dialogShowCustomClipboard() {
    const modMdc = await import("/src/js/mod/util-mdc.js");
    const arrClip = fetchJsmindCopied4Mindmap();
    console.log({ arrCopied4Mindmap: arrClip });
    const body = mkElt("div", { id: "jsmind-test-custom-clipboard" });
    const ourRend = await getOurCustomRenderer();
    const arrProviders = ourRend.getProviderNames();
    const arrProm = arrClip
        .filter(objClip => arrProviders.includes(objClip.provider))
        .map(objClip => mkDivOneCustomClip(objClip));
    const arrElt = await Promise.all(arrProm);
    arrElt.forEach(eltClip => {
        body.appendChild(eltClip);
    });
    modMdc.mkMDCdialogAlert(body, "Close");
}

async function dialogAdded2CustomClipboard(objAdded) {
    const modMdc = await import("/src/js/mod/util-mdc.js");
    const divObjAdded = await mkDivOneCustomClip(objAdded);
    const btnRemove = divObjAdded.lastElementChild;
    if (btnRemove.tagName != "BUTTON") throw Error(`Not button remove: ${btnRemove.tagName}`);
    btnRemove.remove();
    const title = mkElt("h2", undefined, "Copied to custom clipboard");
    const info = mkElt("p", undefined, [
        "To use it open a mindmap.",
        "You can then choose ",
        // FIX-ME: menu item name????
        mkElt("b", undefined, "Link node to custom content"),
        " from the menu."
    ]);
    const btn = modMdc.mkMDCbutton("Show custom clipboard", "raised");
    btn.addEventListener("click", evt => {
        dialogShowCustomClipboard();
        closeDialog();
    });
    const divBtn = mkElt("p", undefined, btn);
    const body = mkElt("div", undefined, [
        title,
        info,
        divObjAdded,
        divBtn
    ])
    const dlg = await modMdc.mkMDCdialogAlert(body, "Close");
    console.log({ dlg });
    function closeDialog() { dlg.mdc.close(); }
}
async function dialogCustomPaste2Mindmap() {
    const arrCopied4Mindmap = fetchJsmindCopied4Mindmap();
    if (!arrCopied4Mindmap) debugger;
    const objCopied4Mindmap = arrCopied4Mindmap[0];
    let info;
    if (objCopied4Mindmap) {
        const warn = mkElt("p", undefined, [
            "This functionality is beeing changed!"
        ]);
        warn.style.background = "red";

        info = mkElt("div");
        info.appendChild(warn);

        const divNewPaste = await mkDivOneCustomClip(objCopied4Mindmap);
        info.appendChild(divNewPaste);
    }
    dialogMindMaps(info);
}




async function dialogFindInMindMaps(key) {
    const arrMindmapsHits = await getMindmapsHits(key);
    console.log({ arrMindmapsHits });
    if (arrMindmapsHits.length == 0) {
        const modMdc = await import("/src/js/mod/util-mdc.js");
        modMdc.mkMDCdialogAlert("Not found in any mindmap");
        // alert("not found in any mindmap");
        return;
    }
    const info = mkElt("p", undefined, "Found in these mindmaps:");
    dialogMindMaps(info, arrMindmapsHits);
}

function mkEltLinkMindmapFc4i(topic, mkey, mhits) {
    const urlPath = "/fc4i-mindmaps.html";
    return mkEltLinkMindmapA(urlPath, topic, mkey, mhits);
}
function mkEltLinkMindmapJsmindEdit(topic, mkey, mhits) {
    const urlPath = "/jsmind-edit.html";
    return mkEltLinkMindmapA(urlPath, topic, mkey, mhits);
}
function mkEltLinkMindmapA(urlPath, topic, mkey, mhits) {
    const url = new URL(urlPath, location);
    url.searchParams.set("mindmap", mkey);
    if (mhits) {
        const hits = mhits.map(h => h.id);
        console.log({ hits })
        url.searchParams.set("nodehits", hits);
    }
    const eltA = mkElt("a", undefined, topic);
    eltA.href = url;
    return eltA;
}

// async function dialogMindMaps(funMkEltLinkMindmap, info, arrMindmapsHits)
async function dialogMindMaps(linkMindmapsPage, info, arrMindmapsHits) {
    const toLink = typeof linkMindmapsPage;
    if (toLink !== "string") throw Error(`urlHtml typeof should be string, got ${toLink}`);
    // const eltA = funMkEltLinkMindmap(topic, m.key, m.hits);
    const funMkEltLinkMindmap = (topic, mKey, mHits) => mkEltLinkMindmapA(linkMindmapsPage, topic, mKey, mHits);
    const modMdc = await import("/src/js/mod/util-mdc.js");
    const dbMindmaps = await getDbMindmaps();

    const showNew = !arrMindmapsHits;

    const eltTitle = mkElt("h2", undefined, "Mindmaps");
    info = info || "";

    arrMindmapsHits = arrMindmapsHits || await dbMindmaps.DBgetAllMindmaps();
    const arrToShow = arrMindmapsHits.map(mh => {
        const key = mh.key;
        const j = mh.jsmindmap;
        const hits = mh.hits;
        let topic;
        switch (j.format) {
            case "node_tree":
                topic = j.data.topic;
                break;
            case "node_array":
                topic = j.data[0].topic;
                break;
            case "freemind":
                const s = j.data;
                topic = s.match(/<node .*?TEXT="([^"]*)"/)[1];
                break;
            default:
                throw Error(`Unknown mindmap format: ${j.format}`);
        }
        // console.log({ m, key, j, name });
        let name = topic;
        if (topic.startsWith("<")) {
            // FIX-ME: use DOMParser? It may be synchronous.
            // https://stackoverflow.com/questions/63869394/parse-html-as-a-plain-text-via-javascript
            const elt = document.createElement("div");
            elt.innerHTML = topic;
            const txt = elt.textContent;
            name = txt;
            const child1 = elt.firstElementChild;
            // const custom = child1.dataset["jsmind-custom"];
            const strCustom = child1.dataset.jsmindCustom;
            if (strCustom) {
                // console.log({ txt, strCustom })
                // ourCustomRenderer
                const objCustom = JSON.parse(strCustom);
                topic = (async () => {
                    const key = objCustom.key;
                    const provider = objCustom.provider;
                    const keyRec = await (await getOurCustomRenderer()).getCustomRec(key, provider);
                    return keyRec.title;
                })();
            }
        }
        return { key, topic, hits };
    });
    const arrPromLiMenu = arrToShow.map(async m => {
        // https://stackoverflow.com/questions/43033988/es6-decide-if-object-or-promise
        const topic = await Promise.resolve(m.topic);
        const btnDelete = await modMdc.mkMDCiconButton("delete_forever");
        btnDelete.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            evt.stopPropagation();
            const eltQdelete = mkElt("span", undefined, ["Delete ", mkElt("b", undefined, topic)]);
            const answerIsDelete = await modMdc.mkMDCdialogConfirm(eltQdelete);
            if (answerIsDelete) {
                console.log("*** del mm");
                const eltLi = btnDelete.closest("li");
                eltLi.style.backgroundColor = "red";
                eltLi.style.opacity = 1;
                eltLi.style.transition = "opacity 1s, height 1s, scale 1s";
                eltLi.style.opacity = 0;
                eltLi.style.height = 0;
                eltLi.style.scale = 0;
                const dbMindmaps = await getDbMindmaps();
                dbMindmaps.DBremoveMindmap(m.key);
                setTimeout(() => eltLi.remove(), 1000);
            }
        }));

        const eltA = funMkEltLinkMindmap(topic, m.key, m.hits);

        const eltTopic = mkElt("span", undefined, topic);
        // const eltMm = mkElt("div", undefined, [eltTopic, btnDelete]);
        const eltMm = mkElt("div", undefined, [eltA, btnDelete]);
        const li = modMdc.mkMDCmenuItem(eltMm);
        li.addEventListener("click", evt => {
            closeDialog();
        });
        return li;
    });
    const arrLiMenu = await Promise.all(arrPromLiMenu);
    if (showNew) {
        const liNew = modMdc.mkMDCmenuItem("New mindmap");
        liNew.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            // await createAndShowNewMindmapFc4i();
            await createAndShowNewMindmap(linkMindmapsPage);
        }));
        // arrLiMenu.push(liNew);

        // function mkMDCfab(eltIcon, title, mini, extendTitle)
        const eltIcon = modMdc.mkMDCicon("add");
        const btnFab = modMdc.mkMDCfab(eltIcon, "Create new mindmap", true);
        btnFab.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            // await createAndShowNewMindmapFc4i();
            await createAndShowNewMindmap(linkMindmapsPage);
        }));
        btnFab.style.marginLeft = "40px";
        eltTitle.appendChild(btnFab);
    }
    const ul = modMdc.mkMDCmenuUl(arrLiMenu);
    ul.classList.add("mindmap-list");
    const body = mkElt("div", { id: "div-dialog-mindmaps" }, [
        eltTitle,
        info,
        ul,
    ]);

    const btnClose = modMdc.mkMDCdialogButton("Close", "close", true);
    const eltActions = modMdc.mkMDCdialogActions([btnClose]);
    const dlg = await modMdc.mkMDCdialog(body, eltActions);
    function closeDialog() { dlg.mdc.close(); }
}



function setJsmindCopied4Mindmap(strJson) {
    localStorage.setItem("jsmind-copied4mindmap", strJson);
}
function getJsmindCopied4Mindmap() {
    return localStorage.getItem("jsmind-copied4mindmap");
}

function addJsmindCopied4Mindmap(key, provider) {
    const strJson = JSON.stringify({ key, provider });
    const objAdded = JSON.parse(strJson);
    let arrClips = fetchJsmindCopied4Mindmap() || [];
    arrClips = arrClips.filter(obj => {
        const str = JSON.stringify(obj);
        return str != strJson;
    });
    // debugger;
    arrClips.unshift(objAdded);
    const strArr = JSON.stringify(arrClips);
    setJsmindCopied4Mindmap(strArr);
    return objAdded;
}
function removeJsmindCopied4Mindmap(objRemove) {
    debugger;
    const strRemove = JSON.stringify(objRemove);
    const arrOldClips = fetchJsmindCopied4Mindmap() || [];
    const arrNewClips = arrOldClips.filter(obj => {
        const str = JSON.stringify(obj);
        return str != strRemove;
    });
    setJsmindCopied4Mindmap(JSON.stringify(arrNewClips));
}
function fetchJsmindCopied4Mindmap() {
    const strJson = getJsmindCopied4Mindmap();
    if (strJson) {
        const obj = JSON.parse(strJson);
        console.log({ obj });
        if (!Array.isArray(obj)) { return [obj]; }
        return obj;
    }
}
function clearJsmindCopied4Mindmap() {
    // FIX-ME: not used
    console.warn("clearJsmindCopied4Mindmap");
    localStorage.removeItem("jsmind-copied4mindmap");
}



function getEmptyMap(keyName, rootTopic, author, version, format) {
    if (!keyName) throw Error("No key given for new mindmap");
    format = format || "node_array";
    rootTopic = rootTopic || `Jsmind ${format}`;
    version = version || "1.0.0";
    const name = keyName;
    const meta = { name, author, version };
    const mind0 = { meta }
    mind0.format = format;
    switch (format) {
        case "node_array":
            mind0.data = [{ "id": "root", isroot: true, "topic": rootTopic, }];
            break;
        case "node_tree":
            mind0.data = { "id": "root", "topic": rootTopic, };
            break;
        case "freemind":
            mind0.data = `<map version="1.0.1"><node ID="root" TEXT="${rootTopic}"/></map>`;
            break;
        default:
            throw Error(`Bad jsmind map format: ${format}`);
    }
    return mind0;
}
