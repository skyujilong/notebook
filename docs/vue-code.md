# vue 源码分析
## vue 数据更新流程
![vue数据流程图](https://github.com/skyujilong/notebook/blob/mastersrc/vue-data.png)

## 核心
1. Object.defineProperty方法 劫持set与get方法（get方法 给dep添加watcher，set方法执行dep队列的sub中watcher的update方法）
1. Watcher 对象，负责收集依赖， 然后最后调用updateComponent-> vm._update更新dom操作
1. Dep 对象。收集 Watcher对象。

## new Vue发生的事情

//TODO: 明天分析这里的核心代码