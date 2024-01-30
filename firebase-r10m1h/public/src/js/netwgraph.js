import("pwa");

// https://stackoverflow.com/questions/50360821/how-do-i-influence-link-distance-in-3d-force-graph
// https://stackoverflow.com/questions/60072100/3d-force-graph-and-three-js-add-geometric-glow-atmospheric-material-simple
// https://stackoverflow.com/questions/75798624/d3-force-graph-zoom-to-node
// https://github.com/jackyzha0/quartz

/// >>>> debug
// running async here...
window.getDeb = () => {
    window.g = graph;
    window.camera = g.camera;
    console.log("%cDEBUG after set", "background:red; color:black; font-size:1.6rem;", { g, camera });
}

let cameraBase;
// https://stackoverflow.com/questions/69914793/three-js-rotate-around-axis-at-an-absoulte-angle
window.rotateMe = () => {
    if (!window.g) window.getDeb();
    // const vector = new THREE.Vector4(0, 0, 300);
    let az;
    // az = +prompt("az", az);
    // console.log({ az, vector });
    // const useCameraPosition = confirm("Use cameraPosition")) {
    let useCameraPosition = true;
    debugger;
    if (useCameraPosition) {
        const rotz = (new THREE.Matrix4).makeRotationZ(az);
        // const rotz = (new THREE.Matrix4).makeRotationZ(0.33 * Math.PI);
        const rotx = (new THREE.Matrix4).makeRotationX(0);
        const roty = (new THREE.Matrix4).makeRotationX(0);
        const rotmat = rotx.multiply(roty).multiply(rotx).multiply(rotz);
        // vector.applyMatrix4(rotz);
        vector.applyMatrix4(rotmat);
        g.cameraPosition(vector);
    } else {

        // https://stackoverflow.com/questions/66750786/update-camera-position-based-on-rotation-three-js
        //x <- left/right  y <- up/down  z <- forward backward
        // const vector = new Vector(x, y, z);
        // const vector = new THREE.Vector4(0, 0, 300);
        // const vector = new THREE.Vector4(0, 0, 0);
        // const rotz = (new THREE.Matrix4).makeRotationZ(az);
        // const rotx = (new THREE.Matrix4).makeRotationX(0);
        // const roty = (new THREE.Matrix4).makeRotationX(0);

        //make matrices
        // const rotx = (new THREE.Matrix4).makeRotationX(camera.rotation.x);
        // const roty = (new THREE.Matrix4).makeRotationY(camera.rotation.y);
        // const rotz = (new THREE.Matrix4).makeRotationZ(camera.rotation.z);

        //multiply all matrices together
        // const rotmat = rotx.multiply(roty).multiply(rotx).multiply(rotz);
        // const rotmat = rotz;

        //multiply vector by matrix
        // vector.applyMatrix4(rotmat);

        //finally add the vector to position
        // camera().position.add(vector);
        // camera().position.set(vector);
        // camera().rotation.set(vector);

        if (!cameraBase) {
            cameraBase = new THREE.Object3D();
            cameraBase.position.set(0, 0, 0);
            cameraBase.add(camera());
            scene.add(cameraBase);
            window.cameraBase = cameraBase;
        }
        console.log("BEFORE", camera().rotation, cameraBase.rotation);
        // camera().rotation.z = az;
        az = -camera().rotation.z;
        console.log("set az", az);
        cameraBase.rotation.z = az;
        console.log("AFTER", camera().rotation, cameraBase.rotation);
    }
    // https://stackoverflow.com/questions/65823815/threejs-rotating-the-camera-by-90-degrees-not-objects
    g.renderer().render(scene, camera());
    console.log("RENDER", camera().rotation, cameraBase.rotation);
}
/// <<<< debug

const menuId = "menu-right";
const buildFrom = {};

const modMdc = await import("util-mdc");
// export function setMaterialIconClass(className) {
modMdc.setMaterialIconClass("material-symbols-outlined");

console.warn("import d3");
const modD3 = await import("d3");
const dbFc4i = await import("db-fc4i");

// FIX-ME: Note the order of import. Something is wrong.
/*
await import("three");
console.log({ __THREE__ });
await import("three-spritetext");
console.log({ __THREE__ });
const mod3d = await import("mod3d-force-graph");
console.log({ __THREE__ });
// debugger;
*/


// FIX-ME: move
const divLinkSettingsstyle = `
    display: grid;
    grid-template-columns: max-content max-content;
    gap: 5px;
`;



