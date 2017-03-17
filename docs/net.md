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
