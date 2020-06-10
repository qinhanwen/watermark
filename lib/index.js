let canvasElement;
let watermarkImgElement;
let backgroundImgElement;
const URL = window.URL || window.webkitURL;
class WaterMark {
    constructor(ops) {
        this.ops = {
            maxWidth: 600,
            radix: 3
        };
        this.ops = Object.assign(Object.assign({}, this.ops), ops);
    }
    /**
     * blob 转 blobURL
     * @param args Blob 数组
     */
    getImgBlobURL(...args) {
        return args.map(item => {
            if (typeof item === "string") {
                return item;
            }
            else if (item instanceof Blob) {
                return URL.createObjectURL(item);
            }
            else {
                throw new TypeError("无效的图片参数");
            }
        });
    }
    /**
     * 清除 blobURL 的引用
     * @param args Blob 数组
     */
    clearImgBlobURL(...args) {
        return args.forEach(bloburl => {
            URL.revokeObjectURL(bloburl);
        });
    }
    /***
     * canvas画背景图
     *  @param imgElement 图片 dom 实例
     */
    renderBackgroundImgToCanvas(imgElement) {
        let naturalWidth = imgElement.naturalWidth;
        let naturalHeight = imgElement.naturalHeight;
        if (naturalWidth > this.ops.maxWidth) {
            naturalWidth = this.ops.maxWidth;
            naturalHeight =
                (imgElement.naturalHeight * this.ops.maxWidth) /
                    imgElement.naturalWidth;
        }
        canvasElement.width = naturalWidth;
        canvasElement.height = naturalHeight;
        const ctx = canvasElement.getContext("2d");
        ctx.drawImage(imgElement, 0, 0, naturalWidth, naturalHeight);
    }
    /***
     *  canvas画水印图
     *  @param watermarkElement 水印图片 dom 实例
     */
    rendermarkImgToCanvas(watermarkElement) {
        const width = this.ops.watermarkWidth || watermarkElement.naturalWidth;
        const height = this.ops.watermarkHeight || watermarkElement.naturalHeight;
        const ctx = canvasElement.getContext("2d");
        const widthRadix = canvasElement.width / 3;
        const heightRadix = canvasElement.height / 3;
        for (let i = 0; i < this.ops.radix; i++) {
            for (let j = 0; j < this.ops.radix; j++) {
                ctx.drawImage(watermarkElement, i * widthRadix, j * heightRadix, width, height);
            }
        }
    }
    /**
     * 加载图片
     * @param imgElement 实例
     * @param blobURL blobURL
     */
    async loadImg(imgElement, blobURL) {
        return new Promise((resolve, reject) => {
            imgElement.crossOrigin = "anonymous";
            imgElement.src = blobURL;
            imgElement.onload = function () {
                resolve();
            };
            imgElement.onerror = function () {
                reject();
            };
        });
    }
    /**
     * 生成带水印图片
     * @param backgroundImg 背景图片 Blob
     * @param watermarkImg 水印图片 Blob
     */
    async generatorWatermarkImg(backgroundImg, watermarkImg) {
        const [backgroundImgBlobURL, watermarkBlobURL] = this.getImgBlobURL(backgroundImg, watermarkImg);
        if (!canvasElement) {
            canvasElement = document.createElement("canvas");
        }
        if (!watermarkImgElement) {
            watermarkImgElement = document.createElement("img");
        }
        if (!backgroundImgElement) {
            backgroundImgElement = document.createElement("img");
        }
        await Promise.all([
            this.loadImg(watermarkImgElement, watermarkBlobURL),
            this.loadImg(backgroundImgElement, backgroundImgBlobURL)
        ]);
        this.renderBackgroundImgToCanvas(backgroundImgElement);
        this.rendermarkImgToCanvas(watermarkImgElement);
        this.clearImgBlobURL(backgroundImgBlobURL, watermarkBlobURL);
        return canvasElement.toDataURL(this.ops.mineType, this.ops.quality);
    }
}
export default WaterMark;
