# canvas下载图片
## 代码：
*适用于chrome浏览器*
```javascript
'use strict';
function base64Img2Blob(code) {
    var parts = code.split(';base64,');
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
}
/**
 * filename下载到本地的文件名字
 * content canvas.toDataURL('image/png');方法生成的base64字符串内容
 */
function downloadFile(fileName, content) {

    var aLink = document.createElement('a');
    var blob = base64Img2Blob(content); //new Blob([content]);

    // var evt = document.createEvent("HTMLEvents");
    // evt.initEvent("click", false, false);//initEvent 不加后两个参数在FF下会报错

    var event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    // save_link.dispatchEvent(event);

    aLink.download = fileName;
    aLink.href = URL.createObjectURL(blob);

    aLink.dispatchEvent(event);
}    
module.exports = downloadFile;       

```
## 原理：
1. canvas toDataURL方法能返回base64化的图片内容。
2. 将base64内容转化为blob对象。
3. 模拟点击事件下载文件。

## 应用场景：
在没有后端支持的情况下，要求下载一个内容是可变化的动态图片。

采用canvas动态生成动态的图片，然后调用上述方法进行下载。

**注意：微信浏览器下不支持上述的方案。**
## 微信应对处理：
原理：
1. 微信长按图片可以有下载选项。
2. 采用canvas生成的base64内容，赋值到一个img标签上。用户长按这个img标签就ok了。

## 可能会碰到的图片
**跨域问题：**

跨域会导致，canvas无法调用toBlob(),toDataURL(),getImageData()方法，这样将无法调用上述的方法。从而导致无法下载图片。或者直接负值给指定的img标签。

解决方案：
1. 服务器端设置 Access-Control-Allow-Origin "*"。
2. img标签上设置crossorigin="Anonymous"属性。