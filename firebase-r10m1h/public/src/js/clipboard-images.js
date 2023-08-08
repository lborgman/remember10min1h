console.warn("here is clipboard-images.js");

let debugPasteLineOn = true;
debugPasteLineOn = false;
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

// https://web.dev/async-clipboard/
export async function isClipboardPermissionStateOk() {
    // There seems to be no max number of skipping prompt here.
    // The permissions systems seems like a mess!
    const queryOpts = { name: 'clipboard-read', allowWithoutGesture: false };
    const permissionStatus = await navigator.permissions.query(queryOpts);
    console.log({ permissionStatus });

    switch (permissionStatus.state) {
        case 'granted':
        case 'prompt': // Something seems to have changed 2023-06-29
            return true;
        case 'denied':
            // alertHowToUnblockPermissions();
            return false;
        default:
            debugger;
            throw Error(`Unknown permission state: ${permissionStatus.state}`);
    }
}
export async function alertHowToUnblockPermissions() {
    const aUnblock = mkElt("a", {
        target: "blank",
        href: "https://www.getbeamer.com/help/how-to-unblock-notification-permissions-on-any-browser"
    }, "How to fix it");
    const body = mkElt("div", undefined, [
        mkElt("h1", undefined, "Can't read clipboard"),
        mkElt("p", undefined, [
            "This can be fixed the same way as explained here: ",
            aUnblock
        ])
    ]);
    const modMdc = await import("util-mdc");
    modMdc.mkMDCdialogAlert(body);
}

export async function getImagesFromClipboard() {
    try {
        // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/read
        // https://web.dev/async-clipboard/

        let clipboardContents;
        debugPasteLine(`addPasteButton 3`);
        try {
            clipboardContents = await navigator.clipboard.read();
            debugPasteLine(`addPasteButton 4`);
        } catch (err) {
            debugPasteLine(`addPasteButton 5, ${err.name}, ${err.message}`);
            return err;
        }

        const foundImages = [];
        // debugPasteLineOn = true;
        debugPasteLine(`addPasteButton 7`);
        for (const item of clipboardContents) {
            debugPasteLine(`addPasteButton 7a`);
            const itemTypes = item.types;
            console.log("addPasteButton 7a", { item, itemTypes });
            debugPasteLine(`addPasteButton 7a1`);
            const imageTypes = itemTypes.filter(t => t.startsWith("image/"));
            const isArray = Array.isArray(imageTypes);
            console.log({ imageTypes, isArray });
            const imageTypesLength = imageTypes.length;
            debugPasteLine(`addPasteButton 7a2, ${imageTypes}, ${typeof imageTypes}, ${isArray}, ${imageTypesLength}`);
            if (imageTypes.length == 0) {
                debugPasteLine(`addPasteButton 7b`);
                continue;
            }
            const it0 = imageTypes[0];
            debugPasteLine(`addPasteButton 7c, ${imageTypes.length}, ${it0}, ${JSON.toString(it0)}`);
            const blob = await item.getType(imageTypes[0]);
            debugPasteLine(`addPasteButton 7d, typeof blob=${typeof blob}, ${blob}`);
            if (blob == null) {
                // You do not get here on Windows 10, but on Android, 2023-01-16
                debugPasteLine(`addPasteButton 7d1, blob==null`);
                continue;
            }
            foundImages.push(blob);
        }
        return foundImages;
    } catch (err) {
        debugPasteLine(`addPasteButton err 1, ${err.name}, ${err.message}`);
        return err;
    }
}

export async function alertNoImagesFound() {
    debugPasteLine(`addPasteButton alertNoImages`);
    const bodyAlert = mkElt("div", { id: "alert-no-images" }, [
        mkElt("h2", undefined, "No images found on clipboard."),
        mkElt("details", undefined, [
            mkElt("summary", undefined, "Why?"),
            mkElt("p", undefined, [
                "The clipboard images may have timed out. ",
                "Or you have not put any images there yet. "
            ]),
            mkElt("p", undefined, [
                mkElt("i", undefined, "Notice: "),
                "You must put images there, not image links!"
            ])
        ]),
        mkElt("details", undefined, [
            mkElt("summary", undefined, "How do you get an image to the clipboard? "),
            mkElt("p", undefined, [
                "One simple way is to right click on an image in your web browser. ",
                "(Long press on a mobile.) ",
            ]),
            mkElt("p", undefined, [
                "However if you have an image in for example Google Photos ",
                "on your Android mobile it is unfortunately not that simple. ",
                "There is today (in the beginning of 2023) no direct way to ",
                "put that image on the clipboard. 🤔",
            ]),
            mkElt("p", undefined, [
                "As a reasonably safe alternative I use this app: ",
                mkElt("a", { href: "https://scrapbook-pwa.web.app/#/images" }, "Scapbook PWA"),
                " (That app is, like this app you are using now, a PWA. ",
                "Essentially a web page. ",
                "With the added capability to show app as targets when you share a link or image.)"
            ]),
        ]),
    ]);
    const modMdc = await import("util-mdc");
    modMdc.mkMDCdialogAlert(bodyAlert);
}