class LocalSetting {
    #key; #defaultValue; #onInputFun;
    constructor(prefix, key, defaultValue) {
        this.#key = prefix + key;
        this.#defaultValue = defaultValue;
    }
    set value(val) {
        // localStorage.setItem(this.#key, val);
        localStorage.setItem(this.#key, val.toString());
    }
    get value() {
        const stored = localStorage.getItem(this.#key);
        if (stored == null) { return this.#defaultValue; }
        const defValType = typeof this.#defaultValue;
        if ("string" === defValType) { return stored; }
        if ("number" === defValType) { return +stored; }
        if ("boolean" === defValType) {
            switch (stored) {
                case "true": return true;
                case "false": return false;
                default:
                    throw Error(`String does not match boolean: ${stored}`);
            }
        }
        throw Error(`Can't handle default value type: ${defValType}`);
        return stored;
    }
    get defaultValue() {
        return this.#defaultValue;
    }
    bindToInput(inp) {
        switch (inp.type) {
            case "checkbox":
                inp.checked = this.value;
            default:
                // console.log(inp.type);
                inp.value = this.value;
        }
        const handleInput = (evt) => {
            let val;
            switch (inp.type) {
                case "checkbox":
                    val = inp.checked;
                    break;
                default:
                    console.log(inp.type);
                    val = inp.value;
            }
            console.log({ inp, evt, val });
            this.value = val;
            if (this.#onInputFun) {
                this.#onInputFun(val);
            } else {
                console.warn("No #onInputFun");
            }
        }
        inp.addEventListener("input", evt => {
            handleInput(evt);
        });
    }
    set onInputFun(fun) {
        if ("function" != typeof fun) throw Error(`fun is not function: ${typeof fun}`);
        if (1 != fun.length) throw Error(`fun should take one parameter: ${fun.length}`);
        this.#onInputFun = debounce(fun, 1000);
    }
}

class settingNetwG extends LocalSetting {
    constructor(key, defaultValue) {
        super("netwg-", key, defaultValue);
    }
}


const settingLinkW = new settingNetwG("linkW", 1);
let linkW = settingLinkW.value;
settingLinkW.onInputFun = (val) => linkW = val;

const settingLinkWHi = new settingNetwG("linkWHi", 1);
let linkWHi = settingLinkWHi.value;
settingLinkWHi.onInputFun = (val) => linkWHi = val;

const settingLinkOp = new settingNetwG("linkOp", 0.2);
let linkOp = settingLinkOp.value;
settingLinkOp.onInputFun = (val) => {
    console.log("linkOp = val", val);
    linkOp = val;
};

const settingLinkOpHi = new settingNetwG("linkOpHi", 0.2);
let linkOpHi = settingLinkOp.value;
settingLinkOpHi.onInputFun = (val) => {
    // mkMDCsnackbar(msg, msTimeout, buttons)
    modMdc.mkMDCsnackbar(`linkOpHi=${val}`);
    linkOpHi = val;
}



const settingLinkColor = new settingNetwG("linkColor", "#ffff00");
let linkColor = settingLinkColor.value;
settingLinkColor.onInputFun = (val) => linkColor = val;

const settingLinkColorHi = new settingNetwG("linkColorHi", "#ff0000");
let linkColorHi = settingLinkColorHi.value;
settingLinkColorHi.onInputFun = (val) => linkColorHi = val;



const settingHiHover = new settingNetwG("hi-hover", true);
let boolHiHover = settingHiHover.value;
settingHiHover.onInputFun = (val) => boolHiHover = val;

const settingHiDrag = new settingNetwG("hi-drag", true);
let boolHiDrag = settingHiDrag.value;
settingHiDrag.onInputFun = (val) => boolHiDrag = val;


const secondsBottom = 0.5;
// let secondsBottom = 3;


const maxNodeTextLines = 4;
const maxNodeTextWidth = 12;
const textH = 3;

let cameraDistance = 100;
// let disemvowel = false;
const colorsRainbow =
    "violet, deepskyblue, cyan, greenyellow, yellow, orange, red".split(",").map(c => c.trim());

// await dialogGraph();


let graph;
let gData;
let gDataUsed;
let showCube = false;
let imagesMode = false;
const setInvisibleTags = new Set();
const setHighlightNodes = new Set();
const setHighlightLinks = new Set();
let theHiliteNode = null;
let hilightOnNodeClick = false;
let theCube;
let theCubeSize = 1000;


async function loadGraphFromJson(gDataUsed) {
    const links4json = gDataUsed.links4json;
    const nodes4json = gDataUsed.nodes4json;
    /*
    // Note: This changes usedLinks!
    const links4json = usedLinks.map(l => {
        const t = l.tags;
        const tArr = [...t];
        l.arrTags = tArr;
        delete l.tags;
        delete l.text;
        return l;
    });
    const nodes4json = nodes.map(n => {
        const newN = { id: n.fc4i.id, fc4ikey: n.fc4i.r.key };
        console.log({ n, newN });
        return newN;
    });
    */
    const arrProm = [];
    const nodesProm = nodes4json.map(async n => {
        const key = n.fc4ikey;
        const rProm = dbFc4i.getDbKey(key);
        arrProm.push(rProm);
        const r = await rProm;
        n.fc4i = {};
        n.fc4i.r = r;
        return n;
    });
    // await Promise.all(arrProm);
    const nodes = await Promise.all(nodesProm);
    const links = links4json.map(l => {
        l.tags = new Set(l.arrTags)
        l.text = l.arrTags.join("\n");
        return l;
    });

    const gData = { nodes, links };

    modMdc.mkMDCsnackbar("Not ready");
    pendingRedrawGraph = false;
    graph?._destructor();
    const eltGraph = document.getElementById("the3d-graph-container");
    eltGraph.textContent = "";
    await testMyOwn(gData);
}
async function loadSavedView(strJsonSaved) {
    const jsonSaved = JSON.parse(strJsonSaved);
    console.log({ strJson: strJsonSaved, jsonSaved });
    const gDataUsed = jsonSaved.gDataUsed;
    await loadGraphFromJson(gDataUsed);
    const eltGraph = document.getElementById("the3d-graph-container");
    await wait4mutations(eltGraph, 200);
    setImagesMode(jsonSaved.imagesMode);
    setCubeMode(jsonSaved.showCube);
    // btnHome
    const obj = graph.camera();
    obj.matrix.copy(jsonSaved.oldMatrix);
    obj.matrix.decompose(obj.position, obj.quaternion, obj.scale);
}

let arrMatchAll;
let numFc4i;
let requiredTags;
const setRequiredTags = new Set();
let minConf;
let maxConf;
let searchFor;
const setLinkTags = new Set();
const setNoLinkTags = new Set();
const setUsedLinkTags = new Set();
const setActuallyUsedLinkTags = new Set();
let prelNodes;
let numNodes;
let sourceName;

const setManExclTags = new Set();
let pendingRedrawGraph = false;

let focusOnNodeClick = false;
let showInfoOnNodeClick = false;
let theBtnFocusNode;

// addDialogGraphButtons();
await getFc4iRecs();
await chooseView();
addDialogGraphButtons();


async function getFc4iRecs() {
    if (arrMatchAll) return;
    const sp = new URLSearchParams(location.search);

    const parSearchFor = sp.get("searchFor");
    searchFor = parSearchFor === null ? "" : parSearchFor;

    const parRequiredTags = sp.get("requiredTags");
    // requiredTags = parRequiredTags === null ? [] : parRequiredTags.split(",");
    if (parRequiredTags === null) {
        requiredTags = [];
    } else if (parRequiredTags === "") {
        requiredTags = [];
    } else {
        requiredTags = parRequiredTags.split(",");
    }
    requiredTags.forEach(t => setRequiredTags.add(t));

    const parMinConf = sp.get("minConf");
    minConf = parMinConf === null ? 0 : +parMinConf;
    const parMaxConf = sp.get("maxConf");
    maxConf = parMaxConf === null ? 7 : +parMaxConf;

    // function getDbMatching(searchFor, minConf, maxConf, requiredTags)
    arrMatchAll = await dbFc4i.getDbMatching(searchFor, minConf, maxConf, requiredTags);
    numFc4i = arrMatchAll.length;
}
function buildDivTags() {
    const spanSearchFor = mkElt("span", undefined, `Search: "${searchFor}",`);
    spanSearchFor.style.paddingRight = "10px";
    const spanConf = mkElt("span", undefined, `confidence: ${minConf}-${maxConf}`);
    spanConf.style.paddingRight = "10px";

    const divSearchEtc = mkElt("div", undefined, [spanSearchFor, spanConf]);
    divSearchEtc.style = `
        display: flex;
        gap: 5px;
        padding: 0 5px;
    `;

    const divSelectTags = mkElt("div", { id: "select-tags" });
    divSelectTags.style = `
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        padding: 5px;
    `;

    // https://keithjgrant.com/posts/2023/04/transitioning-to-height-auto/
    const divTags = document.getElementById("netwg-tags");
    // divTags.classList.add("expanding-wrapper-h");
    const divTagsInner = mkElt("div", undefined, [
        divSearchEtc,
        divSelectTags,
    ]);
    // divTagsInner.classList.add("expanding-inner");
    divTags.appendChild(divTagsInner);
    makeExpandible(divTags, "h");



    requiredTags.forEach(tag => {
        const elt = mkElt("span", { class: "tag-in-our-tags" }, [`#${tag}`]);
        elt.style.filter = "grayscale(1)";
        divSearchEtc.appendChild(elt);
    });
    // [...setUsedLinkTags]
    // [...setLinkTags]
    [...setActuallyUsedLinkTags]
        .sort().forEach(tag => {
            const elt = mkEltTagSelector(tag);
            divSelectTags.appendChild(elt);
        });

    /*
    divSelection.addEventListener("NOclick", evt => {
        const target = evt.target;
        console.log({ evt, target });
        if ("INPUT" != target.tagName) return;
        if ("checkbox" != target.type) return;
        console.log("CHECKBOX!!!");
        const eltCont = target.closest("#netwg-tags");
        const arrChk = [...eltCont.querySelectorAll("input[type=checkbox]")];
        const arrTagsNoLink = arrChk
            .filter(chk => !chk.checked)
            .map(elt => elt.parentElement.textContent.slice(1));
        setNoLinkTags.clear();
        arrTagsNoLink.forEach(t => setNoLinkTags.add(t));
        console.log({ setNoLinkTags });

        // FIX-ME: delay redraw until the select tags div is closed
        // redrawGraph();
        pendingRedrawGraph = true;
    });
    */
}

function OLDgetManuallyExcludedTags() {
    debugger;
    const divCont = document.getElementById("select-tags");
    const chips = divCont
        .querySelectorAll(".tag-selector .chip-tags .chip-tag-selected");
    const arrManExcl = [...chips].filter(c => c.textContent == "delete")
    const tags = arrManExcl.map(btn => {
        const ts = btn.closest(".tag-selector");
        const lbl = ts.firstElementChild;
        const tn = lbl.tagName;
        if (tn != "LABEL") throw Error(`Expected LABEL, got ${tn}`);
        return lbl.textContent.slice(1);
    });
    setManExclTags.clear();
    tags.forEach(t => setManExclTags.add(t));
    // debugger;
}

function redrawGraph() {
    pendingRedrawGraph = false;
    graph._destructor();
    const eltGraph = document.getElementById("the3d-graph-container");
    eltGraph.textContent = "";
    computeNodesAndLinks();
    testMyOwn(gData);
}

function mkEltTagSelector(tag) {
    const eltLabel = mkElt("label", { class: "tag-chk" }, [`#${tag}`,]);
    const eltTagSelector = mkElt("span", { class: "tag-selector" }, [eltLabel]);
    const eltChips = mkElt("span");
    eltChips.classList.add("chip-tags");
    function mkChip(iconName, ariaLabel) {
        // const btn = modMdc.mkMDCiconButton(iconName, ariaLabel, chipFontSize);
        const btn = modMdc.mkMDCiconButton(iconName, ariaLabel);
        btn.classList.add("icon-button-30");
        btn.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            const target = evt.target;
            console.log({ target, iconName });
            // if (await selectChipAction(iconName))
            if (await selectChipAction(btn.textContent)) {
                // selectChip(iconName);
                toggleChipBtnStateDefault(btn);
            }
        }));
        btn.classList.add("chip-tag");
        return btn;
    }
    function addChip(iconNameDefault, iconNameAltState, ariaLabel) {
        const btn = mkChip(iconNameDefault, ariaLabel);
        btn.iconNameDefault = iconNameDefault;
        btn.iconNameAltState = iconNameAltState;
        btn.classList.add("chip-default-state");
        eltChips.appendChild(btn);
        return btn;
    }
    function setChipBtnState(btn, stateDefault) {
        btn.lastChild.remove();
        const newState = stateDefault ? btn.iconNameDefault : btn.iconNameAltState;
        btn.appendChild(document.createTextNode(newState));
        if (stateDefault) {
            btn.classList.add("chip-default-state");
        } else {
            btn.classList.remove("chip-default-state");
        }
    }
    function isChipBtnStateDefault(btn) {
        return btn.textContent == btn.iconNameDefault;
    }
    function toggleChipBtnStateDefault(btn) {
        const isDefault = isChipBtnStateDefault(btn);
        setChipBtnState(btn, !isDefault);
    }
    function selectChip(iconName) {
        /*
        [...eltChips.querySelectorAll(".chip-tag")]
            .forEach(elt => {
                elt.classList.remove("chip-tag-selected");
                if (elt.textContent == iconName) {
                    elt.classList.add("chip-tag-selected");
                }
            });
        */
        // selectedChip = iconName;
    }
    let btnVisible;
    let btnInclude;
    async function selectChipAction(currentState) {
        // if (selectedChip == iconName) return;
        let needLinksUpdate = false;
        let needRedraw = false;
        switch (currentState) {
            case "visibility":
                setInvisibleTags.add(tag);
                needLinksUpdate = true;
                break;
            case "visibility_off":
                setInvisibleTags.delete(tag);
                needLinksUpdate = true;
                break;
            case "check_box":
            case "check_box_outline_blank":
                // setInvisibleTags.delete(tag);
                needRedraw = true;
                break;
            default:
                throw Error(`Unexpected iconName: ${currentState}`);

        }
        if (needRedraw) {
            const ans = await modMdc.mkMDCdialogConfirm("This will redraw the graph and change perspektive, et.");
            if (!ans) return false;
        }
        if (needLinksUpdate) triggerUpdateLinksView();
        if (needRedraw) {
            console.log({ eltTagSelector, btnInclude });
            modMdc.mkMDCsnackbar("Will redraw graph");
            if (btnInclude.textContent == "check_box") {
                setManExclTags.add(tag);
                eltTagSelector.classList.add("manually-excluded");
                // selectedChip
            } else {
                setManExclTags.delete(tag);
                eltTagSelector.classList.remove("manually-excluded");
            }
            // getManuallyExcludedTags();
            // debugger;
            // redrawGraph();
            pendingRedrawGraph = true;
        }
        return true;
    }

