# Event Loop(外文翻译)
## 介绍
该事件循环是最重要的方面来理解关于JavaScript的一个。


>我用JavaScript编写了多年的程序，但我从来没有完全理解它是如何工作的。没有详细了解这个概念是完全没问题的，但是像往常一样，了解它的工作方式很有帮助，而且在这一点上你可能只是有点好奇。


这篇文章旨在解释JavaScript如何与单个线程一起工作的内部细节，以及它如何处理异步函数。

您的JavaScript代码运行单线程。一次只发生一件事。

这是一个实际上非常有用的限制，因为它简化了很多程序，而不必担心并发问题。

您只需要注意编写代码的方式，避免任何可能阻塞线程的内容，如同步网络调用或无限循环。

通常，在大多数浏览器中，每个浏览器选项卡都有一个事件循环，以使每个进程隔离并避免具有无限循环或繁重处理的网页阻止整个浏览器。

例如，环境管理多个并发事件循环，以处理API调用。Web Workers也在自己的事件循环中运行。

您主要需要担心的是，您的代码将在单个事件循环上运行，并在编写代码时考虑到这一点，以避免阻塞它。

## 阻止事件循环

任何需要很长时间才能将控制权返回给事件循环的JavaScript代码都会阻止页面中任何JavaScript代码的执行，甚至阻止UI线程，用户也无法点击，滚动页面等等。

几乎所有JavaScript中的I / O原语都是非阻塞的。网络请求，Node.js文件系统操作等。阻塞是个例外，这就是为什么JavaScript基于回调，以及最近的promises和async / await。

## 调用堆栈

调用堆栈是LIFO队列（Last In，First Out）。

事件循环不断检查调用堆栈以查看是否存在需要运行的任何函数。

在执行此操作时，它会将它找到的任何函数调用添加到调用堆栈并按顺序执行每个调用。

您可以在调试器或浏览器控制台中了解您可能熟悉的错误堆栈跟踪吗？浏览器在调用堆栈中查找函数名称以通知您哪个函数发起当前调用：

![exception-call-stack.png](https://github.com/skyujilong/notebook/blob/master/src/exception-call-stack.png)

## 一个简单的事件循环说明
我们来举一个例子：

>我使用foo，bar并baz作为随机名称。输入任何类型的名称来替换它们

```javascript
const bar = () => console.log('bar')

const baz = () => console.log('baz')

const foo = () => {
  console.log('foo')
  bar()
  baz()
}

foo()
```

此代码打印

```javascript
foo
bar
baz
```
正如所料。

当此代码运行时，首先foo()调用。在foo()我们第一次打电话bar()，然后我们打电话baz()。

此时调用堆栈如下所示：

![call-stack-first-example.png](https://github.com/skyujilong/notebook/blob/master/src/call-stack-first-example.png)

每次迭代的事件循环都会查看调用堆栈中是否存在某些内容并执行它：

![execution-order-first-example.png](https://github.com/skyujilong/notebook/blob/master/src/execution-order-first-example.png)

直到调用堆栈为空。

## 方法队列的执行

上面的例子看起来很正常，没有什么特别的：JavaScript找到要执行的东西，按顺序运行它们。

让我们看看如何推迟函数直到堆栈清除。

用例setTimeout(() => {}), 0)是调用一个函数，但是一旦执行了代码中的每个其他函数就执行它。

举个例子：

```javascript
const bar = () => console.log('bar')

const baz = () => console.log('baz')

const foo = () => {
  console.log('foo')
  setTimeout(bar, 0)
  baz()
}

foo()
```

这段代码打印出来，可能令人惊讶：

```javascript
foo
baz
bar
```

当此代码运行时，首先调用foo（）。在foo（）里面我们首先调用setTimeout，bar作为参数传递，然后我们指示它尽可能快地运行，将0作为计时器传递。然后我们称之为baz（）。

此时调用堆栈如下所示：

![call-stack-second-example.png](https://github.com/skyujilong/notebook/blob/master/src/call-stack-second-example.png)

以下是我们程序中所有函数的执行顺序：

![execution-order-second-example.png](https://github.com/skyujilong/notebook/blob/master/src/execution-order-second-example.png)

为什么会这样？

## 消息队列

调用setTimeout（）时，Browser或Node.js启动计时器。一旦计时器到期，在这种情况下，当我们将0作为超时时立即将回调函数放入消息队列中。

Message Queue也是用户启动的事件（如点击或键盘事件或获取响应）在您的代码有机会对其作出反应之前排队的位置。或者像DOM这样的DOM事件onLoad。

循环优先于调用堆栈，它首先处理它在调用堆栈中找到的所有内容，一旦没有任何东西，它就会在消息队列中拾取内容。

我们不必等待像setTimeoutfetch或其他东西这样的函数来完成自己的工作，因为它们是由浏览器提供的，并且它们存在于自己的线程中。例如，如果将setTimeout超时设置为2秒，则不必等待2秒 - 等待发生在其他地方。

## ES6作业队列

ECMAScript 2015引入了Promises使用的作业队列概念（也在ES6 / ES2015中引入）。这是一种尽快执行异步函数结果的方法，而不是放在调用堆栈的末尾。

在当前函数结束之前解析的Prom将在当前函数之后立即执行。

我觉得在游乐园里过山车的比喻很好：消息队列将你放在队列的后面，在所有其他人的后面，你将不得不等待轮到你，而作业队列是快速通票这可以让你在完成上一个之后再骑一次。

例：

```javascript
const bar = () => console.log('bar')

const baz = () => console.log('baz')

const foo = () => {
  console.log('foo')
  setTimeout(bar, 0)
  new Promise((resolve, reject) =>
    resolve('should be right after baz, before bar')
  ).then(resolve => console.log(resolve))
  baz()
}

foo()
```

这打印

```javascript
foo
baz
should be right after baz, before bar
bar
```

这是Promises（和Async / await，它建立在promises上）和普通的旧异步函数setTimeout()或其他平台API 之间的巨大差异。



[原文](https://flaviocopes.com/javascript-event-loop/#es6-job-queue)