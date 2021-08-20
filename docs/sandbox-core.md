# js 沙箱环境 核心

## 用处

复杂的前端环境中，排除子模块的全局环境的污染。

## api

eval、with、function闭包等方式，之后传入一个fakeWindow来模拟主端环境的window对象。

## 核心代码分析【基于iframe的方式】
```javascript
/// 代理的window
class SandboxWindow {
    
    /**
    * 构造函数，通过代码frame window对象，实现window对象的隔离。【该window 是从当前页动态创建iframe的window获取的。】
    * @params options 
    * @params context 透传的共享变量。或者方法等。 
    * @params frameWindow 页面动态创建iframe的contextWindow对象。
    * return 返回的是一个 proxy的window对象。
    */
    constructor(options, context, frameWindow) {
        return new Proxy(frameWindow, {
            // set劫持，新增或者设置的劫持。
            set(target, name, value) {
                // 优先设置 通过context传递过来的共享变量
                if (Object.keys(context).includes(name)) {
                    context[name] = value;
                }
                target[name] = value;
            },
            get(target, name) {
                // get劫持，优先返回context传递过来的共享方法变量等信息
                if (Object.keys(context).includes(name)) {
                    return context[name];
                }
                if (typeof target[name] === 'function' && /^[a-z]/.test(name)) {
                    return target[name].bind && target[name].bind(target);
                } else {
                    return target[name];
                }
            }
        })
    }
    //  ...
}

// 动态创建的iframe 获取 contextWindow对象
const iframe = document.createElement('iframe',{url:'about:blank'});
document.body.appendChild(iframe);
const sandboxGlobal = iframe.contentWindow;


/// 透传的全局对象
const context = { document:window.document, history: window.histroy }
/// 创建沙箱context，其实就是fakeWindow
const newSandBoxWindow = new SandboxWindow({}, context, sandboxGlobal)

/// 剩下的就是将远端的代码 跑在上述的环境上就是ok了

const codeStr = 'var test = 1;'

/// 分析一下，首先是闭包的执行，将变量进行隔离，之后bind方法 将上面的newSandBoxWindow，绑定到当前的this上，
/// 然后 with(newSandBoxWindow) 这样 with内的代码可以直接访问 newSandBoxWindow上的属性与方法，eg: with({a:123}){console.log(a)} 这里输出的是123.
/// self 作为自己的作用域的引用。

/// 这样 codeStr中的test = 1 其实是把内容挂在到了 newSandBoxWindow上了。

const run = (code) => {
    window.eval(`
        ;(function(global, self){
            with(global){
                ;${code}
            }
        }).bind(newSandBoxWindow)(newSandBoxWindow, newSandBoxWindow);
    `);
}
run(codeStr);
```

## 参考文章：

https://cloud.tencent.com/developer/article/1748172

