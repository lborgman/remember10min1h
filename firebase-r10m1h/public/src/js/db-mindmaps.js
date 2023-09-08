"use strict";

console.log("here is module db-mindmaps.js", import.meta);
if (document.currentScript) throw Error("import .currentScript"); // is module
if (!import.meta.url) throw Error("!import.meta.url"); // is module

const useLocalStorage = true;

let strPrefix = "jsmindmap-";
export function setDBprefix(prefix) {
    strPrefix = prefix;
    console.warn("setDBprefix", prefix);
}

export async function DBgetAllMindmaps() {
    const all = [];
    if (useLocalStorage) {
        for (let lsKey in localStorage) {
            if (lsKey.startsWith(strPrefix)) {
                const json = localStorage[lsKey];
                const jsmindmap = JSON.parse(json);
                const key = lsKey.substring(strPrefix.length);
                const rec = { key, jsmindmap }
                all.push(rec);
            }
        }
    } else {
        throw Error("NIY");
    }
    return all;
}
export async function DBsetMindmap(keyName, objMindmap) {
    if (keyName !== objMindmap.meta.name) throw Error(`key=${keyName} but objMindmap.meta.name=${objMindmap.meta.name}`);
    if (useLocalStorage) {
        const lsKey = strPrefix + keyName;
        const json = JSON.stringify(objMindmap);
        localStorage.setItem(lsKey, json);
    } else {
        throw Error("NIY");
    }
}
export async function DBgetMindmap(key) {
    const lsKey = strPrefix + key;
    const json = localStorage.getItem(lsKey);
    const obj = JSON.parse(json);
    if (key !== obj.meta.name) {
        if (useLocalStorage) {
            console.error(`key=${key} but obj.meta.key=${obj.meta.key}`);
            alert("Old format, fixing");
            obj.meta.name = key;
            delete obj.meta.key;
            DBsetMindmap(key, obj);
        } else {
            throw Error("NIY");
        }
    }
    return obj;
}
export async function DBremoveMindmap(key) {
    if (useLocalStorage) {
        const lsKey = strPrefix + key;
        localStorage.removeItem(lsKey);
    } else {
        throw Error("NIY");
    }
}
