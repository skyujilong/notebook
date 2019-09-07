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

## 现代的浏览器(chrome)

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

### 渲染架构 一个页面tab包含那些线程与进程

main thread 主线程，包含dom解析，js执行，css的执行，layout，paint, composite layers

compositor thread 合成器线程，调用gpu进程进行输出页面

gpu process gpu进程 输出页面

raster thread 光栅线程 

### 流程 
1. 解析html 生成dom tree
2. 请求其他次级资源
3. 解析css【样式计算】构建cssom(css object module)
4. 遇到script标签（type="text/javascript"）执行js代码
5. cssom + dom tree = 渲染树（render tree）
6. render tree => Render Layer(由于有z-index分层，opacity小于1，transform等，分层)
7. 生成合成图层（Compositing Layer【在gpu内】）
//TODO: 后边的渲染没说，Tiling & Rasterization 

### 详细流程
前面1，2，3，4，5步如下图：

![dom tree 到 render tree](https://github.com/skyujilong/notebook/blob/master/src/render-tree-construction.png)


1-7 的4种树类型的转换如下：

![the_compositing_forest](https://github.com/skyujilong/notebook/blob/master/src/the_compositing_forest.png)

上图中的renderObject,是dom tree + cssom计算出来的render tree。

RenderLayer 与 GraphicsLayer 对应关系是多对一的。具体看如下，大体逻辑就是没有条件升级到GraphicsLayer的RenderLayer，会找他的父亲层级，归属到他父亲节点的GraphicsLayer上。

---

**分层Render Layer**

为什么要分层？

因为页面中有一些复杂的效果，比方说3d转换，transform移动，z-index的上下层级，半透明等效果。

*分层的依据：*

1. will-change 属性、 translate3d、 z-index、CSS filter等
2. 有超出限定部分出现滚动条的(剪裁)。
3. 根结点（body）
4. canvas 3d 或者是加速的2d
5. video标签

*图层*

![合并图例](https://github.com/skyujilong/notebook/blob/master/src/compositing-process.png)

**合成图层Compositing Layer**

将render layer根据需求提升到Graphics Layer

*依据:*
1. video
2. translate3d 
3. canvas
4. 对 opacity、transform、fliter、backdropfilter 应用了 animation 或者 transition（需要是 active 的 animation 或者 transition，当 animation 或者 transition 效果未开始或结束后，提升合成层也会失效）
5. css filter
6. 元素有一个包含复合层的后代节点(换句话说，就是一个元素拥有一个子元素，该子元素在自己的层里)
7. 元素有一个 z-index 较低且包含一个复合层的兄弟元素(换句话说就是你渲染的元素，有一个兄弟元素，该兄弟元素是合成图层&z-index值低)
8. 硬件加速的插件，比如 flash 等等
9. will-change 设置为 opacity、transform、top、left、bottom、right（其中 top、left 等需要设置明确的定位属性，如 relative 等）
10. 隐式的提升，eg 页面上俩个元素a与b，两者是兄弟元素，a元素与b元素有覆盖的部分，a元素在下面（z-index小），当a元素有will-change:transform的时候（满足上面9个条件中任意一个）， 则b元素也会被提升。

为什么要提升到Graphics Layer，思考一下，如果上述css的动画，都是上述render tree计算得出来的，这样每次都要更改计算位图（后边讲一下位图的概念），之后还要重新走到render layer这个步骤，再提交给gpu进行输出到用户的屏幕上，这样会频繁占用cpu的计算资源，其中js的线程与渲染的线程是互斥的。页面上想到得到60fps的效果非常的困难。

但是相反，如果我们这里将动画相关资源都提升到了Graphics Layer上（gpu线程上），这里的计算都是gpu在计算，gpu是一个计算单元与cpu是一样的都是存在的硬件。这样能够分担cpu的计算压力（并行执行），并且gpu的设计本身上就是偏向计算的，不像cpu那么的复杂。所以gpu的计算是更高效的，并且css的动画本质上是矩阵的变化，矩阵变化也都是数学上的计算！再加上，因为提升到不同的图层中，这样每次变动也仅仅是变动一个图层（Graphics Layer）的数据，方便进行缓存。而且本身在gpu上，之后进行gpu的输出到屏幕上也很方便。

当然，因为Graphics Layer上，因为会有缓存(每个Graphics Layer都有他自己的Graphics Context，用于最终执行的绘制操作。)，会导致内存的大量占用。当Graphics Layer数量足够多的时候，会对页面造成卡顿。

**Graphics Context**

A GraphicsContext is responsible for writing the pixels into a bitmap that eventually get displayed to the screen. In Chrome, the GraphicsContext wraps Skia, our 2D drawing library.

GraphicsContext负责将像素写入最终显示在屏幕上的位图。在Chrome中，GraphicsContext包含了我们的2D绘图库Skia(一个类库，绘画用的)。

渲染树知道页面应该展示成什么样子，渲染树通过向GraphicsContext发出必要的绘制调用来实现绘制。GraphicsContext负责将像素写入最终显示在屏幕上的位图。

### gpu 

![gpu_process](https://github.com/skyujilong/notebook/blob/master/src/the_gpu_process.png)

如上图，注意两个部分。

1. client -> **bmp**(位图)
2. GPU中的Graphics Context

解释：client是main thread。

**从该图中，我们能够得知，没有经过合成图层的，部分是main thread中直接渲染出来的bmp（位图），放在共享内存中，之后在交给gpu进行渲染到显示器上的，而通过合成线程的部分，是直接在gpu中进行计算（GraphicsContext），然后在渲染到显示器上的。**


### 合成图层与main thread计算的bmp的流程区别

看一个例子：

*没有走合成加速的渲染*

```css
div {
    height: 100px;
    transition: height 1s linear;
}

div:hover {
    height: 200px;
}
```

该操作流程如下：

![main-thread-bmp](https://github.com/skyujilong/notebook/blob/master/src/main-bmp.png)

**分析：当hover的动作执行的时候每次都是main thread进行计算出bmp，之后将bmp交给gpu进行渲染到显示器上，main thread很忙！**


*走合成加速的渲染*

```css
div {
    transform: scale(0.5);
    transition: transform 1s linear;
}

div:hover {
    transform: scale(1.0);
}
```

该操作流程如下：

![compositor-bmp](https://github.com/skyujilong/notebook/blob/master/src/compositor-bmp.png)

**分析：当hover的动作执行的时候每次都是main thread仅仅是将transform的参数传递给了合成线程，由gpu进行计算出来动画的效果，并且显示到显示器上，main thread很闲！**



## event loop 发生在浏览器渲染的什么位置？

![event loop](https://github.com/skyujilong/notebook/blob/master/src/event-loop-in-render-process.jpg)

如上图。

event loop就发生在上述的javascript模块。

也就是说。
1. 先执行同步代码【直到执行完毕】
2. 执行microtask queue【promise,mutation.oberver,直到执行完毕，如果这个时候又有新的，放入队尾继续执行】
3. 执行macrotask queue【raf,setTimeout,setInterval等，执行macrotask出栈，每次出栈都要看一下microtask 是否有内容，有就执行，没有继续执行 macrotask】

上述1，2，3执行完毕，仅接着就执行 ui render


**ui render 中包含：**

*1. Recalculate Style*

>如果你在JS执行过程中修改了样式或者改动了DOM，那么便会执行这一步，重新计算指定元素及其子元素的样式。

*2. Layout 重排*

>我们常说的重排reflow。如果有涉及元素位置信息的DOM改动或者样式改动，那么浏览器会重新计算所有元素的位置、尺寸信息。而单纯修改color、background等等则不会触发重排。详见css-triggers。

*3. Update Layer Tree*

>这一步实际是更新Render Layer的层叠排序关系，也就是我们之前说的为了搞定层叠上下文搞出的那个东西，因为之前更新了相关样式信息和重排，所以层叠情况也可能变动。


*4. Paint*

>其实Paint有两步，第一步是记录要执行哪些绘画调用，第二步才是执行这些绘画调用。第一步只是把所需要进行的操作记录序列化进一个叫做SkPicture的数据结构里:

>The SkPicture is a serializable data structure that can capture and then later replay commands, similar to a display list.

>这个SkPicture其实就一个列表，记录了你的commands。接下来的第二步里会将SkPicture中的操作replay出来，这里才是将这些操作真正执行：光栅化和填充进位图。主线程中和我们在Timeline中看到的这个Paint其实是Paint的第一步操作。第二步是后续的Rasterize步骤（见后文）。


*5. Composite Layers*

>主线程里的这一步会计算出每个Graphics Layers的合成时所需要的data，包括位移（Translation）、缩放（Scale）、旋转（Rotation）、Alpha 混合等操作的参数，并把这些内容传给Compositor Thread，然后就是图中我们看到的第一个commit：Main Thread告诉Compositor Thread，我搞定了，你接手吧。然后主线程此时会去执行requestIdleCallback。这一步并没有真正对Graphics Layers完成位图的composite。


这几个步骤， 其中rAf回调函数每次都是发生在ui render之前执行的。ui render的执行是周期性的执行 一般是16.7ms 由浏览器来决定运行时机。也就是说当我们给元素style的属性中赋值的时候，多次重复的是不会让ui反复进行变化的，因为都是等一个帧之后在进行渲染（你在这个帧内反复操作的多次，也只会绘制他们合成之后的值的结果）。


## Force Layout
**但是上述也有不准确的地方**

>也就是说当我们给元素style的属性中赋值的时候，多次重复的是不会让ui反复进行变化的，因为都是等一个帧之后在进行渲染

**没有考虑到强制重排 Force Layout**

首先如果你在修改一个元素的css样式的时候，比方说高度，宽度，等能够触发Layout的一些属性。main thread会首先，将其标记为dirty。

当你依然在这个frame内（当前帧），又访问了该dom的一些方法。

eg:

```javascript
    var dom = document.getElementById('test');

    dom.style.height = '200px'; // 假设原始高度是100px,我们这里修改成了200px

    console.log(dom.style.height);// 我们这里又去访问了这个属性

```

main thread为了返回给console.log(dom.style.height);正确的值，将会进行**Force Layout（强制重排）**，这样上面的那些计算步骤，Recalculate Style -> Layout -> Update Layer Tree -> Paint -> Composite Layers 等等流程又的执行一边。

所以为了避免上述的操作。导致main thread被大量的占用导致卡顿的发生，最好是将中间量都记录到一个变量内，仅仅在操作dom的时候进行最终赋值。


*如果标记了dirty之后，会触发重排的属性和方法如下:*

![force layout](https://github.com/skyujilong/notebook/blob/master/src/force_layout_method.png)



## TODO:
继续深入了解整个chrome

## 参考
[inside-browser](https://developers.google.com/web/updates/2018/09/inside-browser-part1)

[渲染树构建、布局及绘制](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/render-tree-construction?hl=zh-cn)

[无线性能优化：Composite](https://fed.taobao.org/blog/2016/04/26/performance-composite/)

[隐式提升Graphics Layer](https://www.smashingmagazine.com/2016/12/gpu-animation-doing-it-right/)

[css3 动画优化](http://blogs.adobe.com/webplatform/2014/03/18/css-animations-and-transitions-performance/)