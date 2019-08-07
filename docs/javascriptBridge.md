# javascriptBridge 原理

## 核心api

OC:

decidePolicyForNavigationAction 劫持webview跳转请求（*这里的核心是iframe的src值的变化*）

evaluateJavaScript 直接执行js代码

伪代码
```
[_webView evaluateJavaScript:javascriptCommand completionHandler:nil];
// 比方说 javascriptCommand 为 var a = "2";

//上面的方法执行完毕，在webview中，你的window对象上window.a === "2" 返回true
//也就是说，上面的执行结果都存在你的window对象上的。

```

web端：
iframe src的变化。当前页面不会发生变化

## 流程

1. web页面初始化一个iframe（src 协议地址写的 https://__bridge_loaded__）
1. oc 拦截到 __bridge_loaded__ url
1. oc 执行 js代码，在web页面的window中注入一个对象 A
1. 对象 A 初始化另外一个iframe src 协议 https://__wvjb_queue_message__
1. 对象 A 注册两个方法，callHandler & registerHandler

callHandler方法，先将任务放入到自己的queue中，之后给iframe的src值 修改为https://__wvjb_queue_message__

当oc的检测webview跳转方法，验证到是https://__wvjb_queue_message__的时候，开始执行window对象中 

之前注册的对象A的flush方法（*注意两端交互的时候完全是字符串，因此这里其实是将queue中的task，JOSN.stringify后，返回给oc，oc在依次进行执行，执行结果的回调要依据task中的functionID的标示！*），将队列中的方法予以执行（**注意：这传递的执行参数，需要自己定一个下标，用来标示后边回调具体哪个函数！**）。

//TODO:后边将 WebViewJavascriptBridge_JS.js 代码补全，并添加注释，到时候就非常的清晰了

## 参考
[WebViewJavascriptBridge 原理解析](https://juejin.im/entry/58e4a76a44d904006d2a7778)


