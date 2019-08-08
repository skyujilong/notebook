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

## 源码分析

还记得之前的一个流程吗？ 上面的流程3，oc执行js代码，在web页面的window对象中注入一个对象A

执行的js方法如下：

WebViewJavascriptBridge_JS.js

```javascript
;(function() {
    //如果已经初始化了，则返回。
    if (window.WebViewJavascriptBridge) {
        return;
    }
    if (!window.onerror) {
        window.onerror = function(msg, url, line) {
            console.log("WebViewJavascriptBridge: ERROR:" + msg + "@" + url + ":" + line);
        }
    }
    //初始化一些属性。
    var messagingIframe;
    //用于存储消息列表
    var sendMessageQueue = [];
    //用于存储消息
    var messageHandlers = {};
    //通过下面两个协议组合来确定是否是特定的消息，然后拦击。
    var CUSTOM_PROTOCOL_SCHEME = 'https';
    var QUEUE_HAS_MESSAGE = '__wvjb_queue_message__';
    //oc调用js的回调
    var responseCallbacks = {};
    //消息对应的id
    var uniqueId = 1;
    //是否设置消息超时
    var dispatchMessagesWithTimeoutSafety = true;
    //web端注册一个消息方法
    function registerHandler(handlerName, handler) {
        messageHandlers[handlerName] = handler;
    }
    //web端调用一个OC注册的消息
    function callHandler(handlerName, data, responseCallback) {
        if (arguments.length == 2 && typeof data == 'function') {
            responseCallback = data;
            data = null;
        }
        _doSend({ handlerName: handlerName, data: data }, responseCallback);
    }
    function disableJavscriptAlertBoxSafetyTimeout() {
        dispatchMessagesWithTimeoutSafety = false;
    }
        //把消息转换成JSON字符串返回
    function _fetchQueue() {
        var messageQueueString = JSON.stringify(sendMessageQueue);
        sendMessageQueue = [];
        return messageQueueString;
    }
    //OC调用JS的入口方法
    function _handleMessageFromObjC(messageJSON) {
        _dispatchMessageFromObjC(messageJSON);
    }

    //初始化桥接对象，OC可以通过WebViewJavascriptBridge来调用JS里面的各种方法。
    window.WebViewJavascriptBridge = {
        registerHandler: registerHandler,
        callHandler: callHandler,
        disableJavscriptAlertBoxSafetyTimeout: disableJavscriptAlertBoxSafetyTimeout,
        // _fetchQueue方法就是用户在调用callHandler的时候，通过拦截到iframe的__wvjb_queue_message__跳转后，
        // 回来主动执行js对象WebViewJavascritBridge的_fetchQueue方法，该方法会将之前存入queue的数据JSON化后，返回给oc，
        // 这样oc就有你要调用的内容了。 注：callHandler的时候会对传入的data对象进行扩展，主要是添加callback的对应的一个id的表示。
        //为什么这样设计，因为这俩流程是断开的，这里这样可以使得流程连为一个完整的。
        _fetchQueue: _fetchQueue, 
        // 该方法是oc直接回调js的（无论是callHandler的回调，还是registerHandler的回到，都是该方法发出的！原因是，oc调用js的方法，都是evaluateJavaScript方法。）。
        // 之后会根据返回的data的responseId（registerHandler方法）与callbackId(callHandler方法)的属性，进行执行回调函数的执行。
        //
        _handleMessageFromObjC: _handleMessageFromObjC
    };


    //处理从OC返回的消息。
    function _dispatchMessageFromObjC(messageJSON) {
        if (dispatchMessagesWithTimeoutSafety) {
            setTimeout(_doDispatchMessageFromObjC);
        } else {
            _doDispatchMessageFromObjC();
        }

        function _doDispatchMessageFromObjC() {
            var message = JSON.parse(messageJSON);
            var messageHandler;
            var responseCallback;
            //回调
            if (message.responseId) {
                responseCallback = responseCallbacks[message.responseId];
                if (!responseCallback) {
                    return;
                }
                responseCallback(message.responseData);
                delete responseCallbacks[message.responseId];
            } else {//主动调用
                if (message.callbackId) {
                    var callbackResponseId = message.callbackId;
                    responseCallback = function(responseData) {
                        _doSend({ handlerName: message.handlerName, responseId: callbackResponseId, responseData: responseData });
                    };
                }
                //获取JS注册的函数
                var handler = messageHandlers[message.handlerName];
                if (!handler) {
                    console.log("WebViewJavascriptBridge: WARNING: no handler for message from ObjC:", message);
                } else {
                    //调用JS中的对应函数处理
                    handler(message.data, responseCallback);
                }
            }
        }
    }
    //把消息从JS发送到OC，执行具体的发送操作。
    function _doSend(message, responseCallback) {
        if (responseCallback) {
            var callbackId = 'cb_' + (uniqueId++) + '_' + new Date().getTime();
            //存储消息的回调ID
            responseCallbacks[callbackId] = responseCallback;
            //把消息对应的回调ID和消息一起发送，以供消息返回以后使用。
            message['callbackId'] = callbackId;
        }
        //把消息放入消息列表
        sendMessageQueue.push(message);
        //下面这句话会出发JS对OC的调用
        //让webview执行跳转操作，从而可以在
        //webView:(WKWebView *)webView decidePolicyForNavigationAction:(WKNavigationAction *)navigationAction decisionHandler:(void (^)(WKNavigationActionPolicy))decisionHandler 中拦截到JS发给OC的消息
        messagingIframe.src = CUSTOM_PROTOCOL_SCHEME + '://' + QUEUE_HAS_MESSAGE;
    }


    messagingIframe = document.createElement('iframe');
    messagingIframe.style.display = 'none';
    //messagingIframe.body.style.backgroundColor="#0000ff";
    messagingIframe.src = CUSTOM_PROTOCOL_SCHEME + '://' + QUEUE_HAS_MESSAGE;
    document.documentElement.appendChild(messagingIframe);


    //注册_disableJavascriptAlertBoxSafetyTimeout方法，让OC可以关闭回调超时，默认是开启的。
    registerHandler("_disableJavascriptAlertBoxSafetyTimeout", disableJavscriptAlertBoxSafetyTimeout);
    //执行_callWVJBCallbacks方法
    setTimeout(_callWVJBCallbacks, 0);

    //初始化WEB中注册的方法。这个方法会把WEB中的hander注册到bridge中。
    //下面的代码其实就是执行WEB中的callback函数。
    function _callWVJBCallbacks() {
        var callbacks = window.WVJBCallbacks;
        delete window.WVJBCallbacks;
        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i](WebViewJavascriptBridge);
        }
    }
})();
```

