"use strict";

console.log("here is jsmind-edit-common.js");

async function getDraggableNodes() {
    // return await import("/ext/jsmind/new-jsmind.draggable-nodes.js");
    return await import("new-jsmind.draggable-nodes");
}

const theMirrorWays = [
    "none",
    // "useCanvas",
    // "jsmind",
    "pointHandle",
    // "cloneNode",
];
Object.freeze(theMirrorWays);
const ifMirrorWay = (ourWay) => {
    if (!theMirrorWays.includes(ourWay)) throw Error(`Unknown mirror way: ${ourWay}`);
    return ourWay == theDragTouchAccWay;
}

const checkTheDragTouchAccWay = () => {
    if (!theMirrorWays.includes(theDragTouchAccWay)) throw Error(`Unknown mirror way: ${theDragTouchAccWay}`);
}
function switchDragTouchAccWay(newWay) {
    theDragTouchAccWay = newWay;
    checkTheDragTouchAccWay();
    switch (theDragTouchAccWay) {
        // case "cloneNode": setupMirror(); break;
        case "none":
            teardownPointHandle();
            break;
        case "pointHandle":
            // setTimeout(setupPointHandle, 1000);
            setupPointHandle();
            break;
        default:
            throw Error(`Not handled theMirrorWay=${theDragTouchAccWay}`);
    }
}


