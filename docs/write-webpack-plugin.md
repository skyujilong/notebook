# how to write webpack plugin(如何写一个webpack的插件)
作为一个webpack的忠实拥护者，怎么也得给webpack推广一下是吧。所以就有了这篇文章，众所周知，webpack有两个强力的东西，一个是loader，应对于处理各种文件类型的。还有另外一个就是plugin了，这个东西怎么说那，应该是个万金油，干什么都行，比loader还要强大。

## 基本使用
### 同步PLUGIN如下代码：
```javascript
    function HelloWorldPlugin(options){
        //为外部初始化该plugin时的参数
    }
    HelloWorldPlugin.prototype.apply = function (compliler) {
        //compliler对象是webpack的对象这个很重要，后面讲解作用
        compliler.plugin('done',() => {
            console.log('hello world');//该log日志，会在webpack构建项目结束后运行
        });
    };
    module.exports = HelloWorldPlugin;
```
### 异步PLUGIN如下代码：
```javascript
    function HelloWorldPlugin(options){
        //为外部初始化该plugin时的参数
    }
    HelloWorldPlugin.prototype.apply = function (compliler) {
        //compliler对象是webpack的对象这个很重要，后面讲解作用
        compliler.plugin('done',(compilation, cb) => {
            setTimeout(() => {
                console.log('hello world');//在webpack 构建完毕后的300ms后打印hello world
                cb();//通知webpack 该组件已经运行完毕
            },300);
        });
    };
    module.exports = HelloWorldPlugin;
```
### Compliler & Compilation
为什么说plugin会很强大那？   
就是因为webpack给plugin注入的两个对象，compliler 和 compliation。   
现在让我们来讲讲这两个对象。

1. compliler:该对象，在webpack运行的时候，只创建一次，该对象会包含有你所有的配置信息。请用该对象来访问你配置的webpack环境。
2. compliation:该对象，包含有compliler,该对象在每次文件更改时都会创建。请用该对象来访问你需要的webpack资源。比如说，更改一个文件的内容，请用该对象去找到你需要更改的文件，并予以更改内容。

//["make", "compile", "emit", "after-emit", "invalid", "done", "this-compilation"]
