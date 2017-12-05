# react-redux 框架源码分析

*主要是采用了react的高阶组件的方案，去给react的类库添加store属性,mapDispatchToProps & mapStateToProps方法*

## Provider 组件
一个react的高阶组件，原理是将store注入到这个注册的高阶组件的属性上。
```javascript
//核心代码如下：
export function createProvider(storeKey = 'store', subKey) {
    const subscriptionKey = subKey || `${storeKey}Subscription`

    class Provider extends Component {
        getChildContext() {
          return { [storeKey]: this[storeKey], [subscriptionKey]: null }
        }

        constructor(props, context) {
          super(props, context)
          this[storeKey] = props.store;
        }

        render() {
          return Children.only(this.props.children)
        }
    }

    if (process.env.NODE_ENV !== 'production') {
      Provider.prototype.componentWillReceiveProps = function (nextProps) {
        if (this[storeKey] !== nextProps.store) {
          warnAboutReceivingStore()
        }
      }
    }

    Provider.propTypes = {
        store: storeShape.isRequired,
        children: PropTypes.element.isRequired,
    }
    Provider.childContextTypes = {
        [storeKey]: storeShape.isRequired,
        [subscriptionKey]: subscriptionShape,
    }

    return Provider
}

export default createProvider()
```

## connect方法
```javascript
    // createConnect with default args builds the 'official' connect behavior. Calling it with
    // different options opens up some testing and extensibility scenarios
    export function createConnect({
        connectHOC = connectAdvanced,
        mapStateToPropsFactories = defaultMapStateToPropsFactories,
        mapDispatchToPropsFactories = defaultMapDispatchToPropsFactories,
        mergePropsFactories = defaultMergePropsFactories,
        selectorFactory = defaultSelectorFactory
    } = {}) {
        //这里是闭包
        //参数均为用户传递进来的参数
        return function connect(
            mapStateToProps, 
            mapDispatchToProps
            mergeProps, {
                pure = true,
                areStatesEqual = strictEqual,
                areOwnPropsEqual = shallowEqual,
                areStatePropsEqual = shallowEqual,
                areMergedPropsEqual = shallowEqual,
                ...extraOptions
            } = {}
        ) {
            //初始化 你传入的 参数
            const initMapStateToProps = match(mapStateToProps, mapStateToPropsFactories, 'mapStateToProps')
            const initMapDispatchToProps = match(mapDispatchToProps, mapDispatchToPropsFactories, 'mapDispatchToProps')
            const initMergeProps = match(mergeProps, mergePropsFactories, 'mergeProps')
            // 这里又来一个闭包！
            return connectHOC(selectorFactory, {
                // used in error messages
                methodName: 'connect',

                // used to compute Connect's displayName from the wrapped component's displayName.
                getDisplayName: name => `Connect(${name})`,

                // if mapStateToProps is falsy, the Connect component doesn't subscribe to store state changes
                shouldHandleStateChanges: Boolean(mapStateToProps),

                // passed through to selectorFactory
                initMapStateToProps,
                initMapDispatchToProps,
                initMergeProps,
                pure,
                areStatesEqual,
                areOwnPropsEqual,
                areStatePropsEqual,
                areMergedPropsEqual,

                // any extra options args can override defaults of connect or connectAdvanced
                ...extraOptions
            })
        }
    }
    //返回的是一个闭包
    export default createConnect();

    //match方法
    //arg参数为你传递进来的 mapStateToProps mapDispatchToProps mergeProps
    function match(arg, factories, name) {
        for (let i = factories.length - 1; i >= 0; i--) {
            //这里执行方法，做的两件事情
            //1.验证传递参数是否正确
            //2.封装传递的参数到具体的方法
            const result = factories[i](arg)
            if (result) return result
        }

        return (dispatch, options) => {
            throw new Error(`Invalid value of type ${typeof arg} for ${name} argument when connecting component ${options.wrappedComponentName}.`)
        }
    }

```

## connect方法中match调用的其中一个方法解析 whenMapStateToPropsIsFunction方法

