import("pwa");

const modMdc = await import("util-mdc");
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
                console.log(inp.type);
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

let gData;

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

let focusOnNodeClick = false;
let showInfoOnNodeClick = false;
let theBtnFocusNode;

// addDialogGraphButtons();
await getFc4iRecs();
await chooseView();
// showSelection(searchFor, setLinkTags);
showSelection();
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
        parRequiredTags.split(",");
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
function showSelection() {
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
    const divSelection = document.getElementById("netwg-our-selection");

    divSelection.appendChild(
        mkElt("details", undefined, [
            mkElt("summary", undefined, "Links"),
            divSearchEtc,
            divSelectTags,
        ]));


    requiredTags.forEach(tag => {
        const elt = mkElt("span", { class: "tag-in-our-tags" }, [`#${tag}`]);
        elt.style.filter = "grayscale(1)";
        divSearchEtc.appendChild(elt);
    });
    // [...setUsedLinkTags]
    // [...setLinkTags]
    [...setActuallyUsedLinkTags]
        .sort().forEach(tag => {
            const elt = mkEltTagSelector(tag, true);
            divSelectTags.appendChild(elt);
        });
    divSelection.addEventListener("NOclick", evt => {
        const target = evt.target;
        console.log({ evt, target });
        if ("INPUT" != target.tagName) return;
        if ("checkbox" != target.type) return;
        console.log("CHECKBOX!!!");
        const eltCont = target.closest("#netwg-our-selection");
        const arrChk = [...eltCont.querySelectorAll("input[type=checkbox]")];
        const arrTagsNoLink = arrChk
            .filter(chk => !chk.checked)
            .map(elt => elt.parentElement.textContent.slice(1));
        setNoLinkTags.clear();
        arrTagsNoLink.forEach(t => setNoLinkTags.add(t));
        console.log({ setNoLinkTags });

        // updateGraph();
        redrawGraph();
    });
}

function getManuallyExcludedTags() {
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
    debugger;
}

function redrawGraph() {
    graph._destructor();
    const eltGraph = document.getElementById("the3d-graph-container");
    eltGraph.textContent = "";
    computeNodesAndLinks();
    testMyOwn();
}

