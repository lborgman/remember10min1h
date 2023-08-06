console.log("here is fc4i-import-maps");

const importMap = {
    imports: {
        "util-mdc": "/src/js/mod/util-mdc.js",
        "db-mindmaps": "/src/js/db-mindmaps.js",
        "db-fc4i": "/src/js/db-fc4i.js",
        "jsmind-edit-common": "/src/js/jsmind-edit-common.js",
        "jsmind-cust-rend": "/src/js/jsmind-cust-rend.js",
        "new-jsmind.draggable-nodes": "/ext/jsmind/new-jsmind.draggable-nodes.js",
    }
};
const im = document.createElement('script');
im.type = 'importmap';
im.textContent = JSON.stringify(importMap);
document.currentScript.after(im);