// https://www.labnol.org/embed/google/photos/?ref=hackernoon.com
// https://hackernoon.com/how-to-embed-single-photos-from-google-photos-on-your-website-and-notion-page
// https://jumpshare.com/blog/how-to-embed-google-drive-video/
async function dialogMirrorWay() {
    const modMdc = await import("/src/js/mod/util-mdc.js");
    const notWorking = ["useCanvas", "jsmind",];
    const altWays = theMirrorWays.filter(alt => !notWorking.includes(alt));
    console.log({ altWays });
    const altsDesc = {}
    altsDesc.none = mkElt("div", undefined, [
        "Default when the only screen input is a mouse or similar."
    ]);

    // const srcVideoMirror = "https://drive.google.com/file/d/17gmHG7X14szrG04nIskIAAP4mNnr9Tm8/preview";
    const srcVideoMirror = "/img/vid/screen-20230513-mirror.mp4";
    const posterVideoMirror = "/img/vid/screen-20230513-mirror.jpg";
    const aspectratioVideoMirror = "1048 / 1248";
    const eltVidMirror = mkVidElt(srcVideoMirror, posterVideoMirror);
    // altsDesc.cloneNode = mkElt("div", undefined, [ eltVidMirror ]);

    function mkVidElt(src, poster, aspectRatio) {
        aspectRatio = aspectRatio || "1 / 1";
        // https://stackoverflow.com/questions/24157940/iframe-height-auto-css
        const styleVideo = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                aspect-ratio: ${aspectRatio};
                `;
        const eltIframe = mkElt("iframe", { style: styleVideo });
        eltIframe.allowfullscreen = true;

        const styleContainer = `
                position: relative;
                 width: 100%;
                 aspect-ratio: 1048 / 1248;
                `;

        const eltVideo = mkElt("video", { style: styleContainer });
        eltVideo.src = src;
        if (poster) eltVideo.poster = poster;
        eltVideo.controls = true;
        // eltVideo.autoplay = true;
        // eltVideo.load();

        // const divIframeContainer = mkElt("div", { style: styleContainer }, eltIframe);
        // return divIframeContainer;

        // const divBoth = mkElt("div", undefined, [divIframeContainer, eltVideo]);
        // return divBoth;
        return eltVideo;
    }

    altsDesc.pointHandle = mkElt("div", undefined, [
        "Default when screen supports touch.",
        "(no description yet)",
        // vidPointHandle,
        // iframePointHandle
        // divIframePointHandle
    ]);
    function mkAltWay(way) {
        const radio = mkElt("input", { type: "radio", name: "mirrorway", value: way });
        if (theDragTouchAccWay == way) radio.checked = true;
        return mkElt("label", undefined, [
            way, radio,
            altsDesc[way]
        ]);
    }

    const style = [
        "display: flex",
        "flex-direction: column",
        "gap: 20px"
    ].join("; ");
    const divChoices = mkElt("div", { style });
    altWays.forEach(way => divChoices.appendChild(mkAltWay(way)));
    const body = mkElt("div", undefined, [divChoices]);
    function getValue() {
        // return "hej";
        return divChoices.querySelector('input[name="mirrorway"]:checked')?.value;
    }
    return modMdc.mkMDCdialogGetValue(body, getValue, "Ok");
}

let theDragTouchAccWay = "none";
if (hasTouchEvents()) theDragTouchAccWay = "pointHandle";
theDragTouchAccWay = "pointHandle"; // FIX-ME:

// switchDragTouchAccWay(theDragTouchAccWay);
// checkTheDragTouchAccWay();


/////////////////////////////////////////////////////
let posPointHandle;
let jmnodesPointHandle;
let pointPointHandle;
const sizePointHandle = 20;
const diffPointHandle = 60;
function startPointHandle(evt) {
    // evt.stopPropagation();
    // evt.preventDefault();
    posPointHandle = {};
    pointPointHandle = mkElt("div", { id: "jsmindtest-point-handle" });
    jmnodesPointHandle.appendChild(pointPointHandle);
    // jmnodesPointHandle.addEventListener("mousemove", checkPointHandleDistance);
    jmnodesPointHandle.addEventListener("drag", checkPointHandleDistance);
}
function stopPointHandle(evt) {
    // evt.stopPropagation();
    // evt.preventDefault();
    // jmnodesPointHandle.removeEventListener("mousemove", checkPointHandleDistance);
    jmnodesPointHandle.removeEventListener("drag", checkPointHandleDistance);
    pointPointHandle?.remove();
}
function setupPointHandle() {
    jmnodesPointHandle = document.body.querySelector("jmnodes");
    // jmnodesPointHandle.addEventListener("mousedown", startPointHandle);
    // jmnodesPointHandle.addEventListener("mouseup", stopPointHandle);
    jmnodesPointHandle.addEventListener("dragstart", startPointHandle);
    jmnodesPointHandle.addEventListener("dragend", stopPointHandle);
}
async function teardownPointHandle() {
    jmnodesPointHandle = document.body.querySelector("jmnodes");
    jmnodesPointHandle.removeEventListener("dragstart", startPointHandle);
    jmnodesPointHandle.removeEventListener("dragend", stopPointHandle);
    stopPointHandle();
    modJsmindDraggable.setPointerDiff(0, 0);
}
function checkPointHandleDistance(evt) {
    if (posPointHandle.startX == undefined) {
        // console.log("checkPointHandleDistance", evt);
        posPointHandle.startX = evt.clientX;
        posPointHandle.startY = evt.clientY;

        const target = evt.target.closest("jmnode");
        const bcrT = target.getBoundingClientRect();
        posPointHandle.dTop = evt.clientY - bcrT.top;
        posPointHandle.dBottom = bcrT.bottom - evt.clientY;
        posPointHandle.dLeft = evt.clientX - bcrT.left;
        posPointHandle.dRight = bcrT.right - evt.clientX;
        ["dTop", "dBottom", "dLeft", "dRight"].forEach(dT => {
            const d = posPointHandle[dT];
            if (d <= 0) throw Error(`${dT} < 0, =${d}`);
        });

        pointPointHandle.style.left = evt.clientX - sizePointHandle / 2;
        pointPointHandle.style.top = evt.clientY - sizePointHandle / 2;
        jmnodesPointHandle.appendChild(pointPointHandle)
        console.log("checkPointHandleDistance start", { posPointHandle });
    }
    const diffX = posPointHandle.startX - evt.clientX;
    const diffY = posPointHandle.startY - evt.clientY;
    const diff2 = diffX * diffX + diffY * diffY;
    const diffOk = !(diff2 < diffPointHandle * diffPointHandle);
    if (!diffOk) return;

    const dOutside = 10;
    const startX = posPointHandle.startX;
    const startY = posPointHandle.startY;
    const dLeft = posPointHandle.dLeft;
    const dRight = posPointHandle.dRight;
    const dTop = posPointHandle.dTop;
    const dBottom = posPointHandle.dBottom;
    const leftInside = startX - evt.clientX < dRight + dOutside;
    const rightInside = evt.clientX - startX < dLeft + dOutside;
    const topInside = startY - evt.clientY < dBottom + dOutside;
    const bottomInside = evt.clientY - startY < dTop + dOutside;
    const isInside = leftInside && rightInside && topInside && bottomInside;
    // console.log({ isInside, leftInside, rightInside, topInside, bottomInside });
    if (isInside) return;

    pointPointHandle.classList.add("active");
    console.log("added active to pph");
    posPointHandle.diffX = posPointHandle.diffX || diffX;
    posPointHandle.diffY = posPointHandle.diffY || diffY;
    const newDiffX = posPointHandle.diffX - sizePointHandle / 2;
    const newDiffY = posPointHandle.diffY - sizePointHandle / 2;
    modJsmindDraggable.setPointerDiff(newDiffX, newDiffY);
    // jmnodesPointHandle.removeEventListener("mousemove", checkPointHandleDistance);
    // jmnodesPointHandle.removeEventListener("mousemove", checkPointHandleDistance);
    jmnodesPointHandle.removeEventListener("drag", checkPointHandleDistance);
    jmnodesPointHandle.addEventListener("drag", movePointHandle);
}
function movePointHandle(evt) {
    // evt.stopPropagation();
    // evt.preventDefault();
    const sp = pointPointHandle.style;
    sp.left = evt.clientX + posPointHandle.diffX - sizePointHandle / 2;
    sp.top = evt.clientY + posPointHandle.diffY - sizePointHandle / 2;
}
function getposPointHandle() {
    const sp = pointPointHandle.style;
    const clientX = sp.left;
    const clientY = sp.top;
    return { clientX, clientY };
}
/////////////////////////////////////////////////////

let arrShapeClasses = getMatchesInCssRules(/\.(jsmind-shape-[^.:#\s]*)/);
function clearShapes(eltShape) {
    if (eltShape.tagName != "DIV" || !eltShape.classList.contains("jmnode-bg")) {
        throw Error('Not <jmnode><div class="jmnode-bg"');
    }
    arrShapeClasses.forEach(oldShape => { eltShape.classList.remove(oldShape) });
}

function shapeCanHaveBorder(shapeName) {
    return !shapeName?.startsWith("jsmind-shape-clip-");
}

function applyNodeShapeEtc(node, eltJmnode) {
    const shapeEtc = node.data.shapeEtc;
    if (!shapeEtc) return;
    applyShapeEtc(shapeEtc, eltJmnode);
}
function applyShapeEtc(shapeEtc, eltJmnode) {
    const eltShape = eltJmnode.querySelector(".jmnode-bg");
    if (!eltShape) {
        if (eltJmnode.childElementCount > 1) {
            console.error("old custom format 2");
            // FIX-ME: just delete this???
            debugger;
            // return;
            let htmlRendererImg = mkElt("div", { class: "jsmind-render-img" });
            const OLDhtmlRendererImg = eltJmnode.lastElementChild;
            OLDhtmlRendererImg.remove();
            const customData = htmlTopic.dataset.jsmindCustom;
            delete htmlTopic.dataset.jsmindCustom;
            htmlRendererImg.dataset.jsmindCustom = customData;
            // FIX-ME: ??? background-image
        }
    }

    clearShapes(eltShape);
    const shape = shapeEtc.shape;
    if (shape) {
        if (arrShapeClasses.includes(shape)) {
            eltShape.classList.add(shape);
        } else {
            if (shape != "default") console.error(`Unknown shape: ${shape}`);
        }
    }
    if (shapeCanHaveBorder(shape)) {
        const border = shapeEtc.border;
        if (border) {
            const w = border.width || 0;
            const c = border.color || "black";
            const s = border.style || "solid";
            if (w == 0) {
                eltShape.style.border = null;
            } else {
                eltShape.style.border = `${w}px ${s} ${c}`;
            }
        }
    } else {
        eltShape.style.border = null;
    }
    const shadow = shapeEtc.shadow;
    if (shadow && shadow.blur > 0) {
        const x = shadow.offX || 0;
        const y = shadow.offY || 0;
        const b = shadow.blur;
        const c = shadow.color || "red";
        eltShape.style.filter = `drop-shadow(${x}px ${y}px ${b}px ${c})`;
        // FIX-ME: spread is currently not used, or???
        // const s = shadow.spread;
        // eltJmnode.style.filter = `drop-shadow(${x}px ${y}px ${b}px ${s}px ${c})`;
    }
}


let modJsmindDraggable;
// basicInit4jsmind();
export function basicInit4jsmind() {
    console.log("jsMind", typeof jsMind);
    jsMind.my_get_DOM_element_from_node = (node) => { return node._data.view.element; }
    jsMind.my_get_nodeID_from_DOM_element = (elt) => {
        const tn = elt.tagName;
        if (tn !== "JMNODE") throw Error(`Not jmnode: <${tn}>`);
        const id = elt.getAttribute("nodeid");
        if (!!!id) throw Error("Could not find jmnode id");
        return id;
    }


    // await thePromiseDOMready;
    async function startDraggable() {
        // modJsmindDraggable = await import("/ext/jsmind/new-jsmind.draggable-nodes.js");
        modJsmindDraggable = await getDraggableNodes();
        // console.log({ modJsmindDraggable });
    }
    errorHandlerAsyncEvent(startDraggable());

    function addDragDropTouch() {
        // if (!confirm("Load DragDropTouch.js?")) return;
        const elt = mkElt("script", { src: "/ext/DragDropTouch.js" });
        document.head.appendChild(elt);
    }
    if (hasTouchEvents()) {
        addDragDropTouch();
    }
    // } else { addDragDropTouch();

}

let funMindmapDialog;
export function setMindmapDialog(fun) {
    const funType = typeof fun;
    if (funType != "function") throw Error(`setMindmapDialog, expected "function" paramenter, got "${funType}"`);
    funMindmapDialog = fun;
}

// pageSetup();

// testDouble(); async function testDouble() { console.warn("testDouble"); }

checkTheDragTouchAccWay();

const idThemeChoices = "theme-choices"; // FIX-ME???

export async function pageSetup() {
    // let useCanvas = true;
    // let useCanvas = false;
    // useCanvas = confirm("Use canvas?");

    const idContextMenu = "jsmind-context-menu";
    let divContextMenu;

    const idDivJmnodesMain = "jsmind_container";
    // const idDivJmnodesMirror = "jsmind-draggable-container4mirror";
    // let mirrorContainer;

    // const idDivScreenMirror = "jsmindtest-div-mirror";
    // const idMirroredWrapper = "jsmindtest-div-mirrored-wrapper";
    // let divMirroredWrapper;

    const jsMindContainer = document.getElementById(idDivJmnodesMain);

    const idDivHits = "jsmind-div-hits";

    let h2cCanvas;
    let promH2cCanvas;
    // const heightDivH2c = 300;
    // const widthDivH2c = 200;
    const mirrorVals = {
        // clientXthrottle4mirror;
        // clientYthrottle4mirror;
        heightDivH2c: 300,
        widthDivH2c: 200,
    }

    const optionsJmDisplay = {
        // container: 'jsmind_container',
        container: idDivJmnodesMain,
        theme: 'orange',
        editable: true,
        view: {
            // draggable: true,
            draggable: false,
            hide_scrollbars_when_draggable: false,
            engine: "svg",
            line_width: 10,
            line_color: "green",
        },
        shortcut: {
            enable: true, 		// whether to enable shortcut
            handles: {}, 			// Named shortcut key event processor
            mapping: { 			// shortcut key mapping
                addchild: [45, 4096 + 13], 	// <Insert>, <Ctrl> + <Enter>
                addbrother: 13, // <Enter>
                editnode: 113, 	// <F2>
                delnode: 46, 	// <Delete>
                toggle: 32, 	// <Space>
                left: 37, 		// <Left>
                up: 38, 		// <Up>
                right: 39, 		// <Right>
                down: 40, 		// <Down>
            }
        },
    };
    const strOptionsJmDisplay = JSON.stringify(optionsJmDisplay);
    const optionsJmMirror = JSON.parse(strOptionsJmDisplay);
    // FIX-ME: We can't use mirror.
    // optionsJmMirror.container = idDivJmnodesMirror;
    optionsJmMirror.container = "this-id-does-not-exist";
    delete optionsJmMirror.shortcut;


    // Use this??? copy canvas https://jsfiddle.net/lborgman/5L1bfhow/3/




    const btnDebugLogClear = mkElt("button", undefined, "Clear");
    btnDebugLogClear.addEventListener("click", evt => {
        divDebugLogLog.textContent = "";
    });
    const divDebugLogHeader = mkElt("div", { id: "jsmind-test-debug-header" }, [
        "JSMIND DEBUG LOG",
        btnDebugLogClear
    ]);
    const divDebugLogLog = mkElt("div", { id: "jsmind-test-div-debug-log-log" });
    const divDebugLog = mkElt("div", { id: "jsmind-test-div-debug-log" }, [
        divDebugLogHeader,
        divDebugLogLog
    ]);
    let btnJsmindDebug;
    const idBtnJsmindDebug = "jsmind-ednode-debug-button";


    let btnJsmindMenu;
    const idBtnJsmindMenu = "jsmind-test-menu-button";
    let btnJsmindSearch;
    const idBtnJsmindSearch = "jsmind-search-button";
    let divSearchInputs;
    const idSearchInputs = "jsmind-search-inputs";
    addJsmindButtons();
    async function addJsmindButtons() {
        const modMdc = await import("/src/js/mod/util-mdc.js");

        btnJsmindDebug = modMdc.mkMDCiconButton("adb", "Debug log", 40);
        btnJsmindDebug.id = idBtnJsmindDebug;
        btnJsmindDebug.classList.add("jsmind-actions");
        jsMindContainer.appendChild(btnJsmindDebug);
        btnJsmindDebug.addEventListener("click", evt => {
            console.log("btnJsmindMenu");
            evt.stopPropagation();
            jsMindContainer.classList.toggle("show-jsmind-debug");
        });


        btnJsmindMenu = modMdc.mkMDCiconButton("menu", "Open menu", 40);
        btnJsmindMenu.id = idBtnJsmindMenu;
        btnJsmindMenu.classList.add("jsmind-actions");
        jsMindContainer.appendChild(btnJsmindMenu);
        btnJsmindMenu.addEventListener("click", evt => {
            // console.log("btnJsmindMenu");
            evt.stopPropagation();
            displayContextMenu(btnJsmindMenu);
        });
        btnJsmindSearch = modMdc.mkMDCiconButton("search", "Search", 40);
        btnJsmindSearch.id = idBtnJsmindSearch;
        btnJsmindSearch.classList.add("jsmind-actions");
        jsMindContainer.appendChild(btnJsmindSearch);
        btnJsmindSearch.addEventListener("click", evt => {
            // console.log("btnJsmindSearch");
            evt.stopPropagation();
            toggleSearchInputs();
            if (visibleSearchInputs()) {
                inpSearch.focus();
            } else {
                const divHits = document.getElementById(idDivHits);
                divHits?.remove();
            }
        });

        inpSearch = mkElt("input", { type: "search", placeholder: "Search node topics" });
        inpSearch.addEventListener("input", evt => {
            restartJsmindSearch();
        })
        divSearchInputs = mkElt("div", { id: idSearchInputs }, inpSearch);
        divSearchInputs.classList.add("jsmind-actions");
        jsMindContainer.appendChild(divSearchInputs);
    }
    function displaySearchInputs() { jsMindContainer.classList.add("display-jsmind-search"); }
    function hideSearchInputs() { jsMindContainer.classList.remove("display-jsmind-search"); }
    function toggleSearchInputs() { jsMindContainer.classList.toggle("display-jsmind-search"); }
    function visibleSearchInputs() { return jsMindContainer.classList.contains("display-jsmind-search"); }
    let inpSearch;
    const restartJsmindSearch = (() => {
        let tmr;
        return () => {
            clearTimeout(tmr);
            tmr = setTimeout(() => doJsmindSearch(), 1000);
        }
    })();
    function doJsmindSearch() {
        const strSearch = inpSearch.value;
        jsmindSearchNodes(strSearch);
    }

    // https://github.com/hizzgdev/jsmind/blob/master/docs/en/1.usage.md#12-data-format
    const mindmapKey = new URLSearchParams(location.search).get("mindmap");
    if (typeof mindmapKey === "string" && mindmapKey.length === 0) {
        throw Error("Parameter mindmapname should have a value (key/name of a mindmap)");
    }
    const createMindmap = new URLSearchParams(location.search).get("createmindmap");
    if (typeof createMindmap === "string" && createMindmap.length > 0) {
        throw Error("Parameter createmindmap does not take a value");
    }
    const create = ((createMindmap != null) || (mindmapKey == null));
    // console.log({ mindmapKey, createMindmap, create });
    let mind;
    if (create) {
        // mind = await dialogCreateMindMap();
    } else {
        mind = await getMindmap(mindmapKey);
    }
    // debugger;
    if (!mind) {
        return;
        // mind = getEmptyMap(mindmapKey);
    }

    // const modJmDrag = await import("/ext/jsmind/new-jsmind.draggable-nodes.js");
    const modJmDrag = await getDraggableNodes();
    modJmDrag.setupNewDragging();

    const nowBefore = Date.now();
    const jmDisplayed = displayMindMap(mind, optionsJmDisplay);

    setOurCustomRendererJm(jmDisplayed);
    switchDragTouchAccWay(theDragTouchAccWay);

    const nowAfter = Date.now();
    console.log(`*** displayMindMap, custom rendering: ${nowAfter - nowBefore} ms`);


    let jmMirrored;
    let ourCustomRenderer4mirror;

    // FIX-ME: remove when this is fixed in jsmind.
    fixProblemsAndUpdateCustomAndShapes(jmDisplayed);
    // oldSecondJmnodesFixing();

    async function setNodeHitsFromArray(arrIdHits, hitType) {
        const modMdc = await import("/src/js/mod/util-mdc.js");
        // const arrHits = nodehits.split(",");
        console.log({ arrHits: arrIdHits });
        arrIdHits.forEach(id => {
            const node = jmDisplayed.get_node(id);
            const eltNode = jsMind.my_get_DOM_element_from_node(node);
            eltNode.classList.add("jsmind-hit");
        });
        const btnCurr = await modMdc.mkMDCbutton("wait");
        btnCurr.addEventListener("click", evt => {
            const num = getBtnCurrNum();
            selectHit(num);
        })
        setHitTo(1);
        function selectHit(num) {
            setTimeout(() => jmDisplayed.select_node(arrIdHits[num - 1]), 200);
        }
        function setHitTo(num) {
            setBtnCurrNum(num);
            selectHit(num);
        }

        function getBtnCurrNum() {
            const txt = btnCurr.textContent;
            const num = parseInt(txt);
            return num;
        }
        function setBtnCurrNum(num) {
            const eltTxt = btnCurr.querySelector(".mdc-button__label");
            eltTxt.textContent = `${num} (${arrIdHits.length})`;
        }
        const btnPrev = await modMdc.mkMDCbutton("<");
        btnPrev.addEventListener("click", evt => {
            let nextNum = getBtnCurrNum() - 1;
            if (nextNum < 1) nextNum = arrIdHits.length;
            setHitTo(nextNum);
        });
        const btnNext = await modMdc.mkMDCbutton(">");
        btnNext.addEventListener("click", evt => {
            let nextNum = getBtnCurrNum() + 1;
            if (nextNum > arrIdHits.length) nextNum = 1;
            setHitTo(nextNum);
        });
        const eltInfo = mkElt("span", undefined, [
            "Hits: ", btnCurr,
        ])
        const divHits = document.getElementById(idDivHits) ||
            mkElt("div", { id: idDivHits, class: "mdc-card" });
        const divHitsInner = mkElt("div", undefined, [
            eltInfo, btnPrev, btnNext
        ]);
        divHits.textContent = "";
        divHits.appendChild(divHitsInner);
        document.body.appendChild(divHits);
    }

    const nodehits = new URLSearchParams(location.search).get("nodehits");
    // console.log({ nodehits });
    if (nodehits) {
        setNodeHits();
        async function setNodeHits() {
            const arrIdHits = nodehits.split(",");
            setNodeHitsFromArray(arrIdHits, "provider");
        }
    }
    jmDisplayed.add_event_listener((type, data) => {
        if (type !== 3) return;
        addDebugLog(`jmDisplayed, event_listener, ${type}`)
        const evt_type = data.evt;
        const datadata = data.data;
        const node_id = data.node;
        // console.log({ evt_type, type, datadata, data });
        finnishAndMirrorOperationOnNode(evt_type, node_id, datadata);
        DBrequestSaveThisMindmap(jmDisplayed); // FIX-ME: delay
        // updateTheMirror();
    });
    async function finnishAndMirrorOperationOnNode(operation_type, operation_node_id, datadata) {
        console.log("finAndMirr", { operation_type, operation_node_id, jm_operation: jmDisplayed, datadata });
        // if (!jmMirrored) return;
        switch (operation_type) {
            case "add_node":
                const id_added = operation_node_id;
                const added_node = jmDisplayed.get_node(id_added);
                console.log({ operation_type, id_added, added_node });
                const id_parent = datadata[0];
                if (id_added != datadata[1]) throw Error(`id_added (${id_added}) != datadata[1] (${datadata[1]})`);
                const topic_added = datadata[2];
                jmMirrored?.add_node(id_parent, id_added, topic_added);
                break;
            case "update_node":
                {
                    const id_updated = operation_node_id;
                    const updated_node = jmDisplayed.get_node(id_updated);
                    console.log({ operation_type, id_updated, updated_node });
                    // const [id, topic] = datadata
                    const eltJmnode = jsMind.my_get_DOM_element_from_node(updated_node);
                    // debugger;
                    const isPlainNode = eltJmnode.childElementCount == 0;
                    theCustomRenderer.addJmnodeBgAndText(eltJmnode);
                    // const isCustomNode = topic.search(" data-jsmind-custom=") > 0;
                    if (!isPlainNode) {
                        theCustomRenderer.updateJmnodeFromCustom(eltJmnode);
                    } else {
                        theCustomRenderer.addEltNodeLink(eltJmnode);
                    }
                }
                break;
            case "move_node":
                {
                    console.warn("move_node event");
                    function walkMoved(id_moved) {
                        // FIX-ME: class left, etc
                        console.log({ id_moved });
                        const moved_node = jmDisplayed.get_node(id_moved);
                        moved_node.children.forEach(child => {
                            walkMoved(child.id);
                        });
                    }
                    const id_moved = operation_node_id;
                    const moved_node = jmDisplayed.get_node(id_moved);
                    const eltJmnode = jsMind.my_get_DOM_element_from_node(moved_node);
                    const isPlainNode = eltJmnode.childElementCount == 0;
                    theCustomRenderer.addJmnodeBgAndText(eltJmnode);
                    if (!isPlainNode) {
                        theCustomRenderer.updateJmnodeFromCustom(eltJmnode);
                    } else {
                        theCustomRenderer.addEltNodeLink(eltJmnode);
                    }
                    // const before_id = datadata[1];
                    // const parent_id = datadata[2];
                    // jmMirrored?.move_node(id_moved, before_id, parent_id);
                    break;
                }
            case "remove_node":
                // const id_removed = operation_node_id;
                const id_removed = datadata[0];
                console.log({ operation_type, id_removed, operation_node_id });
                jmMirrored?.remove_node(id_removed);
                break;
            default:
                console.warn(`unknown operation_type: ${operation_type}`);
        }
    }



    /*
    setTimeout(() => {
        // [...document.getElementsByTagName("jmnode")].forEach(eltJmnode => { });
        const jmData = jmDisplayed.get_data("node_array");
        jmData.data.forEach(entry => {
            const node = jmDisplayed.get_node(entry.id);
            const eltJmnode = jsMind.my_get_DOM_element_from_node(node);
            // applyNodeShapeEtc(node, eltJmnode);
        });
    }, 500);
    */

    jsMindContainer.appendChild(divDebugLog);

    async function getDivContextMenu() {
        if (!divContextMenu) {
            const modMdc = await import("/src/js/mod/util-mdc.js");
            divContextMenu = modMdc.mkMDCmenuDiv();
            divContextMenu.classList.add("is-menu-div");
            document.body.appendChild(divContextMenu);
            divContextMenu.id = idContextMenu;
        }
        return divContextMenu;
    }
    let highestNodeId = 0;
    jmDisplayed.enable_edit();
    const jmData = jmDisplayed.get_data("node_array");
    jmData.data.forEach(entry => {
        // if (entry.id === "root") return;
        if (!Number.isInteger(entry.id)) return;
        highestNodeId = Math.max(+entry.id, highestNodeId);
    });
    function getNextNodeId() { return ++highestNodeId; }

    // FIX-ME: The node does not get DOM focus???
    function focusSelectedNode() {
        // FIX-ME: What is wrong with jmDisplayed here???
        try {
            const selectedNode = jmDisplayed?.get_selected_node();
            if (selectedNode) {
                const selectedElt = getDOMeltFromNode(selectedNode);
                selectedElt.focus();
            }
        } catch (err) {
            console.log("*** focusSelectedNode", { err });
        }
    }
    function hideContextMenu() {
        if (!divContextMenu) return;
        divContextMenu.style.display = "none";
        setTimeout(focusSelectedNode, 2000);
    }
    function hideContextMenuOnEvent(evt) {
        if (!divContextMenu) return;
        if (!targetIsJmnode(evt) && !divContextMenu.contains(evt.target)) hideContextMenu();
    }

    // These bubbles up:
    jsMindContainer.addEventListener("mousedown", evt => hideContextMenuOnEvent(evt));
    jsMindContainer.addEventListener("keydown", evt => hideContextMenuOnEvent(evt));
    jsMindContainer.addEventListener("touchstart", evt => hideContextMenuOnEvent(evt));
    jsMindContainer.addEventListener("click", evt => hideContextMenuOnEvent(evt));
    jsMindContainer.addEventListener("click", evt => {
        // evt.stopPropagation();
        // evt.preventDefault();
        const target = evt.target;
        const eltJmnode = target.closest("jmnode");
        if (!eltJmnode) return;
        const node_id = getNodeIdFromDOMelt(eltJmnode);
        jmDisplayed.select_node(node_id);
        const bcr = eltJmnode.getBoundingClientRect();
        // const bcrLeft = bcr.left;
        // const bcrRight = bcr.right;
        const bcrWidth = bcr.width;
        // const evtSX = evt.screenX;
        // const evtCX = evt.clientX;
        const evtOX = evt.offsetX;
        // const isOutsideS = (evtSX < bcrLeft) || (evtSX > bcrRight);
        // const isOutsideC = (evtCX < bcrLeft) || (evtCX > bcrRight);
        const isOutsideO = (evtOX < 0) || (evtOX > bcrWidth);
        // console.log({ isOutsideS, isOutsideO, isOutsideC, evtSX, evtOX, evtCX, bcrLeft, bcrRight, bcrWidth, target, eltJmnode });
        if (isOutsideO) {
            const node_id = jsMind.my_get_nodeID_from_DOM_element(eltJmnode);
            jmDisplayed.toggle_node(node_id);
            eltJmnode.classList.toggle("is-expanded");
            DBrequestSaveThisMindmap(theCustomRenderer.THEjmDisplayed);
        }
        if (target.dataset.jsmindCustom) {
            setTimeout(async () => {
                // const eltCustom = eltJmnode.querySelector(".jsmind-custom");
                // const eltCustom = eltJmnode.querySelector(".jsmind-custom-image");
                const eltCustom = target;
                const strCustom = eltCustom.dataset.jsmindCustom;
                const objCustom = JSON.parse(strCustom);
                const prov = objCustom.provider;
                const modMdc = await import("/src/js/mod/util-mdc.js");
                const go = await modMdc.mkMDCdialogConfirm(`Show entry in ${prov}?`);
                console.log({ go });
                if (!go) return;
                // showKeyInFc4i(objCustom.key);
                debugger;
                const render = await getOurCustomRenderer();
                // if (!render instanceof CustomRenderer4jsMind) throw Error(`Not a custom renderer`);
                render.showCustomRec(objCustom.key, objCustom.provider);
            }, 100);
        };
    });

    function displayContextMenuOnContainer(evt) {
        evt.preventDefault();
        evt.stopPropagation();

        // FIX-ME: move
        // document.querySelectorAll("jmnode").forEach(n => n.draggable = true);

        displayContextMenu(jsMindContainer, evt.clientX, evt.clientY);
    }

    let msDelayContextMenu = 0;
    jsMindContainer.addEventListener("NOtouchmove", evt => {
        // evt.preventDefault();
        evt.stopPropagation();
        stopContextMenu();
    });
    jsMindContainer.addEventListener("NOtouchstart", evt => {
        const jmnode = targetIsJmnode(evt);
        if (jmnode) {
            evt.stopPropagation();
            msDelayContextMenu = 1000;
            jmDisplayed.select_node(jmnode);
        }
    });
    jsMindContainer.addEventListener("NOcontextmenu", evt => {
        if (targetIsJmnode(evt)) {
            evt.preventDefault();
            const x = `${evt.clientX}`;
            const y = `${evt.clientY}`;
            restartDisplayContextMenu(evt.target, x, y);
        }
    });

    function targetIsJmnode(evt) {
        const targ = evt.target;
        const jmnode = targ.closest("jmnode");
        return jmnode;
    }
    function stopContextMenu() { restartDisplayContextMenu(); }
    const restartDisplayContextMenu = (() => {
        let tmr;
        return (forElt, x, y) => {
            clearTimeout(tmr);
            if (forElt === undefined) return;
            const doDisplay = () => displayContextMenu(forElt, x, y);
            tmr = setTimeout(doDisplay, msDelayContextMenu);
        }
    })();


    async function displayContextMenu(forElt, left, top) {
        const divMenu = await getDivContextMenu();
        await mkContextMenu();
        divMenu.forElt = forElt;
        // Set values in integer, read them as ..px
        if (left) divMenu.style.left = left;
        if (top) divMenu.style.top = top;
        divMenu.style.opacity = 0;
        divMenu.style.display = "block";
        const compStyle = getComputedStyle(divMenu);

        const right = parseInt(compStyle.right);
        // console.log({ right });
        // FIX-ME: This is fragile. Chrome tries to wrap the menu.
        if (right <= 0) divMenu.style.left = parseInt(divMenu.style.left) + right - 30;

        const bottom = parseInt(compStyle.bottom);
        // console.log({ bottom });
        if (bottom < 0) divMenu.style.top = parseInt(divMenu.style.top) + bottom;

        divMenu.style.opacity = 1;
    }


    async function mkContextMenu() {
        const modMdc = await import("/src/js/mod/util-mdc.js");
        let toJmDisplayed;
        try {
            toJmDisplayed = typeof jmDisplayed;
        } catch (err) {
            console.log({ err });
        }
        console.log({ toJmDisplayed });
        const selected_node = toJmDisplayed && jmDisplayed?.get_selected_node();

        function getSelected_node() {
            if (!selected_node) {
                modMdc.mkMDCdialogAlert("No selected node");
                return false;
            }
            return selected_node;
        }
        function markIfNoSelected(li) {
            if (selected_node) return;
            li.classList.add("jsmind-menu-no-selected-node");
        }
        function markIfNoMother(li) {
            if (selected_node?.parent) return;
            li.classList.add("jsmind-menu-no-selected-node");
        }

        function mkMenuItem(lbl, fun) {
            const li = modMdc.mkMDCmenuItem(lbl);
            li.addEventListener("click", evt => {
                evt.preventDefault();
                evt.stopPropagation();
                fun();
                hideContextMenu();
            });
            return li;
        }

        async function pasteCustom2node() {
            // const liDelete = mkMenuItem("Delete node", deleteNode);
            const selected_node = getSelected_node();
            // if (!selected_node) Error("No selected node");
            if (!selected_node) return;
            const eltJmnode = jsMind.my_get_DOM_element_from_node(selected_node);
            const objCustom = await pasteCustomClipDialog();
            console.log({ objCustom });
            if (!objCustom) return;
            convertPlainJmnode2ProviderLink(eltJmnode, jmDisplayed, objCustom);
        }

        const liTestConvertToCustom = mkMenuItem("Link node to custom content", pasteCustom2node);
        markIfNoSelected(liTestConvertToCustom);

        const liTestPointHandle = mkMenuItem("test pointHandle", setupPointHandle);
        liTestPointHandle.classList.add("test-item");

        // https://html2canvas.hertzen.com/getting-started.html
        // const liTestMirror = mkMenuItem("test mirror", testStartMirror);
        const liDragAccessibility = mkMenuItem("Drag accessiblity", dialogDragAccessibility);

        const liMindmaps = funMindmapDialog ? mkMenuItem("Mindmaps", funMindmapDialog) : undefined;

        // const idScreenMirrorPoint = "jsmindtest-screen-mirror-point";
        // const idScreenMirrorColor = "jsmindtest-screen-mirror-color";


        async function dialogDragAccessibility() {
            const oldWay = theDragTouchAccWay;
            const newWay = await dialogMirrorWay();
            if (newWay == oldWay || !newWay) return;
            // teardownPointHandle();
            // teardownMirror();
            switchDragTouchAccWay(newWay);
        }

        // https://www.npmjs.com/package/pinch-zoom-js
        const liTestPinchZoom = mkMenuItem("test pinch-zoom a",
            async () => {
                const src = "https://unpkg.com/pinch-zoom-js@2.3.5/dist/pinch-zoom.min.js";
                // const eltScript = mkElt("script", { src });
                // document.body.appendChild(eltScript);
                const modPZ = await import(src);
                const addZoom = () => {
                    console.log("***** addZoom");
                    const jmnodes = document.querySelector("jmnodes");
                    // const options = { }
                    // const pz = new PinchZoom(jmnodes, options);
                    const pz = new modPZ.default(jmnodes);
                }
                // setTimeout(addZoom, 1000);
                addZoom();
            });
        liTestPinchZoom.classList.add("test-item");

        const liTestDragBetween = mkMenuItem("test move between",
            async () => {
                // const m = await import("/ext/jsmind/new-jsmind.draggable-nodes.js");
                const m = await getDraggableNodes();
                m.startTrackingPointer()
            });
        liTestDragBetween.classList.add("test-item");

        const liTestTabindex = mkMenuItem("Test tabindex=1",
            () => {
                document.querySelectorAll("jmnode").forEach(jmn => {
                    jmn.setAttribute("tabindex", "1");
                })
            }
        );
        liTestTabindex.classList.add("test-item");

        const liTestSvgDrawLine = mkMenuItem("Test svg draw line",
            async () => {
                // const modJsmindDraggable = await import("/ext/jsmind/new-jsmind.draggable-nodes.js");
                const modJsmindDraggable = await getDraggableNodes();
                modJsmindDraggable.testSvgLine();
            }
        );
        liTestSvgDrawLine.classList.add("test-item");

        const liTestTouch = mkMenuItem("Test for touch (and Pixel 7 pointer coarse)",
            () => {
                const hasTouch = hasTouchEvents();
                addDebugLog(`Has touch: ${hasTouch}`);
                const isCoarse = window.matchMedia('(any-pointer:coarse)').matches;
                addDebugLog(`Pointer is coarse: ${isCoarse}`);
            });
        liTestTouch.classList.add("test-item");
        const liTestMouse = mkMenuItem("Test for mouse",
            // https://stackoverflow.com/questions/21054126/how-to-detect-if-a-device-has-mouse-support/50687322#50687322
            // https://bugs.chromium.org/p/chromium/issues/detail?id=1088262
            () => {
                const hasCursor = window.matchMedia('(pointer:fine)').matches;
                addDebugLog(
                    `window.matchMedia('(pointer:fine)').matches; ${hasCursor}`
                );
            });
        liTestMouse.classList.add("test-item");

        const liAddChild = mkMenuItem("Add child node", () => addNode("child"));
        markIfNoSelected(liAddChild);

        const liAddSibling = mkMenuItem("Add sibling node", () => addNode("brother"));
        markIfNoSelected(liAddSibling);
        markIfNoMother(liAddSibling);

        async function addNode(rel) {
            const selected_node = getSelected_node();
            if (selected_node) {
                // const jm = jsMind.current;
                const jm = jmDisplayed;
                const new_node_id = getNextNodeId();
                let fromClipBoard;
                try {
                    fromClipBoard = await navigator.clipboard.readText();
                    if (fromClipBoard?.length > 0) {
                        fromClipBoard = fromClipBoard.slice(0, 100);
                    }
                } catch (err) {
                    console.warn(err);
                }
                const new_node_topic = fromClipBoard || `Node ${new_node_id}`;
                let new_node;
                switch (rel) {
                    case "child":
                        new_node = jm.add_node(selected_node, new_node_id, new_node_topic);
                        console.log(`child .add_node(${selected_node.id}, ${new_node_id}, ${new_node_topic})`);
                        break;
                    case "brother":
                        const mother_node = selected_node.parent;
                        if (!mother_node) {
                            modMdc.mkMDCdialogAlert("This node can't have siblings");
                        } else {
                            new_node = jm.add_node(mother_node, new_node_id, new_node_topic);
                            console.log(`brother .add_node(${mother_node.id}, ${new_node_id}, ${new_node_topic})`);
                        }
                        break;
                }
                jm.select_node(new_node);
                // setTimeout(() => { newNode._data.view.element.draggable = true; }, 1000);
                setTimeout(() => {
                    // jsMind.my_get_DOM_element_from_node(new_node).draggable = true;
                    const eltJmnode = jsMind.my_get_DOM_element_from_node(new_node);
                    fixJmnodeProblem(eltJmnode);
                }, 1000);
            }
        }

        const liDelete = mkMenuItem("Delete node", deleteNode);
        markIfNoSelected(liDelete);
        markIfNoMother(liDelete);

        function deleteNode() {
            const selected_node = getSelected_node();
            if (selected_node) {
                const mother = selected_node.parent;
                if (!mother) {
                    modMdc.mkMDCdialogAlert("This node can't be deleted");
                } else {
                    const jm = jmDisplayed;
                    jm.remove_node(selected_node);
                    jm.select_node(mother);
                }
            }
            hideContextMenu();
        }

        const arrEntries = [
            liAddChild,
            liAddSibling,
            liDelete,
            liTestConvertToCustom,
            liDragAccessibility,
            liMindmaps,

            liTestTouch,
            liTestMouse,
            liTestSvgDrawLine,
            liTestTabindex,
            liTestDragBetween,
            liTestPinchZoom,
            liTestPointHandle,
        ];
        const ulMenu = modMdc.mkMDCmenuUl(arrEntries);
        const divMenu = await getDivContextMenu();
        divMenu.textContent = "";
        divMenu.appendChild(ulMenu);
        return divMenu;
    }

    function displayMindMap(mind, options) {
        const jm = new jsMind(options);
        jm.show(mind);
        return jm;
    }

    addScrollIntoViewOnSelect();
    function addScrollIntoViewOnSelect() {
        jmDisplayed.add_event_listener(function (t, d) {
            // console.log({ t, d });
            if (t !== jsMind.event_type.select) return;
            const id = d.node;
            const n = jmDisplayed.get_node(id);
            // const elt = n._data.view.element;
            const elt = jsMind.my_get_DOM_element_from_node(n);

            // FIX-ME: test .scrollIntoView - problem with vertical
            // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
            const scrollOpt = {
                behavior: "smooth",
                block: "nearest"
            };
            // console.log({scrollOpt})
            elt.scrollIntoView(scrollOpt);
            return;

            const cr = elt.getBoundingClientRect(elt);
            const crLeft = cr.left;
            const crRight = cr.right;
            // console.log({ t, d, id, elt, cr });
            const eltScroll = jsMindContainer.firstElementChild;
            if (crLeft < 0) {
                eltScroll.scrollBy(crLeft, 0);
            } else {
                const overRight = crRight - jsMindContainer.clientWidth;
                if (overRight > 0) {
                    eltScroll.scrollBy(overRight, 0);
                }
            }
            // FIX-ME: vertical
        });
    }
    function jsmindSearchNodes(strSearch) {
        // console.log("jsmindSearch", { strSearch });
        /*
        const nodeArray = jm.get_data("node_array");
        const nodes = nodeArray.data;
        console.log({ nodes });
        const mathingNodes = nodes.filter(node => {
            const topic = node.topic;
            console.log({ topic });
            return topic.indexOf(strSearch) >= 0;
        });
        */
        const nodeEltArray = [...jsMindContainer.querySelectorAll("jmnode[nodeid]")];
        // console.log({ nodeEltArray });
        if (strSearch.length === 0) return;
        const searchLower = strSearch.toLocaleLowerCase();
        // FIX-ME: words
        const matchingNodes = nodeEltArray.filter(node => {
            const topic = node.textContent;
            // console.log({ node, topic });
            const topicLower = topic.toLocaleLowerCase();
            return topicLower.indexOf(searchLower) >= 0;
        });
        nodeEltArray.forEach(n => n.classList.remove("jsmind-hit"));
        // matchingNodes.forEach(n => n.classList.add("jsmind-hit"));
        const arrIdHits = matchingNodes.map(n => jsMind.my_get_nodeID_from_DOM_element(n));
        setNodeHitsFromArray(arrIdHits);
        console.log({ matchingNodes });
    }


    function onMousemoveJmnode(evt) {
        if (evt.target.nodeName !== "JMNODE") return;
        console.log("ddrag", { evt });
    }

    jmDisplayed.select_node(jmDisplayed.get_root());

    function rectDist(br1, br2) {
        const brLeft = br1.left < br2.left ? br1 : br2;
        const brRight = br1.right > br2.right ? br1 : br2;
        const overLapHor = brLeft.right > brRight.left;
        const brTop = br1.top < br2.top ? br1 : br2;
        const brBottom = br1.bottom > br2.bottom ? br1 : br2;
        const overLapVer = brTop.bottom > brBottom.top;
        if (overLapHor && overLapVer) return 0;
        if (overLapHor) { return brTop.bottom - brBottom.top; }
        if (overLapVer) { return brRight.left - brLeft.right; }
        const w = brLeft.right - brRight.left;
        const h = brTop.bottom - brBottom.top;
        return Math.sqrt(h * h + w * w);
    }

    if (!hasTouchEvents()) addGrabAndScroll2jsmind();
    function addGrabAndScroll2jsmind() {
        // const root = jmDisplayed.get_root();
        // const eltRoot = getDOMeltFromNode(root);
        // const jmnodes = eltRoot.closest("jmnodes");
        const jmnodes = getJmnodesFromJm(jmDisplayed);
        const jsmindInner = jmnodes.closest(".jsmind-inner");
        // const jsmindInner = jsMindContainer.firstElementChild;
        // const jsmindInner = jsMindContainer.querySelector(".jsmind-inner");
        if (!jsmindInner.classList.contains("jsmind-inner")) {
            throw Error("Not jsmind-inner");
        }
        addGrabAndScroll(jsmindInner, jmnodes);
    }

    function addGrabAndScroll(ele, mousedownTargets) {
        // https://htmldom.dev/drag-to-scroll/
        /* .container { cursor: grab; overflow: auto; } */
        let posScrollData;

        const isMousedownTarget = (targ) => {
            if (Array.isArray(mousedownTargets)) {
                return mousedownTargets.includes(targ);
            } else {
                return targ === mousedownTargets;
            }
            return false;
        }
        const mouseDownHandler = (evt) => {
            // console.log("ele mousedown");
            if (!isMousedownTarget(evt.target)) {
                // console.log("not mousedown target");
                return;
            }
            evt.preventDefault();
            evt.stopPropagation();
            // mouseDownHandler2();
            // Change the cursor and prevent user from selecting the text
            posScrollData = {
                // The current scroll
                left: ele.scrollLeft,
                top: ele.scrollTop,
                // Get the current mouse position
                x: evt.clientX,
                y: evt.clientY,
            };
            ele.style.cursor = "grabbing";
            // console.log("mouseDownHandler", ele.style.cursor);

            ele.addEventListener('mousemove', mouseMoveHandler);
            ele.addEventListener('mouseup', mouseUpHandler);
            ele.addEventListener("mouseleave", mouseUpHandler);
        };
        const mouseMoveHandler = (evt) => {
            // How far the mouse has been moved
            const dx = evt.clientX - posScrollData.x;
            const dy = evt.clientY - posScrollData.y;
            // console.log("mouseMoveHandler dx, dy, .scrollLeft", dx, dy, ele.scrollLeft, posScrollData);

            // Scroll the element
            ele.scrollTop = posScrollData.top - dy;
            ele.scrollLeft = posScrollData.left - dx;
        };
        const mouseUpHandler = function () {
            // console.log("ele mouseup");
            ele.removeEventListener('mousemove', mouseMoveHandler);
            ele.removeEventListener('mouseup', mouseUpHandler);

            ele.style.cursor = 'grab';
            // console.log("mouseUpHandler", ele.style.cursor);
            ele.style.removeProperty('user-select');
        };

        const showDraggable = () => {
            // Change the cursor and prevent user from selecting the text
            ele.style.cursor = 'grab';
            // console.log("showDraggable", ele.style.cursor);
            ele.style.userSelect = 'none';
        };
        ele.addEventListener("mousedown", mouseDownHandler);
        // ele.addEventListener("dragstart", mouseUpHandler);
        showDraggable();

    }

    // https://javascript.info/bezier-curve
    /*
        For 4 control points:
        P = (1−t)3P1 + 3(1−t)2tP2 +3(1−t)t2P3 + t3P4
    */
    function makePoint(x, y) { return { x, y } }
    function isPoint(xy) {
        return !isNaN(xy.x) && !isNaN(xy.y);
    }
    function bezier(t, p1, p2, p3, p4) {
        check01(t);
        function check01(what, v) {
            if (v < 0) throw Error(`${what} < 0 (${v})`);
            if (v > 1) throw Error(`${what} > 1 (${v})`);
        }

    }

    async function convertPlainJmnode2ProviderLink(eltJmnode, jmOwner, objCustomCopied) {
        // console.log("convertDOMnodeTo...", eltJmnode, objCustomCopied);
        if (eltJmnode.tagName != "JMNODE") throw Error("Not <jmnode>");
        const lastElementChild = eltJmnode.lastElementChild;
        if (lastElementChild) {
            if (lastElementChild.classList.contains("jsmind-custom")) {
                alert("Already provider link, not handled yet");
                return;
            }
        }
        if (eltJmnode.childElementCount == 3) {
            debugger;
        }

        const provider = objCustomCopied.provider;
        if (!theCustomRenderer.getProviderNames().includes(provider)) throw Error(`Provider ${provider} is unknown`);
        const providerKey = objCustomCopied.key;

        const strTopic = theCustomRenderer.customData2jsmindTopic(providerKey, provider);

        console.log("eltJmnode", eltJmnode, strTopic);
        if (jmOwner) {
            const node_id = jsMind.my_get_nodeID_from_DOM_element(eltJmnode);
            jmOwner.update_node(node_id, strTopic);
            jmOwner.set_node_background_image(node_id, undefined, 150, 100);
            ///// Do the rest in callback at update_node!
            // console.log("eltJmnode befor fix", eltJmnode);
            // fixRenderImg(eltRendererImg);
            // const modCustom = await getJsmindCust();
            // modCustom.addJmnodeBgAndText(eltJmnode);
            // theCustomRenderer.updateJmnodeFromCustom(eltJmnode, jmOwner);
        } else {
            const s = eltJmnode.style;
            s.height = s.height || "140px";
            s.width = s.width || "140px";
            const eltCustom = theCustomRenderer.jsmindTopic2customElt(strTopic);
            eltJmnode.appendChild(eltCustom);
            theCustomRenderer.updateJmnodeFromCustom(eltJmnode, jmOwner);
        }
    }
}

function hasTouchEvents() {
    let hasTouch = false;
    try {
        document.createEvent("TouchEvent");
        hasTouch = true;
    } catch (e) { }
    // console.warn({ hasTouch })
    return hasTouch;

}

///////////////////////////////////////////////
// Utility functions.

// FIX-ME: Should be in jsmind core
function getDOMeltFromNode(node) { return jsMind.my_get_DOM_element_from_node(node); }
function getNodeIdFromDOMelt(elt) { return jsMind.my_get_nodeID_from_DOM_element(elt); }
// basicInit4jsmind();



function getJmnodesFromJm(jmDisplayed) {
    const root_node = jmDisplayed.get_root();
    const eltRoot = jsMind.my_get_DOM_element_from_node(root_node);
    const eltJmnodes = eltRoot.closest("jmnodes");
    return eltJmnodes;
}


async function fixJmnodeProblem(eltJmnode) {
    // console.log("fixJmnodeProblem", eltJmnode);
    const customRenderer = await getOurCustomRenderer();
    customRenderer.fixLeftRightChildren(eltJmnode);
    /*
    if (eltJmnode.getAttribute("nodeid") !== "root") {
        console.log("old eltJmnode.draggable", eltJmnode.draggable);
        eltJmnode.draggable = true;

        const node_id = jsMind.my_get_nodeID_from_DOM_element(eltJmnode);
        // const node = ourCustomRenderer.THEjmDisplayed.get_node(nodeId)
        const node = customRenderer.THEjmDisplayed.get_node(node_id)
        const isLeft = node.direction == -1;
        if (!isLeft && node.direction != 1) throw Error(`isLeft but node.direction==${node.direction}`);
        const hasChildren = node.children.length > 0;
        eltJmnode.classList.remove("is-left");
        eltJmnode.classList.remove("is-right");
        eltJmnode.classList.remove("has-children");
        if (hasChildren) {
            eltJmnode.classList.add("has-children");
            if (isLeft) {
                eltJmnode.classList.add("is-left");
            } else {
                eltJmnode.classList.add("is-right");
            }
            if (node.expanded) eltJmnode.classList.add("is-expanded");
        }
    }
    */
    const isPlainNode = eltJmnode.childElementCount == 0;
    const isNewCustomFormat = eltJmnode.childElementCount == 1;
    const eltRendererImg = eltJmnode.lastElementChild;
    const eltTopic = eltJmnode.firstElementChild;

    const modCustom = await getJsmindCust();
    // const { eltTxt, eltBg } = modCustom.addJmnodeBgAndText(eltJmnode);
    const { eltTxt, eltBg } = theCustomRenderer.addJmnodeBgAndText(eltJmnode);

    if (isPlainNode) {
        const txt = eltJmnode.textContent;
        const f1 = eltJmnode.firstChild;
        if (f1.nodeName != "#text") throw Error(`First child not #text: ${f1.nodeName}`);
        f1.remove();
        eltTxt.textContent = txt;
    } else {
        // Custom node
        if (!isNewCustomFormat) {
            console.log("old custom format 3");
            eltTopic.remove();
            const customData = eltTopic.dataset.jsmindCustom;
            // delete htmlTopic.dataset.jsmindCustom;
            eltRendererImg.dataset.jsmindCustom = customData;
        }
    }
    // FIX-ME: This should only be done once
    // eltJmnode.addEventListener("dblclick", ourCustomRenderer.jmnodeDblclick);
    eltJmnode.addEventListener("dblclick", customRenderer.jmnodeDblclick);
}
function isVeryOldCustomFormat(eltJmnode) {
    const child1 = eltJmnode.firstElementChild;
    if (!child1) return false;
    if (child1.classList.contains("fc4i")) {
        console.log("Old custom format", { eltJmnode });
        // https://www.encodedna.com/javascript/override-important-style-property-in-javascript.htm
        // eltJmnode.style.border = "10px double red !important";
        setTimeout(() => {
            eltJmnode.style.setProperty("border", "10px double red", "important");
            eltJmnode.style.setProperty("background-color", "black", "important");
            eltJmnode.style.setProperty("color", "white", "important");
            clearShapes(eltJmnode);
            const eltDelete = mkElt("div", undefined, "Delete!");
            eltDelete.style.position = "absolute";
            eltDelete.style.bottom = 0;
            eltDelete.style.right = 0;
            eltDelete.style.setProperty("background-color", "red", "important");
            eltDelete.style.zIndex = 1000;
            eltJmnode.appendChild(eltDelete);
        }, 1000);
        return true;
    }
}
function fixOldCustomAndUpdate(eltJmnode) {
    const childLast = eltJmnode.lastElementChild;
    const strCustom = childLast.dataset.jsmindCustom
    const isOldCustom = childLast.classList.contains("jsmind-renderer-img");
    if (strCustom) {
        // if (!isOldCustom) { fixRenderImg(childLast); }
        theCustomRenderer.updateJmnodeFromCustom(eltJmnode);
    } else {
        theCustomRenderer.addEltNodeLink(eltJmnode);
    }
}

