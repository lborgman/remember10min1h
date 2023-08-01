console.log("Here is jsmind-edit-spec-jsmindedit.js");

// const modDb = await import("/src/js/db-fc4i.js");

// const modDb = await import("/src/js/db-mindmaps.js");
const modDb = await import("db-mindmaps");

// const modJsEditCommon = await import("/src/js/jsmind-edit-common.js");
const modJsEditCommon = await import("jsmind-edit-common");

modDb.setDBprefix("jsmindedit-");

export function dialogMindMapsJsmindEdit(info, arrMindmapsHits) {
    dialogMindMaps(mkEltLinkMindmapJsmindEdit, info, arrMindmapsHits);
}
export function ourDialogMindmaps(info, arrMindmapsHits) {
    dialogMindMapsJsmindEdit(info, arrMindmapsHits);
}

const u = new URL(location);
const p = u.searchParams;
if (!p.get("mindmap")) dialogMindMapsJsmindEdit();