```javascript
    //wrapMapToPropsFunc(mapStateToProps, 'mapStateToProps')
    //又是闭包。
    //一般情况下mapToProps我们都是function对象
    export function wrapMapToPropsFunc(mapToProps, methodName) {
        //返回这个闭包
        //在selectfactory中调用const mapStateToProps = initMapStateToProps(dispatch, options)
        return function initProxySelector(dispatch, {
            displayName
        }) {
            const proxy = function mapToPropsProxy(stateOrDispatch, ownProps) {
                return proxy.dependsOnOwnProps ?
                    proxy.mapToProps(stateOrDispatch, ownProps) :
                    proxy.mapToProps(stateOrDispatch)
            }

            // allow detectFactoryAndVerify to get ownProps
            proxy.dependsOnOwnProps = true

            proxy.mapToProps = function detectFactoryAndVerify(stateOrDispatch, ownProps) {
                proxy.mapToProps = mapToProps
                proxy.dependsOnOwnProps = getDependsOnOwnProps(mapToProps)
                let props = proxy(stateOrDispatch, ownProps)

                if (typeof props === 'function') {
                    proxy.mapToProps = props
                    proxy.dependsOnOwnProps = getDependsOnOwnProps(props)
                    props = proxy(stateOrDispatch, ownProps)
                }

                if (process.env.NODE_ENV !== 'production')
                    verifyPlainObject(props, displayName, methodName)

                return props
            }

            return proxy
        }
    }
```

## selectorFactory的初始化

```javascript
//将dispatch注入到这个方法中
export default function finalPropsSelectorFactory(dispatch, {
    initMapStateToProps,
    initMapDispatchToProps,
    initMergeProps,
    ...options
}) {    
    //初始化相关参数
    //const sourceSelector = selectorFactory(this.store.dispatch, selectorFactoryOptions) 其中selectorFactory 就是 finalPropsSelectorFactory 方法。

    const mapStateToProps = initMapStateToProps(dispatch, options)
    const mapDispatchToProps = initMapDispatchToProps(dispatch, options)
    const mergeProps = initMergeProps(dispatch, options)

    if (process.env.NODE_ENV !== 'production') {
        verifySubselectors(mapStateToProps, mapDispatchToProps, mergeProps, options.displayName)
    }
    //这里发现一般情况下pure为true，在connect中的初始化参数传递过来的
    const selectorFactory = options.pure ?
        pureFinalPropsSelectorFactory :
        impureFinalPropsSelectorFactory
    //调用 pureFinalPropsSelectorFactory 方法 如下：
    return selectorFactory(
        mapStateToProps,
        mapDispatchToProps,
        mergeProps,
        dispatch,
        options
    )
}

```

## selectorFactory 中的  pureFinalPropsSelectorFactory 方法