function fixProblemsAndUpdateCustomAndShapes(jmDisplayed) {
    setTimeout(() => {
        console.log("fixJmnodesProblem (in setTimeout fun)");
        addDebugLog("fixJmnodesProblem (in setTimeout fun)");
        const eltJmnodes = getJmnodesFromJm(jmDisplayed);
        // [...document.getElementsByTagName("jmnode")].forEach(eltJmnode => 
        [...eltJmnodes.getElementsByTagName("jmnode")].forEach(async eltJmnode => {
            if (isVeryOldCustomFormat(eltJmnode)) return;
            await fixJmnodeProblem(eltJmnode); // FIX-ME: Remove when this is fixed in jsmind
            fixOldCustomAndUpdate(eltJmnode);
            const node_id = jsMind.my_get_nodeID_from_DOM_element(eltJmnode);
            if (node_id == 21) console.warn("node_id 21");
            const node = jmDisplayed.get_node(node_id);
            applyNodeShapeEtc(node, eltJmnode);
        });
    }, 500);
}

// https://css-tricks.com/converting-color-spaces-in-javascript/
function RGBToHex(rgb) {
    return standardizeColorTo6Hex(rgb);
    // Choose correct separator
    let sep = rgb.indexOf(",") > -1 ? "," : " ";
    // Turn "rgb(r,g,b)" into [r,g,b]
    rgb = rgb.substr(4).split(")")[0].split(sep);

    let r = (+rgb[0]).toString(16),
        g = (+rgb[1]).toString(16),
        b = (+rgb[2]).toString(16);

    if (r.length == 1)
        r = "0" + r;
    if (g.length == 1)
        g = "0" + g;
    if (b.length == 1)
        b = "0" + b;

    return "#" + r + g + b;
}

