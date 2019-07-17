# 一次new操作发生了什么
## mdn上的解释
new 运算符创建一个用户定义的对象类型的实例或具有构造函数的内置对象的实例。new 关键字会进行如下的操作：

1. 创建一个空的简单JavaScript对象（即{}）；
1. 链接该对象（即设置该对象的构造函数）到另一个对象 ；
1. 将步骤1新创建的对象作为this的上下文 ；
1. 如果该函数没有返回对象，则返回this。


## 实现
```javascript
function newInstance (fun){
    let obj = {};
    let args = Array.prototype.slice.call(arguments,1);
    obj.__proto__ = fun.prototype;
    let result = fun.apply(obj,args);
    return result || obj;
}
```
测试
```javascript
function Foo(a,b){
    this.a = a;
    this.b = b;
}
Foo.prototype.plus = function (){
    return this.a + this.b;
}

var instance = newInstance(Foo,1,2);
```
输出instance对象结果：
![new对象的结果](https://github.com/skyujilong/notebook/blob/master/src/new.png)
正常new操作符的结果：
![正常new操作符的](https://github.com/skyujilong/notebook/blob/master/src/regular-new.png)