    btnVisible = addChip("visibility", "visibility_off", "Show/hide with these links");
    // addChip("visibility_off", "Hide these links");
    // addChip("delete", "Redraw with/without these links");
    btnInclude = addChip("check_box", "check_box_outline_blank", "Redraw with/without these links");
    // selectChip("visibility");
    /*
    const eltChips = mkElt("span", undefined, [
        // "(",
        eltInclude,
        eltHidden,
        btnRemove,
        // ")",
    ])
    */
    eltTagSelector.appendChild(eltChips);
    return eltTagSelector;
}


async function getNodesAndLinks(
    // numNodes, sourceName
) {

    switch (sourceName) {
        case "random":
            randomGraph();
            break;
        case "fc4i":
            await fc4iGraph();
            break;
        default:
            throw Error(`Unknown source name: ${sourceName}`);
    }
    async function fc4iGraph() {
        // await getFc4iRecs();
        const arrMatch = arrMatchAll.filter(r => r.tags && r.tags.length > 0);
        const lenMatch = arrMatch.length;
        const setI = new Set();
        let s = 0;
        const n = 2;
        while (s++ < 2 * n * numNodes && setI.size < n * numNodes)
        // while (s++ < 4 * lenMatch && setI.size < n * numNodes)
        {
            const i = Math.floor(Math.random() * lenMatch);
            setI.add(i);
        }
        const arrUse = [...setI].map(i => arrMatch[i]).filter(r => r.tags);
        buildFrom.arrUse = arrUse;
        buildFrom.requiredTags = requiredTags;
        buildFrom.arrUse.forEach(r => {
            // console.log(r);
            // if (!r.tags) return;
            if (!r.tags) {
                console.error("No tags", r);
                throw Error(`No tags`);
            }
            r.tags.forEach(t => setLinkTags.add(t));
        });
        buildFrom.requiredTags.forEach(t => { setLinkTags.delete(t); });


        function getPrelNodes() {
            let nodeNum = 0;
            const nodesR = arrUse.map(r => ({ id: nodeNum++, r }));
            const nodes = nodesR.map(r => ({ id: r.id, fc4i: r }));
            return { nodesR, nodes }
        }
        // const prelNodes = { nodesR, nodes }
        prelNodes = getPrelNodes();

        computeNodesAndLinks();
    }
    function randomGraph() {
        // Random tree
        const nodes = [...Array(numNodes).keys()].map(i => ({ id: i }));
        const links = [...Array(numNodes).keys()]
            .filter(id => id)
            .map(id => ({
                source: id,
                target: Math.round(Math.random() * (id - 1))
            }));
        console.log("got nodes and links");
        gData = { nodes, links }
    }
}
function computeNodesAndLinks() {
    const links = [];
    const linksByKey = {};
    const setExclTags = new Set(setManExclTags);
    setExclTags.forEach(t => setNoLinkTags.add(t));
    setUsedLinkTags.clear();
    // setActuallyUsedLinkTags.clear();
    setLinkTags.forEach(t => {
        // if (setNoLinkTags.has(t)) {
        if (setExclTags.has(t)) {
            console.log("no link for ", t);
            return;
        }
        const arrT = [];
        prelNodes.nodesR.forEach(n => {
            if (n.r.tags.includes(t)) { arrT.push(n) }
        });
        while (arrT.length > 0) {
            const a0 = arrT.pop();
            arrT.forEach(r => {
                const linkKey = `${a0.id - r.id}`;
                const oldLink = linksByKey[linkKey];
                if (!oldLink) {
                    setUsedLinkTags.add(t);
                    const tagSet = new Set();
                    tagSet.add(t);
                    const link = {
                        source: a0.id,
                        target: r.id,
                        // text: t,
                        tags: tagSet
                    }
                    linksByKey[linkKey] = link;
                    // links.push(link);
                } else {
                    oldLink.tags.add(t);
                }
            });
        }
    });
    links.push(...Object.values(linksByKey));
    links.forEach(link => { link.text = [...link.tags].join("\n"); });
    // const setLinked = new Set();
    let setLinked;
    const subsetsLinked = [];
    links.forEach(l => {
        if (setLinked) return;
        const src = l.source;
        const trg = l.target;
        // setLinked.add(l.source);
        // setLinked.add(l.target);
        if (subsetsLinked.length == 0) {
            const ns = new Set();
            subsetsLinked[0] = ns;
            ns.add(src);
            ns.add(trg);
            if (numNodes == 2) {
                setLinked = ns;
                return;
            }
        } else {
            let foundSet = false;
            for (let iSet = 0, len = subsetsLinked.length; iSet < len; iSet++) {
                const s = subsetsLinked[iSet];
                if (s.has(src) || s.has(trg)) {
                    s.add(src); s.add(trg);
                    foundSet = true;
                    if (s.size >= numNodes) {
                        setLinked = s;
                        break;
                    }
                }
            }
            if (!foundSet) {
                const ns = new Set();
                subsetsLinked[subsetsLinked.length] = ns;
                ns.add(src); ns.add(trg);
            }
        }
    });
    // FIX-ME: Merge subsets
    console.log({ setLinked });
    setLinked = setLinked || subsetsLinked[0];
    // Remove links not used
    const usedLinks = links.filter(link => {
        if (!setLinked.has(link.source)) return false;
        if (!setLinked.has(link.target)) return false;
        return true;
    });
    console.log({ links, setLinked, usedLinks });
    if (usedLinks.length == 0) debugger;

    const nodes = prelNodes.nodes.filter(n => setLinked.has(n.id));

    const numFinNodes = nodes.length;
    const eltShowFc4i = document.getElementById("show-fc4i-num");
    eltShowFc4i.textContent = `, fc4i: ${numFinNodes} (${numFc4i})`;

    // gData = { nodes, links };
    gData = { nodes, links: usedLinks };
    // https://www.javascripttutorial.net/object/3-ways-to-copy-objects-in-javascript/
    // const gDataSpread = { ...gData };
    // gDataUsed = gDataSpread;
    if (gData.nodes[0].__threeObj) {
        debugger;
        throw Error("gData nodes have __threeObj");
    }
    setActuallyUsedLinkTags.clear();
    usedLinks.forEach(l => {
        l.tags.forEach(t => setActuallyUsedLinkTags.add(t));
    });

    // Note: This changes usedLinks!
    const links4json = usedLinks.map(l => {
        const t = l.tags;
        const tArr = [...t];
        l.arrTags = tArr;
        delete l.tags;
        delete l.text;
        return l;
    });
    const nodes4json = nodes.map(n => {
        const newN = { id: n.fc4i.id, fc4ikey: n.fc4i.r.key };
        console.log({ n, newN });
        return newN;
    });
    const gData4json = { nodes4json, links4json };
    const gDataJson = JSON.parse(JSON.stringify(gData4json));
    gDataUsed = gDataJson;


}

async function chooseView() {

    function mkViewAlt(txt, fun) {
        const eltRad = mkElt("input", { type: "radio", name: "view-alt" });
        eltRad.altFun = fun;
        const txtFun = fun.name;
        const lbl = mkElt("label", undefined, [eltRad, txtFun]);
        return mkElt("p", undefined, lbl);
    }

    const divAlts = mkElt("div", undefined, [
        mkViewAlt("My own", testMyOwn),
        // mkViewAlt("TC", testTC),
        // mkViewAlt("FH", testFH),
        // mkViewAlt("Basic", testBasic),
        // mkViewAlt("Text", testText),
        // mkViewAlt("Html class", testHtml),
        // mkViewAlt("Focus", testFocus),
    ]);
    divAlts.querySelector("input").checked = true;
    divAlts.style.display = "none";

    function mkSourceAlt(sourceName, txt) {
        const eltRad = mkElt("input", { type: "radio", name: "source", value: sourceName });
        const eltLbl = mkElt("label", undefined, [eltRad, txt]);
        return mkElt("div", undefined, eltLbl);
    }
    // getFc4iRecs();
    // const divFc4iNum = mkElt("div", undefined, `${numFc4i} records choosen from fc4i.`);
    // divAltFc4i.appendChild(divFc4iNum);

    const divReqTags = mkElt("div");
    if (requiredTags.length == 0) {
        divReqTags.appendChild(mkElt("span", undefined, "No required tags"));
    } else {
        requiredTags.forEach(t => {
            const s = mkElt("span", { class: "tag-in-our-tags" }, `#${t}`);
            divReqTags.appendChild(s);
        });
    }
    // divAltFc4i.appendChild(divReqTags);

    const eltSearchFor = searchFor.length == 0 ?
        mkElt("i", undefined, "(no search string)")
        :
        mkElt("b", undefined, searchFor);
    const divSearched = mkElt("div", undefined, [
        "Searched: ",
        eltSearchFor
    ]);
    const divAltFc4i = mkElt("div", { class: "xmdc-card" }, [
        // mkSourceAlt("fc4i", "fc4i")
        mkElt("b", undefined, "Flashcard 4 Internet"),
        divSearched,
        divReqTags,
        mkElt("p", undefined, `${numFc4i} records found`),
    ]);

    // divAltFc4i.appendChild(divSearched);

    // localStorage
    // const settingLinkW = new settingNetwG("linkW", 1);
    // let linkW = settingLinkW.value;
    // settingLinkW.onInputFun = (val) => linkW = val;

    const settingNumNodes = new settingNetwG("numNodes", 7);
    numNodes = settingNumNodes.value;
    // const inpNumNodes = mkElt("input", { type: "number", value: numNodes, min: 2 });
    const inpNumNodes = modMdc.mkMDCtextFieldInput(undefined, "number");
    // inpNumNodes.value = numNodes;
    inpNumNodes.min = 2;
    settingNumNodes.bindToInput(inpNumNodes);
    settingNumNodes.onInputFun = (val) => linkW = val;
    const tfNumNodes = modMdc.mkMDCtextFieldOutlined(
        `Number of nodes (available ${numFc4i})`, inpNumNodes, numNodes);
    const divNumNodes = mkElt("div", undefined, [
        tfNumNodes,
        mkElt("div", undefined, `
            If more nodes are available
            then only this many will be shown.
        `)
    ]);
    divNumNodes.style = `
        display: flex;
        flex-direction: column;
        gap: 10px;
        line-height: 1rem;
    `;

    const divSource = mkElt("div", { class: "xmdc-card" }, [
        mkElt("div", { style: "display:flex; flex-direction:column; gap:15px" }, [
            divAltFc4i,
            // mkSourceAlt("random", "Random links, number nodes"),
        ]),
    ]);
    // divSource.querySelector("input[type=radio]").checked = true;

    // const btnHelp = modMdc.mkMDCiconButton("home", "Help");
    // mkMDCfab "hub"
    const iconHelp = modMdc.mkMDCicon("help");
    const aIconHelp = mkElt("a", { href: "/about.html#nwg", target: "_blank" }, iconHelp);
    aIconHelp.style.lineHeight = "1rem";
    const titleHelp = "Help";
    const fabHelp = modMdc.mkMDCfab(aIconHelp, titleHelp, true)
    // fabNetwG.title = titleNetwg;
    fabHelp.style.marginLeft = "30px";
    // fabHelp.style.backgroundColor = "goldenrod";
    fabHelp.style.backgroundColor = "aliceblue";

    let divLoadView = "";
    const strJsonSavedView = localStorage.getItem("netwg-savedView");
    if (strJsonSavedView) {
        // const btnLoadSaved = modMdc.mkMDCbutton("Load saved view", "raised");
        // const btnLoadSaved = modMdc.mkMDCbutton("Load saved view");
        const btnLoadSaved = modMdc.mkMDCbutton("Load saved view", "outlined");
        btnLoadSaved.addEventListener("click", evt => {
            // load saved view
            // const jsonSaved = JSON.parse(strJson);
            // const gDataUsed = jsonSaved.gDataUsed;
            // loadGraphFromJson(gDataUsed);
            loadSavedView(strJsonSavedView);
        });
        divLoadView = mkElt("div", undefined, [
            btnLoadSaved,
        ]);
    }

    const body = mkElt("div", undefined, [
        mkElt("h2", undefined, ["Network graph", fabHelp]),
        // divAlts,
        divLoadView,
        mkElt("h3", undefined, "Source"),
        divSource,
        // mkElt("hr"),
        // mkElt("label", undefined, ["Num nodes to show: ", inpNumNodes]),
        mkElt("h3", undefined, "Output"),
        divNumNodes,
    ]);
    const answer = await modMdc.mkMDCdialogConfirm(body, "Show Graph");
    // console.log({ answer });
    if (!answer) return;
    // await modMdc.mkMDCdialogAlertWait(body, "Close");
    // debugger;
    const radChecked = divAlts.querySelector("input:checked");
    if (!radChecked) return;
    // testText();
    const fun = radChecked.altFun;
    const eltShowViewAlt = document.getElementById("show-view-alt");
    eltShowViewAlt.textContent = fun.name;
    numNodes = Math.floor(Number(inpNumNodes.value));
    // sourceName = divSource.querySelector("input[name=source]:checked").value;
    sourceName = "fc4i";
    // await getNodesAndLinks(numNodes, sourceName);
    await getNodesAndLinks(sourceName);
    fun(gData);
}



