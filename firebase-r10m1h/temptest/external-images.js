// Module for linking external images.
// The user provides the links which I guess will avoid copyright problems.

// https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
console.log("here is external-images.js");

const modMdc = await import("util-mdc");
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
function getImagesRec(prefix) {
    if (typeof prefix != "string") throw Error("prefix is not a string");
    if (prefix.length == 0) throw Error("prefix.length == 0");
    const strJson = localStorage.getItem(prefix + KEY);
    if (!strJson) return;
    const objJson = JSON.parse(strJson);
    return objJson;
}
function setImagesRec(prefix, objJson) {
    if (typeof prefix != "string") throw Error("prefix is not a string");
    if (prefix.length == 0) throw Error("prefix.length == 0");
    const strJson = JSON.stringify(objJson);
    localStorage.setItem(prefix + KEY, strJson);
}
export async function dialogImages(prefix) {
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
        if (val.trim().length < 10) return;
        const valid = inpURL.checkValidity();
        if (!valid) {
            evt.stopImmediatePropagation();
            // setButtonState(saveButtonHotspot, false);
            debounceReportInpURLvalidity();
        }
        debounceCheckIsImage(val);
    });
    const tfURL = modMdc.mkMDCtextField("Link to new image", inpURL);
    tfURL.style = `
        width: 100%;
    `;

    const divOldUrls = mkElt("div");
    divOldUrls.style = `
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;
    const recOld = getImagesRec(prefix);
    if (!recOld) {
        divOldUrls.textContent = "No old images.";
    } else {
        recOld.forEach(url => {
            // const eltUrl = mkElt("div", undefined, url);
            const eltImg = mkElt("span");
            eltImg.style = `
                width: 30%;
                display: inline-block;
                aspect-ratio: 1.6 / 1;
                background-image: url(${url});
                background-size: cover;
                background-repeat: no-repeat;
            `;
            const radImg = mkElt("input", {type:"radio", name:"img", value:url});
            const iconDelete = modMdc.mkMDCicon("delete_forever");
            const btnDelete = modMdc.mkMDCiconButton(iconDelete, "Delete");
            btnDelete.addEventListener("click", evt => {
                alert("not implemented yet");
            })
            const lblImg = mkElt("label", undefined, [radImg, eltImg, btnDelete]);
            lblImg.style = `
                display: flex;
                gap: 10px;
            `;
            const divRec = mkElt("div", undefined, [lblImg]);
            divOldUrls.appendChild(divRec);
        });
    }

    const divNewUrl = mkElt("div", undefined, tfURL);

    const bdy = mkElt("div", { class: "colored-dialog" }, [
        mkElt("h2", undefined, "Background Images"),
        btnCopyright,
        divOldUrls,
        divNewUrl,
        divNewPreview,
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
