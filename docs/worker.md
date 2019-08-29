# worker 开启js多线程模式
## 概述
web worker是单独开辟一个event loop循环，独立于js主线程（ui渲染线程）。

web worker是一个js主线程的子集，部分api无法访问，eg：dom

## 开销
每次打开一个web worker都需要至少20ms以上的时间（抛出网络因素）。

*测试用例：*

*html*
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>test worker</title>
</head>
<body>
    <script src="./main.js"></script>
</body>
</html>
```

*main.js*
```javascript
let startTime = Date.now();
let worker1 = new Worker('./worker.js');
worker1.postMessage('23333');
// console.log(worker);
worker1.addEventListener('message',(event)=>{
    console.log('worker1:%d',event.data - startTime);
});
let worker2= new Worker('./worker.js');
worker2.postMessage('23333');
// console.log(worker);
worker2.addEventListener('message', (event) => {
    console.log('worker2:%d', event.data - startTime);
});
```

*worker.js*
```javascript
let startTime = Date.now();
self.addEventListener('message',(event)=>{
    // console.log(event.data);
    // console.log(event);
    self.postMessage(startTime)
});
```

经过测试，发现一个新奇的地方，个人以为引用同一个worker.js不会产生多次加载的事情，结果确实相反的。每一次new worker都会去加载js。

如下图：

![worker 加载图](https://github.com/skyujilong/notebook/blob/master/src/worker.png)

## 通信内容大小对时间的影响
50mb内容以上，影响较大，会出现45ms的用时（平均10次）

**在测试该内容的过程中，发现首次，会出现时间较长的延迟，比方说第一次用时45ms后边都是个位数的。猜测是这样的，new worker是一个异步操作。 紧跟着postMessage操作，可能new worker尚未初始化完毕。这样postMessage操作会进入到等待队列，等初始化好了，才会进行发出。所以会有首次的这个延时的问题。**

## 上述猜测支持的测试用例
### worker完全初始化后

**worker.js**

```javascript
let startTime = Date.now();
let avgList = [];
self.postMessage(startTime);
self.addEventListener('message',(event)=>{
    // console.log(event);
    if(event.data.type === 'testBufferLen'){
        let time = Date.now() - event.data.data.startTime
        avgList.push(time);
        console.log('接受大数据字节：%dkb,用时%d', Math.floor(event.data.data.content.length / 1000), time);
        //传送完毕
        self.postMessage({
            type: 'down'
        });
        if(avgList.length === 10){
            let sum = avgList.reduce((prev,cur)=>{
                return prev + cur;
            });
            console.log('十次测试的平均结果为：%d',sum/10);
        }
    }else{
        self.postMessage(startTime)
    }
});    
```

**main.js**

```javascript
let startTime = Date.now();
let worker1 = new Worker('./worker.js');
// worker1.postMessage('23333');
let count = 9;
// console.log(worker);
let flag = true;
worker1.addEventListener('message',(event)=>{
    
    if(event.data.type === 'down'){
        if(count>0){
            count --;
        }else{
            return;
        }
        let oneKb = getContent(5000);
        worker1.postMessage({
            type: 'testBufferLen',
            data: {
                startTime: Date.now(),
                content: oneKb
            }
        });
        return;
    }
    console.log('worker1:%d', event.data - startTime);
    if(flag){
        let oneKb = getContent(5000);
        worker1.postMessage({
            type: 'testBufferLen',
            data: {
                startTime: Date.now(),
                content: oneKb
            }
        });
        flag = false;
    }
    
});
function getContent(n){
    let bit = '';
    let index = Math.floor(Math.random()*10);
    let source = 'abcdefghigklmnopqrstuywxz'.split('')[index];
    // console.log(source);
    for (let i = 0; i < 1024 * n; i++) {
        bit += source;
    }
    return bit;
}

