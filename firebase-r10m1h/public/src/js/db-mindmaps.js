"use strict";

let strPrefix = "jsmindmap-";
export function setDBprefix(prefix) {
    strPrefix = prefix;
    console.warn("setDBprefix", prefix);
}

export async function DBgetAllMindmaps() {
    const all = [];
    for (let lsKey in localStorage) {
        if (lsKey.startsWith(strPrefix)) {
            const json = localStorage[lsKey];
            const jsmindmap = JSON.parse(json);
            const key = lsKey.substring(strPrefix.length);
            const rec = { key, jsmindmap }
            all.push(rec);
        }
    }
    return all;
}
export async function DBsetMindmap(keyName, objMindmap) {
    if (keyName !== objMindmap.meta.name) throw Error(`key=${keyName} but objMindmap.meta.name=${objMindmap.meta.name}`);
    const lsKey = strPrefix + keyName;
    const json = JSON.stringify(objMindmap);
    localStorage.setItem(lsKey, json);
}
export async function DBgetMindmap(key) {
    const lsKey = strPrefix + key;
    const json = localStorage.getItem(lsKey);
    const obj = JSON.parse(json);
    if (key !== obj.meta.name) {
        console.error(`key=${key} but obj.meta.key=${obj.meta.key}`);
        alert("Old format, fixing");
        obj.meta.name = key;
        delete obj.meta.key;
        DBsetMindmap(key, obj);
    }
    return obj;
}
export async function DBremoveMindmap(key) {
    const lsKey = strPrefix + key;
    localStorage.removeItem(lsKey);
}
