# 故障排查——服务器cookie丢失篇

## cookie起源

早期的 Web 应用面临的最大问题之一就是如何维持状态。简言之，服务器无法知道两个请求是否来自于同一个浏览器。当时，最简单的办法就是在请求的页面中插入一个 token，然后在下次请求时将这个 token 返回至服务器。这需要在页面的 form 表单中插入一个包含 token 的隐藏域，或者将 token 放在 URL 的 query 字符串中来传递。这两种方法都需要手动操作，而且极易出错。

当时网景通讯的一名员工 Lou Montulli，在 1994 年将 “magic cookies” 的概念应用到 Web 通讯中。他试图解决 Web 的第一个购物车应用，现在购物车成了购物网站的支柱。他的原始说明文档提供了 cookie 工作原理的基本信息，该文档后来被作为规范纳入到 RFC 2109（大多数浏览器的实现参考文档）中，最终被纳入到 RFC 2965 中。Montulli 也被授予 cookie 的美国专利。网景浏览器在它的第一个版本中就开始支持 cookie，现在所有 Web 浏览器都支持 cookie。

## cookie是什么

简单地说，cookie 就是浏览器储存在用户电脑上的一小段文本文件。cookie 是纯文本格式，不包含任何可执行的代码。一个 Web 页面或服务器告知浏览器按照一定规范来储存这些信息，并在随后的请求中将这些信息发送至服务器，Web 服务器就可以使用这些信息来识别不同的用户。大多数需要登录的网站在用户验证成功之后都会设置一个 cookie，只要这个 cookie 存在并可以，用户就可以自由浏览这个网站的任意页面。再次说明，cookie 只包含数据，就其本身而言并不有害。

## 如何定位服务器cookie丢失

首先，这个服务器的cookie应该是服务器种的cookie，这样，自然会在请求的返回中包含这个种的cookie的信息了。如果没有，那么就是服务器端的问题，或者网络也有可能，具体就是他们互相撕逼了。

看如下的例子：
![图片](https://github.com/skyujilong/notebook/blob/master/src/server-save-cookie-demo.png)

服务器设置cookie，通过reponse headers中的Set-Cookie字段。如果没有这个，则说明服务器没有设置cookie。上图是通过chrome中的控制台的network看到的结果。
