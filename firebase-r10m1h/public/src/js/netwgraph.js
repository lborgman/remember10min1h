import("pwa");

const modMdc = await import("util-mdc");
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

const modDbMm = await import("db-mindmaps");
const allMm = await modDbMm.DBgetAllMindmaps();
const mm0 = allMm[0];
console.log({ mm0 });
const mm0nodeArray = mm0.jsmindmap.data;
// debugger;



const elt3dGraph = document.getElementById('3d-graph');
const st3d = elt3dGraph.style;
// st3d.width = "60vw";
// st3d.height = "60vh";
const grWidthPx = document.documentElement.clientWidth * 0.8;
const grHeightPx = document.documentElement.clientHeight * 0.8;


let linkW = 1;
let linkOp = 0.2;
let textH = 3;
let cameraDistance = 100;
let disemvowel = false;
const colorsRainbow =
    "violet, deepskyblue, cyan, greenyellow, yellow, orange, red".split(",").map(c => c.trim());

async function dialogGraph() {
    const inpLinkW = mkElt("input", { id: "linkW", type: "number", min: "1", max: "5", value: linkW });
    const inpLinkOp = mkElt("input", {id:"linkOp", type: "range", value: linkOp, step:"0.1", min:"0", max:"1"});
    const inpTextH = mkElt("input", { id: "textH", type: "number", min: "3", max: "20", value: textH });
    const inpCameraDist = mkElt("input", { id: "camDist", type: "number", min: "40", max: "200", step: "20", value: cameraDistance });
    const inpDisemvwl = mkElt("input", { id: "disemw", type: "checkbox" });
    // inpDisemvwl.checked = disemvowel;

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
    })
    const divSettings = mkElt("div", undefined, [
        // mkElt("div", undefined, [
        mkElt("label", { for: "linkW" }, "Link width:"), inpLinkW,
        mkElt("label", { for: "linkOp" }, "Link opacity:"), inpLinkOp,
        // ]),
        // mkElt("div", undefined, [
        mkElt("label", { for: "textH" }, "Text height:"), inpTextH,
        // ]),
        // mkElt("div", undefined, [
        mkElt("label", { for: "camDist" }, "Camera distance:"), inpCameraDist,
        // ]),
        // mkElt("div", undefined, [
        mkElt("label", { for: "disemw" }, "Disemvowel:"), inpDisemvwl,
        // ]),
        divColors,
    ]);
    divSettings.style = `
        display: grid;
        grid-template-columns: max-content max-content;
        gap: 5px;
    `;
    const body = mkElt("div", undefined, [
        divSettings,
        divColors
    ]);
    const answer = await modMdc.mkMDCdialogConfirm(body);
    if (answer) {
        linkW = +inpLinkW.value;
        linkOp = +inpLinkOp.value;
        textH = +inpTextH.value;
        cameraDistance = +inpCameraDist.value;
        disemvowel = inpDisemvwl.checked;
    }
}
await dialogGraph();
async function setupGraphDisplayer(opt) {
    const funGraph = ForceGraph3D(opt);
    // debugger;
    funGraph.width(grWidthPx);
    funGraph.height(grHeightPx);
    // funGraph.linkColor("green");
    funGraph.linkColor("#ff0000");
    funGraph.linkWidth(linkW);
    funGraph.linkOpacity(linkOp);
    return funGraph(elt3dGraph);
}
const graphDisplayer = await setupGraphDisplayer();

let gData;

let arrMatchAll;
let numFc4i;
let requiredTags;
const setRequiredTags = new Set();
let minConf;
let maxConf;
await getFc4iRecs();
async function getFc4iRecs() {
    if (arrMatchAll) return;
    const sp = new URLSearchParams(location.search);

    const parSearchFor = sp.get("searchFor");
    const searchFor = parSearchFor === null ? "" : parSearchFor;

    const parRequiredTags = sp.get("requiredTags");
    requiredTags = parRequiredTags === null ? [] : parRequiredTags.split(",");
    requiredTags.forEach(t => setRequiredTags.add(t));

    const parMinConf = sp.get("minConf");
    minConf = parMinConf === null ? 0 : +parMinConf;
    const parMaxConf = sp.get("maxConf");
    maxConf = parMaxConf === null ? 7 : +parMaxConf;

    // function getDbMatching(searchFor, minConf, maxConf, requiredTags)
    arrMatchAll = await dbFc4i.getDbMatching(searchFor, minConf, maxConf, requiredTags);
    numFc4i = arrMatchAll.length;
}

chooseView();

