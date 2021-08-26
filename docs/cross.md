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

**注：这中间可能会碰到几个有问题的地方，比如说后端服务的session的问题等等，还有SEO相关问题。我这里提出来的这套方案，仅仅适用于，向跨域服务器提交内容，与获得响应（callback function），具体这套跨域方案的应用还需要各位应对自己的需求，去判断是否使用这套东西。比如你们是单独服务处理账户，那么恭喜你们，在用这套方案的时候会简单的多，如果是基于session的确实会有一些问题，最后感谢群友Carson提出来的这些问题。**

## Ajax跨域方案
1. 服务器端设置Access-Control-Allow-Origin，如果带有cookie 需要将Access-Control-Allow-Origin的*更改为请求过来的origin。 如果是应对多域名下的跨域，建议拿到origin后，返回Access-Control-Allow-Origin对应的origin
2. 如果需要带有cookie，需要服务器设置```Access-Control-Allow-Credentials: true```，同时，请求ajax需要在open与send方法之间设置```xhr.withCredentials = true``` fetch的时候需要mode:'cors'以及credentials: "include"。


## IE Ajax跨域的问题描述(目前测试 没有发生下列问题，后续关注一下)
ie的问题是在于低版本，9以及以下版本，在服务器端返回的respones
Access-Control-Allow-Origin:*
或者将*换成具体的域名，默认是显示你有跨域问题的，就是通信失败。
