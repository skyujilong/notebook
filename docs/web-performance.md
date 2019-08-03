# web首屏优化——更快呈现页面给用户
## 减少加载资源体积
1. 服务器gzip
1. js&css压缩
1. js webpack tree sharking 去除无用代码
1. 图片降低质量压缩，或者使用新的图片格式，比如使用webP格式
## 网络优化
1. dns提起解析dns-prefetch
1. 合并请求，雪碧图、文字icon
1. gif替换成video 降低开销
1. preload css文件中的雪碧图、文字文件
1. prefetch 提前缓冲下一个页面的资源
1. 多域名突破资源并发请求的上线
1. http2 以及 http2的push应用
1. 静态资源部署cdn
1. 资源开启缓存（超长时间缓存失效，更新内容采用md5命名更改）
1. 页面pwa化，缓存资源
1. 小型碎片化图片base64化
## 业务
1. 首屏区域优先，eg 动态的内容为了更快展示可以inline到html内
1. 业务js文件放在dom底部
1. 业务js文件过大，要拆分。拆分规则，可以依据主次。次屏的可以后加载。或者按需加载。
1. 业务next page的html资源缓存，eg：新闻业务要闻区域，我们可以采用prefetch要闻区域的a标签的href进行加载缓存。当然因为这些是次要的，不能影响主业务逻辑，我们可以使用requestIdleCallback（在浏览器空闲时间执行）来进行缓存业务