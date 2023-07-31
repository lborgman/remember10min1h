"use strict";

console.log("here i am");

const theMirrorWays = [
    "none",
    "useCanvas",
    "jsmind",
    "cloneNode",
    "pointHandle"
];
Object.freeze(theMirrorWays);
const ifMirrorWay = (ourWay) => {
    if (!theMirrorWays.includes(ourWay)) throw Error(`Unknown mirror way: ${ourWay}`);
    return ourWay == theMirrorWay;
}

const checkTheMirrorWay = () => {
    if (!theMirrorWays.includes(theMirrorWay)) throw Error(`Unknown mirror way: ${theMirrorWay}`);
}

// https://www.labnol.org/embed/google/photos/?ref=hackernoon.com
// https://hackernoon.com/how-to-embed-single-photos-from-google-photos-on-your-website-and-notion-page
// https://jumpshare.com/blog/how-to-embed-google-drive-video/
async function OLDdialogMirrorWay() {
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
    altsDesc.cloneNode = mkElt("div", undefined, [
        "Default when screen supports touch.",
        eltVidMirror
    ]);

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
        "(no description yet)",
        // vidPointHandle,
        // iframePointHandle
        // divIframePointHandle
    ]);
    function mkAltWay(way) {
        const radio = mkElt("input", { type: "radio", name: "mirrorway", value: way });
        if (theMirrorWay == way) radio.checked = true;
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

// let theMirrorWay = "cloneNode";
// let theMirrorWay = "pointHandle";
// FIX-ME: touch
let theMirrorWay = "none";
// debugger;

checkTheMirrorWay();


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
    // FIX-ME:
    const style = [
        `width: ${sizePointHandle}px`,
        `height: ${sizePointHandle}px`,
        // "background-color: yellow",
        // "position: fixed"
    ].join("; ");
    pointPointHandle = mkElt("div", { style, id: "jsmindtest-point-handle" });
    // jmnodesPointHandle.addEventListener("mousemove", checkPointHandleDistance);
    jmnodesPointHandle.addEventListener("drag", checkPointHandleDistance);
    jmnodesPointHandle.appendChild(pointPointHandle);
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
        posPointHandle.startX = evt.clientX;
        posPointHandle.startY = evt.clientY;
        pointPointHandle.style.left = evt.clientX - sizePointHandle / 2;
        pointPointHandle.style.top = evt.clientY - sizePointHandle / 2;
        jmnodesPointHandle.appendChild(pointPointHandle)
    }
    const diffX = posPointHandle.startX - evt.clientX;
    const diffY = posPointHandle.startY - evt.clientY;
    const diff2 = diffX * diffX + diffY * diffY;
    if (diff2 > diffPointHandle * diffPointHandle) {
        // pointPointHandle.style.backgroundColor = "red";
        pointPointHandle.classList.add("active");
        posPointHandle.diffX = posPointHandle.diffX || diffX;
        posPointHandle.diffY = posPointHandle.diffY || diffY;
        const newDiffX = posPointHandle.diffX - sizePointHandle / 2;
        const newDiffY = posPointHandle.diffY - sizePointHandle / 2;
        modJsmindDraggable.setPointerDiff(newDiffX, newDiffY);
        // jmnodesPointHandle.removeEventListener("mousemove", checkPointHandleDistance);
        // jmnodesPointHandle.removeEventListener("mousemove", checkPointHandleDistance);
        jmnodesPointHandle.addEventListener("drag", movePointHandle);
    }
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
function clearShapes(eltJmnode) {
    if (eltJmnode.tagName != "JMNODE") throw Error("Not <jmnode>");
    arrShapeClasses.forEach(oldShape => { eltJmnode.classList.remove(oldShape) });
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
    // const shapeEtc = node.data.shapeEtc;
    // if (!shapeEtc) return;
    clearShapes(eltJmnode);
    const shape = shapeEtc.shape;
    if (shape) {
        if (arrShapeClasses.includes(shape)) {
            eltJmnode.classList.add(shape);
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
                eltJmnode.style.border = null;
            } else {
                eltJmnode.style.border = `${w}px ${s} ${c}`;
            }
        }
    } else {
        eltJmnode.style.border = null;
    }
    const shadow = shapeEtc.shadow;
    if (shadow && shadow.blur > 0) {
        const x = shadow.offX || 0;
        const y = shadow.offY || 0;
        const b = shadow.blur;
        const c = shadow.color || "red";
        eltJmnode.style.filter = `drop-shadow(${x}px ${y}px ${b}px ${c})`;
        // FIX-ME: spread is currently not used, or???
        // const s = shadow.spread;
        // eltJmnode.style.filter = `drop-shadow(${x}px ${y}px ${b}px ${s}px ${c})`;
    }
}


