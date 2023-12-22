const modD3 = await import("d3");
const mod3d = await import("mod3d-force-graph");
// debugger;

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

const funGraph = ForceGraph3D({
});
// debugger;
funGraph.width(grWidthPx);
funGraph.height(grHeightPx);
const graphDisplayer = funGraph(elt3dGraph)

const gData = getNodesAndLinks();
chooseView();

function getNodesAndLinks() {
    // Random tree
    const N = 30;
    const nodes = [...Array(N).keys()].map(i => ({ id: i }));
    const links = [...Array(N).keys()]
        .filter(id => id)
        .map(id => ({
            source: id,
            target: Math.round(Math.random() * (id - 1))
        }));
    console.log("got nodes and links");
    return { nodes, links }
}
function chooseView() {
    // testBasic();
    testText();
}
async function testText() {
    await import("https://unpkg.com/three");
    await import("https://unpkg.com/three-spritetext");
    // https://github.com/vasturiano/3d-force-graph/blob/master/example/text-nodes/index.html
    const Graph = graphDisplayer.graphData(gData)
        .nodeThreeObject(node => {
            const sprite = new SpriteText(node.id);
            // sprite.material.depthWrite = false; // make sprite background transparent
            sprite.material.transparent = false;
            sprite.backgroundColor = "yellow";
            sprite.padding = 2;
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