// Module for linking external images.
// The user provides the links which I guess will avoid copyright problems.

/////// Google Photos
//// labnol only works for photos, not videos. Use only in private tab.
// https://www.labnol.org/embed/google/photos/ (embed iframe, direct link)
//// Simple instructions to get a link. Not useful here.
// https://www.picbackman.com/tips-tricks/how-to-get-a-direct-link-to-an-image-in-google-photos/

/////// YouTube
// https://developers.google.com/youtube/player_parameters
// https://developers.google.com/youtube/iframe_api_reference

// https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
console.log("here is external-images.js");

const modMdc = await import("util-mdc");

// https://stackoverflow.com/questions/5845238/javascript-generate-transparent-1x1-pixel-in-dataurl-format
const createPlaceholderSrc = (w, h) => {
    // var img = document.createElement('img');
    // img.setAttribute('style', 'width:'+w+'px;height:'+h+'px;border:none;display:block');
    // img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
    // return img;
    return 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
}

export function dialogReason() {
    const bdy = mkElt("div", { class: "colored-dialog" }, [
        mkElt("h2", undefined, "Copyright and images"),
        mkElt("p", undefined,
            `
            There are many wonderful images on the Internet.
            Some (but not all!) of these images can technically be used
            by any website.
            But this may not be legally possible because of copyright.
        `),
        mkElt("p", undefined,
            `
            However you may personally without legal problems
            use these images on your own computer.
        `),
        mkElt("p", undefined,
            `
            This is the reason I do not provide links to 
            any of these images.
            Since if I do I might impinge on the copyright.
            So I let you choose the images you want instead.
        `),
    ]);
    modMdc.mkMDCdialogAlert(bdy);
}
const KEY = "external-images";
export function getImagesRec(prefix) {
    if (typeof prefix != "string") throw Error("prefix is not a string");
    if (prefix.length == 0) throw Error("prefix.length == 0");
    const strJson = localStorage.getItem(prefix + KEY);
    if (!strJson) return [];
    const objJson = JSON.parse(strJson);
    return objJson;
}
function setImagesRec(prefix, objJson) {
    if (typeof prefix != "string") throw Error("prefix is not a string");
    if (prefix.length == 0) throw Error("prefix.length == 0");
    const strJson = JSON.stringify(objJson);
    localStorage.setItem(prefix + KEY, strJson);
}

export function getCurrentImageUrl(prefix) {
    const obj = getImagesRec(prefix);
    return obj[0];
}

