# 视频video

## 清晰度无缝切换
难点
1. 整体更换src的地址，会导致带宽的浪费
1. 更换src策略，无法保证视频无缝切换(中断视频，黑屏等待)！

解决方案

核心：

1. video src 支持流格式bolb
1. MSE规范
1. SourceBuffer.appendBuffer 将其他的分片内容装进这个流


原理

video的src不用原始的视频地址。

而是使用URL.createObjectURL(MediaSource)的bolb对象

采用ajax的方式来获取切分成小块的mp4文件。

将mp4文件通过SourceBuffer.appendBuffer方法添加到MediaSource的buffer队列中。

这样可以持续请求分块的mp4文件。当用户停止播放的时候，不再继续请求下面的mp4文件。从而节省带宽。

同样切换视频质量的时候也是，仅仅切换后请求的mp4文件的质量。无缝！


**通过如上方法，避免了video.src为视频地址导致的视频不可控的问题。使用mse可以给前端带来视频更大的操作空间**

## 参考资料

[关于 video 播放的新探索](https://segmentfault.com/a/1190000015611832)

[createObjectURL](https://developer.mozilla.org/zh-CN/docs/Web/API/URL/createObjectURL)

[buffer demo](http://nickdesaulniers.github.io/netfix/demo/bufferAll.html)

[mse](https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API)