/////////////////


function setImagesMode(newImagesMode) {
    if (imagesMode == newImagesMode) return;
    imagesMode = newImagesMode;
    const btnImages = document.getElementById("btn-images");
    if (newImagesMode) {
        btnImages.style.backgroundColor = "yellowgreen";
        graph.nodeThreeObject(node => showNodeAsImg(node));
    } else {
        btnImages.style.backgroundColor = "unset";
        graph.nodeThreeObject(node => showNodeAsText(node));
    }
}

function setCubeMode(newShowCube) {
    if (newShowCube == showCube) return;
    showCube = newShowCube;
    const btnCube = document.getElementById("btn-cube");
    if (newShowCube) {
        if (!theCube) {
            // getDeb();
            // btnCube.style.color = "darkgoldenrod";
            btnCube.style.color = "#b8440b";
            const elt3dCont = document.getElementById("the3d-graph-container");
            const bcr = elt3dCont.getBoundingClientRect();
            theCubeSize = Math.min(bcr.width, bcr.height);
            // const planeGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
            // mesh.position.set(-100, -200, -100);

            let newCS = 0;
            graph.graphData().nodes.forEach(n => {
                const mx = Math.max(Math.abs(n.x), Math.abs(n.y), Math.abs(n.z));
                newCS = Math.max(newCS, mx);
            });
            // FIX-ME:
            theCubeSize = newCS * 3;

            const halfSize = theCubeSize / 2;
            let x = -halfSize;
            let y = -halfSize;
            let z = -halfSize;

            function makeSide(color) {
                const planeGeometry = new THREE.PlaneGeometry(theCubeSize, theCubeSize, 1, 1);
                const planeMaterial = new THREE.MeshLambertMaterial({
                    color: color,
                    // side: THREE.DoubleSide
                    // side: THREE.FrontSide
                    side: THREE.BackSide
                });
                const mesh = new THREE.Mesh(planeGeometry, planeMaterial);
                return mesh;
            }
            function mkBackSide(color) {
                const planeGeometry = new THREE.PlaneGeometry(theCubeSize, theCubeSize, 1, 1);
                const planeMaterial = new THREE.MeshLambertMaterial({
                    color: color,
                    // side: THREE.DoubleSide
                    side: THREE.FrontSide
                    // side: THREE.BackSide
                });
                const mesh = new THREE.Mesh(planeGeometry, planeMaterial);
                return mesh;
            }
            // const meshBottom = makeSide(0x003F00);
            // meshBottom.position.set(0, y, z);
            // meshBottom.rotation.set(0.5 * Math.PI, 0, 0);
            const meshBottom = mkBackSide(0x003F00);
            meshBottom.position.set(0, -halfSize, 0);
            meshBottom.rotation.set(1.5 * Math.PI, 0, 0);

            // const meshTop = makeSide(0x9090FF);
            // meshTop.position.set(0, -y, z);
            // meshTop.rotation.set(1.5 * Math.PI, 0, 0);
            const meshTop = mkBackSide(0x9090FF);
            meshTop.position.set(0, halfSize, 0);
            meshTop.rotation.set(0.5 * Math.PI, 0, 0);

            // const meshRight = makeSide(0x00009F);
            // meshRight.position.set(-x, 0, z);
            // meshRight.rotation.set(0, 0.5 * Math.PI, 0);
            // const meshRight = mkBackSide(0x00006F);
            const meshRight = mkBackSide(0x0F0FBD);
            meshRight.position.set(halfSize, 0, 0);
            meshRight.rotation.set(0, 1.5 * Math.PI, 0);

            // const meshLeft = makeSide(0x9F0000);
            // meshLeft.position.set(x, 0, z);
            // meshLeft.rotation.set(0, 1.5 * Math.PI, 0);
            const meshLeft = mkBackSide(0x3F0000);
            // meshLeft.rotation.set(0, 0.5 * Math.PI, 0);
            meshLeft.position.set(-halfSize, 0, 0);
            meshLeft.rotation.set(0, 0.5 * Math.PI, 0);

            // const xAxis = new THREE.Vector3(1, 0, 0);
            // const yAxis = new THREE.Vector3(0, 1, 0);
            // const zAxis = new THREE.Vector3(0, 0, 1);
            // meshLeft.rotateOnWorldAxis(xAxis, 0.5 * Math.PI);

            // const meshBack = mkBackSide(0xFFFF00);
            const meshBack = mkBackSide(0xAAAA00);
            meshBack.position.set(0, 0, -halfSize);

            const meshFront = mkBackSide(0x444444);
            meshFront.rotation.set(0, 1 * Math.PI, 0);
            meshFront.position.set(0, 0, halfSize);

            theCube = [
                meshLeft,
                meshRight,
                meshTop,
                meshBottom,
                meshBack,
                meshFront,
            ];
        }
        theCube.forEach(cubeSide => graph.scene().add(cubeSide));
    } else {
        btnCube.style.color = "unset";
        theCube.forEach(cubeSide => graph.scene().remove(cubeSide));
        theCube = undefined;
    }

}
async function addDialogGraphButtons() {

    // https://github.com/vasturiano/3d-force-graph/blob/master/example/scene/index.html
    // https://vasturiano.github.io/3d-force-graph/example/scene/
    const btnCube = modMdc.mkMDCiconButton("view_in_ar", "Show/hide cube");
    btnCube.id = "btn-cube";
    btnCube.addEventListener("click", evt => {
        const newShowCube = !showCube;
        setCubeMode(newShowCube);
    });

    const btnFocusNode = modMdc.mkMDCiconButton("center_focus_strong", "Focus node (on click)");
    theBtnFocusNode = btnFocusNode;
    btnFocusNode.addEventListener("click", evt => {
        focusOnNodeClick = !focusOnNodeClick;
        if (focusOnNodeClick) {
            btnFocusNode.style.color = "red";
        } else {
            btnFocusNode.style.color = "unset";
        }
    });

    const btnDoc = modMdc.mkMDCiconButton("description", "Node description (on click)");
    btnDoc.addEventListener("click", evt => {
        showInfoOnNodeClick = !showInfoOnNodeClick;
        if (showInfoOnNodeClick) {
            btnDoc.style.color = "red";
        } else {
            btnDoc.style.color = "unset";
        }
    });

    const btnImages = modMdc.mkMDCiconButton("imagesmode", "Show images");
    btnImages.id = "btn-images";
    btnImages.addEventListener("click", evt => {
        // https://github.com/vasturiano/3d-force-graph/issues/61
        const newImagesMode = !imagesMode;
        setImagesMode(newImagesMode);
        // FIX-ME: lines above works but not the line below??? 
        //   Is is something with async...
        // graph.nodeThreeObject(node => showNode(node));
    });

    const btnHome = modMdc.mkMDCiconButton("home", "Show initial view");
    btnHome.addEventListener("click", evt => {
        // graph.cameraPosition({ x: 0, y: -10, z: cameraDistance }, { x: 0, y: 10, z: 0 }, 1200);
        // https://stackoverflow.com/questions/69914793/three-js-rotate-around-axis-at-an-absoulte-angle
        const obj = graph.camera();
        obj.matrix.copy(obj.userData.oldMatrix);
        obj.matrix.decompose(obj.position, obj.quaternion, obj.scale);
    });

    buildDivTags();
    const btnTags = modMdc.mkMDCiconButton("tag", "Tags as links");
    btnTags.id = "netwg-btn-tags";
    let tmrPendingRedrawGraph = false;
    btnTags.addEventListener("click", evt => {
        closeOtherExpanded("tags");

        const divTags = document.getElementById("netwg-tags");
        toggleExpandibleDiv(divTags);
        if (isExpanded(divTags)) {
            btnTags.classList.add("is-open");
        } else {
            btnTags.classList.remove("is-open");
        }

        if (pendingRedrawGraph) {
            clearTimeout(tmrPendingRedrawGraph);
            if (!divTags.classList.contains("is-open")) {
                tmrPendingRedrawGraph = setTimeout(redrawGraph, 2000);
            }
        }
    });


    function buildDivLinks() {
        const divLinksAndHiSettings = mkDivLinksSettings();
        const divLinks = document.getElementById("netwg-links");
        const divLinksInner = mkElt("div", undefined, [
            // view settings
            // mkElt("p", undefined, "Just a test, again and again"),
            divLinksAndHiSettings,
        ]);
        divLinks.appendChild(divLinksInner);
        makeExpandible(divLinks, "h");
    }
    buildDivLinks();
    // const btnLinks = modMdc.mkMDCiconButton("line_start"); // FIX-ME: does not show???
    const btnLinks = modMdc.mkMDCiconButton("linked_services", "Links appearance");
    btnLinks.id = "netwg-btn-links";
    btnLinks.addEventListener("click", evt => {
        closeOtherExpanded("links");
        const divLinks = document.getElementById("netwg-links");
        // divLinks.classList.toggle("is-open");
        toggleExpandibleDiv(divLinks);
        if (isExpanded(divLinks)) {
            btnLinks.classList.add("is-open");
        } else {
            btnLinks.classList.remove("is-open");
        }
    });


    /*
    const btnHideGraph = modMdc.mkMDCiconButton("visibility", "Hide/show network graph");
    btnHideGraph.style.color = "yellowgreen";
    btnHideGraph.addEventListener("click", async evt => {
        const elt = document.getElementById("the3d-graph-container");
        const st = elt.style;
        if (st.display == "none") {
            st.display = "block";
        } else {
            st.display = "none";
        }
    });
    */

    const btnDialogGraph = modMdc.mkMDCiconButton("settings", "Old settings variant");
    btnDialogGraph.addEventListener("click", async evt => {
        await dialogLinks();
        // trigger
        triggerUpdateLinksView();
    });

    /*
    const btnHilightNode = modMdc.mkMDCiconButton("highlight", "Highlight node (on click)");
    btnHilightNode.addEventListener("click", evt => {
        hilightOnNodeClick = !hilightOnNodeClick;
        if (hilightOnNodeClick) {
            btnHilightNode.style.color = "red";
        } else {
            btnHilightNode.style.color = "unset";
        }
    });
    */


    const btnFitAll = modMdc.mkMDCiconButton("crop_free", "Zoom to fit all nodes");
    btnFitAll.addEventListener("click", evt => {
        // graph.onEngineStop(() => graph.zoomToFit(100));
        // highlightNodes.has
        // graph.zoomToFit(100, 0, (node) => highlightNodes.has(node));
        // graph.zoomToFit(100, 0);
        const px = 0;
        const objFilterFun = (obj) => true;
        console.log("zoomToFit", { px, objFilterFun });
        graph.zoomToFit(90, px, objFilterFun);
    });
    const eltBtnContainer = mkElt("span", undefined, [
        // btnHilightNode,
        btnFocusNode,
        btnDoc,
        btnHome,
        btnFitAll,
        btnCube,
        btnImages,
        btnTags,
        btnLinks,
        // btnDialogGraph,
        // btnHideGraph,
    ]);
    eltBtnContainer.id = "graph-buttons";
    eltBtnContainer.style = `
        position: fixed;
        top: 0;
        left: 0;
        display: flex;
        background-color: #b1dff1;
        transition-duration: 0.7s;
        transition-property: left, right;
    `;
    document.body.appendChild(eltBtnContainer);

    const btnLeft = modMdc.mkMDCiconButton("first_page", "Show left part of button bar");
    btnLeft.addEventListener("click", evt => {
        btnLeft.style.display = "none";
        btnRight.style.display = "block";
        eltBtnContainer.style.left = 0;
    });
    btnLeft.style = `
        position: fixed;
        top: 0;
        left: 0;
        background-color: skyblue;
        display: none;
    `;

    function getBtnContLeft() {
        const needW = eltBtnContainer.childElementCount * 48;
        const availW = document.documentElement.clientWidth - 48;
        const left = availW - needW;
        return left;
    }
    const btnRight = modMdc.mkMDCiconButton("last_page", "Show right part of button bar");
    btnRight.addEventListener("click", evt => {
        btnRight.style.display = "none";
        btnLeft.style.display = "block";
        const left = getBtnContLeft();
        eltBtnContainer.style.left = `${left}px`;
    });
    btnRight.style = `
        position: fixed;
        top: 0;
        right: 48px;
        background-color: skyblue;
        display: none;
    `;
    (async () => {
        await promiseDOMready();
        const left = getBtnContLeft();
        if (left < 0) btnRight.style.display = "block";
    })();

    document.body.appendChild(btnLeft);
    document.body.appendChild(btnRight);

    const guessMenuRight = 300;
    addMenuRight();
    async function addMenuRight() {
        // const divMenuInner = mkElt("div", undefined, "Menu inner");

        const liSaveThisView = modMdc.mkMDCmenuItem("Save this view");
        liSaveThisView.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            // btnHome, userData
            // obj.userData.oldMatrix = obj.matrix.clone();
            const obj = graph.camera();
            const oldMatrix = obj.matrix.clone();
            // const nodes = gData.nodes.map(n => { const fc4i = n.fc4i.r.key; const id = n.id; return { fc4i, id } })
            // console.log({ gData, setInvisibleTags, nodes, oldMatrix, graph });
            // console.log({ buildFrom });
            console.log({ gData, gDataUsed, oldMatrix });
            const savedView = { gDataUsed, oldMatrix, imagesMode, showCube };
            // const strSaved = JSON.stringify(savedView);
            const strSaved = JSON.stringify(savedView);
            localStorage.setItem("netwg-savedView", strSaved);
            // modMdc.mkMDCdialogAlert("Not ready");
            const sn = modMdc.mkMDCsnackbar("Not ready");
            sn.style.backgroundColor = "red";
        }));
        const liLoadView = modMdc.mkMDCmenuItem("Load saved view");
        liLoadView.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            const strJsonSaved = localStorage.getItem("netwg-savedView");
            await loadSavedView(strJsonSaved);
        }));

        let arrEntries = [
            liSaveThisView,
            liLoadView,
        ];
        const ulMenu = modMdc.mkMDCmenuUl(arrEntries);
        const divMenuSurface = modMdc.mkMDCmenuDiv(ulMenu);
        // FIX-ME: mdc docs are a mess. Trying this:
        // divMenuSurface.classList.add("mdc-menu-surface--open");
        divMenuSurface.classList.remove("mdc-menu-surface");
        divMenuSurface.classList.add("is-menu-div");

        // const divMenuWrapper = mkElt("div", undefined, divMenuInner);
        // divMenuWrapper.id = menuId;
        const divMenuContainer = document.getElementById(menuId);
        divMenuContainer.appendChild(divMenuSurface);
        divMenuContainer.style = `
            right: -${guessMenuRight}px; 
        `;
        // makeExpandible(divMenuWrapper, "w");
        // await promiseDOMready;
        // document.body.appendChild(divMenuWrapper);
        divMenuContainer.addEventListener("NOclick", evt => {
            if (!divMenuContainer.classList.contains("is-open")) {
                debugger;
            }
            // divMenuContainer.classList.remove("is-open");
            closeRightMenu();
        });
        document.documentElement.addEventListener("click", evt => closeRightMenu());
    }
    function closeRightMenu() {
        const menu = document.getElementById(menuId);
        // if (!menu.classList.contains("is-open")) debugger;
        menu.classList.remove("is-open");
        let r = menu.dataset.bcrwidth || guessMenuRight;
        if (r < 100) r = guessMenuRight;
        menu.style.right = `-${r}px`;
    }
    const btnMore = modMdc.mkMDCiconButton("more_vert", "Hide/show menu");
    btnMore.addEventListener("click", evt => {
        evt.stopPropagation();
        const menu = document.getElementById(menuId);
        // toggleExpandibleDiv(menu);
        const bcrw = menu.dataset.bcrwidth;
        if (!menu.classList.contains("is-open")) {
            menu.classList.add("is-open");
            menu.style.right = "0px";
            if (!bcrw || bcrw < 100) {
                setTimeout(() => {
                    const bcr = menu.getBoundingClientRect();
                    console.log({ bcr });
                    menu.dataset.bcrwidth = bcr.width;
                }, 1000);
            }
        } else {
            // let r = bcrw || guessMenuRight;
            // if (r < 100) r = guessMenuRight;
            // menu.style.right = `-${r}px`;
            closeRightMenu();
        }
    });
    btnMore.id = "btn-more";
    btnMore.style = `
        position: fixed;
        top: 0;
        right: 0;
        background-color: orange;
    `;
    document.body.appendChild(btnMore);

}






