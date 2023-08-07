console.warn("here is clipboard-images.js");

let debugPasteLineOn = true;
function debugPasteLine(txt) {
    if (!debugPasteLineOn) return;
    console.log("DEBUG", txt);
}

export async function resizeImage(imageBlobIn) {
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
    // Switch to OffscreenCanvas!
    // https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas
    // shrink image:
    // https://stackoverflow.com/questions/70921457/how-can-i-resize-an-image-in-angular-using-the-canvas
    let lastQuality;

    return new Promise((resolve) => {
        const image = new Image();
        let imageBlobSize;
        image.onload = async () => {
            const natW = image.naturalWidth;
            const natH = image.naturalHeight;
            console.log({ image, natW, natH });
            debugPasteLine(`imageOnload natW: ${natW}, natH: ${natH}`);
            const canvas = document.createElement('canvas');
            canvas.height = natH;
            canvas.width = natW;
            const ctx = canvas.getContext('2d');
            if (ctx != null) {
                // ctx.drawImage(image, 0, 0, 640, 480);  // <-- draw the right image!
                ctx.drawImage(image, 0, 0, natW, natH);  // <-- draw the right image!
            }
            // .toBlog(callback, type, quality)
            // const blob = canvas.toDataURL('image/png', 0.5);
            // resolve(blob);   // <-- call it here!
            let retImageBlob;
            let blobSize = Number.POSITIVE_INFINITY;
            const maxBlobSize = 40 * 1000;
            let n = 0;
            const nMax = 10;
            // let quality = 0.5; // FIX-ME: better start value?
            let quality = (() => {
                // in png, 2 000 000 => const maxBlobSize = 40 * 1000;
                // if (imageBlobSize > 2 * 1000 * 1000) return 0.1; // 3s
                // if (imageBlobSize > 2 * 1000 * 1000) return 0.07; // 2.5s
                // if (imageBlobSize > 2 * 1000 * 1000) return 0.05; // 1.5-2s
                if (imageBlobSize > 2 * 1000 * 1000) return 0.04; // < 1s
                // png, 400 000
                if (imageBlobSize > 400 * 1000) return 0.4;
                return 0.5;
            })();
            while (++n < nMax && blobSize > maxBlobSize) {
                // https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas/convertToBlob
                retImageBlob = await new Promise((resolveToBlob) => {
                    canvas.toBlob(blob => resolveToBlob(blob), 'image/webp', quality);
                });
                blobSize = retImageBlob.size;
                lastQuality = quality;
                console.log({ retBlob: retImageBlob, blobSize, quality });
                debugPasteLine(`resize-loop  retBlob:${retImageBlob}, blobSize:${blobSize}, quality:${quality}`);
                quality *= 0.7;
            }
            resolve(retImageBlob);
        };
        imageBlobSize = imageBlobIn.size;
        const imageBlobType = imageBlobIn.type;
        console.log({ imageBlobIn, imageBlobSize, imageBlobType });
        // debugPasteLineOn = true;
        debugPasteLine(`imageBlob, imageBlobSize: ${imageBlobSize}, imageBlobType: ${imageBlobType} }`);
        const urlBlobHelper = URL.createObjectURL(imageBlobIn);
        // const urlBg = `url(${urlBlobHelper})`;
        // image.src = imageURL;
        image.src = urlBlobHelper
    });
}