js代码中获取bridge的方法
```javascript
function setupWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) {
        return callback(WebViewJavascriptBridge);
    }
    if (window.WVJBCallbacks) {
        return window.WVJBCallbacks.push(callback);
    }
    // 没有上面的对象的时候，给window.WVJBCallbacks 添加 队列执行方法
    window.WVJBCallbacks = [callback];
    //后边的方法 将触发iframe的跳转 __bridge_loaded__，之后将触发oc的初始化之前的js，之后那个js方法会在
    //整体的WebViewJavascriptBridge初始化之后，flush WVJBCallbacks queue，将WebViewJavascriptBridge作为参数直接传递到
    //setupWebViewJavascriptBridge 实参 function的形参上。 这样js就拿到了WebViewJavascriptBridge对象
    var WVJBIframe = document.createElement('iframe');
    WVJBIframe.style.display = 'none';
    if (navigator.userAgent.match(/Android/gi)) {
        WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
    } else if (navigator.userAgent.match(/iPhone|iPad/gi)) {
        WVJBIframe.src = 'https://__bridge_loaded__';
    }
    document.documentElement.appendChild(WVJBIframe);
    setTimeout(function () {
        document.documentElement.removeChild(WVJBIframe)
    }, 0);
}
setupWebViewJavascriptBridge((bridge)=>{
    // brige 对象
})
```

## 优化

思考，在整套流程中，这些方法的执行都是异步的。

普通都是等待上述方法执行完毕之后，在进行后续的ui初始化操作等（比方说你是一个react || vue的项目）

那么如果我们不等待这个，bridge的初始化，就执行ui的初始化，是不是就能更快的呈现画面给用户了。

但是我们又需要bridge，该如何解决哪？

### 方案
采用一个queue保存，在bridge未初始化之前的操作。

等bridge初始化完毕之后，进行 flush queue操作，将之前未注册到bridge的方法予以注册到bridge上！

```typescript

type JSBridgeFn = {
    callHandler: (code: string, data: object, cb: (data: any, responseCb: Function) => any) => any
    registerHandler: (code: string, cb: (data: any, responseCb: Function) => any) => any
}

class JsbHandler{
    queue: Function[]
    jsb: JSBridgeFn
    constructor(){
        this.queue = [];
    }
    //当 jsb初始化之后，调用该方法，将jsb与该对象进行绑定。之后flush 队列中的未执行的方法。
    initJsb(jsb: JSBridgeFn){
        this.jsb = jsb;
        this.flush();
    }
    //实际调用callHandler的方法
    private _call(url:string,data:object,cb:Function){
        if(!this.jsb){
            //添加到缓存队列
            this.queue.push(()=>{
                this.jsb.callHandler(url, data, (data, resCb) => {
                    cb(data);
                });
            });
            return;
        }
        this.jsb.callHandler(url,data,(data,resCb)=>{
            cb(data);
        });
    }
    // 对用户暴露的call方法，主要是语法糖的加入，直接返回一个promise对象
    call(url:string,data:object):Promise<any>{
        return new Promise((resovle,reject)=>{
            this._call(url,data,function(data:object,resolve:Function){
                resolve(data);
            });
        });
    }
    private flush(){
        for(let fn of this.queue){
            fn();
        }
    }
    // 普通的registerHandler函数封装
    register(url:string,cb:(data:object)=>any){
        if(!this.jsb){
            this.queue.push(()=>{
                this.jsb.registerHandler(url, function (data, resCb) {
                    cb(data);
                });        
            });
            return;
        }
        this.jsb.registerHandler(url,function(data,resCb){
            cb(data);
        });
    }
}

let jsbHandler = new JsbHandler();
export default jsbHandler;

```


## 参考
[WebViewJavascriptBridge 原理解析](https://juejin.im/entry/58e4a76a44d904006d2a7778)