```javascript

export function pureFinalPropsSelectorFactory(
    mapStateToProps,// 调用initMapStateToProps方法后返回的proxy对象
    mapDispatchToProps,
    mergeProps,
    dispatch, {
        areStatesEqual,
        areOwnPropsEqual,
        areStatePropsEqual
    }
) {
    let hasRunAtLeastOnce = false
    let state
    let ownProps
    let stateProps
    let dispatchProps
    let mergedProps

    function handleFirstCall(firstState, firstOwnProps) {
        state = firstState
        ownProps = firstOwnProps
        stateProps = mapStateToProps(state, ownProps)
        dispatchProps = mapDispatchToProps(dispatch, ownProps)
        mergedProps = mergeProps(stateProps, dispatchProps, ownProps)
        hasRunAtLeastOnce = true
        return mergedProps
    }

    function handleNewPropsAndNewState() {
        stateProps = mapStateToProps(state, ownProps)

        if (mapDispatchToProps.dependsOnOwnProps)
            dispatchProps = mapDispatchToProps(dispatch, ownProps)

        mergedProps = mergeProps(stateProps, dispatchProps, ownProps)
        return mergedProps
    }

    function handleNewProps() {
        if (mapStateToProps.dependsOnOwnProps)
            stateProps = mapStateToProps(state, ownProps)

        if (mapDispatchToProps.dependsOnOwnProps)
            dispatchProps = mapDispatchToProps(dispatch, ownProps)

        mergedProps = mergeProps(stateProps, dispatchProps, ownProps)
        return mergedProps
    }

    function handleNewState() {
        const nextStateProps = mapStateToProps(state, ownProps)
        const statePropsChanged = !areStatePropsEqual(nextStateProps, stateProps)
        stateProps = nextStateProps

        if (statePropsChanged)
            mergedProps = mergeProps(stateProps, dispatchProps, ownProps)

        return mergedProps
    }

    function handleSubsequentCalls(nextState, nextOwnProps) {
        const propsChanged = !areOwnPropsEqual(nextOwnProps, ownProps)
        const stateChanged = !areStatesEqual(nextState, state)
        state = nextState
        ownProps = nextOwnProps

        if (propsChanged && stateChanged) return handleNewPropsAndNewState()
        if (propsChanged) return handleNewProps()
        if (stateChanged) return handleNewState()
        return mergedProps
    }
    //返回一个闭包 这个闭包的方法是用来比对更新的props和state的对象的
    //在最后这个闭包的运行结果中，返回的是nextProps， 调用是在connectAdvanced中的makeSelectorStateful方法。期间调用了mergeProps中的闭包方法。
    return function pureFinalPropsSelector(nextState, nextOwnProps) {
        return hasRunAtLeastOnce ?
            handleSubsequentCalls(nextState, nextOwnProps) :
            handleFirstCall(nextState, nextOwnProps)
    }
}

```


## connectHOC 

*content实际上是包装的connectHOC,connectHOC本质上是一个react的高阶组件。这里主要处理的是将props中的初始化对象注入到这个高阶组件上。*

