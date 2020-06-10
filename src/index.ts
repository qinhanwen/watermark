let canvasElement: HTMLCanvasElement;
let watermarkImgElement: HTMLImageElement;
let backgroundImgElement: HTMLImageElement;
const URL = window.URL || window.webkitURL;

interface Options {
  mineType?: string; // mine 类型
  quality?: number; // 质量
  maxWidth: number; // 图片最大宽度
  watermarkWidth?: number; // 水印宽
  watermarkHeight?: number; // 水印高
  radix: number; //水印重复次数
}

class WaterMark {
  ops: Options = {
    maxWidth: 600,
    radix: 3,
  };

  constructor(ops: Options) {
    this.ops = { ...this.ops, ...ops };
  }

  /**
   * blob 转 blobURL
   * @param args Blob 数组
   */
  getImgBlobURL(...args: Array<Blob | string>) {
    return args.map(item => {
      if (typeof item === "string") {
        return item;
      } else if (item instanceof Blob) {
        return URL.createObjectURL(item);
      } else {
        throw new TypeError("无效的图片参数");
      }
    });
  }

  /**
   * 清除 blobURL 的引用
   * @param args Blob 数组
   */
  clearImgBlobURL(...args: Array<string>) {
    return args.forEach(bloburl => {
      URL.revokeObjectURL(bloburl);
    });
  }

  /***
   * canvas画背景图
   *  @param imgElement 图片 dom 实例
   */
  renderBackgroundImgToCanvas(imgElement: HTMLImageElement) {
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
    ctx!.drawImage(imgElement, 0, 0, naturalWidth, naturalHeight);
  }

  /***
   *  canvas画水印图
   *  @param watermarkElement 水印图片 dom 实例
   */
  rendermarkImgToCanvas(watermarkElement: HTMLImageElement) {
    const width = this.ops.watermarkWidth || watermarkElement.naturalWidth;
    const height = this.ops.watermarkHeight || watermarkElement.naturalHeight;
    const ctx = canvasElement.getContext("2d");
    const widthRadix = canvasElement.width / 3;
    const heightRadix = canvasElement.height / 3;
    for (let i = 0; i < this.ops.radix; i++) {
      for (let j = 0; j < this.ops.radix; j++) {
        ctx!.drawImage(
          watermarkElement,
          i * widthRadix,
          j * heightRadix,
          width,
          height
        );
      }
    }
  }

  /**
   * 加载图片
   * @param imgElement 实例
   * @param blobURL blobURL
   */
  async loadImg(imgElement: HTMLImageElement, blobURL: string) {
    return new Promise((resolve, reject) => {
      imgElement.crossOrigin = "anonymous";
      imgElement.src = blobURL;
      imgElement.onload = function() {
        resolve();
      };
      imgElement.onerror = function() {
        reject();
      };
    });
  }

  /**
   * 生成带水印图片
   * @param backgroundImg 背景图片 Blob
   * @param watermarkImg 水印图片 Blob
   */
  async generatorWatermarkImg(
    backgroundImg: Blob | string,
    watermarkImg: Blob | string
  ) {
    const [backgroundImgBlobURL, watermarkBlobURL] = this.getImgBlobURL(
      backgroundImg,
      watermarkImg
    );
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