// https://stackoverflow.com/questions/1573053/javascript-function-to-convert-color-names-to-hex-codes/47355187#47355187
function standardizeColorTo6Hex(strColor) {
    var ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = strColor;
    return ctx.fillStyle;
}
function to6HexColor(color) {
    return standardizeColorTo6Hex(color);
    if (color.substring(0, 1) === "#") {
        if (color.length === 7) {
            hex = color.substring(1);
            // console.log("from 7", hex);
        } else if (color.length === 4) {
            const h1 = color.substr(1, 1);
            const h2 = color.substr(2, 1);
            const h3 = color.substr(3, 1);
            hex = h1 + h1 + h2 + h2 + h3 + h3;
            // console.log("from 4", hex);
        } else {
            throw Error(`Expected 3 or 6 hex digits: ${color}`);
        }
        return "#" + hex;
    } else if (color.substring(0, 4) === "rgb(") {
        const hex = RGBToHex(color);
        // console.log("from rgb", hex);
        return hex;
    } else {
        throw Error(`Expected color beginning with # or rgb(): ${color}`);
    }
}







///////////////////////////////////////////////
// Custom rendering



function getMatchesInCssRules(re) {
    const selectors = new Set();
    // const re = new RegExp('\\.' + pattern.replace(/([^\s])\*/, '$1[^ ]+'), 'g')
    for (let i = 0, len = document.styleSheets.length; i < len; i++) {
        const sheet = document.styleSheets[i];
        // console.log("sheet", sheet.href);
        let cssRules;
        try {
            cssRules = sheet.cssRules;
        } catch (err) {
            // console.log(err.name, sheet.href, err.message);
            // console.log(err.name, sheet.href);
        }
        if (!cssRules) continue;
        for (let cssRule of cssRules) {
            const selectorText = cssRule.selectorText;
            if (!selectorText) {
                // console.log("*** cssRule", cssRule);
            } else {
                // console.log("selectorText", selectorText);
                const m = cssRule.selectorText.match(re);
                if (m) {
                    // selectors.add(cssRule.selectorText);
                    selectors.add(m[1]);
                }
            }
        }
    }
    console.log({ selectors, }, re);
    return [...selectors];
}