function mkEltTagSelector(tag, checked) {
    const chkbox = mkElt("input", { type: "checkbox" });
    chkbox.checked = checked;
    // const eltHidden = modMdc.mkMDCicon("visibilty_off");
    // const eltHidden = mkElt("span", { class: "material-icons" }, "visibility_off");
    // const eltRemove = modMdc.mkMDCicon("delete");
    // const eltRemove = mkElt("span", { class: "material-icons" }, "delete");

    const eltChips = mkElt("span");
    eltChips.classList.add("chip-tags");
    // const chipFontSize = 24;
    let selectedChip;
    function mkChip(iconName, ariaLabel) {
        // const btn = modMdc.mkMDCiconButton(iconName, ariaLabel, chipFontSize);
        const btn = modMdc.mkMDCiconButton(iconName, ariaLabel);
        btn.classList.add("icon-button-30");
        btn.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            const target = evt.target;
            console.log({ target, iconName });
            // debugger;
            if (await selectChipAction(iconName)) selectChip(iconName);
        }));
        btn.classList.add("chip-tag");
        return btn;
    }
    function addChip(iconName, ariaLabel) {
        const btn = mkChip(iconName, ariaLabel);
        eltChips.appendChild(btn);
    }
    function selectChip(iconName) {
        [...eltChips.querySelectorAll(".chip-tag")]
            .forEach(elt => {
                elt.classList.remove("chip-tag-selected");
                if (elt.textContent == iconName) {
                    elt.classList.add("chip-tag-selected");
                }
            });
        selectedChip = iconName;
    }
    async function selectChipAction(iconName) {
        if (selectedChip == iconName) return;
        const needLinksUpdate =
            iconName == "visibility_off"
            ||
            selectedChip == "visibility_off";
        const needRedraw =
            iconName == "delete"
            ||
            selectedChip == "delete";
        if (needRedraw) {
            const ans = await modMdc.mkMDCdialogConfirm("This will redraw the graph and change perspektive, et.");
            if (!ans) return false;
        }
        if (selectedChip == "visibility_off") {
            console.log({ tag, needLinksUpdate });
            // debugger;
            setInvisibleTags.delete(tag);
        }
        switch (iconName) {
            case "visibility":
                setInvisibleTags.delete(tag);
                break;
            case "visibility_off":
                setInvisibleTags.add(tag);
                break;
            case "delete":
                setInvisibleTags.delete(tag);
                break;
            default:
                throw Error(`Did not handle chip name ${iconName}`);
        }
        if (needLinksUpdate) updateLinksView();
        if (needRedraw) {
            getManuallyExcludedTags();
            if (iconName == "delete") {
                setManExclTags.add(tag);
            } else {
                setManExclTags.delete(tag);
            }
            debugger;
            redrawGraph();
        }
        return true;
    }

    addChip("visibility", "Redraw with these links");
    addChip("visibility_off", "Hide these links");
    addChip("delete", "Redraw without these links");
    selectChip("visibility");
    /*
    const eltChips = mkElt("span", undefined, [
        // "(",
        eltInclude,
        eltHidden,
        btnRemove,
        // ")",
    ])
    */
    const eltLabel = mkElt("label", { class: "tag-chk" }, [
        `#${tag}`,
        // chkbox,
    ]);
    const ret0 = mkElt("span", { class: "tag-selector" }, [
        eltLabel,
        eltChips,
    ]);
    return ret0;
    return mkElt("span", undefined, ret0);
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
        while (s++ < 2 * numNodes && setI.size < numNodes) {
            const i = Math.floor(Math.random() * lenMatch);
            setI.add(i);
        }
        const arrUse = [...setI].map(i => arrMatch[i]);
        arrUse.forEach(r => {
            console.log(r);
            if (!r.tags) return;
            r.tags.forEach(t => setLinkTags.add(t));
        });
        requiredTags.forEach(t => { setLinkTags.delete(t); });


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
                /*
                const link2 = {
                    source: r.id,
                    target: a0.id
                }
                links.push(link2);
                */
            })
        }
    });
    links.push(...Object.values(linksByKey));
    links.forEach(link => {
        link.text = [...link.tags].join("\n");
        // delete link.tags;
    });
    const setLinked = new Set();
    links.forEach(l => {
        setLinked.add(l.source);
        setLinked.add(l.target);
    });
    // console.log("NIY");
    // const finNodes = [...setLinked]
    const nodes = prelNodes.nodes.filter(n => setLinked.has(n.id));
    const numFinNodes = nodes.length;
    const eltShowFc4i = document.getElementById("show-fc4i-num");
    eltShowFc4i.textContent = `, fc4i: ${numFinNodes} (${numFc4i})`;
    gData = { nodes, links }

    setActuallyUsedLinkTags.clear();
    links.forEach(l => {
        l.tags.forEach(t => setActuallyUsedLinkTags.add(t));
    });

    /*
    console.log("-------------------------- computed!");
    console.log({
        setRequiredTags,
        setNoLinkTags,
        setUsedLinkTags,
        setActuallyUsedLinkTags,
        setExclTags,
        setLinkTags,
        gData,
    });
    */
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
        mkViewAlt("TC", testTC),
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
    const divAltFc4i = mkElt("div", { class: "xmdc-card" }, [
        mkSourceAlt("fc4i", "fc4i")
    ]);
    // getFc4iRecs();
    const divFc4iNum = mkElt("div", undefined, `${numFc4i} records choosen from fc4i.`);
    divAltFc4i.appendChild(divFc4iNum);

    const divReqTags = mkElt("p");
    if (requiredTags.length == 0) {
        divReqTags.appendChild(mkElt("span", undefined, "No required tags"));
    } else {
        requiredTags.forEach(t => {
            const s = mkElt("span", { class: "tag-in-our-tags" }, `#${t}`);
            divReqTags.appendChild(s);
        });
    }
    divAltFc4i.appendChild(divReqTags);

    const inpNumNodes = mkElt("input", { type: "number", value: 10, min: 5, max: 20 });
    const divSource = mkElt("div", { class: "xmdc-card" }, [
        mkElt("h3", undefined, "Source"),
        mkElt("div", { style: "display:flex; flex-direction:column; gap:15px" }, [
            divAltFc4i,
            // mkSourceAlt("random", "Random links, number nodes"),
        ]),
    ]);
    divSource.querySelector("input[type=radio]").checked = true;

    const body = mkElt("div", undefined, [
        mkElt("h2", undefined, "Choose view"),
        divAlts,
        mkElt("label", undefined, ["Num nodes to show: ", inpNumNodes]),
        mkElt("hr"),
        divSource
    ]);
    const answer = await modMdc.mkMDCdialogConfirm(body);
    console.log({ answer });
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
    sourceName = divSource.querySelector("input[name=source]:checked").value;
    // await getNodesAndLinks(numNodes, sourceName);
    await getNodesAndLinks(sourceName);
    fun();
}



