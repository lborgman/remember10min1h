function clearComputedStyles(eltJmnodes) {
    delete eltJmnodes["jmnodeRootTextStyle"];
    delete eltJmnodes["jmnodeTextStyle"];
}
function getJmnodeDefaultSize(eltJmnode) {
    if (!eltJmnode.isConnected) throw Error("<jmnode> not in document");
    const tn = eltJmnode.nodeName;
    if (tn != "JMNODE") throw Error(`Expected JMNODE, got <${tn}>`);
    const eltTxt = eltJmnode.firstElementChild.nextElementSibling;
    if (!eltTxt.classList.contains("jmnode-text")) throw Error("Not .jmnode-text");

    const isRoot = eltJmnode.classList.contains("root");
    const eltJmnodes = eltJmnode.closest("jmnodes");

    const styleNameText = isRoot ? "jmnodeRootTextStyle" : "jmnodeTextStyle";
    eltJmnodes[styleNameText] = eltJmnodes[styleNameText] || getComputedStyle(eltTxt);
    const ourTextStyle = eltJmnodes[styleNameText];

    const styleNameJmnode = isRoot ? "jmnodeRootJmnodeStyle" : "jmnodeJmnodeStyle";
    eltJmnodes[styleNameJmnode] = eltJmnodes[styleNameJmnode] || getComputedStyle(eltJmnode);
    const ourJmnodeStyle = eltJmnodes[styleNameJmnode];

    const ourLineHeight = ourTextStyle.lineHeight;
    const ourText = eltTxt.textContent;
    // debugger;
    const tm = getTextMetrics(ourText, ourTextStyle);
    const bcrText = eltTxt.getBoundingClientRect();
    function logColored2(what, ...args) {
        const ls = "background:orange; color:black;";
        console.log(`%c ${what}`, ls, ...args);
    }
    logColored2("text line-height", ourLineHeight);
    logColored2("TM text", tm);
    logColored2("bcrText", bcrText);
    const hText = parseFloat(ourLineHeight);
    return { w: tm.width, h: hText };
}
function fontStretchCSS2canvas(fsCss) {
    if (fsCss.indexOf("%") == -1) return fsCss;
    // Percentage values for font-stretch are not allowed for canvas.
    // https://developer.mozilla.org/en-US/docs/Web/CSS/font-stretch
    // Today only the listed percentage values seems to work in CSS (2023-11-18)
    const pc2enum = {
        "50%": "ultra-condensed",
        "62.5%": "extra-condensed",
        "75%": "condensed",
        "87.5%": "semi-condensed",
        "100%": "normal",
        "112.5%": "semi-expanded",
        "125%": "expanded",
        "150%": "extra-expanded",
        "200%": "ultra-expanded",
    }
    const fsCanvas = pc2enum[fsCss];
    if (fsCanvas) return fsCanvas;
    return "unset";
}
function getTextMetrics(txt, computedStyle) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
    context.font = computedStyle.font;
    context.fontKerning = computedStyle.fontKerning;
    const fsCss = computedStyle.fontStretch;
    const fsCanvas = fontStretchCSS2canvas(fsCss);
    console.log(`fs: ${fsCss} => ${fsCanvas}`);
    context.fontStretch = fsCanvas;
    context.letterSpacing = computedStyle.letterSpacing;

    const tm = context.measureText(txt);
    return tm;
}