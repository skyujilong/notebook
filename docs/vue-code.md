# vue 源码分析
## vue 数据更新流程
![vue数据流程图](https://github.com/skyujilong/notebook/blob/master/src/vue-data.png)

## 核心
1. Object.defineProperty方法 劫持set与get方法（get方法 给dep添加watcher，set方法执行dep队列的sub中watcher的update方法）
1. Watcher 对象，负责收集依赖， 然后最后调用updateComponent-> vm._update更新dom操作
1. Dep 对象。收集 Watcher对象。

## new Vue发生的事情

### src/platforms/web/runtime/index.js 入口文件
1. 添加指令系统
1. 引入Vue，并给Vue添加$mount方法 注意这个$mount与Vue的更新操作有关系。

```javascript
import Vue from 'core/index'
// install platform runtime directives & components
extend(Vue.options.directives, platformDirectives)
extend(Vue.options.components, platformComponents)

// public mount method 注意这个$mount方法这里 定义了  每个vm对象的watcher对象
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}
```

### src/core/instance/index.js Vue的实现类

```javascript
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

initMixin(Vue)//初始化$options等，重点，这里初步的将Vue的props&data进行了代理劫持
stateMixin(Vue)
//挂载 发布订阅模式
eventsMixin(Vue)
lifecycleMixin(Vue)//挂载_update & $forceUpdate 方法
renderMixin(Vue)// 挂载_render方法 $nextTick方法

export default Vue
```

### src/core/instance/init.js 初始化
```javascript
export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // expose real self
    vm._self = vm
    initLifecycle(vm)//初始化生命周期 相关属性
    initEvents(vm)//将父Component上的listener注入到当前的子元素上。
    initRender(vm)// 注册vnode 的创建方法
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    initState(vm) //重点，进行state的劫持操作
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }

    if (vm.$options.el) {
        // 这里的$mount 就是 mountComponent 方法的执行，将watcher挂载到vm对象上，每次更新视图都是走的watcher更新
      vm.$mount(vm.$options.el) // 进行挂载操作
    }
  }
}


```


### src/core/instance/state.js initState相关，将进行劫持state & props的set & get操作

主要用来劫持 state & props的 set 与 get操作。
state 映射为 vm._data ， props 映射为 vm._props

```javascript
export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props) // 初始化_props进行劫持
  if (opts.methods) initMethods(vm, opts.methods) // 将methods中的方法 添加到Vm.prototype上
  if (opts.data) {
    initData(vm) // 初始化_data进行劫持
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch) //如果有watch的配制，new Watcher。
  }
}
```

看一下 initData方法

```javascript
function initData (vm: Component) {
  let data = vm.$options.data
  // 初始化的时候 有data是 ()=any; 需要执行一下
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
  // proxy data on instance
  const keys = Object.keys(data)//拿到 data对象的keys 数组
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  while (i--) {
    const key = keys[i]
    // 语法糖， 将key都代理到vm实例上，实际上你访问 vm._a翻译过来应该是vm._data._a这个属性
    proxy(vm, `_data`, key)
  }
  // observe data
  observe(data, true /* asRootData */)//初始化观测者，这里就是去劫持data对象了
}

```

看一下 observe 具体的执行

```javascript
export function observe (value: any, asRootData: ?boolean): Observer | void {
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  // 判断是否已经检测过了，检测过就返回__ob__ 没有就去new 观测者
  let ob: Observer | void
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    shouldObserve &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    // new 观测者
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}

```

### src/core/observer/index.js 观测者
观测者类
```javascript
class Observer {
  value: any;// 观测的值
  dep: Dep;//重点
  vmCount: number; // number of vms that have this object as root $data
  constructor (value: any) {
    
  }
  // 劫持观测obj的各种属性
  walk (obj: Object) {
    
  }

  // 劫持观测数组对象
  observeArray (items: Array<any>) {
    
  }
}

```

constructor

```javascript
  constructor (value: any) {
    this.value = value//将对象属性持有到当前的实例的value上
    this.dep = new Dep()// 当前的观察者 持有dep
    this.vmCount = 0
    // 给 data属性添加__ob__属性，并将该属性赋值给当前的Observe对象！！！
    def(value, '__ob__', this)// 将__ob__挂载到当前要 观测的数据上
    if (Array.isArray(value)) {
      if (hasProto) {
        protoAugment(value, arrayMethods)
      } else {
        copyAugment(value, arrayMethods, arrayKeys)
      }
      this.observeArray(value)
    } else {
      // 对象上的属性都进行 set get劫持
      this.walk(value)
    }
  }

```

walk 

```javascript
  walk (obj: Object) {
      // 循环当前对象的所有属性
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
        // 进行劫持 给每个属性的劫持
      defineReactive(obj, keys[i])
    }
  }

```

defineReactive

注意这里的 set & get方法， 他们都有一个闭包的的环境，都会始终持有 这里new Dep对象。



```javascript
export function defineReactive (
  obj: Object, // vm | 被观测的数据
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  const dep = new Dep() // 发布订阅器

  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters

  //存储原始的set 与 get方法
  const getter = property && property.get// 保存原来的set get方法
  const setter = property && property.set
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }

  let childOb = !shallow && observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        // 收集 dep注册watcher
        dep.depend()
        if (childOb) {
          //触发子元素 的dep收集 一个watcher对应多个 dep实例
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      // 如果新值旧值都一样，则不执行下面的内容
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      // #7981: for accessor properties without setter
      if (getter && !setter) return
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = !shallow && observe(newVal)
      dep.notify() // watcher的消耗更新操作 
    }
  })
}

```

### src/core/observer/dep.js 查看一下dep的内容
```javascript
/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'
import config from '../config'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
  }

  addSub (sub: Watcher) {
    // 入栈watcher对象， 等待flush
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }
  // depend方法， 注意之前 的get劫持，调用了depend方法， 
  // 该方法实际上，通过watcher.addDep方法 ， 将Dep.target(watcher对象) 注入到 this.subs队列中
  depend () {
    if (Dep.target) {
      // 这里将watcher 注入到 当前的this.subs队列中
      // watcher会持有Dep对象，因此在发现Dep的id已经存在的情况下，不再进行添加上述的队列
      // Dep对象也会持久化在newDeps 队列中
      Dep.target.addDep(this)
    }
  }

  notify () {
    // flush操作，将watcher都执行更新操作 watcher连接着vm的_update方法
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    if (process.env.NODE_ENV !== 'production' && !config.async) {
      // subs aren't sorted in scheduler if not running async
      // we need to sort them now to make sure they fire in correct
      // order
      subs.sort((a, b) => a.id - b.id)
    }
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update() // watcher进行更新操作
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null
const targetStack = []
// 注入watcher到Dep中
export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}

export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}

```

### src/core/observer/watcher.js Watcher对象

保留部分核心代码

```javascript
/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
export default class Watcher {
  vm: Component;
  expression: string;
  cb: Function;
  id: number;
  deep: boolean;
  user: boolean;
  lazy: boolean;
  sync: boolean;
  dirty: boolean;
  active: boolean;
  deps: Array<Dep>;
  newDeps: Array<Dep>;
  depIds: SimpleSet;
  newDepIds: SimpleSet;
  before: ?Function;
  getter: Function;
  value: any;

  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean
  ) {
    this.vm = vm
    if (isRenderWatcher) {
      vm._watcher = this
    }
    vm._watchers.push(this)
    // options
    if (options) {
      this.deep = !!options.deep
      this.user = !!options.user
      this.lazy = !!options.lazy
      this.sync = !!options.sync
      this.before = options.before
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    this.cb = cb
    this.id = ++uid // uid for batching
    this.active = true
    this.dirty = this.lazy // for lazy watchers
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
    this.expression = process.env.NODE_ENV !== 'production'
      ? expOrFn.toString()
      : ''
    // parse expression for getter
    if (typeof expOrFn === 'function') {
        // 注意这里 expOrFn 其实是一个更新 vue视图的方法， 在mountComponent的时候，会注册updateComponent方法， 这里进行视图更新
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
      if (!this.getter) {
        this.getter = noop
      }
    }
    this.value = this.lazy
      ? undefined
      : this.get()
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  get () {
    pushTarget(this)
    let value
    const vm = this.vm
    try {
        // 执行更新操作, 这里执行的是vue.$mount 上的updateComponent操作
        // 这个value值，其实是变化后的值，但是我没看出来具体是怎么取到的这个值。。。 好蛋疼啊
      value = this.getter.call(vm, vm)
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      if (this.deep) {
        traverse(value)
      }
      // 执行结束 退出当前的watcher
      popTarget()
      this.cleanupDeps()
    }
    return value
  }

  /**
   * Add a dependency to this directive.
   */
  addDep (dep: Dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      // 防止反复添加多次重复的 watcher
      if (!this.depIds.has(id)) {
        //将当前的watcher 添加到 dep.subs 队列中去
        dep.addSub(this)
      }
    }
  }

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
   // 这里 在dep.subs的队列中被执行，进行更新方法
  update () {
    /* istanbul ignore else */
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      queueWatcher(this)
    }
  }

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  run () {
    if (this.active) {
        // get方法中将将调用updateComponent方法更新 dom 计算vdom
      const value = this.get()
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        const oldValue = this.value
        this.value = value
        // 值不同，调用watcher 初始化的cb函数，将vm 以及 新老值传递回去
        if (this.user) {
          try {
            this.cb.call(this.vm, value, oldValue)
          } catch (e) {
            handleError(e, this.vm, `callback for watcher "${this.expression}"`)
          }
        } else {
          this.cb.call(this.vm, value, oldValue)
        }
      }
    }
  }



}


```

### mountComponent 让我们回到开篇的$mount 中的mountComponent方法

```javascript
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el
  callHook(vm, 'beforeMount')

  let updateComponent
    // 这个定一的updateComponent方法 就是执行vdom比对然后更新视图的方法
  updateComponent = () => {
    vm._update(vm._render(), hydrating)
  }

  // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined
  // 初始化每个vm的watcher对象监听视图的更新
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
  hydrating = false

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}

```

## new Vue总结
 核心 Observer 进行对象的set + get方法劫持，get方法,将每个vm的watcher对象注入到dep的subs队列中

 set方法，进行消费subs队列中的watcher， 

 watcher则进行更新视图的操作