export async function dialogImages(prefix, arrBuiltin) {
    let okButton;
    const tellMeOkButton = (btn) => {
        okButton = btn;
    }

    // const btnCopyright = mkElt("button", undefined, "Explain");
    const iconCopyright = modMdc.mkMDCicon("copyright");
    // const btnCopyright = modMdc.mkMDCiconButton(iconCopyright, "Explain copyright issues");
    const btnCopyright = modMdc.mkMDCfab(iconCopyright, "Explain copyright issues", true);
    btnCopyright.addEventListener("click", evt => { dialogReason(); });

    // const inpUrlImage = mkElt("input", { type: "url" });
    // const lblUrlImage = mkElt("label", undefined, ["Image url:", inpUrlImage]);

    const imgNewPreview = mkElt("img");
    imgNewPreview.style = `
        width: 50%;
        aspect-ratio: 1.6 / 1;
        outline: 1px dotted red;
        background-color: #80808060;
    `;
    const btnSaveNew = modMdc.mkMDCbutton("Save", "raised");
    btnSaveNew.style.display = "none";
    btnSaveNew.addEventListener("click", evt => {
        const recs = getImagesRec(prefix) || [];
        recs.push(inpURL.value.trim());
        setImagesRec(prefix, recs);
    })
    const divNewPreview = mkElt("div", undefined, [imgNewPreview, btnSaveNew]);
    divNewPreview.style = `
        display: flex;
        gap: 10px;
        align-items: center;
    `;
    async function isImage(urlImage) {
        return new Promise((resolve, reject) => {
            imgNewPreview.onload = () => resolve(true);
            imgNewPreview.onerror = () => resolve(false);
            imgNewPreview.src = urlImage;
        });
    }
    const debounceCheckIsImage = debounce(checkIsImage, 700);

    const inpURL = modMdc.mkMDCtextFieldInput(undefined, "url");
    async function checkIsImage(urlImage) {
        const res = await isImage(urlImage);
        console.log({ res });
        if (!res) {
            btnSaveNew.style.display = "none";
            inpURL.setCustomValidity("Is this an image? Does CORS prevent access to it?");
            inpURL.reportValidity();
        } else {
            btnSaveNew.style.display = null;
            inpURL.setCustomValidity("");
        }
    }

    // inpURL.classList.add("remember-url");
    const reportInpURLvalidity = () => inpURL.reportValidity();
    const debounceReportInpURLvalidity = debounce(reportInpURLvalidity, 700);
    inpURL.addEventListener("input", evt => {
        const val = inpURL.value.trim();
        // Not possible to put something over the iframe.
        // And iframe is the only way to link to YouTube.
        /*
        if (false && val.startsWith("<iframe")) {
            debugger;
            inpURL.type = "text";
            const tempHtml = mkElt("div");
            tempHtml.innerHTML = val;
            const eltIframe = tempHtml.firstElementChild;
            const h = eltIframe.height;
            const w = eltIframe.width;
            const src = eltIframe.src;
            const srcAuto = src+"&autoplay=1&mute=1"
            eltIframe.src = srcAuto;
            // eltIframe.height = null;
            eltIframe.removeAttribute("height");
            // eltIframe.width = null;
            eltIframe.removeAttribute("width");
            // eltIframe.allowfullscreen = null;
            eltIframe.removeAttribute("allowfullscreen");
            // eltIframe.allow = null;
            eltIframe.removeAttribute("allow");
            eltIframe.style = `
                width: 100%;
                aspect-ratio: ${w} / ${h};
            `;
            const eltOverlay = mkElt("div");
            eltOverlay.addEventListener("click", evt =>{
                evt.stopImmediatePropagation();
                evt.stopPropagation();
                console.log("clicked eltOverlay");
            });
            eltOverlay.style = `
                position: absolute;
                background: #f006;
                width: 100px;
                height: 100px;
            `;
            const eltContainer = mkElt("div", undefined, [eltIframe, eltOverlay]);
            eltContainer.style = `
                position: relative;
                width: 50%;
                aspect-ratio: ${w} / ${h};
            `;
            // divNewPreview.textContent = "";
            const imgPreview = divNewPreview.firstElementChild;
            imgPreview.remove();
            // divNewPreview.appendChild(eltIframe);
            divNewPreview.insertBefore(eltContainer, divNewPreview.firstElementChild);
            return;
        }
        */
        if (val.trim().length < 10) {
            imgNewPreview.src = createPlaceholderSrc(1, 1);
            inpURL.setCustomValidity("");
            return;
        }
        const valid = inpURL.checkValidity();
        if (!valid) {
            evt.stopImmediatePropagation();
            // setButtonState(saveButtonHotspot, false);
            debounceReportInpURLvalidity();
        }
        debounceCheckIsImage(val);
    });
    const tfURL = modMdc.mkMDCtextField("Add new image", inpURL);
    tfURL.style = `
        width: 100%;
        margin-top: 10px;
    `;

    const styleUrlAlt = `
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: red;
    `;
    const divOldUrls = mkElt("div");
    divOldUrls.style = styleUrlAlt;
    const divBuiltinUrls = mkElt("div");
    divBuiltinUrls.style = styleUrlAlt;

    const recOld = getImagesRec(prefix);
    const numBuiltIn = arrBuiltin ? arrBuiltin.length : 0;
    if (recOld.length + numBuiltIn == 0) {
        divOldUrls.textContent = "No images.";
    } else {
        let checked = false;
        let mkImgChoice = (url, isBuiltin) => {
            const eltImg = mkElt("span");
            eltImg.style = `
            width: 30%;
            display: inline-block;
            aspect-ratio: 1.6 / 1;
            background-image: url(${url});
            background-size: cover;
            background-repeat: no-repeat;
        `;
            const radImg = mkElt("input", { type: "radio", name: "img", value: url });
            if (!checked) {
                radImg.checked = true;
                checked = true;
            }
            let eltHandle;
            if (!isBuiltin) {
                const iconDelete = modMdc.mkMDCicon("delete_forever");
                const btnDelete = modMdc.mkMDCiconButton(iconDelete, "Delete");
                btnDelete.addEventListener("click", evt => {
                    alert("not implemented yet");
                });
                eltHandle = btnDelete;
            } else {
                eltHandle = mkElt("span", undefined, "Built in");
            }
            const lblImg = mkElt("label", undefined, [radImg, eltImg, eltHandle]);
            lblImg.style = `
                display: flex;
                gap: 10px;
            `;
            // const divRec = mkElt("div", undefined, [lblImg]);
            return mkElt("div", undefined, [lblImg]);
        }

        recOld.forEach(url => {
            const divRec = mkImgChoice(url, false);
            divOldUrls.appendChild(divRec);
        });
        arrBuiltin.forEach(url => {
            const divRec = mkImgChoice(url, true);
            divBuiltinUrls.appendChild(divRec);
            divBuiltinUrls.style.background = "blue";
        });
    }

    const divNewUrl = mkElt("div", undefined, tfURL);

    const bdy = mkElt("div", { class: "colored-dialog" }, [
        mkElt("h2", undefined, "Background Images"),
        btnCopyright,
        mkElt("p", undefined, "Your own:"),
        divOldUrls,
        divNewUrl,
        divNewPreview,
        mkElt("p", undefined, "Built in:"),
        divBuiltinUrls,
    ]);

    const funHandleResult = () => {
        return "not ready";
    };
    return modMdc.mkMDCdialogConfirm(bdy, "Close",
        undefined, true,
        funHandleResult,
        tellMeOkButton,
    );

}
