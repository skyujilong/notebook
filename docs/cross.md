# ie6/7/8/9 跨域ajax的解决方案
## 同源策略
协议相同，域名相同（同主域），端口号相同。

[浏览器的同源策略](https://developer.mozilla.org/zh-CN/docs/Web/Security/Same-origin_policy)

## 服务器跨域解决方案
要点：
1. form表单提交是可以无视同源策略的，也就是说你在form表单提交信息的同时可以提交cookie。
2. 无刷新的form表单提交，只需要在form标签上添加target属性，并且该target属性指向一个隐藏的iframe即可。
3. 同源策略上来讲，在一个DOC内访问该DOC下的一个iframe内的内容，需要同域名同端口号（当然如果是两个同主域的二级域名，可以通过设置document.domain="主域"，来进行互相访问）。
4. 如何判断一个form表单产生了返回值，可以采用两种方案，第一监听form表单的load事件，load事件发生后，去访问这个iframe的全局js变量，第二在主DOC上注册一个全局函数，form表单提交完毕后的iframe内容可以访问这个全局函数。

**这几点非常的重要。服务器的跨域解决方案就是基于当前的这几个点来做的。**

整个流程如下图：

![流程图](https://github.com/skyujilong/notebook/blob/master/src/cross-server.jpg)

## IE ajax跨域的问题描述(目前测试 没有发生下列问题，后续关注一下)
ie的问题是在于低版本，9以及以下版本，在服务器端返回的respones
Access-Control-Allow-Origin:*
或者将*换成具体的域名，默认是显示你有跨域问题的，就是通信失败。
## ie ajax跨域问题解决方案
可以采用iframe的方式予以解决，具体思路如下：
1. 在js全局中提供一个函数
2. 动态创建iframe，并且将你需要传递后台的数据，用form表单(注意，这个form中，有个参数是，告诉服务器B(跨域地址)回调服务器A(非跨域地址))的方式提交到，iframe中。
3. 由服务器A返回的iframe内容，以及回调1步骤中的全局函数。

## ajax跨域方案
1. 服务器端设置Access-Control-Allow-Origin

## ajax（带cookie）跨域
1. 服务器端设置Access-Control-Allow-Credentials: true
2. 客户端在xhr open方法与 send方法之间设置``` xhr.withCredentials = true; ```
