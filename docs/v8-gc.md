# V8 GC

## 清除方案

### 计数引用清除

计算变量的引用次数，当引用次数为零的时候，释放该变量。

*缺点，在早期的ie浏览器中，该方案，在eg:dom这种循环引用的结构，会导致，无法正确的释放内存。也就是内存泄漏。*

### 标记清除（V8采用）

标记-清除算法由标记阶段和清除阶段构成。在标记阶段会把所有的活动对象都做上标记，然后在清除阶段会把没有标记的对象，也就是非活动对象回收。

*活动对象:能通过引用程序引用的对象就被称为活动对象。（可以直接或间接从全局变量空间中引出的对象）*

*非活动对象:不能通过程序引用的对象呗称为非活动对象。（这就是被清除的目标）*

**过程**

算法执行的时候，需要进行标记存活的变量，清算阶段，需要遍历整个堆栈，查找未标记的变量，然后进行清除操作。


**缺点**
1. 效率不高，需要遍历整个堆栈。
2. 清理出来的内存不够连续。


## 垃圾收集过程

V8采用的是标记清除算法，但是又有所区别。

### Generational layout（代）

v8将堆栈划分为不同的部分，称之为Generational（代）【划分为年轻代与老年代】，年轻代（young generation）划分为两个部分，一个nursery，另外一个是intermediate。

![v8 代](https://github.com/skyujilong/notebook/blob/master/src/generational-layer.svg)

每一次gc，先是在nursery中进行标记操作，如果这次gc中有存活的对象（eg:A），则将其(A对象)copy到intermediate中，当下一次gc的时候，intermediate中，对象依然是存活的（eg:A对象）,则将这个存活的对象copy到 Old Generation上。每次copy操作都是伴随着，修改指针的操作。

反复执行上述过程，就是v8的垃圾回收机制。

**代际假设**
>This basically states that most objects die young. In other words, most objects are allocated and then almost immediately become unreachable, from the perspective of the GC. This holds not only for V8 or JavaScript, but for most dynamic languages.

>这基本上表明大多数对象都死得很年轻。换句话说，从GC的角度来看，大多数对象已分配，然后几乎立即变得不可访问。这不仅适用于V8或JavaScript，而且适用于大多数动态语言。

依据代际假设，绝大部分对象都是很快创建分配空间后就死掉了（无用，应该被回收）。换句话说，大部分的对象，都是刚刚产生，就不需要被访问了。

而Generation，刚好完美的应对上述的环境，每次gc的时候都会在Young Generation，直接进行标记清除。而老的对象最终都会存在在Old Generation中，这样大部分的标记清除，都不会动之前已经标记好的持久化的对象，基本上每次进行标记清除的对象都是新产生的对象。无形中就提高了命中率。

### 半空间 semi-space

V8有两个垃圾回收器，Major GC（Full Mark-Compact） & Minor GC（Generation Mark-Compact），根据上面的代际假设，我们需要Young Generation的垃圾回收机制，因为大部分的对象都在Young Generation上进行分配，之后很快就死掉了。

V8这里采用了半空间的算法进行Young Generation上的垃圾。这意味着，总空间的一半总是空的，用来进行回收操作。

![v8 young generation](https://github.com/skyujilong/notebook/blob/master/src/v8-young-generation.svg)

在清理期间，初始的空堆栈称之为to-space，我们后边将会把from-space中的内容copy到to-space中（拷贝是有条件的，就是被标记的对象）。

对于清理，我们会维护一个根集（root set），该根集中有被标记对象copy前后对象的指针信息。这里使用[write barriers](https://www.memorymanagement.org/glossary/w.html#term-write-barrier)来维护一个数组的被标记对象的新老指针的关系。

与堆栈和全局变量结合使用时，我们知道年轻一代中的所有引用，而无需追溯整个老一代。

清理操作，将所有的被标记的对象，都copy到一个连续的内存块中。这样就能解决之前老的标记清楚算法的缺点之一，*清理出来的内存不够连续*。剩下未被标记的对象，都留在from-space中，等待整个from-space被清空。反复执行上述的过程。



### Orinoco 
TODO:// v8 垃圾回收的其他技术相关。 多线程并行相关。 这部分看看就行了。

## 参考

[v8 trash-talk](https://v8.dev/blog/trash-talk)

[谈谈 GC：新的 Orinoco 垃圾收集器](https://juejin.im/post/5cf8e191f265da1bbf690e0d)







