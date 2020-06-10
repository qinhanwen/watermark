
###生成带水印图片
####使用姿势
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>example</title>
  </head>
  <body>
    背景图：
    <input type="file" id="file" value="xdx" />
    <br />
    <br />
    水印图：
    <input type="file" id="file1" />
    <br />
    <br />
    <button id="generate">生成</button>

    <img id="img" />
  </body>
  <script type="module">
    import WaterMark from "../lib/index.js";

    var wm = new WaterMark({
      mineType: "image/png",// 生成图片 mimetype
      quality: 0.92,// 质量 
      maxWidth: 600, // 生成图片最大宽度
      watermarkWidth: 10,
      watermarkHeight: 10,
    });
    document.getElementById("generate").onclick = function() {
      var bgImageBlob = document.getElementById("file").files[0];
      var watermarkImageBlob = document.getElementById("file1").files[0];
      wm.generatorWatemarkImg(bgImageBlob, watermarkImageBlob).then(dataUrl => {
        document.getElementById("img").src = dataUrl;
      });
    };
  </script>
</html>


```
####截图
![](http://114.55.30.96/WX20200610-151729.png)