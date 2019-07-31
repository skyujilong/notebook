# Function.prototype.bind 函数思考
## 源于一次代码尝试
```javascript
function foo (a,b){
    console.log(this);
    console.log(arguments);
}

let obj1 = {
    a:1
};
let obj2 = {
    a:2
};
foo.bind(obj1,1,1).bind(obj2,2,2)();

```

输出结果:

```javascript
{a: 1}
[1, 1, 2, 2,]

```
有点出乎我的意料之外了。

## 实现一个bind

bind 将返回一个新的函数，并且他的第一个参数作为新函数的运行context,剩余参数作为函数的形参。

```javascript
Function.prototype.bind = function(ctx){
    let fn = this;
    let args = Array.prototype.slice.call(arguments,1);
    return function(){
        return fn.apply(ctx,args.concat(Array.prototype.slice.call(arguments)));
    }
}

```

测试：

```javascript
function foo1 (a,b){
    console.log(this);
    console.log(arguments);
}
foo1.bind(obj1,1,1).bind(obj2,2,2)();
```

结果：

```javascript
{a: 1}
[1, 1, 2, 2]
```
## 结论

这样我们就实现了bind函数，

从该实现中，我们发现，返回的new function中，实际的执行函数是fn.apply。这样执行的，这样不管bind函数几次。

**执行函数的作用域context都是首次绑定的对象。**