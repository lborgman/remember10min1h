console.log("here is fc4i-import-maps");

const importMap = {
    imports: {
        "acc-colors": "/src/acc-colors.js",
        "db-mindmaps": "/src/js/db-mindmaps.js",
        "db-fc4i": "/src/js/db-fc4i.js",
        "flashcards": "/src/js/mod/flashcards.js",
        "jsmind-edit-common": "/src/js/jsmind-edit-common.js",
        "jsmind-edit-spec-fc4i": "/src/js/jsmind-edit-spec-fc4i.js",
        "jsmind-cust-rend": "/src/js/jsmind-cust-rend.js",
        "my-svg": "/src/js/mod/my-svg.js",
        "new-jsmind.draggable-nodes": "/ext/jsmind/new-jsmind.draggable-nodes.js",
        "util-mdc": "/src/js/mod/util-mdc.js",
    }
};
const im = document.createElement('script');
im.type = 'importmap';
im.textContent = JSON.stringify(importMap);
document.currentScript.after(im);
