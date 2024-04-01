export async function viewer(divPanorama, config) {
    // const eltCont = document.getElementById("container");
    const srcPanorama = config.src;
    const eltCont = divPanorama;
    eltCont.style.overflow = "hidden";
    eltCont.style.position = "relative";
    // const eltImg = document.getElementById("img");
    const eltImg = new Image();
    eltImg.setAttribute("draggable", false)
    eltImg.style.position = "absolute";
    eltImg.id = config.imageId;
    eltCont.appendChild(eltImg);
    const imgSizes = config.imgSizes;
    const natW = imgSizes.naturalWidth;
    const natH = imgSizes.naturalHeight;
    let w = natW;
    let h = natH;
    let zoom = config.zoom || 1;
    eltImg.style.width = `${w}px`;
    eltImg.style.height = `${h}px`;
    // eltImg.src = "http://localhost:5004/img/loci.svg";
    eltImg.src = srcPanorama;
    let moving = false;
    let bcrImg;
    let bcrC;
    const initDiff = {}
        let imgBiggerW;
        let imgBiggerH;
    eltCont.addEventListener("mousedown", evt => {
        evt.stopPropagation();
        console.log({ evt });
        moving = true;
        eltImg.style.cursor = "grabbing";
        bcrC = eltCont.getBoundingClientRect();
        bcrImg = eltImg.getBoundingClientRect();
        initDiff.X = bcrImg.left - evt.clientX;
        initDiff.Y = bcrImg.top - evt.clientY;
        imgBiggerW = bcrImg.width > bcrC.width;
        imgBiggerH = bcrImg.height > bcrC.height;
        console.log({ initDiff, bcrImg });
    });
    eltCont.addEventListener("mouseup", evt => {
        evt.stopPropagation();
        moving = false;
        eltImg.style.cursor = null;
    });
    eltCont.addEventListener("mouseleave", evt => {
        moving = false;
        eltImg.style.cursor = null;
    });
    const debounceMoveImg = debounce(moveImg, 0);
    const throttleMoveImg = throttleRA(moveImg);
    eltCont.addEventListener("mousemove", evt => {
        evt.stopPropagation();
        if (!moving) return;
        // debounceMoveImg(evt.clientX, evt.clientY);
        throttleMoveImg(evt.clientX, evt.clientY);
    });
    function moveImg(mouseX, mouseY) {
        let left = mouseX + initDiff.X
        let top = mouseY + initDiff.Y

        if (!imgBiggerW) {
            left = Math.max(left, 0);
            left = Math.min(left, bcrC.right - bcrImg.width - bcrC.left);
        } else {
            left = Math.min(left, 0);
            left = Math.max(left, bcrC.right - bcrImg.width - bcrC.left);
        }
        if (!imgBiggerH) {
            top = Math.max(top, 0);
            top = Math.min(top, bcrC.bottom - bcrImg.height - bcrC.top);
        } else {
            top = Math.min(top, 0);
            top = Math.max(top, bcrC.bottom - bcrImg.height - bcrC.top);
        }

        eltImg.style.left = `${left}px`;
        eltImg.style.top = `${top}px`;
    }
}