async function getNodesAndLinks(N, sourceName) {

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
        while (s++ < 2 * N && setI.size < N) {
            const i = Math.floor(Math.random() * lenMatch);
            setI.add(i);
        }
        const arrUse = [...setI].map(i => arrMatch[i]);
        let nodeNum = 0;
        const nodesR = arrUse.map(r => ({ id: nodeNum++, r }));
        const nodes = nodesR.map(r => ({ id: r.id, fc4i: r }));
        const setTags = new Set();
        arrUse.forEach(r => {
            r.tags.forEach(t => setTags.add(t));
        });
        requiredTags.forEach(t => {
            setTags.delete(t);
        });
        const links = [];
        setTags.forEach(t => {
            const arrT = [];
            nodesR.forEach(n => {
                if (n.r.tags.includes(t)) { arrT.push(n) }
            });
            while (arrT.length > 0) {
                const a0 = arrT.pop();
                arrT.forEach(r => {
                    const link = {
                        source: a0.id,
                        target: r.id
                    }
                    links.push(link);
                    const link2 = {
                        source: r.id,
                        target: a0.id
                    }
                    links.push(link2);
                })
            }
        })
        const setLinked = new Set();
        links.forEach(l => {
            setLinked.add(l.source);
            setLinked.add(l.target);
        })
        console.log("NIY");
        // const finNodes = [...setLinked]
        const finNodes = nodes.filter(n => setLinked.has(n.id));
        const numNodes = finNodes.length;
        const eltShowFc4i = document.getElementById("show-fc4i-num");
        eltShowFc4i.textContent = `, fc4i: ${numNodes} (${numFc4i})`;
        gData = { nodes: finNodes, links }
    }
    function randomGraph() {
        // Random tree
        const nodes = [...Array(N).keys()].map(i => ({ id: i }));
        const links = [...Array(N).keys()]
            .filter(id => id)
            .map(id => ({
                source: id,
                target: Math.round(Math.random() * (id - 1))
            }));
        console.log("got nodes and links");
        gData = { nodes, links }
    }
}
async function chooseView() {
    // testBasic();
    // testText();
    // testHtml();

    function mkViewAlt(txt, fun) {
        const eltRad = mkElt("input", { type: "radio", name: "view-alt" });
        eltRad.altFun = fun;
        const txtFun = fun.name;
        const lbl = mkElt("label", undefined, [eltRad, txtFun]);
        return mkElt("p", undefined, lbl);
    }

    const divAlts = mkElt("div", undefined, [
        mkViewAlt("TF", testTF),
        mkViewAlt("Basic", testBasic),
        // mkViewAlt("Text", testText),
        // mkViewAlt("Html class", testHtml),
        // mkViewAlt("Focus", testFocus),
        mkViewAlt("My own", testMyOwn),
        mkViewAlt("FH", testFH),
    ]);
    divAlts.querySelector("input").checked = true;

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
            const s = mkElt("span", {class:"tag-in-our-tags"}, `#${t}`);
            divReqTags.appendChild(s);
        });
    }
    divAltFc4i.appendChild(divReqTags);

    const inpNumNodes = mkElt("input", { type: "number", value: 10, min: 5, max: 20 });
    const divSource = mkElt("div", { class: "xmdc-card" }, [
        mkElt("h3", undefined, "Source"),
        mkElt("div", { style: "display:flex; flex-direction:column; gap:15px" }, [
            divAltFc4i,
            mkSourceAlt("random", "Random links, number nodes"),
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
    // debugger;
    const radChecked = divAlts.querySelector("input:checked");
    if (!radChecked) return;
    // testText();
    const fun = radChecked.altFun;
    const eltShowViewAlt = document.getElementById("show-view-alt");
    eltShowViewAlt.textContent = fun.name;
    const numNodes = Math.floor(Number(inpNumNodes.value));
    const sourceName = divSource.querySelector("input[name=source]:checked").value;
    await getNodesAndLinks(numNodes, sourceName);
    fun();
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
function nodeClickAction(node) {
    console.log("  addOnClick onNodeClick >>>>> node", node);
    if (true || (lastClickedNodeId == node.id)) {
        console.log("Clicked again", node);
        const body = mkElt("div");
        if (node.fc4i) {
            const rec = node.fc4i.r;
            const title = rec.title;
            body.appendChild(
                mkElt("h3", undefined, `${title}`),
            );
            const imgBlob = rec.images ? rec.images[0] : undefined;
            if (imgBlob) {
                const divImg = mkElt("div");
                const st = divImg.style;
                st.height = "100px";
                st.width = "150px";
                st.backgroundSize = "contain";
                st.backgroundPosition = "center";
                st.backgroundImage = `url(${URL.createObjectURL(imgBlob)})`;
                const p = mkElt("p", undefined, divImg);
                p.style.display = "flex";
                p.style.justifyContent = "center";
                body.appendChild(p);
            }
            const linkRec = getLink2KeyInFc4i(rec.key);
            const a = mkElt("a", { href: linkRec }, "Show entry in fc4i");
            body.appendChild(mkElt("p", undefined, a));

            if (rec.tags) {
                body.appendChild(mkElt("h4", undefined, "Tags"));
                const pTags = mkElt("p");
                pTags.style.display = "flex";
                pTags.style.flexWrap = "wrap";
                pTags.style.gap = "10px";
                rec.tags.forEach(t => {
                    const s = mkElt("span", { class: "tag-in-our-tags" }, `#${t}`);
                    if (setRequiredTags.has(t)) { s.style.opacity = 0.5; }
                    pTags.appendChild(s);
                });
                body.appendChild(pTags);
            }
        } else {
            body.appendChild(
                mkElt("span", { style: "color:red;" }, `clicked again ${node.id}`)
            );
        }
        modMdc.mkMDCdialogAlert(body);
        return;
    }
    lastClickedNodeId = node.id;
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
}

function addOnClick() {
    console.log("addOnClick >>>>>");
    graph = graph.onNodeClick(node => {
        nodeClickAction(node);
    });
}

async function addText() {
    // const Graph = graphDisplayer.graphData(gData)
    // .nodeAutoColorBy("group")
    let added1html = true;
    graph = graph.nodeThreeObject(node => {
        function addNodeAsText(node) {
            const isFc4i = node.fc4i != undefined;
            const fc4iTitle = node.fc4i?.r.title;
            const txtLong = isFc4i ? fc4iTitle : `Dummy long ${node.id}`;
            const txtShort = isFc4i ?
                (disemvowel ? fc4iTitle.replace(/[aeiou]/gi, "") : fc4iTitle).slice(0, 15) + "…"
                :
                `Text ${node.id}`;
            const sprite = new SpriteText(txtShort);
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

/////////////////
async function testTF() {
    let ourDisplayer = graphDisplayer;
    const useHtml = true;
    let m;
    if (useHtml) {
        m = await import('//unpkg.com/three/examples/jsm/renderers/CSS2DRenderer.js');
        ourDisplayer = await setupGraphDisplayer({
            extraRenderers: [new m.CSS2DRenderer()]
        });
    }
    graph = ourDisplayer.graphData(gData);
    graph = graph.nodeOpacity(1.0);

    // await addHtml();
    addText();
    await waitSeconds(1);
    addOnClick();
    // graph.onEngineStop(() => graph.zoomToFit(100));
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

}

async function testFH() {
    let ourDisplayer = graphDisplayer;
    const useHtml = true;
    let m;
    if (useHtml) {
        m = await import('//unpkg.com/three/examples/jsm/renderers/CSS2DRenderer.js');
        ourDisplayer = setupGraphDisplayer({
            extraRenderers: [new m.CSS2DRenderer()]
        });
    }
    graph = ourDisplayer.graphData(gData);
    graph = graph.nodeOpacity(1.0);

    addOnClick();
    await addHtml();

    async function addHtml() {
        console.log("addHTML >>>>>");
        let logged1 = false;
        graph = graph.nodeThreeObject(node => {
            console.log("  addHtml .nodeThreeObject >>>>> node", node);
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

            // return new m.CSS2DObject(nodeEl);
            const ret = new m.CSS2DObject(nodeEl);
            console.log("  addHtml .nodeThreeObject <<<< ret", ret);
            return ret;
        })

    }
    function OLDaddOnClick() {
        console.log("addOnClick >>>>>");
        graph = graph.onNodeClick(node => {
            nodeClickAction(node);
            /*
            console.log("  addOnClick onNodeClick >>>>> node", node);
            // Aim at node from outside it
            const distance = 40;
            const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

            const newPos = node.x || node.y || node.z
                ? { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }
                : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

            graph.cameraPosition(
                newPos, // new position
                node, // lookAt ({ x, y, z })
                3000  // ms transition duration
            );
            */
        });
    }

}
async function testMyOwn() {
    const useHtml = true;
    let ourDisplayer = graphDisplayer;
    let m;
    if (useHtml) {
        m = await import('//unpkg.com/three/examples/jsm/renderers/CSS2DRenderer.js');
        ourDisplayer = setupGraphDisplayer({
            extraRenderers: [new m.CSS2DRenderer()]
        });
    }
    graph = ourDisplayer.graphData(gData);
    graph = graph.nodeOpacity(1.0);

    // if (useHtml) await addHtml();
    addOnClick();

    async function addHtml() {
        let logged1 = false;
        graph = graph.nodeThreeObject(node => {
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

    }
    function OLDaddOnClick() {
        graph = graph.onNodeClick(node => {
            nodeClickAction(node);
            /*
            // Aim at node from outside it
            const distance = 40;
            const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

            const newPos = node.x || node.y || node.z
                ? { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }
                : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

            graph.cameraPosition(
                newPos, // new position
                node, // lookAt ({ x, y, z })
                3000  // ms transition duration
            );
            */
        });
    }
}
async function testFocus() {
    // https://github.com/vasturiano/3d-force-graph/blob/master/example/click-to-focus/index.html
    const Graph = graphDisplayer.graphData(gData)
        .nodeLabel("id")
        .onNodeClick(node => {
            // Aim at node from outside it
            const distance = 40;
            const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

            const newPos = node.x || node.y || node.z
                ? { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }
                : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

            Graph.cameraPosition(
                newPos, // new position
                node, // lookAt ({ x, y, z })
                3000  // ms transition duration
            );
        });
}
async function testHtml() {
    console.log("TEST HTLM");
    // https://github.com/vasturiano/3d-force-graph/blob/master/example/html-nodes/index.html
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