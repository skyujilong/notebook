# ie6/7/8/9 跨域ajax的解决方案
## 同源策略
协议相同，域名相同（同主域），端口号相同。

[浏览器的同源策略](https://developer.mozilla.org/zh-CN/docs/Web/Security/Same-origin_policy)

## IE ajax跨域的问题描述
ie的问题是在于低版本，9以及以下版本，在服务器端返回的respones
Access-Control-Allow-Origin:*
或者将*换成具体的域名，默认是显示你有跨域问题的，就是通信失败。
## ie ajax跨域问题解决方案
可以采用iframe的方式予以解决，具体思路如下：
1. 在js全局中提供一个函数
2. 动态创建iframe，并且将你需要传递后台的数据，用form表单(注意，这个form中，有个参数是，告诉服务器B(跨域地址)回调服务器A(非跨域地址))的方式提交到，iframe中。
3. 由服务器A返回的iframe内容，以及回调1步骤中的全局函数。
