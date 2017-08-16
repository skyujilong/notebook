# Promise

promise随着生成器函数以及async await的普及是越来越重要了。**毕竟异步的终极解决方案就是async await + promise。**

## Promise大致的实现

### Promise的状态:

1. pending 初始状态，不是成功或失败状态。
2. fulfilled 意味着操作成功完成。
3. rejected 意味着操作失败。

**状态的迁移，只能单向的pending -> fulfilled 或者 pending -> rejected**

因此：可以推论，每次状态的变化都会生成一个新的promise对象。
eg:
```JavaScript

let obj1 = demo.then(() => {
    console.log(123);
});
let obj2 = obj1.then(() => {
    console.log(233);
})
console.log(obj1 === obj2);

//这里返回false 证明then回来的都是一个新的promise对象

```


### Promise相关属性：

```JavaScript
//伪代码：
{
    promiseStatus:'pending|fulfilled|rejected',
    promiseValue:'',
    queue:[
        QueueItem:{
            promise: Promise { state: 0, value: undefined, queue: [] },
            callFulfilled: [Function],
            callRejected: [Function] },
        },
        QueueItem:{
            promise: Promise { state: 0, value: undefined, queue: [] },
            callFulfilled: [Function],
            callRejected: [Function] },
        }
    ]
}

//promise对象主要是有两个状态一个是promiseStatus默认值是pending，一个是成功回调的value,队列内容是后续的操作
```
**注：因为状态是不可更改的，因此promise的链式调用，每次都是返回一个新的promise对象**
### Promise的值穿透
因为可以Promise.then(f1).then(f2)这样同一个promise可以调用then多次，因此会有值穿透发生。       
eg:
```JavaScript
let demo = new Promise((resovle,reject) => {
    setTimeout(() => {
        resovle(2)
    },300);
});
let obj = {};//这里obj 可以是任意非function对象
demo.then(obj).then((val) => {
    console.log(val);
});
//输出2,在第二个then中输出的
```