// chatGPT
function getRectangleInEllipse(w, h) {
    const a = w / 2;
    const b = h / 2;
    const r_ellipse = a / b;

    const r = r_ellipse;

    const x = (r * a * b) / Math.sqrt((r * r * a * a) + (b * b));
    const y = x / r;

    return {
        width: x,
        height: y
    };
}


//////////////////////
// Accesibility color contrast

// https://codepen.io/davidhalford/pen/AbKBNr
function getCorrectTextColor(color) {
    const hex = to6HexColor(color).substring(1);

    /*
    From this W3C document: http://www.webmasterworld.com/r.cgi?f=88&d=9769&url=http://www.w3.org/TR/AERT#color-contrast
    
    Color brightness is determined by the following formula: 
    ((Red value X 299) + (Green value X 587) + (Blue value X 114)) / 1000

I know this could be more compact, but I think this is easier to read/explain.
    
    */

    const threshold = 130; /* about half of 256. Lower threshold equals more dark text on dark background  */

    const hRed = hexToR(hex);
    const hGreen = hexToG(hex);
    const hBlue = hexToB(hex);


    function hexToR(h) { return parseInt((cutHex(h)).substring(0, 2), 16) }
    function hexToG(h) { return parseInt((cutHex(h)).substring(2, 4), 16) }
    function hexToB(h) { return parseInt((cutHex(h)).substring(4, 6), 16) }
    function cutHex(h) { return (h.charAt(0) == "#") ? h.substring(1, 7) : h }

    const cBrightness = ((hRed * 299) + (hGreen * 587) + (hBlue * 114)) / 1000;
    if (cBrightness > threshold) { return "#000000"; } else { return "#ffffff"; }
}




