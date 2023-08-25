console.log("Here is jsmind-edit-spec-fc4i.js");

// const modDb = await import("db-fc4i");
// const modJsEditCommon = await import("jsmind-edit-common");

function getLink2KeyInFc4i(keyFc4i) {
    const objUrl = new URL("/", location);
    objUrl.searchParams.set("showkey", keyFc4i)
    // location = objUrl;
    return objUrl.href;
}

async function addProviderFc4i() {
    // const dbFc4i = await getDbFc4i();
    const dbFc4i = await import("db-fc4i");
    const modMMhelpers = await import("mindmap-helpers");
    const linkRendImg = "/img/192.png";
    modMMhelpers.ourCustomRendererAddProvider({
        name: "fc4i",
        longName: "Flashcard 4 Internet",
        img: linkRendImg,
        getRec: dbFc4i.get1Reminder,
        getRecLink: getLink2KeyInFc4i,
    });
}
addProviderFc4i();
// modJsEditCommon.basicInit4jsmind();
// modJsEditCommon.pageSetup();

async function dialogMindMapsFc4i(info, arrMindmapsHits) {
    // dialogMindMaps(mkEltLinkMindmapFc4i, info, arrMindmapsHits);
    // dialogMindMaps("/fc4i-mindmaps.html", info, arrMindmapsHits);
    const modMMhelpers = await import("mindmap-helpers");
    modMMhelpers.dialogMindMaps("/mm4i/mm4i.html", info, arrMindmapsHits);
}
export function ourDialogMindmaps(info, arrMindmapsHits) {
    dialogMindMapsFc4i(info, arrMindmapsHits);
}
