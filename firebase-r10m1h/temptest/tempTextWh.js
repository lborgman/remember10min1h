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
    const bcrJmnode = eltJmnode.getBoundingClientRect();
    function logColored2(what, ...args) {
        const ls = "background:orange; color:black;";
        console.log(`%c ${what}`, ls, ...args);
    }
    logColored2("text line-height", ourLineHeight);
    logColored2("TM text", tm);
    logColored2("bcr Text", bcrText);
    logColored2("bcr jmnode", bcrJmnode);
    const hText = parseFloat(ourLineHeight);
    const textWh = { w: tm.width, h: hText };
    logColored2("text Wh", textWh);
    const getPx = (str) => {
        if (!str.endsWith("px")) throw Error(`Does not end with px: ${str}`);
        return parseFloat(str);
    }
    const jmPadT = getPx(ourJmnodeStyle.paddingTop);
    const jmPadB = getPx(ourJmnodeStyle.paddingBottom);
    const jmPadL = getPx(ourJmnodeStyle.paddingLeft);
    const jmPadR = getPx(ourJmnodeStyle.paddingRight);
    const jmnodeWh = { w: tm.width + jmPadL + jmPadR, h: hText+jmPadT+jmPadB };
    logColored2("jmnode Wh", jmnodeWh);
    return jmnodeWh;
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

var cjmnode;
function test() {
    const jmnode = temp1;
    getJmnodeDefaultSize(jmnode);
    cjmnode?.remove();
    cjmnode = jmnode.cloneNode(true);
    const st = cjmnode.style;
    st.visibility = "hidden";
    st.position = "fixed";
    st.left = 0;
    st.top = 100;
    const jmnodes = jmnode.closest("jmnodes");
    jmnodes.appendChild(cjmnode);
    console.log("HIDDEN------------------");
    getJmnodeDefaultSize(cjmnode);
}