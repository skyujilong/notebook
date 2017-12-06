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