function getJmnodesIn(idContainer) {
    const eltContainer = document.getElementById(idContainer)
    const j = eltContainer.querySelector("jmnodes");
    return j;
}
function getJmnodesMain() { return getJmnodesIn(idContainer); }







function checkTagName(elt, expectName) {
    const tn = elt.nodeName;
    if (elt.nodeName !== expectName) {
        console.error(`Expected DOM elt ${expectName}, got ${tn}`, elt);
        throw Error(`Expected DOM elt ${expectName}, got ${tn}`);
    }
}
function getJsmindTheme(eltJmnodes) {
    checkTagName(eltJmnodes, "JMNODES");
    const themes = [...eltJmnodes.classList].filter(cls => cls.startsWith("theme-"));
    if (themes.length > 1) {
        const err = `There seems to be several JsMind themes`
        console.error(err, eltJmnodes, themes);
        throw Error(err);
    }
    return themes[0];
}
function setJsmindTheme(eltJmnodes, theme) {
    checkTagName(eltJmnodes, "JMNODES");
    const strJsmindThemeStart = "theme-"
    if (!theme.startsWith(strJsmindThemeStart)) Error(`${theme} is not a jsmind theme`);
    const arrCls = [...eltJmnodes.classList];
    arrCls.forEach(cls => {
        if (cls.startsWith(strJsmindThemeStart)) eltJmnodes.classList.remove(cls)
    });
    eltJmnodes.classList.add(theme);
}

function addDebugLog(msg) {
    // const divDebugLogLog = mkElt("div", { id: "jsmind-test-div-debug-log-log" });
    const divDebugLogLog = document.getElementById("jsmind-test-div-debug-log-log");
    const prevRow = divDebugLogLog.lastElementChild;
    const prevMsg = prevRow?.firstElementChild.textContent;
    if (msg === prevMsg) {
        const eltCounter = prevRow.lastElementChild;
        const txtCounter = eltCounter.textContent.trim();
        let counter = txtCounter === "" ? 1 : parseInt(txtCounter);
        eltCounter.textContent = ++counter;
    } else {
        const entry = mkElt("span", { class: "debug-entry" }, msg);
        const counter = mkElt("span", { class: "debug-counter" }, " ");
        const row = mkElt("div", { class: "debug-row" }, [entry, counter])
        divDebugLogLog.appendChild(row);
    }
}
