"use strict";

console.log("here is jsmind-cust-rend.js");

export class providerDetails {
    #name; #longName; #img; #getRec; #showRec;
    constructor(providerRec) {
        // console.warn("providerRec.constructor", providerRec);
        const len = Object.keys(providerRec).length;
        const wantLen = 5;
        if (len !== wantLen) {
            const msg = `providerRec has ${len} keys, but should have ${wantLen}`;
            throw Error(msg);
        }
        checkType(providerRec.name, "string");
        checkType(providerRec.longName, "string");
        checkType(providerRec.img, "string");
        checkType(providerRec.getRec, "function");
        checkType(providerRec.showRec, "function");
        if (providerRec.getRec.length != 1) throw Error("getRec function should take 1 argument");
        if (providerRec.showRec.length != 1) throw Error("showRec function should take 1 argument");
        this.#name = providerRec.name;
        this.#longName = providerRec.longName;
        this.#img = providerRec.img;
        this.#getRec = providerRec.getRec;
        this.#showRec = providerRec.showRec;
    }
    get name() { return this.#name; }
    get longName() { return this.#longName; }
    get img() { return this.#img; }
    get getRec() { return this.#getRec; }
    get showRec() { return this.#showRec; }
}
export class CustomRenderer4jsMind {
    #providers = {};
    // constructor(THEjmDisplayed, linkRendererImg)
    constructor() {
        // this.THEjmDisplayed = THEjmDisplayed;
        // this.linkRendererImg = linkRendererImg;
    }

    setJm(jmDisplayed) {
        this.THEjmDisplayed = jmDisplayed;
    }
    addProvider(objProv) {
        if (!objProv instanceof providerDetails) { throw Error("Not object of class providerDetails"); }
        this.#providers[objProv.name] = objProv;
        console.log("Providers:", this.#providers);
    }
    getProviderNames() { return Object.keys(this.#providers); }
    getCustomRec(key, provider) {
        return this.#providers[provider].getRec(key);
    }
    showCustomRec(key, provider) {
        this.#providers[provider].showRec(key);
    }
    // getOurCustomRenderer().getCustomRec(key, provider);

    customData2jsmindTopic(customKey, customProvider) {
        const eltCustom = mkElt("div");
        const objCustom = {
            key: customKey,
            provider: customProvider // FIX-ME:
        }
        eltCustom.dataset.jsmindCustom = JSON.stringify(objCustom);
        return eltCustom.outerHTML;
    }
    jsmindTopic2customElt(strEltCustom) {
        // FIX-ME: wrong format for DOMParser???
        // this.domParser = this.domParser || new DOMParser();
        // const doc = this.domParser.parseFromString(strEltCustom);
        // const eltCustom = doc.body.firstElementChild;
        const divParse = mkElt("div");
        divParse.innerHTML = strEltCustom;
        const eltCustom = divParse.firstElementChild;

        const strCustom = eltCustom.dataset.jsmindCustom;
        if (typeof strCustom == "undefined") throw Error("strCustom is undefined");
        const objCustom = JSON.parse(strCustom);
        const customImage = theCustomRenderer.getLinkRendererImage(objCustom.provider);
        eltCustom.style.backgroundImage = `url(${customImage})`;
        eltCustom.classList.add("jsmind-custom-image");
        return eltCustom;
    }


    getLinkRendererImage(providerName) {
        // return this.linkRendererImg;
        return this.#providers[providerName].img;
    }
    addJmnodeBgAndText(eltJmnode) { return addJmnodeBgAndText(eltJmnode) }
    fixLeftRightChildren(eltJmnode) { fixLeftRightChildren(eltJmnode); }
    async addEltNodeLink(eltJmnode) {
        const childCount = eltJmnode.childElementCount;
        // console.warn("addEltNodeLink", eltJmnode, childCount);
        if (childCount != 2) throw Error(`childElementCound != 2, ${childCount}`);
        // debugger;
        const node_id = jsMind.my_get_nodeID_from_DOM_element(eltJmnode);
        const node = this.THEjmDisplayed.get_node(node_id);
        const nodeLink = node.data.shapeEtc?.nodeLink;
        // console.log({ node }, node.data.shapeEtc, nodeLink);
        if (nodeLink && nodeLink.length > 0) {
            // item link
            const modMdc = await import("util-mdc");
            const iconLink = modMdc.mkMDCicon("link");
            const eltA = mkElt("a", { href: nodeLink, class: "jsmind-plain-link" }, iconLink);
            const eltA2 = modMdc.mkMDCbuttonA(nodeLink, "", "raised", iconLink);
            eltA2.classList.add("icon-button-40");
            eltA2.classList.add("jsmind-plain-link");

            const iconBtn = modMdc.mkMDCiconButton("link");
            iconBtn.classList.add("icon-button-40");
            const eltA3 = mkElt("a", { href: nodeLink, class: "jsmind-plain-link" }, iconBtn);

            eltJmnode.appendChild(eltA3);
        }
    }
    async updateJmnodeFromCustom(eltJmnode, jmOwner) {
        const eltBefore = eltJmnode.cloneNode(true);
        // console.warn("updateJmnodeFromCustom", eltBefore, eltBefore.childElementCount);
        if (eltJmnode.childElementCount != 3) throw Error(`ChildElementCount != 3, ${eltJmnode.childElementCount}`);

        const tn = eltJmnode.tagName;
        if (tn !== "JMNODE") throw Error(`Not a <jmnode>: ${tn}`)
        if (eltJmnode.childElementCount != 3) {
            debugger;
            return;
        }

        const htmlRendererImg = eltJmnode.lastElementChild;
        // console.log("htmlRenderingImg", htmlRendererImg);
        const strCustom = htmlRendererImg.dataset.jsmindCustom;
        if (!strCustom) throw Error("No jsmindCustom key found on <jmnode>");
        fixRenderImg(htmlRendererImg);
        const objCustom = JSON.parse(strCustom)
        // const keyRec = await get1Reminder(objCustom.key);
        const provider = objCustom.provider;
        if (!provider) throw Error(`strCustom, but no provider: ${strCustom}`);
        const keyRec = await this.#providers[provider].getRec(objCustom.key);

        const divText = eltJmnode.querySelector(".jmnode-text");

        divText.textContent = keyRec.title;
        let backgroundImage;
        if (keyRec.images && (keyRec.images.length > 0)) {
            const blob = keyRec.images[0];
            const urlBlob = URL.createObjectURL(blob);
            const urlBg = `url(${urlBlob})`;
            backgroundImage = urlBg;
            const divBg = eltJmnode.querySelector(".jmnode-bg");
            divBg.style.backgroundImage = backgroundImage;
        }
        /*
        if (jmOwner) {
            htmlTopic.addEventListener("click", evt => {
                // console.log("clicked", eltJmnode);
                // This did not work: eltJmnode.click(evt);
                const node_id = getNodeIdFromDOMelt(eltJmnode);
                this.THEjmDisplayed.select_node(node_id);
            });
        }
        */
    }
    // async updatePlainLink(node, eltJmnode) { debugger; }

    async editNodeDialog(eltJmnode) {
        const idThemeChoices = "theme-choices";
        const modMdc = await import("util-mdc");
        const modJsEditCommon = await import("jsmind-edit-common");
        const modIsDisplayed = await import("is-displayed");

        function somethingToSave() {
            return JSON.stringify(initialShapeEtc) != JSON.stringify(currentShapeEtc);
        }

        // updateCopiesSizes()
        // const onAnyCtrlChange = debounce(applyToCopied);
        const onAnyCtrlChange = throttleTO(applyToCopied);
        function applyToCopied() {
            const changed = somethingToSave();
            console.warn("applyToCopied", changed);
            requestSetStateBtnSave();
            requestUpdateCopiesSizes();
            modJsEditCommon.applyShapeEtc(currentShapeEtc, eltCopied);
        }

        const onCtrlsGrpChg = {
            border: setBorderCopied,
            shadow: onCtrlsChgShadow,
        };
        const ctrlsSliders = {}

        const eltJmnodes = eltJmnode.closest("jmnodes");
        let themeClass;
        eltJmnodes.classList.forEach(entry => {
            const clsName = entry;
            if (clsName.match(/^theme-[a-z0-9]*$/)) themeClass = clsName;
        })
        const eltCopied = eltJmnode.cloneNode(true);
        const bcrOrig = eltJmnode.getBoundingClientRect();
        eltCopied.style.top = 0;
        eltCopied.style.left = 0;
        eltCopied.classList.remove("selected");
        eltCopied.classList.remove("jsmind-hit");
        eltCopied.classList.remove("is-left");
        eltCopied.classList.remove("is-right");
        eltCopied.classList.remove("has-children");
        if (eltCopied.style.width == "") {
            eltCopied.style.width = `${bcrOrig.width}px`;
            eltCopied.style.height = `${bcrOrig.height}px`;
        }

        // https://css-tricks.com/almanac/properties/r/resize/
        // eltCopied.style.overflow = "auto";
        eltCopied.draggable = null;

        const node_ID_copied = jsMind.my_get_nodeID_from_DOM_element(eltJmnode);
        const node_copied = this.THEjmDisplayed.get_node(node_ID_copied)
        const node_copied_data = node_copied.data;
        const initialTempData = {}; // For editing

        // .nodeLink
        // node_copied_data.nodeLink = node_copied_data.nodeLink || "";
        // initialTempData.nodeLink = node_copied_data.nodeLink;

        // .shapeEtc
        node_copied_data.shapeEtc = node_copied_data.shapeEtc || {};
        const copiedShapeEtc = node_copied_data.shapeEtc;

        const initialShapeEtc = JSON.parse(JSON.stringify(copiedShapeEtc));

        initialTempData.height = node_copied_data.height;
        initialTempData.width = node_copied_data.width;
        initialTempData.topic = node_copied.topic;
        const eltCopiedText = eltCopied.querySelector(".jmnode-text"); // FIX-ME:

        const fgColor = node_copied_data["foreground-color"];
        const bgColor = node_copied_data["background-color"];
        if (fgColor) {
            initialTempData.fgColor = fgColor;
            eltCopied.style.color = fgColor;
        }
        if (bgColor) {
            initialTempData.bgColor = bgColor;
            eltCopied.style.backgroundColor = bgColor;
        }

        initialShapeEtc.temp = initialTempData;
        console.log({ copiedShapeEtc, node_copied_data, initialTempData });

        const currentShapeEtc = JSON.parse(JSON.stringify(initialShapeEtc));
        const currentTempData = currentShapeEtc.temp;

        /* 
            css resize does not work well on Android Chrome today (2023-05-01).
            Add a workaround using pointerdown, -move and -up.
            https://javascript.info/pointer-events
            https://plnkr.co/edit/zSi5dCJOiabaCHfw?p=preview&preview
        */
        const jmnodesCopied = mkElt("jmnodes", undefined, eltCopied);
        if (themeClass) jmnodesCopied.classList.add(themeClass);
        const divCopied = mkElt("div", undefined, [
            jmnodesCopied
        ]);
        divCopied.style.position = "relative";
        divCopied.style.height = "200px";
        divCopied.style.width = "100%";
        // https://stackoverflow.com/questions/59010779/pointer-event-issue-pointercancel-with-pressure-input-pen
        divCopied.style.touchAction = "none";

        const lblBorderColor = mkCtrlColor("border.color", "black");

        function onCtrlChgBorderWidth() {
            const dialogBW = currentShapeEtc.border.width;
            if (dialogBW > 0) {
                divBorder.classList.remove("no-specified-border");
            } else {
                divBorder.classList.add("no-specified-border");
            }
            // setBorderCopied();
        }

        function setBorderCopied() {
            debugger; // should not happen any more... soon
            return;
            const w = currentShapeEtc.border.width;
            if (w === 0) {
                eltCopied.style.border = "none";
            } else {
                const bs = currentShapeEtc.border.style;
                const bc = currentShapeEtc.border.color;
                eltCopied.style.border = `${w}px ${bs} ${bc}`;
            }
        }

        const divSliBorderWidth = mkElt("div", undefined, "Width: ");
        let sliBorderWidth;
        async function addSliBorderWidth() {
            const eltCont = divSliBorderWidth;
            const title = "Border width";
            const funChange = onCtrlChgBorderWidth;
            await mkSlider4shapeEtc("border.width", eltCont, 0, 20, 0, 2, title, funChange);
        }


        const initialBorderStyle = initialShapeEtc.border?.style || "solid";
        function mkAltBorderStyle(styleName) {
            const inp = mkElt("input", { type: "radio", name: "borderstyle", value: styleName });
            if (styleName == initialBorderStyle) inp.checked = true;
            const eltShow = mkElt("span", undefined, styleName);
            const ss = eltShow.style;
            ss.width = "800px";
            ss.height = "30px";
            ss.borderBottom = `3px ${styleName} red`;
            ss.marginLeft = "5px";
            ss.marginRight = "20px";
            const lbl = mkElt("label", undefined, [inp, eltShow]);
            lbl.style.display = "inline-block";
            return lbl;
        }
        const divBorderStyle = mkElt("div", { id: "jsmind-ednode-div-border-style", class: "specify-border-detail" }, [
            mkAltBorderStyle("solid"),
            mkAltBorderStyle("dotted"),
            mkAltBorderStyle("dashed"),
            mkAltBorderStyle("double"),
        ]);
        divBorderStyle.addEventListener("change", evt => {
            const borderStyle = getCtrlValBorderStyle()
            console.log({ borderStyle });
            currentShapeEtc.border = currentShapeEtc.border || {};
            currentShapeEtc.border.style = borderStyle;
        });

        const divCanBorder = mkElt("div", { class: "if-can-border" }, [
            divSliBorderWidth,
            lblBorderColor,
            divBorderStyle,
        ]);
        const divCannotBorder = mkElt("div", { class: "if-cannot-border" }, [
            mkElt("p", undefined, "Chosen shape can't have a border")
        ]);
        const divBorder = mkElt("div", { id: "jsmind-ednode-border" }, [
            divCanBorder,
            divCannotBorder,
        ]);

        let borderTabwasSetup = false;
        function setupBorderTab() {
            borderTabwasSetup = true;
            addSliBorderWidth();
            if (!sliBorderWidth) return;
            if (borderTabwasSetup) return;
            inpBorderColor.value = initialShapeEtc.border?.color || "black";
            const borderStyle = initialShapeEtc.border?.style;
            divBorder.querySelectorAll("input[name=borderstyle]")
                .forEach(inp => { if (inp.value == borderStyle) inp.checked = true });
        }
        function activateBorderTab() {
            // FIX-ME:
            setupBorderTab();
            const currentShape = currentShapeEtc.shape;
            if (!modJsEditCommon.shapeCanHaveBorder(currentShape)) {
                divBorder.classList.add("cannot-border");
            } else {
                divBorder.classList.remove("cannot-border");
            }
        }


        const jmnodesShapes = mkElt("jmnodes");
        jmnodesShapes.addEventListener("change", evt => {
            console.log({ evt });
            const target = evt.target;
            const tname = target.name;
            if (tname != "shape") throw Error(`evt.target.name != shape (${tname})`);
            const tval = target.value;
            const eltShape = eltCopied.querySelector(".jmnode-bg");
            modJsEditCommon.clearShapes(eltShape);
            if (tval.length == 0) {
                currentShapeEtc.shape = undefined;
            } else {
                eltShape.classList.add(tval);
                currentShapeEtc.shape = tval;
            }
        });
        if (themeClass) jmnodesShapes.classList.add(themeClass);
        const eltCopiedNoShape = eltCopied.cloneNode(true);
        const divCopiedNoShape = eltCopiedNoShape.querySelector(".jmnode-bg");
        modJsEditCommon.clearShapes(divCopiedNoShape);
        // delete eltCopied.style.border;
        eltCopiedNoShape.style.border = null;
        eltCopiedNoShape.style.boxShadow = null;
        eltCopiedNoShape.style.filter = null;
        eltCopiedNoShape.style.backgroundColor = "rgba(0,0,0,0)";

        const desiredW = 60;
        const origW = bcrOrig.width;
        const scaleCopies = desiredW / origW;

        const formShapes = mkElt("form", undefined, jmnodesShapes);
        const divShapes = mkElt("div", { id: "jsmind-ednode-shape" });

        const arrCopiedChildren = [...eltCopied.querySelectorAll("jmnode>[class|=jsmind-custom-image]")];
        const numCopiedChildren = arrCopiedChildren.length;
        const divChildCoundInfo = mkElt("div", undefined, `Node internal child cound: ${numCopiedChildren}`);
        divShapes.appendChild(divChildCoundInfo);

        divShapes.appendChild(formShapes);

        function mkShapeCopy(shapeClass) {
            const eltCopy4shape = eltCopiedNoShape.cloneNode(true);
            eltCopy4shape.style.position = "relative";
            if (shapeClass) {
                const eltShape = eltCopy4shape.querySelector(".jmnode-bg");
                eltShape.classList.add(shapeClass);
            }
            return eltCopy4shape;
        }
        function mkShapeAlt(shapeClass) {
            const eltCopy4shape = mkShapeCopy(shapeClass);
            const ss = eltCopy4shape.style;
            ss.transformOrigin = "top left";
            ss.scale = scaleCopies;
            const radioVal = shapeClass || "default";
            const inpRadio = mkElt("input", { type: "radio", name: "shape", value: radioVal });
            if (shapeClass) { inpRadio.dataset.shape = shapeClass; }
            const eltLabel = mkElt("label", undefined, [inpRadio, eltCopy4shape])
            return eltLabel;
        }
        let computedStyleCopied;
        let promCompStyleCopied = new Promise(resolve => {
            setTimeout(() => {
                computedStyleCopied = getComputedStyle(eltCopied);
                resolve(computedStyleCopied);
            }, 500);
        })
        setTimeout(() => {
            const bcrCopied = eltCopied.getBoundingClientRect();
            function appendAlt(theAlt) {
                const clipping = mkElt("div", undefined, theAlt);
                const sc = clipping.style;
                sc.width = bcrCopied.width * scaleCopies;
                sc.height = bcrCopied.height * scaleCopies + 30;
                // sc.marginLeft = 10;
                sc.overflow = "clip";
                jmnodesShapes.appendChild(clipping);
            }
            appendAlt(mkShapeAlt());
            modJsEditCommon.arrShapeClasses.forEach(cls => appendAlt(mkShapeAlt(cls)));
            setDialogShapeName(initialShapeEtc.shape);
        }, 500);

        function updateCopiesSizes() {
            const bcrCopied = eltCopied.getBoundingClientRect();
            const desiredW = 60;
            // const origW = bcrOrig.width;
            const origW = bcrCopied.width;
            const scaleCopies = desiredW / origW;
            function updateSize(divSmallCopy) {
                const clipping = divSmallCopy;
                if (clipping.tagName != "DIV") throw Error(`clipping is not DIV: ${clpping.tagName}`);
                const sc = clipping.style;
                sc.width = bcrCopied.width * scaleCopies;
                sc.height = bcrCopied.height * scaleCopies + 30;
                // jmnodesShapes.appendChild(clipping);
                const eltJmnodeSmall = divSmallCopy.querySelector("jmnode");
                const ss = eltJmnodeSmall.style;
                ss.scale = scaleCopies;
                ss.height = eltCopied.style.height;
                ss.width = eltCopied.style.width;
            }
            jmnodesShapes.parentElement.querySelectorAll("jmnodes>div")
                .forEach(clipping => { updateSize(clipping) });
        }


        const inpBgColor = mkElt("input", { type: "color" });
        const inpFgColor = mkElt("input", { type: "color" });
        promCompStyleCopied.then(style => {
            inpBgColor.value = modJsEditCommon.to6HexColor(style.backgroundColor);
            inpFgColor.value = modJsEditCommon.to6HexColor(style.color);
            checkColorContrast();
        });
        // let bgColorChanged;
        // let fgColorChanged;
        inpBgColor.addEventListener("input", evt => {
            // currentShapeEtc.bgColor = inpBgColor.value;
            currentShapeEtc.temp.bgColor = inpBgColor.value;
            // somethingtosave
            onAnyCtrlChange();
            eltCopied.style.backgroundColor = inpBgColor.value;
            checkColorContrast();
        });
        inpFgColor.addEventListener("input", evt => {
            // currentShapeEtc.fgColor = inpFgColor.value;
            currentShapeEtc.temp.fgColor = inpFgColor.value;
            onAnyCtrlChange();
            eltCopied.style.color = inpFgColor.value;
            checkColorContrast();
        });
        const pContrast = mkElt("p");
        async function checkColorContrast() {
            const modContrast = await import("acc-colors");
            const contrast = modContrast.colorContrast(inpFgColor.value, inpBgColor.value);
            console.warn("checkColorContrast", contrast);
            if (contrast > 4.5) {
                pContrast.textContent = "Color contrast is ok.";
                pContrast.style.color = "";
            } else {
                pContrast.textContent = `Color contrast is low: ${contrast.toFixed(1)}.`;
                pContrast.style.color = "red";
            }
        }
        const styleColors = [
            "display: flex",
            "flex-direction: column",
            "gap: 10px"
        ].join("; ");
        const divColors = mkElt("div", { style: styleColors }, [
            mkElt("label", undefined, ["Background color: ", inpBgColor]),
            mkElt("label", undefined, ["Text color: ", inpFgColor]),
            pContrast
        ]);



        const taTopic = modMdc.mkMDCtextFieldTextarea(undefined, 8, 50);
        taTopic.classList.add("jsmind-ednode-topic");
        taTopic.style.resize = "vertical";
        taTopic.addEventListener("input", evt => {
            currentShapeEtc.temp.topic = taTopic.value;
            eltCopiedText.textContent = taTopic.value;
        });
        const tafTopic = modMdc.mkMDCtextareaField("Topic", taTopic, initialTempData.topic);
        modMdc.mkMDCtextareaGrow(tafTopic);


        const inpLink = modMdc.mkMDCtextFieldInput(undefined, "url");
        inpLink.addEventListener("input", evt => {
            console.log("inpLink input");
            currentShapeEtc.nodeLink = inpLink.value;
        });
        const strLink = initialShapeEtc.nodeLink;
        // inpLink.value = strLink;
        const tfLink = modMdc.mkMDCtextField("Link", inpLink, strLink);

        let blobBg;
        const btnAddBg = modMdc.mkMDCbutton("Add background image", "raised");
        btnAddBg.addEventListener("click", evt => {
            addBg();
        });
        const divPasteImage = mkElt("div");
        const divBg = mkElt("div", undefined, [
            mkElt("div", { style: "color:red;" }, "Not ready!"),
            divPasteImage,
            btnAddBg,
        ]);
        async function addBg(blob) {
            const modClipboardImages = await import("clipboard-images");
            const clipboardAccessOk = await modClipboardImages.isClipboardPermissionStateOk();
            if (clipboardAccessOk == false) {
                // debugPasteLine(`addPasteButton event 1`);
                modClipboardImages.alertHowToUnblockPermissions();
                return;
            }
            const resultImageBlobs = await modClipboardImages.getImagesFromClipboard();
            if (Array.isArray(resultImageBlobs)) {
                if (resultImageBlobs.length == 0) {
                    modClipboardImages.alertNoImagesFound();
                } else {
                    const toDiv = divPasteImage;
                    const maxBlobOutSize = 20 * 1000;
                    for (const blob of resultImageBlobs) {
                        const eltImg = await modClipboardImages.mkImageCardFromBigImage(blob, toDiv, maxBlobOutSize);
                        toDiv.appendChild(eltImg);
                    }
                }
            } else {
                // Should be an error object
                const err = resultImageBlobs;
                console.log({ err });
                if (!err instanceof Error) {
                    debugger;
                    throw Error(`resultImages is not instanceof Error`);
                }
                switch (err.name) {
                    case "NotAllowedError":
                        // handleClipboardReadNotAllowed();
                        modClipboardImages.alertHowToUnblockPermissions();
                        break;
                    case "DataError":
                        modClipboardImages.alertNoImagesFound();
                        break;
                    default:
                        debugger;
                        throw Error(`Unknown error name: ${err.name}, ${err.message}`);
                }
            }

            btnAddBg.style.display = "none";
        }
        function removeBg(blob) {
            btnAddBg.style.display = null;
        }
        const divNormalContent = mkElt("div", { class: "normal-content" }, [
            "edit jmnode",
            tafTopic,
            tfLink,
            divBg,
        ]);

        let providerName = "NOT CUSTOM PROVIDED";
        const divCustomContent = mkElt("div", { class: "custom-content" }, [
            mkElt("p", undefined, [
                "This node content is from provider ",
                providerName,
                ". Click the image below to show and edit it:"
            ]),
        ]);

        // const strCopiedCustom = eltCopied.firstElementChild?.dataset.jsmindCustom;
        const strCopiedCustom = eltCopied.lastElementChild?.dataset.jsmindCustom;
        if (strCopiedCustom) {
            const objCopiedCustom = JSON.parse(strCopiedCustom);
            const eltCustomLink = mkElt("div", { class: "jsmind-ednode-custom-link" });
            // const btnCustomLink = mkElt("button", undefined, eltCustomLink);
            // const btnCustomLink = await modMdc.mkMDCbutton(eltCustomLink, "raised");
            const btnCustomLink = await modMdc.mkMDCiconButton(eltCustomLink, "", 48);

            btnCustomLink.addEventListener("click", evt => {
                console.log("goto provider");
                // const strCustom = node_copied_data.custom;
                // const objCustom = JSON.parse(strCustom);
                showKeyInFc4i(objCopiedCustom.key);
            });
            const stCL = eltCustomLink.style;
            // stCL.backgroundImage = `url(${this.linkRendererImg})`;
            stCL.backgroundImage = `url(${this.#providers[objCopiedCustom.provider].img})`;
            stCL.backgroundSize = "cover";
            stCL.width = 48;
            stCL.height = 48;
            stCL.border = "1px solid black";
            stCL.borderRadius = "4px";
            // providerName = objCopiedCustom.provider || "fc4i";
            providerName = objCopiedCustom.provider;
            divCustomContent.appendChild(btnCustomLink);
        }


        const divContent = mkElt("div", { id: "jsmind-ednode-content" }, [
            divNormalContent,
            divCustomContent
        ]);

        if (strCopiedCustom) {
            divContent.classList.add("custom-node");
        }



        // drop-shadow
        // https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/drop-shadow
        const divSliShadowOffX = mkElt("div");
        const divSliShadowOffY = mkElt("div");
        const divSliShadowBlur = mkElt("div");
        // const divSliShadowSpread = mkElt("div");

        const divShadow = mkElt("div", undefined, [
            mkElt("div", undefined, ["Horizontal offset:", divSliShadowOffX]),
            mkElt("div", undefined, ["Vertical offset:", divSliShadowOffY]),
            mkElt("div", undefined, ["Shadow blur:", divSliShadowBlur]),
            // mkElt("div", undefined, ["Shadow spread:", divSliShadowSpread]),
            mkElt("div", undefined, mkCtrlColor("shadow.color", "red")),
        ]);
        let shadowTabWasSetup = false;
        async function addSliShadowOffX() {
            const eltCont = divSliShadowOffX;
            const title = "Shadow horizontal offset";
            await mkSlider4shapeEtc("shadow.offX", eltCont, -10, 10, 0, 2, title, undefined);
        }
        async function addSliShadowOffY() {
            const eltCont = divSliShadowOffY;
            const title = "Shadow vertical offset";
            await mkSlider4shapeEtc("shadow.offY", eltCont, -10, 10, 0, 2, title, undefined);
        }
        async function addSliShadowBlur() {
            const eltCont = divSliShadowBlur;
            const title = "Shadow blur";
            await mkSlider4shapeEtc("shadow.blur", eltCont, 0, 50, 0, 5, title, undefined);
        }



        /////////////////////////////////////
        // Maybe generalize like below? But it gets a bit complicated...
        function getShapeEtcGrpMbr(strShEtc) {
            const arrShEtc = strShEtc.split(".");
            const grpName = arrShEtc[0];
            const mbrName = arrShEtc[1];
            return { grpName, mbrName }
        }
        function setInShapeEtc(val, pathShEtc, targetShEtc) {
            // let grpName, mbrName;
            // https://javascript.info/destructuring-assignment
            // ({ grpName, mbrName } = getGrpMbr(pathShEtc));
            const { grpName, mbrName } =
                typeof pathShEtc == "string" ? getShapeEtcGrpMbr(pathShEtc) : pathShEtc;
            targetShEtc[grpName] = targetShEtc[grpName] || {};
            const grp = targetShEtc[grpName];
            grp[mbrName] = val;
        }
        function getFromShapeEtc(pathShEtc, sourceShEtc) {
            const { grpName, mbrName } =
                typeof pathShEtc == "string" ? getShapeEtcGrpMbr(pathShEtc) : pathShEtc;
            const grp = sourceShEtc[grpName];
            if (!grp) return;
            return grp[mbrName];
        }



        function mkCtrlColor(pathShEtc, defaultColor) {
            const objShEtc = getShapeEtcGrpMbr(pathShEtc);
            const initColor = getFromShapeEtc(objShEtc, initialShapeEtc) || defaultColor;
            const initHex6 = modJsEditCommon.to6HexColor(initColor);
            const inpColor = mkElt("input", { type: "color", value: initHex6 });
            // const funGrp = onCtrlsGrpChg[objShEtc.grpName];
            inpColor.addEventListener("input", (evt) => {
                console.log("inpColor, input", inpColor.value);
                setInShapeEtc(inpColor.value, objShEtc, currentShapeEtc);
                // setBorderCopied();
                // if (funGrp) funGrp();
            });
            inpColor.addEventListener("change", (evt) => {
                console.log("inpColor, change", inpColor.value);
                // setBorderCopied();
            });
            const lbl = mkElt("label", { class: "specify-border-detail" }, [
                "Color: ", inpColor
            ]);
            return lbl;
        }

        async function mkSlider4shapeEtc(pathShEtc, eltCont, min, max, defaultVal, step, title, funChgThis) {
            const objShEtc = getShapeEtcGrpMbr(pathShEtc);
            const initVal = getFromShapeEtc(objShEtc, initialShapeEtc) || defaultVal;
            let sli = ctrlsSliders[pathShEtc];
            if (sli) return;
            const funChange = () => {
                setInCurrent();
                if (funChgThis) funChgThis();
                const funGrp = onCtrlsGrpChg[objShEtc.grpName];
                onAnyCtrlChange(); // throttle
            }
            function setInCurrent() {
                const mdc = sli?.myMdc;
                const val = mdc?.getValue();
                if (val == undefined) return;
                setInShapeEtc(val, objShEtc, currentShapeEtc);
            }
            sli = await modIsDisplayed.mkSliderInContainer(eltCont, min, max, initVal, step, title, funChange);
            ctrlsSliders[pathShEtc] = sli;
        }
        /////////////////////////////////////

        function setupShadowTab() {
            if (shadowTabWasSetup) return;
            const promBlur = addSliShadowBlur();
            // const promSpread = addSliShadowSpread();
            const promOffX = addSliShadowOffX();
            const promOffY = addSliShadowOffY();
            // if (!(sliShadowOffX && sliShadowOffY && sliShadowBlur)) return;
            shadowTabWasSetup = true;
        }
        function activateShadowTab() {
            console.log("clicked shadow tab");
            setupShadowTab();
        }

        const divThemeChoices = mkElt("div", { id: idThemeChoices });
        const divColorThemes = mkElt("div", undefined, [
            "Themes are for all nodes",
            divThemeChoices,
        ]);
        const oldThemeCls = getJsmindTheme(jmnodesCopied);
        console.log({ oldTheme: oldThemeCls });
        setupThemeChoices(oldThemeCls);
        function setupThemeChoices(oldThemeCls) {
            const arrFormThemes = modJsEditCommon.getMatchesInCssRules(/\.(theme-[^.#\s]*)/);
            function mkThemeAlt(cls) {
                const themeName = cls.substring(6);
                // console.log("mkThemeAlt", { cls, themeName });
                const inpRadio = mkElt("input", { type: "radio", name: "theme", value: cls });
                if (cls == oldThemeCls) inpRadio.checked = true;
                const eltLbl = mkElt("label", undefined, [inpRadio, themeName]);
                return mkElt("jmnodes", { class: cls },
                    mkElt("jmnode", undefined, eltLbl)
                );
            }
            arrFormThemes.forEach(cls => {
                divThemeChoices.appendChild(mkThemeAlt(cls));
            });

            // https://javascript.info/events-change-input
            divThemeChoices.addEventListener("change", evt => {
                evt.stopPropagation();
                console.log("theme change", evt.target);
            });
            divThemeChoices.addEventListener("input", evt => {
                evt.stopPropagation();
                console.log("theme input", evt.target);
                const theme = evt.target.value;
                setJsmindTheme(jmnodesCopied, theme);
            });


        }


        // console.log("setting up tabs bar", eltCopied);
        // mkMdcTabBarSimple(tabsRecs, contentElts, moreOnActivate) 
        const tabRecs = ["Content", "Shapes", "Border", "Shadow", "Colors", "Themes"];
        const contentElts = mkElt("div", undefined, [divContent, divShapes, divBorder, divShadow, divColors, divColorThemes]);
        if (tabRecs.length != contentElts.childElementCount) throw Error("Tab bar setup number mismatch");
        const onActivateMore = (idx) => {
            // console.log("onActivateMore", idx);
            switch (idx) {
                case 0:
                    break;
                case 1:
                    break;
                case 2:
                    activateBorderTab();
                    break;
                case 3:
                    activateShadowTab();
                    break;
                case 4:
                    break;
                case 5:
                    activateThemesTab();
                    break;
                default:
                    throw Error(`There is no tab at idx=${idx} `);
            }
        }

        function activateThemesTab() {
            console.log("activateThemesTab");
            const divThemeChoices = document.getElementById(idThemeChoices);
            checkThemesContrast(divThemeChoices);
        }
        let allThemesContrastsChecked = false;
        async function checkThemesContrast(divThemeChoices) {
            if (allThemesContrastsChecked) return;
            const modContrast = await import("acc-colors");
            setTimeout(() => {
                try {
                    const markWithOutline = false;
                    divThemeChoices.querySelectorAll("jmnode").forEach(jmnode => {
                        const s = getComputedStyle(jmnode);
                        const fgColor = s.color;
                        const bgColor = s.backgroundColor;
                        const contrast = modContrast.colorContrast(fgColor, bgColor);
                        if (contrast < 3.0) {
                            jmnode.classList.add("low-theme-contrast");
                        }
                        if (markWithOutline) {
                            if (contrast < 7) jmnode.style.outline = "1px dotted red";
                            if (contrast < 4.5) jmnode.style.outline = "4px dotted red";
                            if (contrast < 3.0) jmnode.style.outline = "6px dotted red";
                            if (contrast < 2.5) jmnode.style.outline = "8px dotted red";
                            if (contrast < 2.0) jmnode.style.outline = "10px dotted red";
                        }
                        const fgHex = to6HexColor(fgColor);
                        const fgHexCorrect = getCorrectTextColor(bgColor);
                        if (fgHex !== fgHexCorrect) {
                            jmnode.style.outlineColor = "black";
                        }
                        if (contrast < 4.5) {
                            // console.log(jmnode.textContent, { fgColor, bgColor, fgHexCorrect, fgHex, contrast });
                        }
                    });
                    allThemesContrastsChecked = true;
                    console.log({ allThemesContrastsChecked });
                } catch (err) {
                    console.error("checkThemesContrast", err);
                }
            }, 1000);
        }

        contentElts.classList.add("tab-elts");
        contentElts.addEventListener("change", evt => {
            console.log("contentElts change", evt.target);
            onAnyCtrlChange(); // throttle
        });
        contentElts.addEventListener("input", evt => {
            console.log("contentElts input", evt.target);
            onAnyCtrlChange(); // throttle
        });

        const tabBar = modMdc.mkMdcTabBarSimple(tabRecs, contentElts, onActivateMore);
        const divParts = mkElt("div", undefined, [
            divCopied,
            tabBar,
            contentElts,
            // detThemes,
        ])
        const body = mkElt("div", { id: "jsmind-ednode" }, [
            mkElt("h2", undefined, "Edit node"),
            divParts,
        ]);


        // The workaround:
        const thumbSize = "50";
        const style = [
            `width:${thumbSize}px`,
            `height:${thumbSize}px`,
        ].join(";");
        const icon = modMdc.mkMDCicon("resize");
        icon.style.fontSize = `${thumbSize}px`;
        const thumb = mkElt("span", { style }, icon);
        thumb.id = "jsmind-ednode-copied-resizer";
        thumb.title = "Resize";
        // if (confirm("thumb absolute?")) thumb.style.position = "absolute";
        thumb.style.position = "absolute";
        // console.log({ thumb });
        divCopied.appendChild(thumb);
        let bcrC, bcrT;
        let newBcrC;
        thumb.style.visibility = "hidden";
        // thumb.style.display = "none";
        setTimeout(async () => {
            const eltMutations = thumb.parentElement.parentElement.parentElement
            const resMu = await wait4mutations(eltMutations, 500);
            // console.log({ resMu });
            bcrC = eltCopied.getBoundingClientRect();
            bcrT = thumb.getBoundingClientRect();
            // thumb.style.display = "block";
            if (thumb.style.position == "fixed") {
                thumb.style.left = bcrC.left + bcrC.width - bcrT.width / 2 + "px";
                thumb.style.top = bcrC.top + bcrC.height + - bcrT.height / 2 + "px";
            } else if (thumb.style.position == "absolute") {
                // const bcrDiv = divCopied.getBoundingClientRect();
                const bcrJmnodes = jmnodesCopied.getBoundingClientRect();
                thumb.style.left = bcrC.right - bcrT.width / 2 - bcrJmnodes.left + "px";
                thumb.style.top = bcrC.bottom - bcrT.height / 2 - bcrJmnodes.top + "px";
            } else {
                debugger;
            }
            thumb.style.visibility = "visible";
            newBcrC = eltCopied.getBoundingClientRect();
        },
            // 100 - too small, strange things happens!
            // 500
            1
        );

        let thumbShiftX, thumbShiftY;
        let thumbStartX, thumbStartY;
        function onThumbDown(evts) {
            console.log("onThumbDown", { evts });
            evts.preventDefault(); // prevent selection start (browser action)

            const bcrThumb = thumb.getBoundingClientRect();
            bcrC = eltCopied.getBoundingClientRect();
            const evt = evts[0] || evts;
            thumbStartX = evt.clientX;
            thumbStartY = evt.clientY;
            thumbShiftX = thumbStartX - bcrThumb.left;
            thumbShiftY = thumbStartY - bcrThumb.top;

            thumb.setPointerCapture(evts.pointerId);
            thumb.onpointermove = onThumbMove;
            thumb.onpointerup = evts => {
                console.log("onpointerup", { evts });
                thumb.onpointermove = null;
                thumb.onpointerup = null;
                newBcrC = eltCopied.getBoundingClientRect();
                currentTempData.width = newBcrC.width;
                currentTempData.height = newBcrC.height;
                // FIX-ME: check somethingtosave
                // somethingToSave();
                onAnyCtrlChange();
            }
        };

        let n = 0;
        function onThumbMove(evts) {
            const target = evts.target;
            const evt = evts[0] || evts;
            const nowX = evt.clientX;
            const nowY = evt.clientY;
            if (thumb.style.position == "fixed") {
                thumb.style.left = nowX - thumbShiftX + 'px';
                thumb.style.top = nowY - thumbShiftY + 'px';
            } else if (thumb.style.position == "absolute") {
                // const bcrDiv = divCopied.getBoundingClientRect();
                const bcrJmnodes = jmnodesCopied.getBoundingClientRect();
                thumb.style.left = nowX - thumbShiftX - bcrJmnodes.left + 'px';
                thumb.style.top = nowY - thumbShiftY - bcrJmnodes.top + 'px';
            } else {
                debugger;
            }
            const diffLeft = nowX - thumbStartX;
            const diffTop = nowY - thumbStartY;
            // return;
            eltCopied.style.width = bcrC.width + diffLeft + "px";
            eltCopied.style.height = bcrC.height + diffTop + "px";
        };

        thumb.onpointerdown = onThumbDown;
        thumb.ondragstart = () => false;



        // Getters and setters for dialog input values
        function setDialogShapeName(shapeName) {
            const inpShape = divShapes.querySelector(`input[name=shape][value=${shapeName}]`);
            if (inpShape) inpShape.checked = true;
        }



        /////////// Shadow


        /////////// Border

        // let initValSliBorderWidth;
        function getCtrlValBorderWidth(val) {
            // FIX-ME:
            const mdc = sliBorderWidth?.myMdc;
            return mdc?.getValue();
        }

        function getCtrlValBorderStyle() {
            return divBorderStyle.querySelector("[name=borderstyle]:checked").value;
        }

        function getCtrlValBorderColor(val) {
            return inpBorderColor.value;
        }


        function getCtrlValShadowBlur() {
            const mdc = sliShadowBlur?.myMdc;
            return mdc?.getValue();
        }
        function onCtrlsChgShadow() {
            // const b = getCtrlValShadowBlur();
            const b = getFromShapeEtc("shadow.blur", currentShapeEtc) || 0;
            if (b <= 0) { eltCopied.style.filter = "none"; return; }
            const s = getFromShapeEtc("shadow.spread", currentShapeEtc) || 0;
            const x = getFromShapeEtc("shadow.offX", currentShapeEtc) || 0;
            const y = getFromShapeEtc("shadow.offY", currentShapeEtc) || 0;
            if (isNaN(b) || isNaN(x) || isNaN(y)) {
                console.error("Some shadow val is not set yet");
                return;
            }
            const c = getFromShapeEtc("shadow.color", currentShapeEtc) || "red";
            eltCopied.style.filter = `drop-shadow(${x}px ${y}px ${b}px ${s}px ${c})`;
        }

        let btnSave;
        function getBtnSave() {
            if (btnSave) return btnSave;
            // const contBtns = body.querySelector(".mdc-dialog__actions");
            const contBtns = body.closest(".mdc-dialog__surface").querySelector(".mdc-dialog__actions");
            // FIX-ME: Should be the first?
            btnSave = contBtns.querySelector("button");
            if (btnSave.textContent != "save") throw Error("Did not find the save button");
            return btnSave;
        }
        function setStateBtnSave() {
            const btn = getBtnSave();
            if (!btn) return;
            btn.disabled = !somethingToSave();
        }
        const throttleStateBtnSave = throttleTO(setStateBtnSave, 300);
        function requestSetStateBtnSave() { throttleStateBtnSave(); }
        requestSetStateBtnSave();

        const throttleUpdateCopiesSizes = throttleTO(updateCopiesSizes, 300);
        function requestUpdateCopiesSizes() { throttleUpdateCopiesSizes(); }


        const save = await modMdc.mkMDCdialogConfirm(body, "save", "cancel");
        console.log({ save });
        if (save) {
            if (!somethingToSave()) throw Error("Save button enabled but nothing to save?");

            // FIX-ME: temp
            const currTemp = currentShapeEtc.temp;
            const initTemp = initialShapeEtc.temp;
            delete currentShapeEtc.temp;
            node_copied_data.shapeEtc = currentShapeEtc;

            const sameTopic = currTemp.topic == initTemp.topic;
            if (!sameTopic) {
                this.THEjmDisplayed.update_node(node_ID_copied, currTemp.topic);
            }

            const sameW = currTemp.width == initTemp.width;
            const sameH = currTemp.height == initTemp.height;
            console.log({ currTemp, initTemp, sameW, sameH });
            if (!sameW || !sameH) {
                this.THEjmDisplayed.set_node_background_image(node_ID_copied, undefined, currTemp.width, currTemp.height);
                delete currTemp.width;
                delete currTemp.height;
            }
            console.log({ currTemp });

            setTimeout(async () => {
                console.log("setTimeout in save", { eltJmnode });
                // FIX-ME: set size once again to trigger a reflow. (Bug in jsMind.)
                this.THEjmDisplayed.set_node_background_image(node_ID_copied, undefined, currTemp.width, currTemp.height);
                await modJsEditCommon.fixJmnodeProblem(eltJmnode);
                modJsEditCommon.applyNodeShapeEtc(node_copied, eltJmnode);
                DBrequestSaveThisMindmap(this.THEjmDisplayed);

                // FIX-ME: use lastElementChild instead???
                // if (node_copied.data.fc4i) this.updateJmnodeFromCustom(eltJmnode);
                const eltLast = eltJmnode.lastElementChild;
                if (!eltLast) return;
                const strCustom = eltLast.dataset.jsmindCustom;
                if (strCustom) {
                    this.updateJmnodeFromCustom(eltJmnode);
                } else {
                    this.addEltNodeLink(eltJmnode);
                }
            }, 1100);


            const sameFgColor = currTemp.fgColor == initTemp.fgColor;
            const sameBgColor = currTemp.bgColor == initTemp.bgColor;
            if (!sameFgColor || !sameBgColor) {
                this.THEjmDisplayed.set_node_color(node_ID_copied, currTemp.bgColor, currTemp.fgColor);
            }

        }
    }
    jmnodeDblclick = (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        evt.stopImmediatePropagation();
        const target = evt.target;
        let eltJmnode = target;
        const tn = target.tagName;
        if (tn !== "JMNODE") { eltJmnode = target.closest("jmnode"); }
        this.editNodeDialog(eltJmnode);
    }
}
const cr4j = new CustomRenderer4jsMind();
console.log({ cr4j });

function addJmnodeBgAndText(eltJmnode) {
    const eltTxt = mkElt("div", { class: "jmnode-text" });
    eltTxt.classList.add("multiline-ellipsis");
    const eltBg = mkElt("div", { class: "jmnode-bg" });
    eltJmnode.insertBefore(eltTxt, eltJmnode.firstElementChild);
    eltJmnode.insertBefore(eltBg, eltJmnode.firstElementChild);
    return { eltTxt, eltBg };
}

function fixRenderImg(eltImg) {
    eltImg.classList.add("jsmind-renderer-img");
    const strCustom = eltImg.dataset.jsmindCustom;
    const objCustom = JSON.parse(strCustom);
    const bgImg = theCustomRenderer.getLinkRendererImage(objCustom.provider);
    eltImg.style.backgroundImage = `url(${bgImg})`;
}

function fixLeftRightChildren(eltJmnode) {
    const node_id = jsMind.my_get_nodeID_from_DOM_element(eltJmnode);
    // FIX-ME: root
    if (node_id == "root") return;
    console.log("old eltJmnode.draggable", eltJmnode.draggable);
    eltJmnode.draggable = true;

    const node = theCustomRenderer.THEjmDisplayed.get_node(node_id)
    const isLeft = node.direction == -1;
    if (!isLeft && node.direction != 1) throw Error(`isLeft but node.direction==${node.direction}`);
    const hasChildren = node.children.length > 0;
    eltJmnode.classList.remove("is-left");
    eltJmnode.classList.remove("is-right");
    eltJmnode.classList.remove("has-children");
    if (hasChildren) {
        eltJmnode.classList.add("has-children");
        if (isLeft) {
            eltJmnode.classList.add("is-left");
        } else {
            eltJmnode.classList.add("is-right");
        }
        if (node.expanded) eltJmnode.classList.add("is-expanded");
    }
}

function getJsmindTheme(eltJmnodes) {
    checkTagName(eltJmnodes, "JMNODES");
    const themes = [...eltJmnodes.classList].filter(cls => cls.startsWith("theme-"));
    if (themes.length > 1) {
        const err = `There seems to be several JsMind themes`
        console.error(err, eltJmnodes, themes);
        throw Error(err);
    }
    return themes[0];
}
function setJsmindTheme(eltJmnodes, theme) {
    checkTagName(eltJmnodes, "JMNODES");
    const strJsmindThemeStart = "theme-"
    if (!theme.startsWith(strJsmindThemeStart)) Error(`${theme} is not a jsmind theme`);
    const arrCls = [...eltJmnodes.classList];
    arrCls.forEach(cls => {
        if (cls.startsWith(strJsmindThemeStart)) eltJmnodes.classList.remove(cls)
    });
    eltJmnodes.classList.add(theme);
}

function checkTagName(elt, expectName) {
    const tn = elt.nodeName;
    if (elt.nodeName !== expectName) {
        console.error(`Expected DOM elt ${expectName}, got ${tn}`, elt);
        throw Error(`Expected DOM elt ${expectName}, got ${tn}`);
    }
}