let modJsmindDraggable;
basicInit4jsmind();
function basicInit4jsmind() {
    jsMind.my_get_DOM_element_from_node = (node) => { return node._data.view.element; }

    // await thePromiseDOMready;
    async function startDraggable() {
        modJsmindDraggable = await import("/ext/jsmind/new-jsmind.draggable-nodes.js");
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


pageSetup();

checkTheMirrorWay();

async function pageSetup() {
    // let useCanvas = true;
    // let useCanvas = false;
    // useCanvas = confirm("Use canvas?");
    const idDivJmnodesMain = "jsmind_container";
    const idDivJmnodesMirror = "jsmind-draggable-container4mirror";
    let mirrorContainer;

    const idDivScreenMirror = "jsmindtest-div-mirror";
    const idMirroredWrapper = "jsmindtest-div-mirrored-wrapper";
    let divMirroredWrapper;

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
    optionsJmMirror.container = idDivJmnodesMirror;
    delete optionsJmMirror.shortcut;


    // let clientXthrottle4mirror;
    // let clientYthrottle4mirror;
    const moveJmnodesInMirror = throttleRA(doMoveJmnodesInMirror);
    // const moveJmnodesInMirror = throttleTO(doMoveJmnodesInMirror, 50);

    const restartCloneJmnodes = debounce(cloneJmnodes, 2000);
    function cloneJmnodes() {
        divMirroredWrapper = divMirroredWrapper || document.getElementById(idMirroredWrapper);
        if (!divMirroredWrapper) return;
        console.log("cloneJmnodes");
        const displayedJmnodes = getJmnodes(jmDisplayed);
        const displayedInner = displayedJmnodes.parentElement;
        const clonedInner = displayedInner.cloneNode(true);
        const styleInner = clonedInner.style;
        styleInner["cursor"] = "unset";
        styleInner["position"] = "static";
        divMirroredWrapper.textContent = "";
        divMirroredWrapper.appendChild(clonedInner);
    }
    // Use this??? copy canvas https://jsfiddle.net/lborgman/5L1bfhow/3/
    function restartMkCanvasImage() {
        // if (!useCanvas) return;
        if (!ifMirrorWay("useCanvas")) return;
        // console.warn("restart_MkCanvasImage");
        h2cCanvas = undefined;
        promH2cCanvas = undefined;
        mkCanvasImage();
        moveJmnodesInMirror();
    }
    function OLDupdateTheMirror() {
        if (divScreenMirror) {
            if (ifMirrorWay("useCanvas")) {
                setTimeout(restartMkCanvasImage, 2000);
                return;
            }
            if (ifMirrorWay("cloneNode")) {
                restartCloneJmnodes();
                return;
            }
        }
    }

    const modJmDrag = await import("/ext/jsmind/new-jsmind.draggable-nodes.js");

    let divScreenMirror;

    /*
    This was just an extremely bad idea. The opposite of what I thought I was doing...
    const clsMoveInMirrorTimer = new modJmDrag.TimeoutTimer(200, doMoveJmnodesInMirror);
    function moveJmnodesInMirror() {
        if (!divTestMirror) return;
        clsMoveInMirrorTimer.restart();
    }

    The problem arises from the async function for updating the mirror. 
    It can't be guaranteed that the updating happens during drag or mouse
    move operations.
    So I will now test making moveJmnodesInMirror non-async.

    That did not work by itself. Wrap the canvas in a div for scrolling it?
    */
    // async function moveJmnodesInMirror()

    function getJmnodesPosition() {
        mirrorVals.jmnodes = mirrorVals.jmnodes || document.querySelector("jmnodes");
        // const bcrJ = jmnodes.getBoundingClientRect();
        // const bcrJ = mirrorVals.jmnodes.parentElement.getBoundingClientRect();
        const bcrJ = mirrorVals.jmnodes.getBoundingClientRect();
        mirrorVals.bcrJtop = bcrJ.top;
        mirrorVals.bcrJleft = bcrJ.left;
        // console.log("getJmnodesPosition", bcrJ, mirrorVals);
    }
    function OLDcompareSizesDisplayedMirrored() {
        divMirroredWrapper = divMirroredWrapper || document.getElementById(idMirroredWrapper);
        if (!divMirroredWrapper) return;
        const jmnodesMirrored = divMirroredWrapper.querySelector("jmnodes");
        if (!jmnodesMirrored) return;
        const jmnodesDisplayed = getJmnodes(jmDisplayed);
        const sD = jmnodesDisplayed.style;
        const sM = jmnodesMirrored.style;
        if (sD.height != sM.height) throw Error(`Heights differ, ${sD.height} != ${sM.height}`);
        if (sD.width != sM.width) throw Error(`Widths differ, ${sD.width} != ${sM.width}`);
    }
    function OLDdoMoveJmnodesInMirror() {
        if (ifMirrorWay("useCanvas")) mkCanvasImage();
        divMirroredWrapper = divMirroredWrapper || document.getElementById(idMirroredWrapper);
        if (!divMirroredWrapper) {
            console.log("!mirroredWrapper, return");
            return;
        }

        const bcrSM = divScreenMirror.getBoundingClientRect();
        if (bcrSM.width == 0) {
            console.warn("bcrSM.width == 0, return", { bcrSM });
            return;
        }

        compareSizesDisplayedMirrored();

        const bcrSMtop = bcrSM.top;
        const bcrSMleft = bcrSM.left;
        let newTop = - bcrSMtop + mirrorVals.bcrJtop;
        // newTop -= bcrSM.height / 2;
        let newLeft = - bcrSMleft + mirrorVals.bcrJleft;
        // newLeft -= mirrorVals.widthDivH2c / 2 + 40;
        newLeft -= bcrSM.width / 2 + 40;

        setTimeout(() => {
            divMirroredWrapper.style.top = `${newTop}px`;
            divMirroredWrapper.style.left = `${newLeft}px`;
            // console.log("doMove, setTimeout", newTop, newLeft);
        });
    }

    async function mkCanvasImage() {
        if (!ifMirrorWay("useCanvas")) throw Error("canvas should not be used");
        const beforeMs = Date.now();
        const eltMyVer = document.getElementById("jsmind-test-my-ver");
        if (!promH2cCanvas) {
            if (h2cCanvas) {
                if (eltMyVer) { eltMyVer.textContent = `had it 0 ms`; }
                return h2cCanvas;
            }
            const modH2C = await import("/ext/html2canvas.esm.js");
            // FIX-ME:
            const jmnodes = document.querySelector("jmnodes");
            // promH2cCanvas = m2.default(jmnodes);
            promH2cCanvas = modH2C.default(jmnodes.parentElement);
        }
        // const canvas = await promH2cCanvas;
        h2cCanvas = await promH2cCanvas;
        const jmnodesCopyClass = "jsmindtest-jmnodes-copy";
        h2cCanvas.classList.add(jmnodesCopyClass);
        h2cCanvas.style.position = "absolute";
        // promH2cCanvas = undefined;
        const elapsedH2cMs = Date.now() - beforeMs;
        // console.log({ jh2c: canvas, elapsedH2cMs });
        if (eltMyVer) { eltMyVer.textContent = `${elapsedH2cMs} ms`; }
        // const divMirror = document.getElementById(idTestDivMirror);
        // const oldCopy = divMirror.querySelector(`.${jmnodesCopyClass}`);
        divMirroredWrapper = divMirroredWrapper || document.getElementById(idMirroredWrapper);
        const oldCopy = divMirroredWrapper?.firstElementChild;
        oldCopy?.remove();
        // divMirror.appendChild(h2cCanvas);
        divMirroredWrapper?.appendChild(h2cCanvas);
        return h2cCanvas;
    }


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
    function addDebugLog(msg) {
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
    // jsMindContainer.appendChild(divDebugLog);
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
            displayContextMenu(btnJsmindMenu, 10, 48);
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
        const keyFc4i = getJsmindCopied4Mindmap();
        if (keyFc4i) {
            alert(`not ready: ${keyFc4i}`);
            // return;
            // getEmptyMap()
            const nextKey = await getNextMindmapKey();
            mind = getEmptyMap(nextKey);
            // fc4i:
            debugger;
        } else {
            mind = await dialogCreateMindMap();
        }
    } else {
        // mind = getTestMindmap(mindmapName);
        mind = DBgetMindmap(mindmapKey);
    }
    // debugger;
    if (!mind) {
        return;
        // let formatEmpty = "node_array";
        // debugger;
        mind = getEmptyMap(mindmapKey);
    }
    modJmDrag.setupNewDragging();

    const nowBefore = Date.now();
    const jmDisplayed = displayMindMap(mind, optionsJmDisplay);
    const linkRendImg = "/img/192.png";
    const ourCustomRenderer = new CustomRenderer4jsMind(jmDisplayed, linkRendImg);
    const nowAfter = Date.now();
    // console.log(`displayMindMap etc: ${nowAfter - nowBefore} ms`);

    // FIX-ME:
    // const eltJmnodes = document.getElementById(optionsJmDisplay.container).querySelector("jmnodes");
    // eltJmnodes.addEventListener("dblclick", ourCustomRenderer.jmnodeDblclick);


    let jmMirrored;
    let ourCustomRenderer4mirror;
    // getJmMirrored();
    async function OLDgetJmMirrored() {
        if (jmMirrored) return jmMirrored;
        mirrorContainer = document.getElementById(optionsJmMirror.container);
        if (mirrorContainer) {
            const jm = displayMindMap(mind, optionsJmMirror);
            ourCustomRenderer4mirror = new CustomRenderer4jsMind(jmMirrored);
            // await wait4mutations(mirrorContainer, 100);
            const displayedRoot = jsMind.my_get_DOM_element_from_node(jmDisplayed.get_root());
            const mirroredRoot = jsMind.my_get_DOM_element_from_node(jm.get_root());
            const displayedJmnodes = displayedRoot.closest("jmnodes");
            const mirroredJmnodes = mirroredRoot.closest("jmnodes");
            if (displayedJmnodes.style.width != mirroredJmnodes.style.width) Error(`Width of jmnodes does not match`);
            if (displayedJmnodes.style.height != mirroredJmnodes.style.height) Error(`Height of jmnodes does not match`);
            const bcrD = displayedJmnodes.getBoundingClientRect();
            const bcrM = mirroredJmnodes.getBoundingClientRect();
            if (bcrD.width != bcrM.width) Error(`bcr width of jmnodes does not match`);
            if (bcrD.height != bcrM.height) Error(`bcr height of jmnodes does not match`);
            // if (!useCanvas) {
            // mirror
            // }
            if (ifMirrorWay("jsmind")) jmMirrored = jm;
            if (ifMirrorWay("jsmind")) return jm;
        }
    }

    // FIX-ME: remove when this is fixed in jsmind.
    fixJmnodeProblems(ourCustomRenderer);

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
        const evt_type = data.evt;
        const datadata = data.data;
        const node_id = data.node;
        // console.log({ evt_type, type, datadata, data });
        finnishAndMirrorOperationOnNode(evt_type, node_id, datadata);
        DBsaveThisMindmap(jmDisplayed); // FIX-ME: delay
        updateTheMirror();
    });
    function finnishAndMirrorOperationOnNode(operation_type, operation_node_id, datadata) {
        debugger;
        // console.log("finAndMirr", { operation_type, operation_node_id, jm_operation: jmDisplayed, datadata });
        // if (!jmMirrored) return;
        switch (operation_type) {
            case "add_node":
                const id_added = operation_node_id;
                const added_node = jmDisplayed.get_node(id_added);
                const fc4i_added = added_node.data.fc4i;
                console.log({ operation_type, id_added, added_node, fc4i_added });
                const id_parent = datadata[0];
                if (id_added != datadata[1]) throw Error(`id_added (${id_added}) != datadata[1] (${datadata[1]})`);
                const topic_added = datadata[2];
                jmMirrored?.add_node(id_parent, id_added, topic_added);
                break;
            case "update_node":
                const id_updated = operation_node_id;
                const updated_node = jmDisplayed.get_node(id_updated);
                const fc4i_updated = updated_node.data.fc4i;
                console.log({ operation_type, id_updated, fc4i_updated, updated_node });

                // jmMirrored.update_node.apply(datadata);
                const [id_upd, topic] = datadata
                jmMirrored?.update_node(id_upd, topic);

                if (!!fc4i_updated) {
                    ourCustomRenderer.updateJmnodeFromCustom(jsMind.my_get_DOM_element_from_node(updated_node));
                    if (jmMirrored) {
                        const mirror_updated_node = jmMirrored.get_node(updated_node);
                        ourCustomRenderer4mirror.updateJmnodeFromCustom(jsMind.my_get_DOM_element_from_node(mirror_updated_node));
                    }
                }
                break;
            case "move_node":
                function walkMoved(id_moved) {
                    console.log({ id_moved });
                    const moved_node = jmDisplayed.get_node(id_moved);
                    moved_node.children.forEach(child => {
                        walkMoved(child.id);
                    });
                }
                const id_moved = operation_node_id;
                const moved_node = jmDisplayed.get_node(id_moved);
                const fc4i_moved = moved_node.data.fc4i;
                let update = false;
                update = true;
                const customNeedUpdate = update && !!fc4i_moved;
                if (customNeedUpdate) {
                    ourCustomRenderer.updateJmnodeFromCustom(jsMind.my_get_DOM_element_from_node(moved_node));
                }
                const before_id = datadata[1];
                const parent_id = datadata[2];
                jmMirrored?.move_node(id_moved, before_id, parent_id);
                if (customNeedUpdate) {
                    if (jmMirrored) {
                        const mirror_moved_node = jmMirrored.get_node(id_moved);
                        ourCustomRenderer4mirror.updateJmnodeFromCustom(jsMind.my_get_DOM_element_from_node(mirror_moved_node));
                    }
                }
                break;
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




    setTimeout(() => {
        [...document.getElementsByTagName("jmnode")].forEach(eltJmnode => {
            const child1 = eltJmnode.firstElementChild;
            if (child1 && child1.tagName === "DIV") {
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
                    },
                        1000);
                    return;
                }
                if (child1.classList.contains("jsmind-custom")) {
                    ourCustomRenderer.updateJmnodeFromCustom(eltJmnode);
                }
            }
        });
    }, 500);
    setTimeout(() => {
        // [...document.getElementsByTagName("jmnode")].forEach(eltJmnode => { });
        const jmData = jmDisplayed.get_data("node_array");
        jmData.data.forEach(entry => {
            const node = jmDisplayed.get_node(entry.id);
            const eltJmnode = jsMind.my_get_DOM_element_from_node(node);
            applyNodeShapeEtc(node, eltJmnode);
        });
    }, 500);

    jsMindContainer.appendChild(divDebugLog);

    const idContextMenu = "jsmind-context-menu";
    let divContextMenu;

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
        const selectedNode = jmDisplayed.get_selected_node();
        if (selectedNode) {
            const selectedElt = getDOMeltFromNode(selectedNode);
            selectedElt.focus();
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
        // eltFc4iLink.dataset.fc4iEntryLink = "true";
        if (target.dataset.fc4iEntryLink === "true") {
            const eltJmnode = target.closest("jmnode");
            if (eltJmnode) {
                const node_id = getNodeIdFromDOMelt(eltJmnode);
                jmDisplayed.select_node(node_id);
            }
            setTimeout(() => {
                const go = confirm("Show entry in fc4i?");
                console.log({ go });
                // if (go) alert("Not implemented yet");
                if (!go) return;
                const eltCustom = eltJmnode.querySelector(".jsmind-custom");
                // const strCustom = eltCustom.dataset["jsmind-custom"];
                const strCustom = eltCustom.dataset.jsmindCustom;
                const objCustom = JSON.parse(strCustom);
                showKeyInFc4i(objCustom.key);
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
            // if (x === undefined) return;
            // if (divContextMenu.style.display === "block") return;
            // if (divContextMenu?.forElt === forElt) return;
            const doDisplay = () => displayContextMenu(forElt, x, y);
            tmr = setTimeout(doDisplay, msDelayContextMenu);
        }
    })();


    async function displayContextMenu(forElt, left, top) {
        const divMenu = await getDivContextMenu();
        await mkContextMenu();
        divMenu.forElt = forElt;
        // Set values in integer, read them as ..px
        divMenu.style.left = left;
        divMenu.style.top = top;
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
        const selected_node = jmDisplayed.get_selected_node();

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

        const liTestPointHandle = mkMenuItem("test pointHandle", setupPointHandle);

        // https://html2canvas.hertzen.com/getting-started.html
        // const liTestMirror = mkMenuItem("test mirror", testStartMirror);
        const liTestMirror = mkMenuItem("test drag accessiblity", testDragAccessibility);

        const idScreenMirrorPoint = "jsmindtest-screen-mirror-point";
        const idScreenMirrorColor = "jsmindtest-screen-mirror-color";

        function OLDmoveMirrorPoint(left, origClientY, topDivH2c) {
            // 20x20px
            const pointSize = 20;
            const divPoint = document.getElementById(idScreenMirrorPoint);
            divPoint.style.left = left - pointSize / 2;
            divPoint.style.top = origClientY - topDivH2c - pointSize / 2;
        }

        async function testDragAccessibility() {
            const oldWay = theMirrorWay;
            const newWay = await dialogMirrorWay();
            if (newWay == oldWay || !newWay) return;
            teardownPointHandle();
            teardownMirror();
            switchMirrorWay(newWay);
            function OLDswitchMirrorWay(newWay) {
                theMirrorWay = newWay;
                switch (theMirrorWay) {
                    case "none":
                        break;
                    case "cloneNode":
                        setupMirror();
                        break;
                    case "pointHandle":
                        setTimeout(setupPointHandle, 1000);
                        break;
                    default:
                        throw Error(`Not handled theMirrorWay=${theMirrorWay}`);
                }
            }
        }
        function OLDteardownMirror() {
            const oldDivH2c = document.getElementById(idDivScreenMirror);
            // if (oldDivH2c) { oldDivH2c.remove(); return; }
            oldDivH2c?.remove();
        }
        function OLDsetupMirror() {
            const jmnodes = document.querySelector("jmnodes");
            const jsmindInner = jmnodes.closest(".jsmind-inner");
            const jmContainer = jsmindInner.parentElement;
            function followMouseTest4mirror(evt) {
                mirrorVals.clientXthrottle4mirror = evt.clientX;
                mirrorVals.clientYthrottle4mirror = evt.clientY;
            }
            function showTestInfo() {
                const style = [
                    "position: fixed",
                    "top: 0",
                    "left: 50px",
                    "background-color: red",
                    "color: black",
                    "width: 150px",
                    "height: 30px",
                    "padding: 3px",
                    "z-index: 1000"
                ].join(";");
                let sec = 3;
                const eltTestCountdown = mkElt("span", undefined, sec);
                const eltTestInfo = mkElt("div", { style }, ["Position mouse: ", eltTestCountdown]);
                document.body.appendChild(eltTestInfo);
                const cdi = setInterval(() => {
                    if (--sec < 1) {
                        clearInterval(cdi);
                        eltTestInfo.remove();
                        jmnodes.removeEventListener("mousemove", followMouseTest4mirror);
                        startMirror(
                            mirrorVals.clientXthrottle4mirror,
                            mirrorVals.clientYthrottle4mirror
                        );
                    }
                    eltTestCountdown.textContent = sec;
                }, 1000);
            }
            showTestInfo();
            setTimeout(getJmnodesPosition, 2500);
            jmnodes.addEventListener("mousemove", followMouseTest4mirror, { passive: true });
            jmnodes.parentElement.addEventListener("scroll",
                () => {
                    // console.log("jmnodes scrolled again");
                    getJmnodesPosition();
                    moveJmnodesInMirror();
                }, { passive: true });
        }
        async function OLDstartMirror(clientX4mirror, clientY4mirror) {
            const jmnodes = document.querySelector("jmnodes");

            const topDivH2c = clientY4mirror - mirrorVals.heightDivH2c / 2
            const leftDivH2c = clientX4mirror - mirrorVals.widthDivH2c - 40;
            divScreenMirror = mkDivScreenMirror();
            if (ifMirrorWay("useCanvas")) h2cCanvas = await mkCanvasImage();

            compareSizesDisplayedMirrored();
            doMoveJmnodesInMirror();
            function OLDfollowMouse4mirror(evt) {
                mirrorVals.clientXthrottle4mirror = evt.clientX;
                mirrorVals.clientYthrottle4mirror = evt.clientY;
                const topDivH2c = mirrorVals.clientYthrottle4mirror - mirrorVals.heightDivH2c / 2
                const leftDivH2c = mirrorVals.clientXthrottle4mirror - mirrorVals.widthDivH2c - 40;
                divScreenMirror.style.top = topDivH2c + "px";
                divScreenMirror.style.left = leftDivH2c + "px";
                moveJmnodesInMirror();
            }
            jmnodes.addEventListener("dragstart", startFollowMouse);
            jmnodes.addEventListener("dragend", finishFollowMouse);

            function startFollowMouse() {
                divScreenMirror.style.display = "block";
                moveJmnodesInMirror();
                jmnodes.addEventListener("drag", followMouse4mirror);
            }
            function finishFollowMouse() {
                jmnodes.removeEventListener("drag", followMouse4mirror);
                divScreenMirror.style.display = "none";
            }


            function OLDmkDivScreenMirror() {
                const divMirrorColor = mkDivMirrorColor();
                const divPoint = mkDivPoint();

                function mkDivMirrorColor() { return mkElt("div", { id: idScreenMirrorColor }); }
                function mkDivPoint() { return mkElt("div", { id: idScreenMirrorPoint }); }
                setTimeout(() => moveMirrorPoint(mirrorVals.widthDivH2c / 2, clientY4mirror, topDivH2c), 100);

                divMirroredWrapper = mkElt("div", { id: idMirroredWrapper });
                const sw = divMirroredWrapper.style;
                sw.position = "absolute";
                sw.width = "100wv";
                sw.height = "100wh";

                const style = [
                    `top: ${topDivH2c}px`,
                    `left: ${leftDivH2c}px`,
                    `width: ${mirrorVals.widthDivH2c}px`,
                    `height: ${mirrorVals.heightDivH2c}px`,
                ].join(";");

                const div = mkElt("div", { style, id: idDivScreenMirror }, [
                    divMirrorColor, divPoint,
                    divMirroredWrapper
                ]);
                // if (!ifMirrorWay("useCanvas")) 
                if (ifMirrorWay("jsmind")) {
                    const divJmnodesMirror = document.getElementById(idDivJmnodesMirror);
                    const mirrored = divJmnodesMirror.firstElementChild;
                    divMirroredWrapper.appendChild(mirrored);
                    mirrored.style.position = "static";
                }
                if (ifMirrorWay("cloneNode")) {
                    cloneJmnodes();
                }
                document.body.appendChild(div);
                return div;
            }
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

        const liTestDragBetween = mkMenuItem("test move between",
            async () => {
                const m = await import("/ext/jsmind/new-jsmind.draggable-nodes.js");
                m.startTrackingPointer()
            });

        const liTestTabindex = mkMenuItem("Test tabindex=1",
            () => {
                document.querySelectorAll("jmnode").forEach(jmn => {
                    jmn.setAttribute("tabindex", "1");
                })
            }
        );
        const liTestSvgDrawLine = mkMenuItem("Test svg draw line",
            () => { testSvgLine(); }
        );

        const liTestTouch = mkMenuItem("Test for touch",
            () => {
                const hasTouch = hasTouchEvents();
                addDebugLog(`Has touch: ${hasTouch}`);
            });
        const liTestMouse = mkMenuItem("Test for mouse",
            // https://stackoverflow.com/questions/21054126/how-to-detect-if-a-device-has-mouse-support/50687322#50687322
            // https://bugs.chromium.org/p/chromium/issues/detail?id=1088262
            () => {
                const hasCursor = window.matchMedia('(pointer:fine)').matches;
                addDebugLog(
                    `window.matchMedia('(pointer:fine)').matches; ${hasCursor}`
                );
            });

        const liAddChild = mkMenuItem("Add child", () => addNode("child"));
        markIfNoSelected(liAddChild);

        const liAddSibling = mkMenuItem("Add sibling", () => addNode("brother"));
        markIfNoSelected(liAddSibling);
        markIfNoMother(liAddSibling);

        function addNode(rel) {
            const selected_node = getSelected_node();
            if (selected_node) {
                // const jm = jsMind.current;
                const jm = jmDisplayed;
                const new_node_id = getNextNodeId();
                const new_node_topic = `Node ${new_node_id}`;
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
                setTimeout(() => { jsMind.my_get_DOM_element_from_node(new_node).draggable = true; }, 1000);
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
                    // const jm = jsMind.current;
                    const jm = jmDisplayed;
                    jm.remove_node(selected_node);
                    // setTestMindmap();
                }
            }
            hideContextMenu();
        }

        const arrEntries = [
            liAddChild,
            liAddSibling,
            liDelete,
            liTestTouch,
            liTestMouse,
            liTestSvgDrawLine,
            liTestTabindex,
            liTestDragBetween,
            liTestPinchZoom,
            liTestMirror,
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

    /*
    function setTestMindmap() {
        console.error("called setTestMindMap");
        throw Error("called setTestMindMap");
        const mind = jmDisplayed.get_data("node_array");
        const mindmapName = mind.meta.name;
        if (!mindmapName) throw Error("Current mindmap has no meta.name");
        DBsetMindmap(mindmapName, mind);
    }
    function getTestMindmap(mindmapName) {
        console.error("called getTestMindMap");
        throw Error("called getTestMindMap");
        return DBgetMindmap(mindmapName);
    }
    function removeMind() {
        console.error("called removeMind");
        throw Error("called removeMind");
        // localStorage.removeItem(lsMindKey);
        const mind = jmDisplayed.get_data("node_array");
        const mindmapName = mind.meta.name;
        DBremoveMindmap(mindmapName);
    }
    */


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
        const jmnodes = getJmnodes(jmDisplayed);
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

    function pasteCopied4Mindmap() {
        const strCopied = getJsmindCopied4Mindmap();
        removeJsmindCopied4Mindmap(); // FIX-ME: how??
        console.log({ strCopied });
        // debugger;
        if (strCopied === null) return;
        const objCopied = JSON.parse(strCopied);
        const old_node = jmDisplayed.get_node(objCopied.key);
        if (old_node) {
            jmDisplayed.select_node(old_node);
            setTimeout(() => alert("Not added because node already exists"));
            return;
        }
        const root_id = jmDisplayed.get_root().id;
        const node_data = {
            info: "This is just a test",
            custom: strCopied
        }

        // getNext
        const new_id = getNextNodeId();
        // const new_node = jmDisplayed.add_node(root_id, keyCopied, "RMINDER", node_data);
        const new_node = jmDisplayed.add_node(root_id, new_id, "RMINDER", node_data);
        fixNewFc4iNode(new_node.id);
        jmDisplayed.select_node(new_node);
        // setTestMindmap();
    }
    pasteCopied4Mindmap();

    async function fixNewFc4iNode(node_id) {
        const node = jmDisplayed.get_node(node_id);
        const fc4iKey = node.data.custom;
        console.log(fc4iKey);
        // const html = mkElt("div", { class: "fc4i" }, [
        const html = mkElt("div", { class: "jsmind-custom" }, [
            mkElt("div", { class: "fc4i-title" }),
            mkElt("div", { class: "fc4i-image" })
        ]);
        html.dataset["jsmindCustom"] = fc4iKey;
        const style = [
            `background-image:url(/img/192.png)`,
        ].join(";");
        const eltFc4iLink = mkElt("div", { style });
        eltFc4iLink.classList.add("jsmind-renderer-img");
        eltFc4iLink.dataset.fc4iEntryLink = "true";
        jmDisplayed.update_node(node, html.outerHTML + eltFc4iLink.outerHTML);
        // jmDisplayed.set_node_background_image(node_id, "none", 150, 100);
        jmDisplayed.set_node_background_image(node_id, undefined, 150, 100);
    }

    function updateAllFc4i() {
        const eltJmnodes = getJmnodes(jmDisplayed);
        eltJmnodes.querySelectorAll("jmnode > div.fc4i")
            .forEach(async fc => {
                const eltJmnode = fc.parentElement;
                // const key = fc.dataset.fc4i;
                // const keyRec = await get1Reminder(key);
                // console.log({ eltJmnode, keyRec });
                ourCustomRenderer.updateJmnodeFromCustom(eltJmnode);
            });
    }

    let moFc4i;
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
jsMind.my_get_nodeID_from_DOM_element = (elt) => {
    const tn = elt.tagName;
    if (tn !== "JMNODE") throw Error(`Not jmnode: <${tn}>`);
    const id = elt.getAttribute("nodeid");
    if (!!!id) throw Error("Could not find jmnode id");
    return id;
}



function getJmnodes(jmDisplayed) {
    const root_node = jmDisplayed.get_root();
    const eltRoot = jsMind.my_get_DOM_element_from_node(root_node);
    const eltJmnodes = eltRoot.closest("jmnodes");
    return eltJmnodes;
}



function fixJmnodeProblems(ourCustomRenderer) {
    // FIX-ME: Remove when this is fixed in jsmind
    setTimeout(() => {
        [...document.getElementsByTagName("jmnode")].forEach(eltJmnode => {
            if (eltJmnode.getAttribute("nodeid") === "root") return;
            console.log("old eltJmnode.draggable", eltJmnode.draggable);
            eltJmnode.draggable = true;
            eltJmnode.addEventListener("dblclick", ourCustomRenderer.jmnodeDblclick);
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

class CustomRenderer4jsMind {
    constructor(THEjmDisplayed, linkRendererImg) {
        this.THEjmDisplayed = THEjmDisplayed;
        // this.linkRendererImg = "/img/192.png";
        this.linkRendererImg = linkRendererImg;
    }
    getLinkRendererImage() { return this.linkRendererImg; }
    async updateJmnodeFromCustom(eltJmnode) {
        const tn = eltJmnode.tagName;
        if (tn !== "JMNODE") throw Error(`Not a <jmnode>: ${tn}`)
        // eltJmnode.removeEventListener("dblclick", this.jmnodeDblclick);
        // eltJmnode.addEventListener("dblclick", this.jmnodeDblclick);
        const htmlTopic = eltJmnode.firstElementChild;
        if (!htmlTopic) return;
        const htmlRendererImg = eltJmnode.lastElementChild;
        htmlRendererImg.style.backgroundImage = `url(${this.linkRendererImg})`;
        htmlTopic.addEventListener("click", evt => {
            // console.log("clicked", eltJmnode);
            // This did not work: eltJmnode.click(evt);
            const node_id = getNodeIdFromDOMelt(eltJmnode);
            this.THEjmDisplayed.select_node(node_id);
        });
        // debugger;
        // const strCustom = html.dataset.fc4i;
        const strCustom = htmlTopic.dataset.jsmindCustom;
        if (!strCustom) throw Error("No jsmindCustom key found on <jmnode>")
        const objCustom = JSON.parse(strCustom)
        const keyRec = await get1Reminder(objCustom.key);
        htmlTopic.firstElementChild.textContent = keyRec.title;
        if (keyRec.images && (keyRec.images.length > 0)) {
            const blob = keyRec.images[0];
            const urlBlob = URL.createObjectURL(blob);
            const eltHtmlImg = htmlTopic.lastElementChild;
            const style = eltHtmlImg.style;
            const urlBg = `url(${urlBlob})`;
            style.backgroundImage = urlBg;
        }
    }

    async editNodeDialog(eltJmnode) {
        const modMdc = await import("/src/js/mod/util-mdc.js");

        function somethingToSave() {
            return JSON.stringify(initialShapeEtc) != JSON.stringify(currentShapeEtc);
        }

        // const onAnyCtrlChange = debounce(applyToCopied);
        const onAnyCtrlChange = throttleTO(applyToCopied);
        function applyToCopied() {
            const changed = somethingToSave();
            console.warn("applyToCopied", changed);
            requestSetStateBtnSave();
            applyShapeEtc(currentShapeEtc, eltCopied);
        }

        const onCtrlsGrpChg = {
            border: setBorderCopied,
            shadow: onCtrlsChgShadow,
        };
        const ctrlsSliders = {}

        const eltJmnodes = eltJmnode.closest("jmnodes");
        let themeClass;
        eltJmnodes.classList.forEach(entry => {
            const clsName = entry;
            if (clsName.match(/^theme-[a-z0-9]*$/)) themeClass = clsName;
        })
        const eltCopied = eltJmnode.cloneNode(true);
        const bcrOrig = eltJmnode.getBoundingClientRect();
        eltCopied.style.top = 0;
        eltCopied.style.left = 0;
        eltCopied.classList.remove("selected");
        eltCopied.classList.remove("jsmind-hit");
        if (eltCopied.style.width == "") {
            eltCopied.style.width = `${bcrOrig.width}px`;
            eltCopied.style.height = `${bcrOrig.height}px`;
        }

        // https://css-tricks.com/almanac/properties/r/resize/
        // eltCopied.style.overflow = "auto";
        eltCopied.draggable = null;

        const node_ID_copied = jsMind.my_get_nodeID_from_DOM_element(eltJmnode);
        const node_copied = this.THEjmDisplayed.get_node(node_ID_copied)
        // .shapeEtc
        const node_copied_data = node_copied.data;
        node_copied_data.shapeEtc = node_copied_data.shapeEtc || {};
        const copiedShapeEtc = node_copied_data.shapeEtc;

        const initialShapeEtc = JSON.parse(JSON.stringify(copiedShapeEtc));
        const initialTempData = {}; // For editing

        initialTempData.height = node_copied_data.height;
        initialTempData.width = node_copied_data.width;
        initialTempData.topic = node_copied.topic;
        const eltCopiedTopic = eltCopied; // FIX-ME:

        const fgColor = node_copied_data["foreground-color"];
        const bgColor = node_copied_data["background-color"];
        if (fgColor) {
            initialTempData.fgColor = fgColor;
            eltCopied.style.color = fgColor;
        }
        if (bgColor) {
            initialTempData.bgColor = bgColor;
            eltCopied.style.backgroundColor = bgColor;
        }

        initialShapeEtc.temp = initialTempData;
        console.log({ copiedShapeEtc, node_copied_data, initialTempData });

        const currentShapeEtc = JSON.parse(JSON.stringify(initialShapeEtc));
        const currentTempData = currentShapeEtc.temp;

        /* 
            css resize does not work well on Android Chrome today (2023-05-01).
            Add a workaround using pointerdown, -move and -up.
            https://javascript.info/pointer-events
            https://plnkr.co/edit/zSi5dCJOiabaCHfw?p=preview&preview
        */
        const jmnodesCopied = mkElt("jmnodes", undefined, eltCopied);
        if (themeClass) jmnodesCopied.classList.add(themeClass);
        const divCopied = mkElt("div", undefined, [
            jmnodesCopied
        ]);
        divCopied.style.position = "relative";
        divCopied.style.height = "200px";
        divCopied.style.width = "100%";
        // https://stackoverflow.com/questions/59010779/pointer-event-issue-pointercancel-with-pressure-input-pen
        divCopied.style.touchAction = "none";

        const lblBorderColor = mkCtrlColor("border.color", "black");

        function onCtrlChgBorderWidth() {
            const dialogBW = currentShapeEtc.border.width;
            if (dialogBW > 0) {
                divBorder.classList.remove("no-specified-border");
            } else {
                divBorder.classList.add("no-specified-border");
            }
            // setBorderCopied();
        }

        function setBorderCopied() {
            debugger; // should not happen any more... soon
            return;
            const w = currentShapeEtc.border.width;
            if (w === 0) {
                eltCopied.style.border = "none";
            } else {
                const bs = currentShapeEtc.border.style;
                const bc = currentShapeEtc.border.color;
                eltCopied.style.border = `${w}px ${bs} ${bc}`;
            }
        }

        const divSliBorderWidth = mkElt("div", undefined, "Width: ");
        let sliBorderWidth;
        async function addSliBorderWidth() {
            const eltCont = divSliBorderWidth;
            const title = "Border width";
            const funChange = onCtrlChgBorderWidth;
            await mkSlider4shapeEtc("border.width", eltCont, 0, 20, 0, 2, title, funChange);
        }

        async function mkSliderInContainer(eltCont, min, max, now, step, label, onChange, onInput, disable) {
            let sli = eltCont.querySelector("div.mdc-slider");
            if (!sli) {
                try {
                    sli = await modMdc.mkMDCslider(min, max, now, step, label, onChange, onInput, disable);
                    sli.classList.add("mdc-my-slider-colors-fix");
                    await AddBeforeWhenContainerIsDisplayed(eltCont, sli);
                    if (!sli.parentElement) return;
                    const mdc = sli.myMdc || await sli.myPromMdc;
                } catch (err) {
                    console.error("mkSliderInContainer", err);
                }
            }
            return sli;
        }

        const initialBorderStyle = initialShapeEtc.border?.style || "solid";
        function mkAltBorderStyle(styleName) {
            const inp = mkElt("input", { type: "radio", name: "borderstyle", value: styleName });
            if (styleName == initialBorderStyle) inp.checked = true;
            const eltShow = mkElt("span", undefined, styleName);
            const ss = eltShow.style;
            ss.width = "800px";
            ss.height = "30px";
            ss.borderBottom = `3px ${styleName} red`;
            ss.marginLeft = "5px";
            ss.marginRight = "20px";
            const lbl = mkElt("label", undefined, [inp, eltShow]);
            lbl.style.display = "inline-block";
            return lbl;
        }
        const divBorderStyle = mkElt("div", { id: "jsmind-ednode-div-border-style", class: "specify-border-detail" }, [
            mkAltBorderStyle("solid"),
            mkAltBorderStyle("dotted"),
            mkAltBorderStyle("dashed"),
            mkAltBorderStyle("double"),
        ]);
        divBorderStyle.addEventListener("change", evt => {
            const borderStyle = getCtrlValBorderStyle()
            console.log({ borderStyle });
            currentShapeEtc.border = currentShapeEtc.border || {};
            currentShapeEtc.border.style = borderStyle;
        });

        const divCanBorder = mkElt("div", { class: "if-can-border" }, [
            divSliBorderWidth,
            lblBorderColor,
            divBorderStyle,
        ]);
        const divCannotBorder = mkElt("div", { class: "if-cannot-border" }, [
            mkElt("p", undefined, "Chosen shape can't have a border")
        ]);
        const divBorder = mkElt("div", { id: "jsmind-ednode-border" }, [
            divCanBorder,
            divCannotBorder,
        ]);

        let borderTabwasSetup = false;
        function setupBorderTab() {
            borderTabwasSetup = true;
            addSliBorderWidth();
            if (!sliBorderWidth) return;
            if (borderTabwasSetup) return;
            inpBorderColor.value = initialShapeEtc.border?.color || "black";
            const borderStyle = initialShapeEtc.border?.style;
            divBorder.querySelectorAll("input[name=borderstyle]")
                .forEach(inp => { if (inp.value == borderStyle) inp.checked = true });
        }
        function activateBorderTab() {
            // FIX-ME:
            setupBorderTab();
            const currentShape = currentShapeEtc.shape;
            if (!shapeCanHaveBorder(currentShape)) {
                divBorder.classList.add("cannot-border");
            } else {
                divBorder.classList.remove("cannot-border");
            }
        }


        const jmnodesShapes = mkElt("jmnodes");
        jmnodesShapes.addEventListener("change", evt => {
            console.log({ evt });
            const target = evt.target;
            const tname = target.name;
            if (tname != "shape") throw Error(`evt.target.name != shape (${tname})`);
            const tval = target.value;
            clearShapes(eltCopied);
            if (tval.length == 0) {
                currentShapeEtc.shape = undefined;
            } else {
                eltCopied.classList.add(tval);
                currentShapeEtc.shape = tval;
            }
        });
        if (themeClass) jmnodesShapes.classList.add(themeClass);
        const eltCopiedNoShape = eltCopied.cloneNode(true);
        clearShapes(eltCopiedNoShape);
        // delete eltCopied.style.border;
        eltCopiedNoShape.style.border = null;
        eltCopiedNoShape.style.boxShadow = null;
        eltCopiedNoShape.style.filter = null;

        const desiredW = 60;
        const origW = bcrOrig.width;
        const scaleCopies = desiredW / origW;

        const formShapes = mkElt("form", undefined, jmnodesShapes);
        const divShapes = mkElt("div", { id: "jsmind-ednode-shape" });

        const arrCopiedChildren = [...eltCopied.querySelectorAll("jmnode>[class|=jsmind-renderer-img]")];
        const numCopiedChildren = arrCopiedChildren.length;
        const divChildCoundInfo = mkElt("div", undefined, `Node internal child cound: ${numCopiedChildren}`);
        divShapes.appendChild(divChildCoundInfo);

        divShapes.appendChild(formShapes);

        function mkShapeCopy(shapeClass) {
            const eltCopy4shape = eltCopiedNoShape.cloneNode(true);
            eltCopy4shape.style.position = "relative";
            if (shapeClass) eltCopy4shape.classList.add(shapeClass);
            return eltCopy4shape;
        }
        function mkShapeAlt(shapeClass) {
            const eltCopy4shape = mkShapeCopy(shapeClass);
            const ss = eltCopy4shape.style;
            ss.transformOrigin = "top left";
            ss.scale = scaleCopies;
            const radioVal = shapeClass || "default";
            const inpRadio = mkElt("input", { type: "radio", name: "shape", value: radioVal });
            if (shapeClass) { inpRadio.dataset.shape = shapeClass; }
            const eltLabel = mkElt("label", undefined, [inpRadio, eltCopy4shape])
            return eltLabel;
        }
        let computedStyleCopied;
        let promCompStyleCopied = new Promise(resolve => {
            setTimeout(() => {
                computedStyleCopied = getComputedStyle(eltCopied);
                resolve(computedStyleCopied);
            }, 500);
        })
        setTimeout(() => {
            const bcrCopied = eltCopied.getBoundingClientRect();
            function appendAlt(theAlt) {
                const clipping = mkElt("div", undefined, theAlt);
                const sc = clipping.style;
                sc.width = bcrCopied.width * scaleCopies;
                sc.height = bcrCopied.height * scaleCopies + 30;
                // sc.marginLeft = 10;
                sc.overflow = "clip";
                jmnodesShapes.appendChild(clipping);
            }
            appendAlt(mkShapeAlt());
            arrShapeClasses.forEach(cls => appendAlt(mkShapeAlt(cls)));
            setDialogShapeName(initialShapeEtc.shape);
        }, 500);

        const divThemes = mkElt("div", { id: "jsmind-test-div-themes" });
        const detThemes = mkElt("details", undefined, [
            mkElt("summary", undefined, "Check jsMind themes color contrasts"),
            divThemes
        ]);
        detThemes.style.marginTop = "20px";
        const arrFormThemes = getMatchesInCssRules(/\.(theme-[^.#\s]*)/);
        function mkThemeAlt(cls) {
            return mkElt("jmnodes", { class: cls },
                mkElt("jmnode", undefined, cls.substring(6))
            );
        }
        arrFormThemes.forEach(cls => {
            divThemes.appendChild(mkThemeAlt(cls));
        });
        const modContrast = await import("/src/acc-colors.js");
        setTimeout(() => {
            divThemes.querySelectorAll("jmnode").forEach(jmnode => {
                const s = getComputedStyle(jmnode);
                const fgColor = s.color;
                const bgColor = s.backgroundColor;
                const contrast = modContrast.colorContrast(fgColor, bgColor);
                if (contrast < 7) jmnode.style.outline = "1px dotted red";
                if (contrast < 4.5) jmnode.style.outline = "4px dotted red";
                if (contrast < 3.0) jmnode.style.outline = "6px dotted red";
                if (contrast < 2.5) jmnode.style.outline = "8px dotted red";
                if (contrast < 2.0) jmnode.style.outline = "10px dotted red";
                const fgHex = to6HexColor(fgColor);
                const fgHexCorrect = getCorrectTextColor(bgColor);
                if (fgHex !== fgHexCorrect) {
                    jmnode.style.outlineColor = "black";
                }
                if (contrast < 4.5) {
                    // console.log(jmnode.textContent, { fgColor, bgColor, fgHexCorrect, fgHex, contrast });
                }
            }, 1000);
        })

        const inpBgColor = mkElt("input", { type: "color" });
        const inpFgColor = mkElt("input", { type: "color" });
        promCompStyleCopied.then(style => {
            inpBgColor.value = RGBToHex(style.backgroundColor);
            inpFgColor.value = RGBToHex(style.color);
            checkColorContrast();
        });
        // let bgColorChanged;
        // let fgColorChanged;
        inpBgColor.addEventListener("input", evt => {
            // currentShapeEtc.bgColor = inpBgColor.value;
            currentShapeEtc.temp.bgColor = inpBgColor.value;
            // somethingtosave
            onAnyCtrlChange();
            eltCopied.style.backgroundColor = inpBgColor.value;
            checkColorContrast();
        });
        inpFgColor.addEventListener("input", evt => {
            // currentShapeEtc.fgColor = inpFgColor.value;
            currentShapeEtc.temp.fgColor = inpFgColor.value;
            onAnyCtrlChange();
            eltCopied.style.color = inpFgColor.value;
            checkColorContrast();
        });
        const pContrast = mkElt("p");
        function checkColorContrast() {
            const contrast = modContrast.colorContrast(inpFgColor.value, inpBgColor.value);
            // console.log("checkColorContrast", contrast);
            if (contrast > 4.5) {
                pContrast.textContent = "Color contrast is ok.";
                pContrast.style.color = "";
            } else {
                pContrast.textContent = `Color contrast is low: ${contrast.toFixed(1)}.`;
                pContrast.style.color = "red";
            }
        }
        const styleColors = [
            "display: flex",
            "flex-direction: column",
            "gap: 10px"
        ].join("; ");
        const divColors = mkElt("div", { style: styleColors }, [
            mkElt("label", undefined, ["Background color: ", inpBgColor]),
            mkElt("label", undefined, ["Text color: ", inpFgColor]),
            pContrast
        ]);



        const taTopic = modMdc.mkMDCtextFieldTextarea(undefined, 8, 50);
        taTopic.classList.add("jsmind-ednode-topic");
        taTopic.style.resize = "vertical";
        taTopic.addEventListener("input", evt => {
            currentShapeEtc.temp.topic = taTopic.value;
            eltCopiedTopic.textContent = taTopic.value;
        });
        const tafTopic = modMdc.mkMDCtextareaField("Topic", taTopic, initialTempData.topic);
        modMdc.mkMDCtextareaGrow(tafTopic);
        const divNormalContent = mkElt("div", { class: "normal-content" }, [
            "edit jmnode",
            tafTopic,
        ]);


        const eltCustomLink = mkElt("div", { class: "jsmind-ednode-custom-link" });
        eltCustomLink.addEventListener("click", evt => {
            console.log("goto provider");
            const strCustom = node_copied_data.custom;
            const objCustom = JSON.parse(strCustom);
            showKeyInFc4i(objCustom.key);
        });
        const stCL = eltCustomLink.style;
        stCL.backgroundImage = `url(${this.linkRendererImg})`;
        stCL.width = 100;
        stCL.height = 100;
        const providerName = "fc4i";
        const divCustomContent = mkElt("div", { class: "custom-content" }, [
            mkElt("p", undefined, [
                "This node content is from provider ",
                providerName,
                ". Click the image below to show and edit it:"
            ]),
            eltCustomLink,
        ]);


        const divContent = mkElt("div", { id: "jsmind-ednode-content" }, [
            divNormalContent,
            divCustomContent
        ]);
        if (node_copied_data.custom) { divContent.classList.add("custom-node"); }



        // drop-shadow
        // https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/drop-shadow
        const divSliShadowOffX = mkElt("div");
        const divSliShadowOffY = mkElt("div");
        const divSliShadowBlur = mkElt("div");
        // const divSliShadowSpread = mkElt("div");

        const divShadow = mkElt("div", undefined, [
            mkElt("div", undefined, ["Horizontal offset:", divSliShadowOffX]),
            mkElt("div", undefined, ["Vertical offset:", divSliShadowOffY]),
            mkElt("div", undefined, ["Shadow blur:", divSliShadowBlur]),
            // mkElt("div", undefined, ["Shadow spread:", divSliShadowSpread]),
            mkElt("div", undefined, mkCtrlColor("shadow.color", "red")),
        ]);
        let shadowTabWasSetup = false;
        async function addSliShadowOffX() {
            const eltCont = divSliShadowOffX;
            const title = "Shadow horizontal offset";
            await mkSlider4shapeEtc("shadow.offX", eltCont, -10, 10, 0, 2, title, undefined);
        }
        async function addSliShadowOffY() {
            const eltCont = divSliShadowOffY;
            const title = "Shadow vertical offset";
            await mkSlider4shapeEtc("shadow.offY", eltCont, -10, 10, 0, 2, title, undefined);
        }
        async function addSliShadowBlur() {
            const eltCont = divSliShadowBlur;
            const title = "Shadow blur";
            await mkSlider4shapeEtc("shadow.blur", eltCont, 0, 50, 0, 5, title, undefined);
        }



        /////////////////////////////////////
        // Maybe generalize like below? But it gets a bit complicated...
        function getShapeEtcGrpMbr(strShEtc) {
            const arrShEtc = strShEtc.split(".");
            const grpName = arrShEtc[0];
            const mbrName = arrShEtc[1];
            return { grpName, mbrName }
        }
        function setInShapeEtc(val, pathShEtc, targetShEtc) {
            // let grpName, mbrName;
            // https://javascript.info/destructuring-assignment
            // ({ grpName, mbrName } = getGrpMbr(pathShEtc));
            const { grpName, mbrName } =
                typeof pathShEtc == "string" ? getShapeEtcGrpMbr(pathShEtc) : pathShEtc;
            targetShEtc[grpName] = targetShEtc[grpName] || {};
            const grp = targetShEtc[grpName];
            grp[mbrName] = val;
        }
        function getFromShapeEtc(pathShEtc, sourceShEtc) {
            const { grpName, mbrName } =
                typeof pathShEtc == "string" ? getShapeEtcGrpMbr(pathShEtc) : pathShEtc;
            const grp = sourceShEtc[grpName];
            if (!grp) return;
            return grp[mbrName];
        }



        function mkCtrlColor(pathShEtc, defaultColor) {
            const objShEtc = getShapeEtcGrpMbr(pathShEtc);
            const initColor = getFromShapeEtc(objShEtc, initialShapeEtc) || defaultColor;
            const initHex6 = to6HexColor(initColor);
            const inpColor = mkElt("input", { type: "color", value: initHex6 });
            // const funGrp = onCtrlsGrpChg[objShEtc.grpName];
            inpColor.addEventListener("input", (evt) => {
                console.log("inpColor, input", inpColor.value);
                setInShapeEtc(inpColor.value, objShEtc, currentShapeEtc);
                // setBorderCopied();
                // if (funGrp) funGrp();
            });
            inpColor.addEventListener("change", (evt) => {
                console.log("inpColor, change", inpColor.value);
                // setBorderCopied();
            });
            const lbl = mkElt("label", { class: "specify-border-detail" }, [
                "Color: ", inpColor
            ]);
            return lbl;
        }

        async function mkSlider4shapeEtc(pathShEtc, eltCont, min, max, defaultVal, step, title, funChgThis) {
            const objShEtc = getShapeEtcGrpMbr(pathShEtc);
            const initVal = getFromShapeEtc(objShEtc, initialShapeEtc) || defaultVal;
            let sli = ctrlsSliders[pathShEtc];
            if (sli) return;
            const funChange = () => {
                setInCurrent();
                if (funChgThis) funChgThis();
                const funGrp = onCtrlsGrpChg[objShEtc.grpName];
                onAnyCtrlChange(); // throttle
            }
            function setInCurrent() {
                const mdc = sli?.myMdc;
                const val = mdc?.getValue();
                if (val == undefined) return;
                setInShapeEtc(val, objShEtc, currentShapeEtc);
            }
            sli = await mkSliderInContainer(eltCont, min, max, initVal, step, title, funChange);
            ctrlsSliders[pathShEtc] = sli;
        }
        /////////////////////////////////////

        function setupShadowTab() {
            if (shadowTabWasSetup) return;
            const promBlur = addSliShadowBlur();
            // const promSpread = addSliShadowSpread();
            const promOffX = addSliShadowOffX();
            const promOffY = addSliShadowOffY();
            // if (!(sliShadowOffX && sliShadowOffY && sliShadowBlur)) return;
            shadowTabWasSetup = true;
        }
        function activateShadowTab() {
            console.log("clicked shadow tab");
            setupShadowTab();
        }

        const divThemeChoices = mkElt("div", { id: "theme-choices" });
        const divColorThemes = mkElt("div", undefined, [
            "Themes are for all nodes",
            divThemeChoices,
        ]);
        setupThemeChoices();
        function setupThemeChoices() {
            const arrFormThemes = getMatchesInCssRules(/\.(theme-[^.#\s]*)/);
            function mkThemeAlt(cls) {
                const themeName = cls.substring(6);
                const inpRadio = mkElt("input", { type: "radio", name: "theme", value: cls });
                const eltLbl = mkElt("label", undefined, [inpRadio, themeName]);
                return mkElt("jmnodes", { class: cls },
                    mkElt("jmnode", undefined, eltLbl)
                );
            }
            arrFormThemes.forEach(cls => {
                divThemeChoices.appendChild(mkThemeAlt(cls));
            });
            // https://javascript.info/events-change-input
            divThemeChoices.addEventListener("change", evt => {
                evt.stopPropagation();
                console.log("theme change", evt.target);
            });
            divThemeChoices.addEventListener("input", evt => {
                evt.stopPropagation();
                console.log("theme input", evt.target);
                const theme = evt.target.value;
                setJsmindTheme(jmnodesCopied, theme);
            });
            function setJsmindTheme(eltJmnodes, theme) {
                const strJsmindThemeStart = "theme-"
                if (!theme.startsWith(strJsmindThemeStart)) Error(`${theme} is not a jsmind theme`);
                const arrCls = [...eltJmnodes.classList];
                arrCls.forEach(cls => {
                    if (cls.startsWith(strJsmindThemeStart)) eltJmnodes.classList.remove(cls)
                });
                eltJmnodes.classList.add(theme);
            }

        }


        // console.log("setting up tabs bar", eltCopied);
        // mkMdcTabBarSimple(tabsRecs, contentElts, moreOnActivate) 
        const tabRecs = ["Content", "Shapes", "Border", "Shadow", "Colors", "Themes"];
        const contentElts = mkElt("div", undefined, [divContent, divShapes, divBorder, divShadow, divColors, divColorThemes]);
        if (tabRecs.length != contentElts.childElementCount) throw Error("Tab bar setup number mismatch");
        contentElts.classList.add("tab-elts");
        contentElts.addEventListener("change", evt => {
            console.log("contentElts change", evt.target);
            onAnyCtrlChange(); // throttle
        });
        contentElts.addEventListener("input", evt => {
            console.log("contentElts input", evt.target);
            onAnyCtrlChange(); // throttle
        })
        const onActivateMore = (idx) => {
            // console.log("onActivateMore", idx);
            switch (idx) {
                case 0:
                    break;
                case 1:
                    break;
                case 2:
                    activateBorderTab();
                    break;
                case 3:
                    activateShadowTab();
                    break;
                case 4:
                    break;
                case 5:
                    break;
                default:
                    throw Error(`There is no tab at idx=${idx} `);
            }
        }
        const tabBar = modMdc.mkMdcTabBarSimple(tabRecs, contentElts, onActivateMore);
        const divParts = mkElt("div", undefined, [
            divCopied,
            tabBar,
            contentElts,
            detThemes,
        ])
        const body = mkElt("div", { id: "jsmind-ednode" }, [
            mkElt("h2", undefined, "Edit node"),
            divParts,
        ]);


        // The workaround:
        const thumbSize = "50";
        const style = [
            `width:${thumbSize}px`,
            `height:${thumbSize}px`,
        ].join(";");
        const icon = modMdc.mkMDCicon("resize");
        icon.style.fontSize = `${thumbSize}px`;
        const thumb = mkElt("span", { style }, icon);
        thumb.id = "jsmind-ednode-copied-resizer";
        thumb.title = "Resize";
        // if (confirm("thumb absolute?")) thumb.style.position = "absolute";
        thumb.style.position = "absolute";
        // console.log({ thumb });
        divCopied.appendChild(thumb);
        let bcrC, bcrT;
        let newBcrC;
        thumb.style.visibility = "hidden";
        // thumb.style.display = "none";
        setTimeout(async () => {
            const eltMutations = thumb.parentElement.parentElement.parentElement
            const resMu = await wait4mutations(eltMutations, 500);
            // console.log({ resMu });
            bcrC = eltCopied.getBoundingClientRect();
            bcrT = thumb.getBoundingClientRect();
            // thumb.style.display = "block";
            if (thumb.style.position == "fixed") {
                thumb.style.left = bcrC.left + bcrC.width - bcrT.width / 2 + "px";
                thumb.style.top = bcrC.top + bcrC.height + - bcrT.height / 2 + "px";
            } else if (thumb.style.position == "absolute") {
                // const bcrDiv = divCopied.getBoundingClientRect();
                const bcrJmnodes = jmnodesCopied.getBoundingClientRect();
                thumb.style.left = bcrC.right - bcrT.width / 2 - bcrJmnodes.left + "px";
                thumb.style.top = bcrC.bottom - bcrT.height / 2 - bcrJmnodes.top + "px";
            } else {
                debugger;
            }
            thumb.style.visibility = "visible";
            newBcrC = eltCopied.getBoundingClientRect();
        },
            // 100 - too small, strange things happens!
            // 500
            1
        );

        let thumbShiftX, thumbShiftY;
        let thumbStartX, thumbStartY;
        function onThumbDown(evts) {
            console.log("onThumbDown", { evts });
            evts.preventDefault(); // prevent selection start (browser action)

            const bcrThumb = thumb.getBoundingClientRect();
            bcrC = eltCopied.getBoundingClientRect();
            const evt = evts[0] || evts;
            thumbStartX = evt.clientX;
            thumbStartY = evt.clientY;
            thumbShiftX = thumbStartX - bcrThumb.left;
            thumbShiftY = thumbStartY - bcrThumb.top;

            thumb.setPointerCapture(evts.pointerId);
            thumb.onpointermove = onThumbMove;
            thumb.onpointerup = evts => {
                console.log("onpointerup", { evts });
                thumb.onpointermove = null;
                thumb.onpointerup = null;
                newBcrC = eltCopied.getBoundingClientRect();
                currentTempData.width = newBcrC.width;
                currentTempData.height = newBcrC.height;
                // FIX-ME: check somethingtosave
                // somethingToSave();
                onAnyCtrlChange();
            }
        };

        let n = 0;
        function onThumbMove(evts) {
            const target = evts.target;
            const evt = evts[0] || evts;
            const nowX = evt.clientX;
            const nowY = evt.clientY;
            if (thumb.style.position == "fixed") {
                thumb.style.left = nowX - thumbShiftX + 'px';
                thumb.style.top = nowY - thumbShiftY + 'px';
            } else if (thumb.style.position == "absolute") {
                // const bcrDiv = divCopied.getBoundingClientRect();
                const bcrJmnodes = jmnodesCopied.getBoundingClientRect();
                thumb.style.left = nowX - thumbShiftX - bcrJmnodes.left + 'px';
                thumb.style.top = nowY - thumbShiftY - bcrJmnodes.top + 'px';
            } else {
                debugger;
            }
            const diffLeft = nowX - thumbStartX;
            const diffTop = nowY - thumbStartY;
            // return;
            eltCopied.style.width = bcrC.width + diffLeft + "px";
            eltCopied.style.height = bcrC.height + diffTop + "px";
        };

        thumb.onpointerdown = onThumbDown;
        thumb.ondragstart = () => false;



        // Getters and setters for dialog input values
        function setDialogShapeName(shapeName) {
            const inpShape = divShapes.querySelector(`input[name=shape][value=${shapeName}]`);
            if (inpShape) inpShape.checked = true;
        }



        /////////// Shadow


        /////////// Border

        // let initValSliBorderWidth;
        function getCtrlValBorderWidth(val) {
            // FIX-ME:
            const mdc = sliBorderWidth?.myMdc;
            return mdc?.getValue();
        }

        function getCtrlValBorderStyle() {
            return divBorderStyle.querySelector("[name=borderstyle]:checked").value;
        }

        function getCtrlValBorderColor(val) {
            return inpBorderColor.value;
        }


        function getCtrlValShadowBlur() {
            const mdc = sliShadowBlur?.myMdc;
            return mdc?.getValue();
        }
        function onCtrlsChgShadow() {
            // const b = getCtrlValShadowBlur();
            const b = getFromShapeEtc("shadow.blur", currentShapeEtc) || 0;
            if (b <= 0) { eltCopied.style.filter = "none"; return; }
            const s = getFromShapeEtc("shadow.spread", currentShapeEtc) || 0;
            const x = getFromShapeEtc("shadow.offX", currentShapeEtc) || 0;
            const y = getFromShapeEtc("shadow.offY", currentShapeEtc) || 0;
            if (isNaN(b) || isNaN(x) || isNaN(y)) {
                console.error("Some shadow val is not set yet");
                return;
            }
            const c = getFromShapeEtc("shadow.color", currentShapeEtc) || "red";
            eltCopied.style.filter = `drop-shadow(${x}px ${y}px ${b}px ${s}px ${c})`;
        }

        let btnSave;
        function getBtnSave() {
            if (btnSave) return btnSave;
            // const contBtns = body.querySelector(".mdc-dialog__actions");
            const contBtns = body.closest(".mdc-dialog__surface").querySelector(".mdc-dialog__actions");
            // FIX-ME: Should be the first?
            btnSave = contBtns.querySelector("button");
            if (btnSave.textContent != "save") throw Error("Did not find the save button");
            return btnSave;
        }
        function setStateBtnSave() {
            const btn = getBtnSave();
            if (!btn) return;
            btn.disabled = !somethingToSave();
        }
        const throttleStateBtnSave = throttleTO(setStateBtnSave, 300);
        function requestSetStateBtnSave() { throttleStateBtnSave(); }
        requestSetStateBtnSave();


        const save = await modMdc.mkMDCdialogConfirm(body, "save", "cancel");
        console.log({ save });
        if (save) {
            if (!somethingToSave()) throw Error("Save button enabled but nothing to save?");

            // FIX-ME: temp
            const currTemp = currentShapeEtc.temp;
            const initTemp = initialShapeEtc.temp;
            delete currentShapeEtc.temp;
            node_copied_data.shapeEtc = currentShapeEtc;

            const sameTopic = currTemp.topic == initTemp.topic;
            if (!sameTopic) {
                this.THEjmDisplayed.update_node(node_ID_copied, currTemp.topic);
            }

            const sameW = currTemp.width == initTemp.width;
            const sameH = currTemp.height == initTemp.height;
            console.log({ currTemp, initTemp, sameW, sameH });
            if (!sameW || !sameH) {
                this.THEjmDisplayed.set_node_background_image(node_ID_copied, undefined, currTemp.width, currTemp.height);
                delete currTemp.width;
                delete currTemp.height;
            }
            console.log({ currTemp });

            setTimeout(() => {
                // FIX-ME: set size once again to trigger a reflow. (Bug in jsMind.)
                this.THEjmDisplayed.set_node_background_image(node_ID_copied, undefined, currTemp.width, currTemp.height);
                this.updateJmnodeFromCustom(eltJmnode);
                applyNodeShapeEtc(node_copied, eltJmnode);
            }, 1100);


            const sameFgColor = currTemp.fgColor == initTemp.fgColor;
            const sameBgColor = currTemp.bgColor == initTemp.bgColor;
            if (!sameFgColor || !sameBgColor) {
                this.THEjmDisplayed.set_node_color(node_ID_copied, currTemp.bgColor, currTemp.fgColor);
            }

            DBsaveThisMindmap(this.THEjmDisplayed);
            this.updateJmnodeFromCustom(eltJmnode);
        }
    }
    jmnodeDblclick = (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        const target = evt.target;
        let eltJmnode = target;
        const tn = target.tagName;
        if (tn !== "JMNODE") { eltJmnode = target.closest("jmnode"); }
        this.editNodeDialog(eltJmnode);
    }
}


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
function OLDgetJmnodesMirror() { return getJmnodesIn(idDivJmnodesMirror); }


// https://medium.com/codex/throttling-in-javascript-649375f6b9f
// https://garden.bradwoods.io/notes/javascript/performance/debounce-throttle
function throttleTO(fn, msDelay) {
    let timeoutId;
    return function (...args) {
        if (timeoutId) {
            return;
        }
        timeoutId = setTimeout(() => {
            fn(...args);
            console.log("throttleTO(fn, delay)");
            timeoutId = null;
        }, msDelay);
    }
}
function throttleRA(fn) {
    let requestId;
    return function (...args) {
        if (requestId) {
            return;
        }
        requestId = requestAnimationFrame(() => {
            fn(...args);
            requestId = null;
        });
    }
}

function debounce(callback, waitMS = 200) {
    let timeoutId;

    return function (...args) {
        const context = this
        clearTimeout(timeoutId);

        timeoutId = setTimeout(function () {
            timeoutId = null
            callback.call(context, ...args)
        }, waitMS);
    };
};


// https://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
// https://developer.mozilla.org/en-US/docs/Glossary/Truthy
function isDisplayedJq(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}
function isDisplayedOffsetParent(el) {
    // return (!!el.offsetParent === null)
    return (!!el.offsetParent);
}
function isDisplayedStyle(el) {
    var style = window.getComputedStyle(el);
    return (style.display !== 'none')
}
function isDisplayedRoot(el) {
    return !!el.closest(":root");
}

async function AddBeforeWhenContainerIsDisplayed(eltContainer, eltNew, eltBefore, msMaxWait) {
    msMaxWait = msMaxWait || 1000;
    const elapsed = await waitUntilDisplayed(eltContainer, msMaxWait);
    console.log("AddMdcSliderBefore, elapsed", elapsed, eltContainer, eltNew, eltBefore, msMaxWait);
    if (elapsed < 0) return;
    eltContainer.insertBefore(eltNew, eltBefore);
}


async function waitUntilDisplayed(elt, msMax) {
    const isDisplayed = () => {
        const dispJq = isDisplayedJq(elt);
        const dispOP = isDisplayedOffsetParent(elt);
        const dispSt = isDisplayedStyle(elt);
        const dispRt = isDisplayedRoot(elt);
        // console.log("wud", { dispJq, dispOP, dispSt, dispRt });
        return dispJq && dispOP && dispSt && dispRt;
    };
    if (isDisplayed()) return 0;
    const startAt = Date.now();
    let n = 0;
    return new Promise((resolve, reject) => {
        function tryAgain() {
            if (++n > 100) reject(`${n} > 100`);
            const finAt = Date.now();
            const elapsed = finAt - startAt;
            const disp = isDisplayed();
            if (disp) {
                console.log("resolve", elapsed,)
                resolve(elapsed);
                return;
            }
            if (elapsed > msMax) {
                console.error(`Time out ${elapsed} (${msMax}) ms waiting for elt displayed`, elt);
                console.warn(`Time out ${elapsed} (${msMax}) ms waiting for elt displayed`);
                resolve(-elapsed);
                return;
            }
            setTimeout(tryAgain, 200);
        }
        tryAgain();
    });
}

function showKeyInFc4i(keyFc4i) {
    const encodedKey = decodeURIComponent(keyFc4i);
    const url = `${location.protocol}//${location.host}/share.html?showkey=${encodedKey}`;
    location.href = url;
}