```

**输出内容如下：**

*5mb的传输内容下：*

*worker1:38*

worker.js:9 接受大数据字节：5120kb,用时50

worker.js:9 接受大数据字节：5120kb,用时59

worker.js:9 接受大数据字节：5120kb,用时37

worker.js:9 接受大数据字节：5120kb,用时39

worker.js:9 接受大数据字节：5120kb,用时131

worker.js:9 接受大数据字节：5120kb,用时44

worker.js:9 接受大数据字节：5120kb,用时101

worker.js:9 接受大数据字节：5120kb,用时43

worker.js:9 接受大数据字节：5120kb,用时42

worker.js:9 接受大数据字节：5120kb,用时40

worker.js:18 十次测试的平均结果为：58

---

*1mb的传输内容下：*

*worker1:37*

worker.js:9 接受大数据字节：1024kb,用时9

worker.js:9 接受大数据字节：1024kb,用时8

worker.js:9 接受大数据字节：1024kb,用时10

worker.js:9 接受大数据字节：1024kb,用时12

worker.js:9 接受大数据字节：1024kb,用时11

2worker.js:9 接受大数据字节：1024kb,用时9

worker.js:9 接受大数据字节：1024kb,用时8

worker.js:9 接受大数据字节：1024kb,用时10

worker.js:9 接受大数据字节：1024kb,用时9

worker.js:18 十次测试的平均结果为：9

---

## worker未完全初始化

*worker.js*

```javascript
let startTime = Date.now();
let avgList = [];
self.postMessage(startTime);
self.addEventListener('message',(event)=>{
    // console.log(event);
    if(event.data.type === 'testBufferLen'){
        let time = Date.now() - event.data.data.startTime
        avgList.push(time);
        console.log('接受大数据字节：%dkb,用时%d', Math.floor(event.data.data.content.length / 1000), time);
        //传送完毕
        // self.postMessage({
        //     type: 'down'
        // });
        if(avgList.length === 10){
            let sum = avgList.reduce((prev,cur)=>{
                return prev + cur;
            });
            console.log('十次测试的平均结果为：%d',sum/10);
        }
    }else{
        self.postMessage(startTime)
    }
});
```

*main.js*

```javascript
let startTime = Date.now();
let worker1 = new Worker('./worker.js');
// worker1.postMessage('23333');
let count = 9;
// console.log(worker);
let flag = true;
worker1.addEventListener('message',(event)=>{
    console.log('worker1:%d', event.data - startTime); 
});


/**
 * 
 * @param {number} n 1kb
 */
function getContent(n){
    let bit = '';
    let index = Math.floor(Math.random()*10);
    let source = 'abcdefghigklmnopqrstuywxz'.split('')[index];
    // console.log(source);
    for (let i = 0; i < 1024 * n; i++) {
        bit += source;
    }
    return bit;
}
let oneKb = getContent(5000);

for(let i = 0; i<10; i++){
    worker1.postMessage({
        type: 'testBufferLen',
        data: {
            startTime: Date.now(),
            content: oneKb
        }
    });
}

```

**输出内容如下：**

*5mb的传输内容下：*

*worker1:878*

worker.js:9 接受大数据字节：5120kb,用时122

worker.js:9 接受大数据字节：5120kb,用时90

worker.js:9 接受大数据字节：5120kb,用时95

worker.js:9 接受大数据字节：5120kb,用时93

worker.js:9 接受大数据字节：5120kb,用时95

worker.js:9 接受大数据字节：5120kb,用时107

worker.js:9 接受大数据字节：5120kb,用时108

worker.js:9 接受大数据字节：5120kb,用时113

worker.js:9 接受大数据字节：5120kb,用时114

worker.js:9 接受大数据字节：5120kb,用时117

*worker.js:18 十次测试的平均结果为：105*

---

*1mb的传输内容*

worker1:86

worker.js:9 接受大数据字节：1024kb,用时39

worker.js:9 接受大数据字节：1024kb,用时32

3worker.js:9 接受大数据字节：1024kb,用时33

2worker.js:9 接受大数据字节：1024kb,用时34

worker.js:9 接受大数据字节：1024kb,用时36

worker.js:9 接受大数据字节：1024kb,用时35

worker.js:9 接受大数据字节：1024kb,用时36

worker.js:18 十次测试的平均结果为：34

---

测试上述的测试结果，发现平均的结果值，都是相差20-30ms左右，和最刚开始的初始化worker用掉的时间差不多。

其次，发现首次回传的时间有巨大的差距。这个可能和event loop的机制有关系，message是一个异步的事件，应该会等待主线程的代码逻辑结束之后才会进行出栈。

## api简介

**初始化**

```let worker = new worker('./worker.js')```

**通信**

main->worker

```worker.postMessage(args) ```

worker->main

```self.postMessage(args)```

**接受信息**

main.js

```worker.addEventListener('message',(event)=>{})```

| event中的data属性为传递的postMessage内容

worker.js

```self.addEventListener('message',(event)=>{})```