function mkDivLinksSettings() {
    const inpLinkW = mkElt("input", { id: "linkW", type: "number", min: "1", max: "5", value: linkW });
    settingLinkW.bindToInput(inpLinkW);
    const inpLinkWHi = mkElt("input", { id: "linkWHi", type: "number", min: "1", max: "5", value: linkWHi });
    settingLinkWHi.bindToInput(inpLinkWHi);

    const inpLinkOp = mkElt("input", { id: "linkOp", type: "range", value: linkOp, step: "0.1", min: "0", max: "1" });
    settingLinkOp.bindToInput(inpLinkOp);
    const inpLinkOpHi = mkElt("input", { id: "linkOpHi", type: "range", value: linkOpHi, step: "0.1", min: "0", max: "1" });
    settingLinkOpHi.bindToInput(inpLinkOpHi);

    const inpLinkColor = mkElt("input", { id: "linkColor", type: "color", value: linkColor });
    settingLinkColor.bindToInput(inpLinkColor);
    const inpLinkColorHi = mkElt("input", { id: "linkColorHi", type: "color", value: linkColorHi });
    settingLinkColorHi.bindToInput(inpLinkColorHi);

    const inpTextH = mkElt("input", { id: "textH", type: "number", min: "3", max: "20", value: textH });
    const inpCameraDist = mkElt("input", { id: "camDist", type: "number", min: "40", max: "200", step: "20", value: cameraDistance });

    const divColors = mkElt("p");
    divColors.style = `
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    `;
    colorsRainbow.forEach(c => {
        const s = mkElt("span", undefined, c);
        s.style = `
            padding: 2px;
            color: black;
            background-color: ${c};
        `;
        divColors.appendChild(s);
    });

    const chkHiHover = mkElt("input", { id: "hi-hover", type: "checkbox" });
    settingHiHover.bindToInput(chkHiHover);
    const chkHiDrag = mkElt("input", { id: "hi-drag", type: "checkbox" });
    settingHiDrag.bindToInput(chkHiDrag);

    const lbl4Hover = mkElt("label", { for: "hi-hover" }, "Hilite on node hover:");
    const lbl4Drag = mkElt("label", { for: "hi-drag" }, "Hilite on node Drag:");
    const divHiSettings = mkElt("div", undefined, [
        lbl4Hover, chkHiHover,
        lbl4Drag, chkHiDrag,
        mkElt("label", { for: "linkColorHi" }, "Link color (hilite):"), inpLinkColorHi,
        mkElt("label", { for: "linkWHi" }, "Link width (hilite):"), inpLinkWHi,
        mkElt("label", { for: "linkOpHi" }, "Link opacity (hilite):"), inpLinkOpHi,
    ]);
    const divHiSettingsBody = mkElt("div", undefined, [
        mkElt("p", undefined, "This settings are applied during node hover or drag."),
        divHiSettings,
    ]);
    const divLinkHiSettings = mkElt("div", { class: "mdc-card" }, [
        mkElt("details", undefined, [
            mkElt("summary", undefined, "Hilite settings"),
            divHiSettingsBody
        ])
    ]);
    divLinkHiSettings.style.backgroundColor = "yellow";
    divLinkHiSettings.style.padding = "10px";

    const divLinksSettings = mkElt("div", undefined, [
        mkElt("label", { for: "linkColor" }, "Link color:"), inpLinkColor,
        mkElt("label", { for: "linkW" }, "Link width:"), inpLinkW,
        mkElt("label", { for: "linkOp" }, "Link opacity:"), inpLinkOp,
        // mkElt("label", { for: "textH" }, "Text height:"), inpTextH,
        // mkElt("label", { for: "camDist" }, "Camera distance:"), inpCameraDist,
    ]);
    divLinksSettings.style = divLinkSettingsstyle;
    divHiSettings.style = divLinkSettingsstyle;

    const divLinksAndHiSettings = mkElt("div", undefined, [
        divLinksSettings,
        divLinkHiSettings,
    ]);
    return divLinksAndHiSettings;
}
async function dialogLinks() {
    const divLinksAndHiSettings = mkDivLinksSettings();
    const body = mkElt("div", undefined, [
        mkElt("h2", undefined, "Network graph view settings"),
        // divLinksSettings,
        // divLinkHiSettings,
        divLinksAndHiSettings,
        // divColors
    ]);
    // FIX-ME:
    const answer = await modMdc.mkMDCdialogAlertWait(body, "Close");
}
async function setupGraphDisplayer(opt) {
    const funGraph = ForceGraph3D(opt);
    // debugger;
    await promiseDOMready();
    const elt3dGraph = document.getElementById('the3d-graph-container');
    const bcr = elt3dGraph.getBoundingClientRect();
    const grWidthPx = bcr.width;
    const grHeightPx = bcr.height;
    funGraph.width(grWidthPx);
    funGraph.height(grHeightPx);
    // funGraph.linkColor("green");
    // funGraph.linkColor("#ff0000");
    funGraph.linkColor(linkColor);
    funGraph.linkWidth(linkW);
    funGraph.linkOpacity(linkOp);
    return funGraph(elt3dGraph);
}



