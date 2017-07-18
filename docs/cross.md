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

## 采用postMessage的方式进行跨域（高级版本浏览器推荐）
window.postMessage() 方法可以安全地实现跨源通信。

eg,main html:

*测试域名：http://fun.sina.cn*

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>测试postMessage</title>
</head>
<body>
    <h1>hello 测试postMessage跨域</h1>
    <iframe src="http://test.sina.com.cn/ifr.html" style="display:none;"></iframe>
    <script type="text/javascript">
        window.addEventListener('message',function(evt){
            switch (evt.origin) {
                case 'http://test.sina.com.cn':
                    //TODO your buz
                    //evt.data your data
                    console.log(evt.origin);
                    console.log(evt.data);
                    break;
                default:
                    return;
            }
        },false);
    </script>
</body>
</html>

```

eg,ifr html:

*测试域名：http://test.sina.com.cn*

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>post message</title>
        <script type="text/javascript">
            // 参数说明 argv1 发送消息体 argv2 目标源（协议+域名）
            window.top.postMessage('hello world','http://fun.sina.cn');
        </script>
    </head>
    <body>
        <h1>post message</h1>
    </body>
</html>
```
----

### postMessage说明：

xxx.postMessage(...),xxx必须是对应的窗口window对象，eg:

a文档内含有b文档（通过iframe等），b文档要给a文档发送消息，**b文档需要通过获取a文档的window** 才行发送消息。

xxx.postMessage(argv1,argv2,argv3);

1. argv1: 可序列化的字符串
2. argv2: 要发送给那个源（对应的是协议+域名）
3. argv3: 可选，是一串和message 同时传递的 Transferable 对象. 这些对象的所有权将被转移给消息的接收方，而发送一方将不再保有所有权。

message事件：**通过event.origin进行判断是否要进行对应的操作！！**

### 浏览器支持情况
![浏览器支持](https://github.com/skyujilong/notebook/blob/master/src/postMessageSupport.jpg)
