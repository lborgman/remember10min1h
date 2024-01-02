console.log("fixBidImg.js here again!!!!!!!");
// dbfc4i
const modImg = await import("images");
const dbFc4i = await import("db-fc4i");
const modMdc = await import("util-mdc");

const allRecs = await dbFc4i.getDbMatching();

function addComma(num) {
    if (isNaN(num)) throw Error(`Not a number: ${num}`);
    return num.toLocaleString("en-US");
}

function getLink2KeyInFc4i(keyFc4i) {
    const objUrl = new URL("/", location);
    objUrl.searchParams.set("showkey", keyFc4i)
    // location = objUrl;
    return objUrl.href;
}

function mkImageThumb(blob) {
    console.log({ blob });
    const eltImg = mkElt("span", { class: "image-bg-cover image-thumb-size" });
    const st = eltImg.style;
    st.width = "100px";
    st.height = "100px";
    st.backgroundSize = "contain";
    st.backgroundPosition = "center";
    const urlBlob = URL.createObjectURL(blob);
    const urlBg = `url(${urlBlob})`;
    st.backgroundImage = urlBg;
    return eltImg;
}

const defMaxOutSize = 30 * 1000;
export async function fix() {
    let maxOutSize = defMaxOutSize;
    const storageEstimate = await navigator.storage.estimate();
    const idbBytes = storageEstimate.usageDetails.indexedDB;

    // https://stackoverflow.com/questions/71028035/add-thousand-separator-with-javascript-when-add-input-dynamically
    function formatWithComma(numericVal) {
        //NumberFormat options
        const options = {
            style: `decimal`,
            maximumFractionDigits: 20,
        };
        const val = new Intl.NumberFormat(`en-US`, options).format(numericVal);
        return val;
    }
    const inpSize = mkElt("input", { type: "text" });
    inpSize.addEventListener("keyup", evt => {
        // Current string value of the input
        const value = evt.target.value;
        let val;

        // Split the value string into an array on each decimal and 
        // count the number of elements in the array
        // const decimalCount = value.split(`.`).length - 1;

        // Don't do anything if a first decimal is entered
        // if (evt.key === `.` && decimalCount === 1) return

        // Remove any commas from the string and convert to a float
        // This will remove any non digit characters and second decimals
        const strN = value.replace(/,/g, '');
        if ("" != strN.replace(/[0-9]/g, "")) {
            val = "NaN";
        } else {
            const numericVal = parseInt(strN);

            // Assign the formatted number to the input box
            // this.value = new Intl.NumberFormat(`en-US`, options).format(numericVal);
            // const val = new Intl.NumberFormat(`en-US`, options).format(numericVal);
            val = formatWithComma(numericVal)
        }
        const st = evt.target.style;
        if ("NaN" == val) {
            st.color = "red";
            st.backgroundColor = "black";
        } else {
            st.color = null;
            st.backgroundColor = null;
            evt.target.value = val;
        }
    });
    function setInpSize(num) { }
    function getInpSize(num) { }
    inpSize.value = formatWithComma(maxOutSize);

    const divSizeBugInfo = mkElt("p", undefined, `
        This fixes a bug.
        Images were unfortunately during a short period stored without being shrinked.
    `);
    divSizeBugInfo.style.color = "darkred";
    divSizeBugInfo.style.fontStyle = "italic";
    const divIdbSize = mkElt("p", undefined, [
        `Stored data size now (indexedDB): ${addComma(idbBytes)} B.`
    ]);
    const bodySize = mkElt("div", undefined, [
        mkElt("h2", undefined, "Fix big images"),
        divSizeBugInfo,
        divIdbSize,
        mkElt("label", undefined, ["Max image-blob size: ", inpSize]),
    ]);
    const ansSize = await modMdc.mkMDCdialogConfirm(bodySize);
    if (!ansSize) return;
    maxOutSize = +inpSize.value.replaceAll(",", "");
    if (isNaN(maxOutSize)) throw Error("maxOutSize is not a number");

    let imgToShowNewest; let recToShowNewest;
    let imgToShowOldest; let recToShowOldest;
    let numBig = 0;
    let totBigSize = 0;

    for (let i = 0, len = allRecs.length; i < len; i++) {
        const r = allRecs[i];
        if (!r.images) continue;
        const img0 = r.images[0];
        if (!img0) continue;
        if (img0.size > maxOutSize) {
            if (!imgToShowNewest) {
                imgToShowNewest = img0;
                recToShowNewest = r;
            } else {
                imgToShowOldest = img0;
                recToShowOldest = r;
            }
            // break;
            numBig++;
            totBigSize += img0.size;
        }
    }
    showRes();
    async function showRes() {
        const divImgsStyle = ` display: flex; gap: 10px; `;
        const outline0 = "4px dotted red";
        const outlineNew = "4px dotted green";

        const divInfoNewest = await showImgInfo(imgToShowNewest, recToShowNewest);
        const dateNewest = recToShowNewest.key.slice(0, 10);
        const divNewest = mkElt("div", { class: "mdc-card" }, [
            mkElt("div", undefined, `Newest ${dateNewest}`),
            divInfoNewest]);
        divNewest.style.padding = "10px";
        divNewest.style.backgroundColor = "wheat";
        divNewest.style.marginBottom = "10px";

        const divInfoOldest = await showImgInfo(imgToShowOldest, recToShowOldest);
        const dateOldest = recToShowOldest.key.slice(0, 10);
        const divOldest = mkElt("div", { class: "mdc-card" }, [
            mkElt("div", undefined, `Oldest ${dateOldest}`),
            divInfoOldest]);
        divOldest.style.padding = "10px";
        divOldest.style.backgroundColor = "wheat";
        divOldest.style.marginBottom = "10px";

        async function showImgInfo(imgToShow, recToShow) {
            const img0 = imgToShow;
            const retResize = await modImg.resizeImage(img0, maxOutSize);
            console.log({ retResize });
            const img0New = retResize.blobOut;

            const th0 = mkImageThumb(img0);
            th0.classList.add("img-old");
            const div0 = mkElt("div", undefined, [th0, mkElt("div", undefined, `${addComma(img0.size)} B`)]);
            th0.style.outline = outline0;

            const thNew = mkImageThumb(img0New);
            const divNew = mkElt("div", undefined, [thNew, mkElt("div", undefined, `${addComma(img0New.size)} B`)]);
            thNew.style.outline = outlineNew;

            const divImgs0 = mkElt("p", undefined, [
                div0,
                divNew,
            ]);
            divImgs0.style = divImgsStyle;

            const linkRec = getLink2KeyInFc4i(recToShow.key);
            const a = mkElt("a", { href: linkRec }, "Show entry in fc4i");
            const btnFix = mkElt("button", undefined, "Fix size");
            btnFix.classList.add("fix-1-big");
            btnFix.addEventListener("click", errorHandlerAsyncEvent(async evt => {
                console.log({ img0, img0New, recToShowNewest: recToShow, dbFc4i });
                const key = recToShow.key;
                recToShow.images[0] = img0New;
                await dbFc4i.setDbKey(key, recToShow);
                showBig1Fixed(btnFix);
            }));
            const divLink = mkElt("p", undefined, [a, mkElt("span", undefined, btnFix)]);
            divLink.style.display = "flex";
            divLink.style.gap = "10px";

            return mkElt("div", undefined, [divImgs0, divLink]);
        }
        function showBig1Fixed(btnFix1) {
            const c = btnFix1.closest("p").parentElement;
            const imgBig = c.querySelector(".img-old");
            imgBig.style.filter = "grayscale(1)";
            imgBig.style.opacity = 0.5;
            const parentBtn = btnFix1.parentElement;
            parentBtn.textContent = "fixed!";
            parentBtn.style.color = "red";
        }

        const btnFixAll = mkElt("button", undefined, "Fix all");
        const divShowNumFixed = mkElt("div", undefined, "Number of fixed big images: 0");
        btnFixAll.addEventListener("click", errorHandlerAsyncEvent(async evt => {
            alert("not ready");
            let nFixed = 0;
            for (let i = 0, len = allRecs.length; i < len; i++) {
                const r = allRecs[i];
                if (!r.images) continue;
                const img0 = r.images[0];
                if (!img0) continue;
                if (img0.size > maxOutSize) {
                    const retResize = await modImg.resizeImage(img0, maxOutSize);
                    console.log({ retResize });
                    const img0New = retResize.blobOut;
                    divShowNumFixed.textContent = `Num fixed: ${++nFixed}`;
                }
            }
            const d = btnFixAll.closest(".mdc-dialog__content");
            const arrBtnFix = [...d.querySelectorAll("button.fix-1-big")];
            arrBtnFix.forEach(btn => showBig1Fixed(btn));
            debugger;
        }));
        const divSums = mkElt("p", undefined, [
            mkElt("div", undefined, [
                "Num big images: ",
                addComma(numBig),
            ]),
            mkElt("div", undefined, [
                "Total size: ",
                addComma(totBigSize),
                " B"
            ]),
            mkElt("div", undefined, [
                btnFixAll,
                divShowNumFixed,
            ]),
        ]);
        const body = mkElt("div", undefined, [
            mkElt("h3", undefined, `Max size: ${addComma(maxOutSize)} B`),
            // divImgs0, divLink,
            divNewest,
            divOldest,
            divSums
        ])
        const ans = await modMdc.mkMDCdialogConfirm(body);
        console.log({ ans });
    }

}