/////////////////

let hilightOnNodeClick = false;
let theCube;
let theCubeSize = 1000;
let showCube = false;

async function addDialogGraphButtons() {

    // https://github.com/vasturiano/3d-force-graph/blob/master/example/scene/index.html
    // https://vasturiano.github.io/3d-force-graph/example/scene/
    const btnCube = modMdc.mkMDCiconButton("view_in_ar");
    btnCube.addEventListener("click", evt => {
        showCube = !showCube;
        if (showCube) {
            if (!theCube) {
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
    });

    const btnFocusNode = modMdc.mkMDCiconButton("center_focus_strong");
    theBtnFocusNode = btnFocusNode;
    btnFocusNode.addEventListener("click", evt => {
        focusOnNodeClick = !focusOnNodeClick;
        if (focusOnNodeClick) {
            btnFocusNode.style.color = "red";
        } else {
            btnFocusNode.style.color = "unset";
        }
    });

    const btnDoc = modMdc.mkMDCiconButton("description");
    btnDoc.addEventListener("click", evt => {
        showInfoOnNodeClick = !showInfoOnNodeClick;
        if (showInfoOnNodeClick) {
            btnDoc.style.color = "red";
        } else {
            btnDoc.style.color = "unset";
        }
    });

    const btnHome = modMdc.mkMDCiconButton("home");
    btnHome.addEventListener("click", evt => {
        graph.cameraPosition({ x: 0, y: 0, z: 400 }, undefined, 2000);
    });

    const btnHideGraph = modMdc.mkMDCiconButton("visibility");
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

    const btnDialogGraph = modMdc.mkMDCiconButton("settings");
    btnDialogGraph.addEventListener("click", async evt => {
        await dialogGraph();
        // trigger
        updateLinksView();
    });

    const btnHilightNode = modMdc.mkMDCiconButton("highlight");
    btnHilightNode.addEventListener("click", evt => {
        hilightOnNodeClick = !hilightOnNodeClick;
        if (hilightOnNodeClick) {
            btnHilightNode.style.color = "red";
        } else {
            btnHilightNode.style.color = "unset";
        }
    });


    const btnFitAll = modMdc.mkMDCiconButton("crop_free");
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
        btnDialogGraph,
        // btnHideGraph,
    ]);
    eltBtnContainer.style = `
        position: fixed;
        top: 0;
        right: 0;
        display: flex;
        background-color: #b1dff1;
    `;
    document.body.appendChild(eltBtnContainer);
}
async function dialogGraph() {
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
    const divHiSettingsCard = mkElt("div", { class: "mdc-card" }, [
        mkElt("details", undefined, [
            mkElt("summary", undefined, "Hilite settings"),
            divHiSettingsBody
        ])
    ]);
    divHiSettingsCard.style.backgroundColor = "yellow";
    divHiSettingsCard.style.padding = "10px";

    const divSettingsstyle = `
        display: grid;
        grid-template-columns: max-content max-content;
        gap: 5px;
    `;

    const divSettings = mkElt("div", undefined, [
        mkElt("label", { for: "linkColor" }, "Link color:"), inpLinkColor,
        mkElt("label", { for: "linkW" }, "Link width:"), inpLinkW,
        mkElt("label", { for: "linkOp" }, "Link opacity:"), inpLinkOp,
        // mkElt("label", { for: "textH" }, "Text height:"), inpTextH,
        // mkElt("label", { for: "camDist" }, "Camera distance:"), inpCameraDist,
    ]);
    divSettings.style = divSettingsstyle;
    divHiSettings.style = divSettingsstyle;

    const body = mkElt("div", undefined, [
        mkElt("h2", undefined, "Network graph view settings"),
        divSettings,
        divHiSettingsCard,
        divColors
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
let graph;
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
        rec.tags.forEach(t => {
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
async function addText() {
    let added1html = true;
    graph = graph.nodeThreeObject(node => {
        function addNodeAsText(node) {
            const isFc4i = node.fc4i != undefined;
            const fc4iTitle = node.fc4i?.r.title;
            const txtLong = isFc4i ? fc4iTitle : `Dummy long ${node.id}`;
            /*
            const txtShort = isFc4i ?
                (disemvowel ? fc4iTitle.replace(/[aeiou]/gi, "") : fc4iTitle).slice(0, 15) + "…"
                :
                `Text ${node.id}`;
            */
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
        if (!added1html) {
            added1html = true;
            return addNodeAsHtml(node);
        }
        return addNodeAsText(node);
    });
}

const setInvisibleTags = new Set();

const setHighlightNodes = new Set();
const setHighlightLinks = new Set();
let theHiliteNode = null;
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

    updateLinksView();
}

async function addNodeLinkHighlighter() {
    graph = graph
        .nodeColor(node => setHighlightNodes.has(node) ? node === theHiliteNode ? 'rgb(255,0,0,1)' : 'rgba(255,160,0,0.8)' : 'rgba(0,255,255,0.6)')
        .linkColor(link => {
            if (setInvisibleTags.has(link.text)) {
                return "#0000";
                return;
            }
            let numTags = link.tags.size;
            [...link.tags].forEach(t => { if (setInvisibleTags.has(t)) numTags--; });
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
            let numTags = link.tags.size;
            [...link.tags].forEach(t => { if (setInvisibleTags.has(t)) numTags--; });
            if (numTags == 0) return 0;
            let emp = 1;
            if (numTags > 1) {
                const emphase = 1.3 ** (numTags - 1);
                emp = Math.min(emphase, 2.5);
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
    nodeEl.classList.add("node-label");
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
function updateLinksView() {
    // trigger update of highlighted objects in scene
    graph
        .nodeColor(graph.nodeColor())
        .linkWidth(graph.linkWidth())
        .linkOpacity(graph.linkOpacity())
        .linkColor(graph.linkColor())
        // .linkDirectionalParticles(graph.linkDirectionalParticles())
        ;
}

async function testMyOwn() {
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
        // const a = gData.nodes[link.source];
        const a = gData.nodesById[link.source];
        // const b = gData.nodes[link.target];
        const b = gData.nodesById[link.target];
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
    addText();
    await waitSeconds(1);
    addOnClick();
    addNodeLinkHighlighter();
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
    // Graph.cameraPosition
    graph.cameraPosition(
        newPos, // new position
        node, // lookAt ({ x, y, z })
        3000  // ms transition duration
    );
}
async function testFocus() {
    // https://github.com/vasturiano/3d-force-graph/blob/master/example/click-to-focus/index.html
    const Graph = graphDisplayer.graphData(gData)
        .nodeLabel("id")
        .onNodeClick(node => {
        });
}
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
function testBasic() {
    // https://github.com/vasturiano/3d-force-graph/blob/master/example/basic/index.html
    const Graph = graphDisplayer.graphData(gData);
}
*/