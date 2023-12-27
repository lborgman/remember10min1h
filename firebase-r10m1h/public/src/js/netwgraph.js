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


function setupGraphDisplayer(opt) {
    const funGraph = ForceGraph3D(opt);
    // debugger;
    funGraph.width(grWidthPx);
    funGraph.height(grHeightPx);
    // funGraph.linkColor("green");
    funGraph.linkColor("#ff0000");
    funGraph.linkWidth(3);
    funGraph.linkOpacity(1.0);
    return funGraph(elt3dGraph);
}
const graphDisplayer = setupGraphDisplayer();

let gData;
chooseView();

function getNodesAndLinks(N, sourceName) {
    switch (sourceName) {
        case "random":
            randomGraph();
            break;
        case "fc4i":
            break;
        default:
            throw Error(`Unknown source name: ${sourceName}`);
    }
    function fc4iGraph() {
        alert("NIY");
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
        mkViewAlt("Basic", testBasic),
        mkViewAlt("Text", testText),
        mkViewAlt("Html class", testHtml),
        mkViewAlt("Focus", testFocus),
        mkViewAlt("My own", testMyOwn),
        mkViewAlt("FH", testFH),
        mkViewAlt("HF", testTF),
    ]);
    divAlts.querySelector("input").checked = true;

    function mkSourceAlt(sourceName, txt) {
        const eltRad = mkElt("input", { type: "radio", name: "source", value: sourceName });
        const eltLbl = mkElt("label", undefined, [eltRad, txt]);
        return mkElt("div", undefined, eltLbl);
    }
    const divAltFc4i = mkElt("div", { class: "mdc-card" }, [
        mkSourceAlt("fc4i", "fc4i")
    ]);

    const inpNumNodes = mkElt("input", { type: "number", value: 10, min: 5, max: 20 });
    const divSource = mkElt("div", { class: "xmdc-card" }, [
        mkElt("h3", undefined, "Source"),
        mkElt("label", undefined, ["Num nodes: ", inpNumNodes]),
        mkSourceAlt("random", "Random links, number nodes"),
        divAltFc4i
    ]);
    divSource.querySelector("input[type=radio]").checked = true;

    const body = mkElt("div", undefined, [
        mkElt("h2", undefined, "Choose view"),
        divAlts,
        mkElt("hr"),
        divSource
    ])
    const answer = await modMdc.mkMDCdialogConfirm(body);
    console.log({ answer });
    if (!answer) return;
    // debugger;
    const radChecked = divAlts.querySelector("input:checked");
    if (!radChecked) return;
    // testText();
    const fun = radChecked.altFun;
    const eltShowAlt = document.getElementById("show-alt");
    eltShowAlt.textContent = fun.name;
    const numNodes = Math.floor(Number(inpNumNodes.value));
    const sourceName = divSource.querySelector("input[name=source]:checked").value;
    getNodesAndLinks(numNodes, sourceName);
    fun();
}
async function testTF() {
    let ourDisplayer = graphDisplayer;
    const useHtml = true;
    let m;
    if (useHtml) {
        m = await import('//unpkg.com/three/examples/jsm/renderers/CSS2DRenderer.js');
        ourDisplayer = setupGraphDisplayer({
            extraRenderers: [new m.CSS2DRenderer()]
        });
    }
    let graph = ourDisplayer.graphData(gData);
    graph = graph.nodeOpacity(1.0);

    // await addHtml();
    addText();
    await waitSeconds(1);
    addOnClick();
    async function addText() {
        // const Graph = graphDisplayer.graphData(gData)
        // .nodeAutoColorBy("group")
        let added1html = true;
        graph = graph.nodeThreeObject(node => {
            function addNodeAsText(node) {
                const sprite = new SpriteText(`Text ${node.id}`);
                // sprite.material.depthWrite = false; // make sprite background transparent
                sprite.material.transparent = false;
                sprite.backgroundColor = "yellow";
                // sprite.backgroundColor = node.color;
                sprite.padding = [1, 2];
                sprite.borderRadius = 2;
                sprite.borderWidth = 1;
                sprite.borderColor = "yellowgreen";
                // sprite.color = node.color;
                sprite.color = "red";
                sprite.textHeight = 14;
                sprite.ourCustom = "sprite our custom";
                return sprite;
            }
            if (!added1html) {
                added1html = true;
                return addNodeAsHtml(node);
            }
            return addNodeAsText(node);
        });
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
    let lastClickedNodeId;
    function addOnClick() {
        console.log("addOnClick >>>>>");
        graph = graph.onNodeClick(node => {
            nodeClickAction(node);
            function nodeClickAction(node) {
                console.log("  addOnClick onNodeClick >>>>> node", node);
                if (lastClickedNodeId == node.id) {
                    console.log("Clicked again", node.id);
                    modMdc.mkMDCdialogAlert(`clicked again ${node.id}`);
                    return;
                }
                lastClickedNodeId = node.id;
                // Aim at node from outside it
                let distance = 40;
                distance = 300; // Should make text 14px easily readable
                distance = 100; // Should make text 14px easily readable
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
            }
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
    let graph = ourDisplayer.graphData(gData);
    graph = graph.nodeOpacity(1.0);

    addOnClick();
    // addText();
    await addHtml();

    async function addText() {
    }
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
    function addOnClick() {
        console.log("addOnClick >>>>>");
        graph = graph.onNodeClick(node => {
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
    let graph = ourDisplayer.graphData(gData);
    graph = graph.nodeOpacity(1.0);

    // if (useHtml) await addHtml();
    addOnClick();

    async function addText() {
    }
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
    function addOnClick() {
        graph = graph.onNodeClick(node => {
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
            sprite.textHeight = 14;
            return sprite;
        });
}
function testBasic() {
    // https://github.com/vasturiano/3d-force-graph/blob/master/example/basic/index.html
    const Graph = graphDisplayer.graphData(gData);
}