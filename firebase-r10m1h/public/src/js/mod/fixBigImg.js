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

const defMaxOutSize = 20 * 1000;
export async function fix() {
    let maxOutSize = defMaxOutSize;
    // const step = 10 * 1000;
    // const min = 10 * 1000;
    // const max = 500 * 1000;

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

    const bodySize = mkElt("div", undefined,
        mkElt("label", undefined, ["Max image-blob size: ", inpSize]))
    const ansSize = await modMdc.mkMDCdialogConfirm(bodySize);
    if (!ansSize) return;
    maxOutSize = +inpSize.value.replaceAll(",", "");
    if (isNaN(maxOutSize)) throw Error("maxOutSize is not a number");
    let imgToShow;
    let numBig = 0;
    let totBigSize = 0;
    for (let i = 0, len = allRecs.length; i < len; i++) {
        const r = allRecs[i];
        if (!r.images) continue;
        const img0 = r.images[0];
        if (!img0) continue;
        if (img0.size > maxOutSize) {
            if (!imgToShow) imgToShow = img0;
            // break;
            numBig++;
            totBigSize += img0.size;
        }
    }
    showRes();
    async function showRes() {
        const img0 = imgToShow;
        const retResize = await modImg.resizeImage(img0, maxOutSize);
        console.log({ retResize });
        const imgNew = retResize.blobOut;

        const th0 = mkImageThumb(img0);
        const div0 = mkElt("div", undefined, [th0, mkElt("div", undefined, `${addComma(img0.size)} B`)]);
        th0.style.outline = "4px dotted red";

        const thNew = mkImageThumb(imgNew);
        const divNew = mkElt("div", undefined, [thNew, mkElt("div", undefined, `${addComma(imgNew.size)} B`)]);
        thNew.style.outline = "4px dotted green";

        const divImgs = mkElt("p", undefined, [
            div0,
            divNew,
        ]);
        divImgs.style = `
            display: flex;
            gap: 10px;
        `;
        const divSums = mkElt("p", undefined, [
            mkElt("div", undefined, [
                "Num big images: ",
                addComma(numBig)
            ]),
            mkElt("div", undefined, [
                "Total size: ",
                addComma(totBigSize),
                " B"
            ]),
        ]);
        const body = mkElt("div", undefined, [
            mkElt("h3", undefined, `Max size: ${addComma(maxOutSize)} B`),
            divImgs,
            divSums
        ])
        const ans = await modMdc.mkMDCdialogConfirm(body);
        console.log({ ans });
    }

}