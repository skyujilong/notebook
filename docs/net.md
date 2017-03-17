# 网络协议方面相关的
## 同源策略 ##
TODO
## 已//开头的的URL（依赖协议的URL） ##
eg:
```html
    <a href="//ceshi.com.cn">测试地址</a>
```
URL是以双斜杠“//”开头的，这种写法有特殊的用途，它会判断当前的页面协议是http 还是 https 来决定请求 url 的协议。防止IE下出现“This Page Contains Both Secure and Non-Secure Items”的报错。

但是当你浏览本地文件的时候，它会解析为 file:// 协议。这种特性可以用来加载CDN：
```html
    <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.js"></script>
```
也适用于CSS：
```css
    .omgomg { background: url(//lvtao.net/lvtao.gif); }
```
## javascript伪协议 ##
伪协议不同于因特网上所真实存在的协议，如http://，https://，ftp://，

而是为关联应用程序而使用的.如:tencent://(关联QQ)，data:(用base64编码来在浏览器端输出二进制文件)，还有就是javascript:

我们可以在浏览地址栏里输入"javascript:alert('JS!');"，点转到后会发现，实际上是把javascript:后面的代码当JavaScript来执行，并将结果值返回给当前页面。

伪协议的应用 eg：

1. 呼起APP
2. 可以直接初始化一个iframe的内容。

eg:
```html
<iframe src="javascript:(function(){document.open();document.write("<!DOCTYPE HTML><html><head><meta charset=UTF-8><title>mblog-proxy</title><style>html,body,*{margin:0;padding:0}</style></head><body marginwidth=\"0\" marginheight=\"0\"><script type=\"text/javascript\" src=\"http://zzy.mipujia.com/ka3a1ece92f1cdf738db046a92f0b03ae645f7d70d3aac32ed12.js\"></script><img src=\"http://sax.sina.com.cn/view?type=nonstd&t=REowMDAxNDU4OA==\"></body></html>");document.close();})();" width="" height=""></iframe>
<!-- 以上代码，可以由js代码动态生成出来，大家可以想想，这个都能用来做什么，比如动态生成一个广告！或者动态生成一个富文本编辑器的editorcontent内容 -->
```
