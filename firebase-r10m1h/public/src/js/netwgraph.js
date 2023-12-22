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
const grWidthPx = document.documentElement.clientWidth * 0.6;
const grHeightPx = document.documentElement.clientHeight * 0.6;

const funGraph = ForceGraph3D({
    // width: grWidthPx,
    // height: grHeightPx,
});
// debugger;
funGraph.width(grWidthPx);
funGraph.height(grWidthPx);
// funGraph.width(100);
// funGraph.height(100);
testRandom();

function testRandom() {
    // https://github.com/vasturiano/3d-force-graph/blob/master/example/basic/index.html
    // Random tree
    const N = 30;
    const gData = {
        nodes: [...Array(N).keys()].map(i => ({ id: i })),
        links: [...Array(N).keys()]
            .filter(id => id)
            .map(id => ({
                source: id,
                target: Math.round(Math.random() * (id - 1))
            }))
    };

    // const Graph = ForceGraph3D()
    // (document.getElementById('3d-graph'))
    const Graph = funGraph
        (elt3dGraph)
        .graphData(gData);
}