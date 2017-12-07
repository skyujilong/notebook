# redux 源码分析
## combineReducers
```javascript
// combineReducers({})
// reducers参数星星{key:function,key:function,..}
// 这个步骤，现去判断你的reducer是否是一个合格的reducer，判断方式为，直接调用你的reducer 传入参数
// 为undefined,{type:ActionTypes.INIT} 然后判断你的返回值是否是undefined，钥匙undefined则报错。

export default function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers)
  const finalReducers = {}
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i]

    if (process.env.NODE_ENV !== 'production') {
      if (typeof reducers[key] === 'undefined') {
        warning(`No reducer provided for key "${key}"`)
      }
    }

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key]
    }
  }
  const finalReducerKeys = Object.keys(finalReducers)

  let unexpectedKeyCache
  if (process.env.NODE_ENV !== 'production') {
    unexpectedKeyCache = {}
  }

  let shapeAssertionError
  try {
    assertReducerShape(finalReducers)
  } catch (e) {
    shapeAssertionError = e
  }

  return function combination(state = {}, action) {
    //...略
  }
}

```

```javascript
//闭包中返回的内容
//该函数，在调用的时候，会将所有的reducer调用一次,然后生成一个默认初始化的state
function combination(state = {}, action) {
    if (shapeAssertionError) {
      throw shapeAssertionError
    }

    if (process.env.NODE_ENV !== 'production') {
      const warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache)
      if (warningMessage) {
        warning(warningMessage)
      }
    }

    let hasChanged = false
    const nextState = {}
    //这里调用所有的reducer
    for (let i = 0; i < finalReducerKeys.length; i++) {
      //获取store对应的key值
      const key = finalReducerKeys[i]
      //获取对应的reducer -》 对应store key的处理function方法
      const reducer = finalReducers[key]
      //获取当前store 对应key 的value值
      const previousStateForKey = state[key]
      //这里 真正执行了reducer，注意传入的是之前的value值，与当前执行的action值
      // action中的type 会与reducer中的switch case语句进行匹配，没有命中的自然就是返回之前的默认的store值了。
      const nextStateForKey = reducer(previousStateForKey, action)
      if (typeof nextStateForKey === 'undefined') {
        const errorMessage = getUndefinedStateErrorMessage(key, action)
        throw new Error(errorMessage)
      }
      nextState[key] = nextStateForKey
      //判断是否发生了改变
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
    //这里返回的是整体的state值
    return hasChanged ? nextState : state
  }

```


## createStore
createStore 返回4个api
1. dispatch 派发action，调用reducer
2. subscribe 注册lintener
3. getState 获取state
4. replaceReducer 更新reducer，webpack 中的hot模式可以用。
5. observable 这个是啥玩意没用过，有感兴趣的去自行观看源码。

**subscribe**

```javascript
  //添加一个注册监听器，返沪值，是用来解除该监听器的。
  
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.')
    }

    if (isDispatching) {
      throw new Error(
        'You may not call store.subscribe() while the reducer is executing. ' +
        'If you would like to be notified after the store has been updated, subscribe from a ' +
        'component and invoke store.getState() in the callback to access the latest state. ' +
        'See http://redux.js.org/docs/api/Store.html#subscribe for more details.'
      )
    }

    let isSubscribed = true

    ensureCanMutateNextListeners()
    // 将listener注册到nextListeners nextListeners会在dispatch的时候进行调用。
    nextListeners.push(listener)

    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }

      if (isDispatching) {
        throw new Error(
          'You may not unsubscribe from a store listener while the reducer is executing. ' +
          'See http://redux.js.org/docs/api/Store.html#subscribe for more details.'
        )
      }

      isSubscribed = false

      ensureCanMutateNextListeners()
      const index = nextListeners.indexOf(listener)
      nextListeners.splice(index, 1)
    }
  }
```

**dispatch**

