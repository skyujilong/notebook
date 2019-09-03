# 浏览器

## 需要简单理解多线程

### 并行处理

计算机中并行处理就是同一时刻处理多个任务。

```javascript
    let a = 1+2;
    let b = 20 / 5;
    let c = 7*8
```
如上，正常情况下是但线程来处理上述的任务，将上述每行的任务入队。之后依次执行。

![图线程图](https://github.com/skyujilong/notebook/blob/master/src/process.png)

单个线程：
1. 执行第一行
1. 执行第二行
1. 执行第三行

顺序的三步


如果采用多线程，比方说我们有两个线程 a 、线程 b 。
1. 第一行分配给 a线程
1. 第二行分配给 b线程
1. 第三行分配给 a线程（队列关系）
1. 之后进行执行，两个线程，a线程执行2次，b执行一次， 因为a&b是两条并行的线程，因此执行速度得到加快



### 进程与线程的区别

cpu执行的最小单元是进程。一个进程可以有多个线程。

如何理解？
> 一个进程好比一个工厂，线程，好比一个工厂的工人， 一个工厂拥有多个工人！

### 进程与线程的特点
进程挂掉了，会回收所有的线程。

单一线程挂掉了， 会引起进程的崩溃。

线程与线程之间可以共享数据，但是进程与进程之间是隔离的。

## 早期浏览器

早期的浏览器都是单独的进程的（所有的模块都运行在单独的这个进程下）。

特点：

1. 插件一崩溃，导致浏览器直接挂掉。
1. js执行while(true)，会导致整个浏览器崩溃。
1. js发生内存泄漏，会导致整个浏览器的内存跟着飙升。

从进程与线程的特点，应该就能 分析出来为什么会产生上面的问题了。

## 现在的浏览器(chrome)

多进程的浏览器

优点：
1. 插件崩溃，不会导致浏览器的崩溃。
1. js死锁也不会导致整个浏览器的崩溃，只有当前的tab页会无响应。
1. tab页的关闭，会完整释放这个tab页用到的内存。

从上述的描述中，我们大致可以猜测到。

页面的tab单独一个进程，插件机制也是独立的进程。

因为进程之间是隔离的，所以单个进程的崩溃，不会影响其他的进程。

tab关闭的释放内存，也是同样的，一个进程的结束，会释放该进程所占用的内存（操作系统释放）。

缺点：

主要是资源的开销，会比单进程的浏览器要高的多。

复杂性，要高很多。

## chrome当前的架构

![浏览器架构图](https://github.com/skyujilong/notebook/blob/master/src/browser-arch2.png)

简单来看
 
1. Browser 主要负责界面显示、用户交互、子进程管理、书签、前进后退，同时提供存储等功能。
1. Renderer 每个tab标签，都有一个Renderer进程，该进程主要负责页面呈现渲染。
1. Plugin 组件（eg:flash），独立的进程
1. GPU 负责复合层的渲染（translate3d，will-change：transform）

从上面的架构，可以看到一个多进程的浏览器。

## 为什么了解浏览器

主要是为了了解如何让页面更快的呈现在用户面前，并且不在发生卡顿。


## 一次页面的请求
TOOD: 解释一次url的请求

## 一次渲染的过程
### 流程 
1. 解析html 生成dom tree
2. 请求其他次级资源
3. 解析css【样式计算】构建cssom(css object module)
4. 遇到script标签（type="text/javascript"）执行js代码
5. cssom + dom tree = 渲染树（render tree）
6. render tree => Render Layer(由于有z-index分层，opacity小于1，transform等，分层)
7. 生成合成图层（Compositing Layer【在gpu内】）

### 详细流程
前面1，2，3，4，5步如下图：

![dom tree 到 render tree](https://github.com/skyujilong/notebook/blob/master/src/render-tree-construction.png)

---

**分层Render Layer**

为什么要分层？

因为页面中有一些复杂的效果，比方说3d转换，transform移动，z-index的上下层级，半透明等效果。

*分层的依据：*

1. will-change 属性、 translate3d、 z-index、CSS filter等
2. 有超出限定部分出现滚动条的(剪裁)。

**合成图层Compositing Layer**

将render layer根据需求提升到Graphics Layer

*依据:*
1. video
2. translate3d 
3. canvas
4. 对 opacity、transform、fliter、backdropfilter 应用了 animation 或者 transition（需要是 active 的 animation 或者 transition，当 animation 或者 transition 效果未开始或结束后，提升合成层也会失效）
5. css filter
6. 元素有一个包含复合层的后代节点(换句话说，就是一个元素拥有一个子元素，该子元素在自己的层里)
7. 元素有一个 z-index 较低且包含一个复合层的兄弟元素(换句话说就是该元素在复合层上面渲染)
8. 硬件加速的插件，比如 flash 等等
9. will-change 设置为 opacity、transform、top、left、bottom、right（其中 top、left 等需要设置明确的定位属性，如 relative 等）
10. 隐式的提升，eg 页面上俩个元素a与b，两者是兄弟元素，a元素与b元素有覆盖的部分，a元素在下面（z-index小），当a元素有will-change:transform的时候（满足上面9个条件中任意一个）， 则b元素也会被提升。

为什么要提升到Graphics Layer，思考一下，如果上述css的动画，都是上述render tree计算得出来的，这样每次都要更改计算位图（后边讲一下位图的概念），之后还要重新走到render layer这个步骤，再提交给gpu进行输出到用户的屏幕上，这样会频繁占用cpu的计算资源，其中js的线程与渲染的线程是互斥的。页面上想到得到60fps的效果非常的困难。

但是相反，如果我们这里将动画相关资源都提升到了Graphics Layer上（gpu线程上），这里的计算都是gpu在计算，gpu是一个计算单元与cpu是一样的都是存在的硬件。这样能够分担cpu的计算压力（并行执行），并且gpu的设计本身上就是偏向计算的，不像cpu那么的复杂。所以gpu的计算是更高效的，并且css的动画本质上是矩阵的变化，矩阵变化也都是数学上的计算！再加上，因为提升到不同的图层中，这样每次变动也仅仅是变动一个图层（Graphics Layer）的数据，方便进行缓存。而且本身在gpu上，之后进行gpu的输出到屏幕上也很方便。

当然，因为Graphics Layer上，因为会有缓存，会导致内存的大量占用。当Graphics Layer数量足够多的时候，会对页面造成卡顿。

[合并图例](https://github.com/skyujilong/notebook/blob/master/src/compositing-process.png)

## TODO:
继续深入了解整个chrome

## 参考
[inside-browser](https://developers.google.com/web/updates/2018/09/inside-browser-part1)

[渲染树构建、布局及绘制](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/render-tree-construction?hl=zh-cn)

[无线性能优化：Composite](https://fed.taobao.org/blog/2016/04/26/performance-composite/)

[隐式提升Graphics Layer](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/)