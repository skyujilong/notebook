# React Fiber分析
React Fiber是react16的核心引擎。

## 解决问题
老版本的React引擎，从计算到渲染是一气呵成的，如果碰到大量的计算或者dom的更改，会导致页面的卡顿。

也就是说在16ms内计算没有完成，主线程得不到释放。后果大家都懂。卡就一个字。

为了解决如上的问题，React Fiber出现了。

## 优化

1. 在 UI 中，并非所有的更新都需要立即生效。实际上，这样做是浪费的，可能会造成掉帧从而影响用户体验。
1. 不同类型的更新有不同的优先级。一个动画更新相比于来自数据的更新通常需要更快地被执行。
1. 一个以“推”为基础的方案要求应用程序（你，工程师）来决定如何调度工作。而一个以“拉”为核心的方案允许框架（如：React）更智能，来为你做这些决定。

## React Fiber特点

1. 拆分成不同的单元
1. 任务能够暂停
1. 为不同的任务设置不同的优先级。
1. 重新使用之前完成的任务。
1. 如果不在需要则可以终止一个任务。

## 如何让人能够控制任务的优先级

all new api (requestAnimationFrame)[https://www.w3.org/TR/requestidlecallback/]

该方法能够在空闲时间执行你的函数

![requestAnimationFrame](https://github.com/skyujilong/notebook/blob/master/src/requestAnimationFrame.png)


## react 核心

state + props => react => UI

核心就是上面的这个，输入state props返回给你一个ui

Fiber在这个流程中干了什么事情？

就是在new State + props 进入state的时候，进行计算。计算两个树的区别，与不通。

那两颗树那？ 就是之前的React Element树与 新的计算后的React Element的树的区别，之后在标记区别，然后让react dom 进行操作更新。

React Element 

```javascript
{
    type: Compenent | string | Function,
    props: any,
    state: any,
    ...// 等等
}

```

## React Fiber的流程

### ReactDOM.render 第一次react渲染页面

legacyRenderSubtreeIntoContainer -> legacyCreateRootFromDOMContainer(获取root) -> ReactRoot.render -> updateContainer->updateContainerAtExpirationTime(首次初始化fiber)->scheduleRootUpdate(创建一个upader负载payload 以及next & newEffect)->fiber流程

### fiber流程

enqueueUpdate & scheduleWork(划分任务等级) -> requestWork -> performWork -> renderRoot(创建workInProcess Fiber)-> workLoop (开始工作循环递归) -> performUnitOfWork(计算当前的workInProgress fiber，备份current fiber（老的状态）) -> beginWork(根据workInProgress.tag走不同的逻辑) -> 子流程1 ->completeUnitOfWork -> completeWork(根据不同的tag执行不同的分支，看子流程2)->completeRoot->commitRoot(消费Effect进行Reactdom操作)

### 子流程1
子流程 以 tag 符合Compenent为例子

->updateClassComponent （没有current就创建，有进入更新环节，我们进入更新环节）-> updateClassInstance(比对props发现不同，调用shouldComponentUpdate函数，会调用callComponentWillReceiveProps生命周期函数， 标记Effect（要执行更新)) -> reconcileChildren(计算子元素的fiber，并标记) 上述过程反复递归执行。->reconcileChildFibers(子元素，标记Effect（要执行更新)，加入Effect队列中)

### 子流程2

子流程 tag HostComponent 为例子

->updateHostComponent(react-reconciler/src/ReactFiberCompleteWork.js 比对新老props进行更新操作,标记更新)->prepareUpdate(react-dom/src/client/ReactDOMHostConfig.js)->diffProperties(计算两颗树的不同，将不同的属性值计算的结果放入数组中返回，实际上是挂载在workInProgress.updateQueue上)->markUpdate(标记要更新)



## 结语


在上述Fiber的过程中，低优先级的操作可以被高优先级的操作打断，并让主线程执行高优先级的更新，以时用户可感知的响应更快。

但是重新执行的低优先级的任务，会从头开始，因此会导致生命周期函数会被执行复数次。

![生命周期函数](https://github.com/skyujilong/notebook/blob/master/src/reconciliation.png)

phase1 的流程的生命周期函数会被执行多次

## 参考
[React Fiber](https://juejin.im/post/5ab7b3a2f265da2378403e57#heading-7)

[Reconciliation](https://reactjs.org/docs/reconciliation.html)

[fiber-reconciler](https://reactjs.org/docs/codebase-overview.html#fiber-reconciler)

[requestidlecallback调度](https://www.w3.org/TR/requestidlecallback/)

[react-fiber](http://echizen.github.io/tech/2019/04-06-react-fiber)

[React Fiber](https://juejin.im/post/5ab7b3a2f265da2378403e57)