```javascript
  //发布action，调用reducer
  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error(
        'Actions must be plain objects. ' +
        'Use custom middleware for async actions.'
      )
    }

    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
        'Have you misspelled a constant?'
      )
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }

    try {
      isDispatching = true
      //调用reducer,获取当前的状态。 这里明显是可以多store的，但是在react应用中，推荐根节点一个
      //store，store中有对应combine的reducers。这里调用currentReducer，就是combine中的reducer返回的function。这样currentReducer其实是走了整个所有的reducer一遍。然后返回的state。
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }
    //调用 subscribe中注册的linstener
    const listeners = currentListeners = nextListeners
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }

    return action
  }

```

## createStore的扩展

**结论：** 整个流程是 通过applyMiddleware方法，给thunk组件注入store以及store相关的api，之后thunk函数通过在applyMiddleware方法中重写dispatch的方式，让产生的action可以为function，当判断是action后走thunk重写的dispatch，当判断是action是object的时候走原来的store的dispatch.

*在解决有异步请求的时候，官方给出的方案是采用applyMiddleware进行扩展，现在我们来看看该扩展是如何进行的。*



```javascript
// createStore.js

//注意第三个参数，第三个参数就是是否要进行扩展的一个方法
export default function createStore(reducer, preloadedState, enhancer) {
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }
    //在这里巧妙的将createStore方法传递给了 扩展方法，这样扩展方法就能拿到createStore方法以及
    //createStore方法返回的对象内容api。
    //enhancer 其实就是applyMiddleware方法
    return enhancer(createStore)(reducer, preloadedState)
  }
  //...后续内容省略
  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }
}

```

## applyMiddleware 

```javascript
//扩展方法， eg: midllewares是 thunk组件
//eg: applyMiddleware(ReduxThunk)  返回return 中的闭包

export default function applyMiddleware(...middlewares) {
    //这个 return 的闭包在createStore的第三个参数中，之后在createStore方法中被调用
    //return enhancer(createStore)(reducer, preloadedState)
    return (createStore) => (...args) => {
        //args 是reducer 与 preloadedState的数组，其中最后一个参数 preloadedState 是打算初始化的数据 eg: server端的渲染，就需要去初始化该对象。
        const store = createStore(...args)
        let dispatch = () => {
            throw new Error(
                `Dispatching while constructing your middleware is not allowed. ` +
                `Other middleware would not be applied to this dispatch.`
            )
        }
        let chain = []
        //获取关键的api getState与dispatch
        const middlewareAPI = {
            getState: store.getState,
            //dispatch 这里是 compose = 的dispatch 就是thunk中的最后return的方法
            dispatch: (...args) => dispatch(...args)
        }
        //给thunk组件传入 关键apimiddlewareAPI
        chain = middlewares.map(middleware => middleware(middlewareAPI))
        //替换dispatch方法，这里的dispatch 就是thunk中的 最后的return 的方法
        dispatch = compose(...chain)(store.dispatch)

        return {
            ...store,
            dispatch
        }
    }
}



```


## 官方ajax请求方案 thunk组件

```javascript
//调用方式
let store = createStore(rootReducer, applyMiddleware(ReduxThunk));
```

```javascript
function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => next => action => {
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgument);
    }

    return next(action);
  };
}

const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;
//返回的是 上面createThunkMiddleware执行后的闭包
export default thunk;

```
上述代码翻译如下：
```javascript
'use strict';

exports.__esModule = true;

function createThunkMiddleware(extraArgument) {
    // _ref中的内容是 上面createStore
    return function (_ref) {
        //获取 dispatch 与getState方法,这里的dispatch不是store的disptch
        //而是：(...args) => dispatch(...args) | function(args){return dispatch(args)}
        //dispatch 是 function(action){....}这个
        var dispatch = _ref.dispatch,
            getState = _ref.getState;
            //next为store.dispatch方法
        return function (next) {
            //这里return的方法为真正你用的加工过后的dispatch方法
            return function (action) {
                //当判断出来是function的时候，久奖dispatch传递过去
                if (typeof action === 'function') {
                    return action(dispatch, getState, extraArgument);
                }

                return next(action);
            };
        };
    };
}

var thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

exports['default'] = thunk;

```