/////////////////
let lastClickedNodeId;
function getLink2KeyInFc4i(keyFc4i) {
    const objUrl = new URL("/", location);
    objUrl.searchParams.set("showkey", keyFc4i)
    // location = objUrl;
    return objUrl.href;
}
function showNodeInfo(node) {
    const rec = node.fc4i.r;
    const title = rec.title;
    const bodyInner = mkElt("div");
    const imgBlob = rec.images ? rec.images[0] : undefined;
    // let eltImg;
    const imgSize = 100;
    const eltImg = mkElt("div");
    const st = eltImg.style;
    st.height = `${imgSize}px`;
    st.width = `${imgSize}px`;
    st.backgroundSize = "contain";
    st.backgroundPosition = "top left";
    st.backgroundRepeat = "no-repeat";
    st.backgroundColor = "#0001";
    if (imgBlob) {
        st.backgroundImage = `url(${URL.createObjectURL(imgBlob)})`;
    }
    const linkRec = getLink2KeyInFc4i(rec.key);
    const aSource = mkElt("a", { href: linkRec }, title);
    aSource.style.textDecoration = "none";
    const divHeading = mkElt("div", undefined, [
        // mkElt("div", undefined, `${title}`),
        aSource,
    ]);
    if (eltImg) divHeading.appendChild(eltImg);
    divHeading.style = `
        NOdisplay: flex;
        NOjustify-content: space-between;
        display: grid;
        grid-template-columns: 1fr ${imgSize}px;
        gap: 5px;
        height: ${imgSize}px;
    `;
    bodyInner.appendChild(divHeading);

    // const a = mkElt("a", { href: linkRec }, "Show entry in fc4i");
    // body.appendChild(mkElt("p", undefined, a));

    if (rec.tags) {
        const pTags = mkElt("div");
        pTags.style.marginTop = "10px";
        pTags.style.display = "flex";
        pTags.style.flexWrap = "wrap";
        pTags.style.gap = "10px";
        let oldWay = false;
        rec.tags.forEach(t => {
            // tag-selector
            if (oldWay) {
                const eltInfo = mkElt("span", undefined, `#${t}`);
                // const eltTag = mkElt("span", { class: "tag-in-our-tags" }, `#${t}`);
                const eltTag = mkElt("span", { class: "tag-in-our-tags" }, eltInfo);
                let icon;
                if (setInvisibleTags.has(t)) {
                    icon = modMdc.mkMDCicon("visibility_off");
                    eltTag.appendChild(icon);
                }
                if (setNoLinkTags.has(t)) {
                    icon = modMdc.mkMDCicon("delete");
                }
                if (icon) {
                    icon.style.fontSize = "inherit";
                    icon.style.marginLeft = "5px";
                    eltTag.style.opacity = "0.5";
                    eltTag.appendChild(icon);
                }
                if (setRequiredTags.has(t)) {
                    eltTag.style.opacity = 0.5;
                    eltTag.style.filter = "grayscale(1)";
                }
                if (setLinkTags.has(t)) {
                    pTags.appendChild(eltTag);
                }
            } else {
                const eltTag = mkEltTagSelector(t);
                // FIX-ME: A bit fragile
                const btnDel = eltTag.lastElementChild.lastElementChild;
                const tn = btnDel.tagName;
                if (tn != "BUTTON") throw Error(`Expected <BUTTON> but found <${tn}`);
                btnDel.remove();
                if (!setActuallyUsedLinkTags.has(t)) {
                    const btnHide = eltTag.lastElementChild.lastElementChild;
                    const tn = btnHide.tagName;
                    if (tn != "BUTTON") throw Error(`Expected <BUTTON> but found <${tn}`);
                    btnHide.remove();
                }
                pTags.appendChild(eltTag);
            }
        });
        bodyInner.appendChild(pTags);
    }
    // modMdc.mkMDCdialogAlert(body, "Close");
    const bodyOuter = mkElt("div", undefined, bodyInner);
    bodyOuter.id = "bottom-outer";
    bodyOuter.style = `
        position: fixed;
        bottom: 0;
        left: 0;
        margin-left: 0;
        margin-right: 0;
        background-color: white;
        padding: 10px;
        border-radius: 15px 15px 0 0;
        height: ${imgSize + 20}px;
        height: 0;
        transition-property: height, padding;
        transition-duration: ${secondsBottom}s;
    `;

    // const btnMore = modMdc.mkMDCbutton("Tags...", "raised");
    // const btnMore = modMdc.mkMDCiconButton("#", "raised");
    const iconTag = modMdc.mkMDCicon("tag");
    const btnMore = modMdc.mkMDCfab(iconTag, "Show tags", true);
    btnMore.addEventListener("click", evt => {
        const bcr = bodyInner.getBoundingClientRect();
        bodyOuter.style.height = `${bcr.height + 2 * 10}px`;
        btnMore.remove();
    });
    btnMore.style = `
        position: absolute;
        right: calc(${imgSize}px - 10px);
        bottom: 0px;
        background: yellow;
    `
    bodyInner.appendChild(btnMore);


    const eltScrim = mkElt("div", undefined, bodyOuter);
    eltScrim.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        transition: ${secondsBottom} background-color;
        background-color: #00008b00;
    `;
    eltScrim.addEventListener("click", evt => {
        if (evt.target == eltScrim) {
            bodyOuter.style.height = "0";
            bodyOuter.style.paddingTop = "0";
            bodyOuter.style.paddingBottom = "0";
            eltScrim.style.backgroundColor = "#00008b00";
            btnMore.remove();
            setTimeout(() => eltScrim.remove(), secondsBottom * 1000 + 10);
        }
    });

    document.body.appendChild(eltScrim);
    setTimeout(() => {
        eltScrim.style.backgroundColor = "#00008b75";
        bodyOuter.style.height = `${imgSize + 20}px`;
    }, 20);
}

function nodeClickAction(node) {
    if (showInfoOnNodeClick) {
        showNodeInfo(node);
    }
    if (focusOnNodeClick) {
        focusOnNodeClick = false;
        theBtnFocusNode.style.color = "unset";
        if (confirm("use new focusNode")) {
            focusNode(node);
        } else {
            OLDfocusNode(node);
        }
    }
    if (hilightOnNodeClick) { hiliteNode(node); }
    return;

    if ((lastClickedNodeId != node.id)) {
        lastClickedNodeId = node.id;
        return;
    } else {
        // console.log("Clicked again", node);
        if (node.fc4i) {
            showNodeInfo(node);
        } else {
            const body = mkElt("div");
            body.appendChild(
                mkElt("span", { style: "color:red;" }, `clicked again ${node.id}`)
            );
            modMdc.mkMDCdialogAlert(body, "Close");
        }
        return;
    }
    return;

    /*
    // Aim at node from outside it
    let distance = 40;
    distance = 300; // Should make text 14px easily readable
    distance = 100; // Should make text 14px easily readable
    distance = cameraDistance;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

    const newPos = node.x || node.y || node.z
        ? { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }
        : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

    graph.cameraPosition(
        newPos, // new position
        node, // lookAt ({ x, y, z })
        // 3000  // ms transition duration
        2000  // ms transition duration
    );
    // graph.cooldownTime(200);
    // graph.onEngineStop(() => graph.zoomToFit(100));
    */
}

function addOnClick() {
    // console.log("addOnClick >>>>>");
    graph = graph.onNodeClick(node => {
        nodeClickAction(node);
    });
}

async function addLinkText() {
    // https://github.com/vasturiano/3d-force-graph/blob/master/example/text-links/index.html
    graph = graph.linkThreeObjectExtend(true);
    graph = graph.linkThreeObject(link => {
        return false;
        if (link.text) {
            // extend link with text sprite
            const sprite = new SpriteText(`${link.text}`);
            sprite.color = 'lightgrey';
            sprite.color = 'rgba(255, 0, 0, 0.7)';
            sprite.textHeight = 4;
            return sprite;
        }
        return link;
    });
    graph = graph.linkPositionUpdate((sprite, { start, end }) => {
        if (sprite) {
            // FIX-ME: I don't understand this syntax???
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
            const middlePos = Object.assign(
                ...['x', 'y', 'z']
                    .map(c => ({
                        [c]: start[c] + (end[c] - start[c]) / 2 // calc middle point
                    }))
            );
            // FIX-ME: move closer to camera. Scale?
            // middlePos["z"] = middlePos["z"] - 100;
            // console.log({ middlePos });
            // Position sprite
            Object.assign(sprite.position, middlePos);
        }
    });
}
function showNodeAsText(node) {
    const isFc4i = node.fc4i != undefined;
    const fc4iTitle = node.fc4i?.r.title;
    const txtLong = isFc4i ? fc4iTitle : `Dummy long ${node.id}`;
    const txtShort = mkShortTxt(txtLong);
    function mkShortTxt(txt) {
        const arrTxt = txt.split(" ");
        const arrLines = [];
        let i = 0;
        const len = arrTxt.length;
        let newLine = "";
        let iLines = 0;
        while (i < len) {
            const nextWord = arrTxt[i++];
            const nextLine = newLine + nextWord + " ";
            if (nextLine.length > maxNodeTextWidth) {
                if (newLine.length > 0) {
                    arrLines[iLines++] = newLine.slice(0, -1);
                    newLine = nextWord + " ";
                } else {
                    arrLines[iLines++] = nextLine.slice(0, -1);
                    newLine = "";
                }
            } else newLine = nextLine;
        }
        if (newLine.length > 0) {
            arrLines[iLines++] = newLine.slice(0, -1);
        }
        let allUsed = true;
        if (arrLines.length > maxNodeTextLines) {
            arrLines.length = maxNodeTextLines;
            allUsed = false;
        }
        let retTxt = arrLines.join("\n");
        if (!allUsed) retTxt += "…";
        return retTxt;
    }
    const sprite = new SpriteText(txtShort);
    // const sprite = new SpriteText("hi\nthere");
    sprite.material.transparent = false;
    const numTags = node.fc4i.r.tags.length;
    const idxClr = Math.min(numTags, colorsRainbow.length - 1);
    sprite.backgroundColor = isFc4i ? colorsRainbow[idxClr] : "yellow";
    sprite.borderWidth = 1;
    sprite.borderColor = "yellowgreen";
    sprite.borderColor = "yellowgreen";
    // sprite.color = node.color;
    sprite.color = "black";
    sprite.textHeight = textH;
    // sprite.ourCustom = "sprite our custom";
    sprite.ourCustom = txtLong; // FIX-ME:
    return sprite;
}
function showNodeAsImg(node) {
    // const imgTexture = new THREE.TextureLoader().load(`./imgs/${img}`);
    if (node.fc4i.r.images.length == 0) return showNodeAsText(node);
    const blobImg = node.fc4i.r.images[0];
    // st.backgroundImage = `url(${URL.createObjectURL(imgBlob)})`;
    const urlImg = URL.createObjectURL(blobImg);
    const imgTexture = new THREE.TextureLoader().load(urlImg);
    imgTexture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.SpriteMaterial({ map: imgTexture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(20, 12.4);
    const img = new Image();
    img.onload = () => {
        const h = img.height;
        const w = img.width;
        const sc = (20 * 12.4) / (w * h);
        const sc2 = Math.sqrt(sc);
        const scW = w * sc2;
        const scH = h * sc2;
        sprite.scale.set(scW, scH);
    }
    img.src = urlImg;
    return sprite;
}
// let textOrImg = 0;
// async function showNode() 
function showNode() {
    graph = graph.nodeThreeObject(node => {
        if (imagesMode) return showNodeAsImg(node);
        return showNodeAsText(node);
    });
}

function hiliteNode(node) {
    // no state change
    if ((!node && !setHighlightNodes.size) || (node && theHiliteNode === node)) return;

    setHighlightNodes.clear();
    setHighlightLinks.clear();
    if (node) {
        setHighlightNodes.add(node);
        node.neighbors.forEach(neighbor => setHighlightNodes.add(neighbor));
        node.links.forEach(link => setHighlightLinks.add(link));
    }

    theHiliteNode = node || null;

    triggerUpdateLinksView();
}

async function addNodeLinkHighlighter() {
    graph = graph
        .nodeColor(node => setHighlightNodes.has(node) ? node === theHiliteNode ? 'rgb(255,0,0,1)' : 'rgba(255,160,0,0.8)' : 'rgba(0,255,255,0.6)')
        .linkColor(link => {
            if (setInvisibleTags.has(link.text)) {
                return "#0000";
                return;
            }
            // let numTags = link.tags.size;
            let numTags = link.arrTags.length;
            // [...link.tags].forEach(t => { if (setInvisibleTags.has(t)) numTags--; });
            link.arrTags.forEach(t => { if (setInvisibleTags.has(t)) numTags--; });
            if (numTags == 0) return "#0000";

            if (setHighlightLinks.has(link)) {
                const hexOpacityHi = Math.round(linkOpHi * 255).toString(16);
                return linkColorHi + hexOpacityHi;
            } else {
                const hexOpacity = Math.round(linkOp * 255).toString(16);
                return linkColor + hexOpacity;
            }
        })
        /*
        .linkOpacity(link => {
            // FIX-ME: linkOpacity is never called. add opacity to linkColor instead
            if (highlightLinks.has(link)) { return linkOpHi; } else { return linkOp; }
        })
        */
        .linkWidth(link => {
            // let arrText = link.text.split("\n");
            // const emphase = 1.3 ** arrText.length;
            // invisible
            // let numTags = link.tags.size;
            let numTags = link.arrTags.length;
            // [...link.tags].forEach(t => { if (setInvisibleTags.has(t)) numTags--; });
            link.arrTags.forEach(t => { if (setInvisibleTags.has(t)) numTags--; });
            if (numTags == 0) return 0;
            let emp = 1;
            if (numTags > 1) {
                const emphase = 1.14 ** (numTags - 1);
                emp = Math.min(emphase, 2);
            }
            if (setHighlightLinks.has(link)) { return linkWHi * emp; } else { return linkW * emp; }
        })
        .linkThreeObject(link => {
            if (setHighlightLinks.has(link)) {
                // if (link.text)
                if (link.tags) {
                    // extend link with text sprite
                    const txt = [...link.tags].filter(t => !setInvisibleTags.has(t)).join("\n");
                    const sprite = new SpriteText(txt);
                    sprite.color = 'rgba(255, 255, 0, 1)';
                    sprite.textHeight = 4;
                    return sprite;
                }
                return link;
            } else return false;
        })
        .onNodeHover(node => {
            if (!boolHiHover) return;
            hiliteNode(node);
        })
        .onNodeDrag(node => {
            if (!boolHiDrag) return;
            hiliteNode(node);
        })
}

function addNodeAsHtml(node) {
    console.log("  addHtml .nodeThreeObject >>>>> node", node);
    const nodeEl = document.createElement('div');
    nodeEl.textContent = `Html ${node.id}`;
    nodeEl.classList.add("html-node");
    const ret = new m.CSS2DObject(nodeEl);
    console.log("  addHtml .nodeThreeObject <<<< ret", ret);
    return ret;
}
async function addHtml() {
    console.log("addHTML >>>>>");
    graph = graph.nodeThreeObject(node => {
        return addNodeAsHtml(node);
    });
}

/////////////////
async function getHtmlGraphDisplayer() {
    console.warn("getHtmlGraphDisplayer, import CSS2Renderer.js");
    const m = await import('//unpkg.com/three/examples/jsm/renderers/CSS2DRenderer.js');
    const htmlDisplayer = await setupGraphDisplayer({
        extraRenderers: [new m.CSS2DRenderer()]
    });
    return htmlDisplayer;
}
/*
async function testTC() {
    const graphDisplayer = await setupGraphDisplayer();
    let ourDisplayer = graphDisplayer;
    const useHtml = false;
    if (useHtml) { ourDisplayer = await getHtmlGraphDisplayer(); }
    graph = ourDisplayer.graphData(gData);
    graph = graph.nodeOpacity(1.0);

    // await addHtml();
    addText();
    await waitSeconds(1);
    addOnClick();
    // graph.onEngineStop(() => graph.zoomToFit(100));

}
*/
/*
async function testFH() {
    console.warn("testFH, setupGraphDisplayer");
    const graphDisplayer = await setupGraphDisplayer();
    let ourDisplayer = graphDisplayer;
    const useHtml = false;
    let m;
    if (useHtml) {
        console.warn("testFH, import CSS2DRenderer");
        m = await import('//unpkg.com/three/examples/jsm/renderers/CSS2DRenderer.js');
        ourDisplayer = setupGraphDisplayer({
            extraRenderers: [new m.CSS2DRenderer()]
        });
    }
    graph = ourDisplayer.graphData(gData);
    graph = graph.nodeOpacity(1.0);

    // await addHtml();
    addText();
    await waitSeconds(1);
    addOnClick();
}
*/
function triggerUpdateLinksView() {
    // trigger update of highlighted objects in scene
    graph
        .nodeColor(graph.nodeColor())
        .linkWidth(graph.linkWidth())
        .linkOpacity(graph.linkOpacity())
        .linkColor(graph.linkColor())
        // .linkDirectionalParticles(graph.linkDirectionalParticles())
        ;
}

async function testMyOwn(gData) {
    // cross-link node objects
    if (!gData.nodesById) {
        gData.nodesById = {};
    }
    for (let i = 0, len = gData.nodes.length; i < len; i++) {
        const n = gData.nodes[i];
        const id = n.id;
        gData.nodesById[id] = n;
    }

    gData.links.forEach(link => {
        const a = gData.nodesById[link.source];
        const b = gData.nodesById[link.target];

        // Links are from all selected nodes.
        // But all nodes are not used here:
        // FIX-ME: Too late to check here?
        // if (!a) return;
        // if (!b) return;

        !a.neighbors && (a.neighbors = []);
        !b.neighbors && (b.neighbors = []);
        a.neighbors.push(b);
        b.neighbors.push(a);

        !a.links && (a.links = []);
        !b.links && (b.links = []);
        a.links.push(link);
        b.links.push(link);
    });

    const graphDisplayer = await setupGraphDisplayer();
    let ourDisplayer = graphDisplayer;
    const useHtml = true;
    if (useHtml) { ourDisplayer = await getHtmlGraphDisplayer(); }
    graph = ourDisplayer.graphData(gData);

    graph = graph.nodeOpacity(1.0);

    addLinkText();
    showNode();
    await waitSeconds(1);
    addOnClick();
    addNodeLinkHighlighter();

    // https://stackoverflow.com/questions/69914793/three-js-rotate-around-axis-at-an-absoulte-angle
    // setTimeout(() => {
    const obj = graph.camera();
    obj.userData.oldMatrix = obj.matrix.clone();
    // }, 1000);


}
function focusNode(node) {
    const spriteW = maxNodeTextWidth * textH;
    let assumedW = spriteW;
    const degFov = graph.camera().fov; // degrees
    const radFov = degFov * Math.PI / 180;
    const rCamera = (assumedW / 2) / Math.atan(radFov / 2);
    const rNode = Math.hypot(node.x, node.y, node.z);
    let ratio = rCamera / rNode;
    ratio = ratio * 2; // FIX-ME: ???
    const x = node.x * ratio;
    const y = node.y * ratio;
    const z = node.z * ratio;
    const newPos = { x, y, z };
    console.log("focusNode", newPos, node);
    graph.cameraPosition(
        newPos, // new position
        node, // lookAt ({ x, y, z })
        3000  // ms transition duration
    );
}
function OLDfocusNode(node) {
    // https://github.com/vasturiano/3d-force-graph/blob/master/example/click-to-focus/index.html
    // Aim at node from outside it
    // const distance = 40;
    // const distance = 60;
    // const distance = 70;
    // const distance = 80;
    const distance = 90;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

    const newPos = node.x || node.y || node.z
        ? { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }
        : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

    console.log("OLDfocusNode", newPos, node);
    graph.cameraPosition(
        newPos, // new position
        node, // lookAt ({ x, y, z })
        3000  // ms transition duration
    );
}
/*
async function testFocus() {
    // https://github.com/vasturiano/3d-force-graph/blob/master/example/click-to-focus/index.html
    const Graph = graphDisplayer.graphData(gData)
        .nodeLabel("id")
        .onNodeClick(node => {
        });
}
*/
/*
async function testHtml() {
    console.log("TEST HTLM");
    // https://github.com/vasturiano/3d-force-graph/blob/master/example/html-nodes/index.html
    console.warn("testFH, import CSS2DRenderer");
    const m = await import('//unpkg.com/three/examples/jsm/renderers/CSS2DRenderer.js');
    const graphDisplayer = setupGraphDisplayer({
        extraRenderers: [new m.CSS2DRenderer()]
    });
    let logged1 = false;
    const Graph = graphDisplayer.graphData(gData)
        .onNodeClick(node => {
            console.log("onNodeClick", node);
        })
        .nodeThreeObject(node => {
            const nodeEl = document.createElement('div');
            nodeEl.textContent = `Html ${node.id}`;

            const btn = mkElt("button", undefined, `Html ${node.id}`);
            btn.addEventListener("click", evt => {
                console.log(`clicked ${node.id}`);
                alert(node.id);
            });
            nodeEl.appendChild(btn);

            nodeEl.classList.add("node-label");

            if (!logged1) {
                console.log(nodeEl);
                logged1 = true;
            }

            return new m.CSS2DObject(nodeEl);
        })
        ;
}
*/

/*
async function testText() {
    // https://github.com/vasturiano/3d-force-graph/blob/master/example/text-nodes/index.html
    const Graph = graphDisplayer.graphData(gData)
        // .nodeAutoColorBy("group")
        .nodeThreeObject(node => {
            const sprite = new SpriteText(`Text ${node.id}`);
            // sprite.material.depthWrite = false; // make sprite background transparent
            sprite.material.transparent = false;
            sprite.backgroundColor = "yellow";
            // sprite.backgroundColor = node.color;
            sprite.padding = [2, 6];
            sprite.borderRadius = 4;
            sprite.borderWidth = 1;
            sprite.borderColor = "red";
            // sprite.color = node.color;
            sprite.color = "red";
            sprite.textHeight = textH;
            return sprite;
        });
}
*/
/*
function testBasic() {
    // https://github.com/vasturiano/3d-force-graph/blob/master/example/basic/index.html
    const Graph = graphDisplayer.graphData(gData);
}
*/

function makeExpandible(divWrapper, dir) {
    if (!["h", "w"].includes(dir)) throw Error(`Parameter dir must be "h" or "w", but is "${dir}"`)
    const tnW = divWrapper.tagName;
    if (tnW != "DIV") throw Error(`Expected wrapper <DIV>, got ${tnW}`);
    const cnt = divWrapper.childElementCount;
    if (cnt != 1) throw Error(`Wrapper should have exactly 1 child, has ${cnt} `);
    const divInner = divWrapper.firstElementChild;
    const tnI = divInner.tagName;
    if (tnI != "DIV") throw Error(`Expected inner <DIV>, got ${tnI}`);
    divWrapper.classList.add(`expanding-wrapper-${dir}`);
    divInner.classList.add("expanding-inner");
}
function checkIsExpandable(divWrapper) {
    if (divWrapper.classList.contains("expanding-wrapper-h")) return;
    if (divWrapper.classList.contains("expanding-wrapper-w")) return;
    throw Error(`Wrapper div does not contain class "expanding-wrapper-h"`); j
}
/*
function expandDiv(divWrapper) {
    checkIsExpandable(divWrapper);
    divWrapper.classList.add("is-open");
}
*/
function collapseDiv(divWrapper) {
    checkIsExpandable(divWrapper);
    divWrapper.classList.remove("is-open");
}
function toggleExpandibleDiv(divWrapper) {
    checkIsExpandable(divWrapper);
    divWrapper.classList.toggle("is-open");
}
function isExpanded(divWrapper) {
    checkIsExpandable(divWrapper);
    return divWrapper.classList.contains("is-open");
}


function closeOtherExpanded(notThis) {
    if (notThis != "tags") {
        const divTags = document.getElementById("netwg-tags");
        collapseDiv(divTags);
        const btnTags = document.getElementById("netwg-btn-tags");
        btnTags.classList.remove("is-open");
    }
    if (notThis != "links") {
        const divLinks = document.getElementById("netwg-links");
        collapseDiv(divLinks)
        const btnLinks = document.getElementById("netwg-btn-links");
        btnLinks.classList.remove("is-open");
    }
}