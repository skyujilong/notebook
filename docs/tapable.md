# webpack tapable 源码分析
## 流程图
![流程图](https://github.com/skyujilong/notebook/blob/master/src/tapable.png)
## 代码分析
```javascript
let hooks = new SyncHook(['test01']);
hooks.tap('LoggerPlugin',(args)=>{
    // console.log(arguments);
    console.log(args);
    console.log(1);
});
hooks.tap('test',(args)=>{
    console.log(args);
    console.log(2);
})
hooks.call('23333');
```
## SyncHook
SyncHook 继承自 Hock基类

主要是实现了Hock的compile方法

compile方法主要是根据不同的类型的hock实现，通过HookCodeFactory的实例，返回对应的hock函数！（异步同步之类的不同实现）

## HookCodeFactory
根据不同的情景返回不同的函数

## 核心
### tap 方法注册
_insert 注册参数等信息
### call
call=>createCompileDelegate=>lazyCompileHook=>_createCall=>compile=>setup=>creat

createCompileDelegate 返回函数lazyCompileHook

```javascript
function createCompileDelegate(name, type) {
    //  返回的函数！ lazyCompileHook 相当于挂载在Hook.prototype上
	return function lazyCompileHook(...args) {
        // 注意 这里的this! 他是Hook的实例！
        // this[name] 这里相当于将this._createCall(type)返回的创建出来的hock 方法 挂载在Hook的实例上！ 这样_x是能被访问到的！！！！
		this[name] = this._createCall(type);//返回 需要创建的function 比方说现在需要的 hock function
		return this[name](...args);
	};
}

Object.defineProperties(Hook.prototype, {
	_call: {
        // 拿到的是函数。
		value: createCompileDelegate("call", "sync"),// 这里是一个闭包 返回的 lazyCompileHook(a,b,c,d,...e):any
		configurable: true,
		writable: true
	},
	_callAsync: {
		value: createCompileDelegate("callAsync", "async"),
		configurable: true,
		writable: true
	},
	_promise: {
		value: createCompileDelegate("promise", "promise"),
		configurable: true,
		writable: true
	}
});
```

_createCall 调用 实例化的的compile 返回hock函数

compile 函数 会调用 HookCodeFactory的setup方法 以及create 方法

HookCodeFactory.setup 将tap中的function 初始化到_x上

```javascript
setup(instance, options) {
    // instance 是前面的Hook实例
    // 这里将tap方法带来的function都初始化到_x上！
    instance._x = options.taps.map(t => t.fn);
}

```

HookCodeFactory.create 返回整个hock函数

**注意HookCodeFactory.content的实现！！！callTapsSeries & callTap会根据content方法返回对应的hock代码！**
