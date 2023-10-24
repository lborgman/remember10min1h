console.log("here is fc4i-importmaps");

const importMap = {
    imports: {
        "acc-colors": "/src/acc-colors.js",
        "color-converter": "/src/js/mod/color-converter.js",
        "db-mindmaps": "/src/js/db-mindmaps.js",
        "db-fc4i": "/src/js/db-fc4i.js",
        "fc4i-items": "/src/js/share.js",
        "flashcards": "/src/js/mod/flashcards.js",
        "idb-common": "/src/js/mod/idb-common.js",
        "images": "/src/js/images.js",
        "is-displayed": "/src/js/is-displayed.js",
        "jsmind-edit-common": "/src/js/jsmind-edit-common.js",
        "jsmind-edit-spec-fc4i": "/src/js/jsmind-edit-spec-fc4i.js",
        "jsmind-cust-rend": "/src/js/jsmind-cust-rend.js",
        "mindmap-helpers": "/src/js/mindmap-helpers.js",
        "my-svg": "/src/js/mod/my-svg.js",
        "new-jsmind.draggable-nodes": "/ext/jsmind/new-jsmind.draggable-nodes.js",
        "pwa": "/src/js/mod/pwa.js",
        "sharing-params": "/src/js/mod/sharing-params.js",
        "util-mdc": "/src/js/mod/util-mdc.js",
    }
};
const im = document.createElement('script');
im.type = 'importmap';
im.textContent = JSON.stringify(importMap);
document.currentScript.after(im);
console.log("END fc4i-importmaps");
