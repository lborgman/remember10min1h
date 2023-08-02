console.log("Here is jsmind-edit-spec-fc4i.js");

const modDb = await import("/src/js/db-fc4i.js");
const modJsEditCommon = await import("/src/js/jsmind-edit-common.js");

function showKeyInFc4i(keyFc4i) {
    const objUrl = new URL("/", location);
    objUrl.searchParams.set("showkey", keyFc4i)
    location = objUrl;
}

async function addProviderFc4i() {
    const dbFc4i = await getDbFc4i();
    const linkRendImg = "/img/192.png";
    ourCustomRendererAddProvider({
        name: "fc4i",
        longName: "Flashcard 4 Internet",
        img: linkRendImg,
        getRec: dbFc4i.get1Reminder,
        showRec: showKeyInFc4i,
    });
}
addProviderFc4i();
// modJsEditCommon.basicInit4jsmind();
// modJsEditCommon.pageSetup();

export function dialogMindMapsFc4i(info, arrMindmapsHits) {
    // dialogMindMaps(mkEltLinkMindmapFc4i, info, arrMindmapsHits);
    dialogMindMaps("/fc4i-mindmaps.html", info, arrMindmapsHits);
}
export function ourDialogMindmaps(info, arrMindmapsHits) {
    dialogMindMapsFc4i(info, arrMindmapsHits);
}