```javascript
    export default function connectAdvanced(
        /*
          selectorFactory is a func that is responsible for returning the selector function used to
          compute new props from state, props, and dispatch. For example:

            export default connectAdvanced((dispatch, options) => (state, props) => ({
              thing: state.things[props.thingId],
              saveThing: fields => dispatch(actionCreators.saveThing(props.thingId, fields)),
            }))(YourComponent)

          Access to dispatch is provided to the factory so selectorFactories can bind actionCreators
          outside of their selector as an optimization. Options passed to connectAdvanced are passed to
          the selectorFactory, along with displayName and WrappedComponent, as the second argument.

          Note that selectorFactory is responsible for all caching/memoization of inbound and outbound
          props. Do not use connectAdvanced directly without memoizing results between calls to your
          selector, otherwise the Connect component will re-render on every state or props change.
        */
        selectorFactory,
        // options object:
        {
            // the func used to compute this HOC's displayName from the wrapped component's displayName.
            // probably overridden by wrapper functions such as connect()
            getDisplayName = name => `ConnectAdvanced(${name})`,

            // shown in error messages
            // probably overridden by wrapper functions such as connect()
            methodName = 'connectAdvanced',

            // if defined, the name of the property passed to the wrapped element indicating the number of
            // calls to render. useful for watching in react devtools for unnecessary re-renders.
            renderCountProp = undefined,

            // determines whether this HOC subscribes to store changes
            shouldHandleStateChanges = true,

            // the key of props/context to get the store
            storeKey = 'store',

            // if true, the wrapped element is exposed by this HOC via the getWrappedInstance() function.
            withRef = false,

            // additional options are passed through to the selectorFactory
            ...connectOptions
        } = {}
    ) {
        const subscriptionKey = storeKey + 'Subscription'
        const version = hotReloadingVersion++

            const contextTypes = {
                [storeKey]: storeShape,
                [subscriptionKey]: subscriptionShape,
            }
        const childContextTypes = {
            [subscriptionKey]: subscriptionShape,
        }
        //依然是一个闭包，其中这个wrappedComponent就是咱们传入connect(args...)(arg1)的arg1，是一个react对象
        return function wrapWithConnect(WrappedComponent) {
            invariant(
                typeof WrappedComponent == 'function',
                `You must pass a component to the function returned by ` +
                `connect. Instead received ${JSON.stringify(WrappedComponent)}`
            )

            const wrappedComponentName = WrappedComponent.displayName ||
                WrappedComponent.name ||
                'Component'

            const displayName = getDisplayName(wrappedComponentName)

            const selectorFactoryOptions = {
                ...connectOptions,
                getDisplayName,
                methodName,
                renderCountProp,
                shouldHandleStateChanges,
                storeKey,
                withRef,
                displayName,
                wrappedComponentName,
                WrappedComponent
            }
            //实际包裹的 react对象
            class Connect extends Component {
                constructor(props, context) {
                    super(props, context)

                    this.version = version
                    this.state = {}
                    this.renderCount = 0
                    this.store = props[storeKey] || context[storeKey]
                    this.propsMode = Boolean(props[storeKey])
                    this.setWrappedInstance = this.setWrappedInstance.bind(this)

                    invariant(this.store,
                        `Could not find "${storeKey}" in either the context or props of ` +
                        `"${displayName}". Either wrap the root component in a <Provider>, ` +
                        `or explicitly pass "${storeKey}" as a prop to "${displayName}".`
                    )
                    //初始化selectorFactory
                    this.initSelector()
                    this.initSubscription()
                }

                getChildContext() {
                    // If this component received store from props, its subscription should be transparent
                    // to any descendants receiving store+subscription from context; it passes along
                    // subscription passed to it. Otherwise, it shadows the parent subscription, which allows
                    // Connect to control ordering of notifications to flow top-down.
                    const subscription = this.propsMode ? null : this.subscription
                    return {
                        [subscriptionKey]: subscription || this.context[subscriptionKey]
                    }
                }

                componentDidMount() {
                    if (!shouldHandleStateChanges) return

                    // componentWillMount fires during server side rendering, but componentDidMount and
                    // componentWillUnmount do not. Because of this, trySubscribe happens during ...didMount.
                    // Otherwise, unsubscription would never take place during SSR, causing a memory leak.
                    // To handle the case where a child component may have triggered a state change by
                    // dispatching an action in its componentWillMount, we have to re-run the select and maybe
                    // re-render.
                    this.subscription.trySubscribe()
                    this.selector.run(this.props)
                    if (this.selector.shouldComponentUpdate) this.forceUpdate()
                }

                componentWillReceiveProps(nextProps) {
                    //在接受到新的props的时候，去进行一次run 方法比对props是否发生了变更
                    this.selector.run(nextProps)
                }

                shouldComponentUpdate() {
                    //这个方法是react组件的方法，在发现props变动的时候会调用这个方法，这里会进行判断selector是否发生了更新。
                    return this.selector.shouldComponentUpdate
                }

                componentWillUnmount() {
                    if (this.subscription) this.subscription.tryUnsubscribe()
                    this.subscription = null
                    this.notifyNestedSubs = noop
                    this.store = null
                    this.selector.run = noop
                    this.selector.shouldComponentUpdate = false
                }

                getWrappedInstance() {
                    invariant(withRef,
                        `To access the wrapped instance, you need to specify ` +
                        `{ withRef: true } in the options argument of the ${methodName}() call.`
                    )
                    return this.wrappedInstance
                }

                setWrappedInstance(ref) {
                    this.wrappedInstance = ref
                }

                initSelector() {
                    /*
                        const selectorFactoryOptions = {
                            ...connectOptions,
                            getDisplayName,
                            methodName,
                            renderCountProp,
                            shouldHandleStateChanges,
                            storeKey,
                            withRef,
                            displayName,
                            wrappedComponentName,
                            WrappedComponent
                            }
                    */
                    const sourceSelector = selectorFactory(this.store.dispatch, selectorFactoryOptions)
                    //返回selector 对象。
                    this.selector = makeSelectorStateful(sourceSelector, this.store)
                    this.selector.run(this.props)
                    //selector对象中包含一个run方法，能够比对props
                }

                initSubscription() {
                    if (!shouldHandleStateChanges) return

                    // parentSub's source should match where store came from: props vs. context. A component
                    // connected to the store via props shouldn't use subscription from context, or vice versa.
                    const parentSub = (this.propsMode ? this.props : this.context)[subscriptionKey]
                    this.subscription = new Subscription(this.store, parentSub, this.onStateChange.bind(this))

                    // `notifyNestedSubs` is duplicated to handle the case where the component is  unmounted in
                    // the middle of the notification loop, where `this.subscription` will then be null. An
                    // extra null check every change can be avoided by copying the method onto `this` and then
                    // replacing it with a no-op on unmount. This can probably be avoided if Subscription's
                    // listeners logic is changed to not call listeners that have been unsubscribed in the
                    // middle of the notification loop.
                    this.notifyNestedSubs = this.subscription.notifyNestedSubs.bind(this.subscription)
                }

                onStateChange() {
                    this.selector.run(this.props)

                    if (!this.selector.shouldComponentUpdate) {
                        this.notifyNestedSubs()
                    } else {
                        this.componentDidUpdate = this.notifyNestedSubsOnComponentDidUpdate
                        this.setState(dummyState)
                    }
                }

                notifyNestedSubsOnComponentDidUpdate() {
                    // `componentDidUpdate` is conditionally implemented when `onStateChange` determines it
                    // needs to notify nested subs. Once called, it unimplements itself until further state
                    // changes occur. Doing it this way vs having a permanent `componentDidUpdate` that does
                    // a boolean check every time avoids an extra method call most of the time, resulting
                    // in some perf boost.
                    this.componentDidUpdate = undefined
                    this.notifyNestedSubs()
                }

                isSubscribed() {
                    return Boolean(this.subscription) && this.subscription.isSubscribed()
                }

                addExtraProps(props) {
                    if (!withRef && !renderCountProp && !(this.propsMode && this.subscription)) return props
                    // make a shallow copy so that fields added don't leak to the original selector.
                    // this is especially important for 'ref' since that's a reference back to the component
                    // instance. a singleton memoized selector would then be holding a reference to the
                    // instance, preventing the instance from being garbage collected, and that would be bad
                    const withExtras = { ...props
                    }
                    if (withRef) withExtras.ref = this.setWrappedInstance
                    if (renderCountProp) withExtras[renderCountProp] = this.renderCount++
                        if (this.propsMode && this.subscription) withExtras[subscriptionKey] = this.subscription
                    return withExtras
                }

                render() {
                    const selector = this.selector
                    selector.shouldComponentUpdate = false

                    if (selector.error) {
                        throw selector.error
                    } else {
                        return createElement(WrappedComponent, this.addExtraProps(selector.props))
                    }
                }
            }

            Connect.WrappedComponent = WrappedComponent
            Connect.displayName = displayName
            Connect.childContextTypes = childContextTypes
            Connect.contextTypes = contextTypes
            Connect.propTypes = contextTypes

            if (process.env.NODE_ENV !== 'production') {
                Connect.prototype.componentWillUpdate = function componentWillUpdate() {
                    // We are hot reloading!
                    if (this.version !== version) {
                        this.version = version
                        this.initSelector()

                        // If any connected descendants don't hot reload (and resubscribe in the process), their
                        // listeners will be lost when we unsubscribe. Unfortunately, by copying over all
                        // listeners, this does mean that the old versions of connected descendants will still be
                        // notified of state changes; however, their onStateChange function is a no-op so this
                        // isn't a huge deal.
                        let oldListeners = [];

                        if (this.subscription) {
                            oldListeners = this.subscription.listeners.get()
                            this.subscription.tryUnsubscribe()
                        }
                        this.initSubscription()
                        if (shouldHandleStateChanges) {
                            this.subscription.trySubscribe()
                            oldListeners.forEach(listener => this.subscription.listeners.subscribe(listener))
                        }
                    }
                }
            }

            return hoistStatics(Connect, WrappedComponent)
        }
    }
```