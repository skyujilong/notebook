# 实现一个promise
## 要点

状态

1. pendding 执行中
2. fulfilled 成功
3. reject 失败

**状态的迁移，只能单向的pending -> fulfilled 或者 pending -> rejected**

then方法返回一个new Promise对象。

如何自动进行执行.then方法后续的所有方法。

**采用队列（FIFO），缓存then方法注入的方法，resolve的时候，进行队列的出栈操作。**

```javascript
        function Promise1(cb) {
            var _self = this;
            this.state = 'pendding';
            this.promiseValue = '';
            this.rejectQueue = [];
            this.fulfilledQueue = [];

            function reject(err) {
                _self.state = 'reject';
                _self.promiseValue = err;

                //出站操作
                function run() {
                    if (_self.rejectQueue.length > 0) {
                        // cb 就是 then方法中注册的 函数或者其他值
                        var cb = _self.rejectQueue.splice(0, 1)[0];
                        cb(err);
                    }
                }
                // 为了支持同步的Promise，这里采用异步调用
                setTimeout(run, 0);
            }
            //val会出现promise的情况 
            function resolve(val) {
                _self.state = 'fulfilled';
                _self.promiseValue = val;
                //出站操作
                function run() {

                    const runFulfilled = (value) => {
                        let cb;
                        while (cb = _self.fulfilledQueue.shift()) {
                            cb(value)
                        }
                    }
                    // 依次执行失败队列中的函数，并清空队列
                    const runRejected = (error) => {
                        let cb;
                        while (cb = _self.rejectQueue.shift()) {
                            cb(error)
                        }
                    }
                    // 处理是promise的情况。 就是将promise.then进行消化。拿到最后的值，在去执行cb
                    if (val instanceof Promise1) {
                        val.then(value => {
                            _self._value = value
                            _self._status = 'fulfilled'
                            runFulfilled(value)
                        }, err => {
                            _self._value = err
                            _self._status = 'reject'
                            runRejected(err)
                        })
                    } else {
                        _self._value = val
                        _self._status = 'fulfilled'
                        runFulfilled(val)
                    }


                }
                // 为了支持同步的Promise，这里采用异步调用
                setTimeout(run, 0);
            }
            cb(resolve, reject);
        }
        Promise1.prototype.then = function (resolveNext, rejectNext) {
            var _self = this;
            var nextPromise1 = new Promise1((resolve, reject) => {

                function _fulfilled(val) {
                    try {
                        if (_self.state === 'fulfilled') {
                            if (Object.prototype.toString.call(resolveNext) === '[object Function]') {
                                //当then(()=>{},()=>{}) 时，返回参数中的函数运行的值
                                resolve(resolveNext(val));
                            } else if (resolveNext instanceof Promise1) {
                                //当then(Promise1)的时候
                                resolveNext.then(() => {
                                    resolve(val);
                                }, reject);
                            } else {
                                //普通值 直接穿透 不理会普通的值
                                resolve(val);
                            }
                        }
                    } catch (error) {
                        reject();
                    }
                }

                function _reject(err) {
                    try {
                        if (Object.prototype.toString.call(rejectNext) === '[object Function]') {
                            reject(rejectNext(err))
                        } else if (rejectNext instanceof Promise1) {
                            //当then(Promise1,Promise1)的时候
                            rejectNext.then(() => {}, reject);
                        } else {
                            reject(err);
                        }
                    } catch (error) {
                        reject(error);
                    }
                }

                if (_self.state === 'fulfilled') {
                    //成功
                    _fulfilled(_self.promiseValue); //将上一次的promise中的值传递给下一个promise使用
                } else if (_self.state === 'reject') {
                    //失败
                    _reject(_self.promiseValue); // 将错误传递
                } else if (_self.state === 'pendding') {
                    //执行中 入栈操作
                    _self.fulfilledQueue.push(_fulfilled);
                    _self.rejectQueue.push(_reject);
                }
            });




            return nextPromise1;
        }

        //all 方法 所有promise执行完毕，在确定reject并更改状态。 有错误立即更改错误状态
        Promise1.all = function (list) {
            var count = 0;
            var _list = [];
            return new Promise1((reject, resolve) => {
                for (var i = 0; i < list.length; i++) {
                    ((index) => {
                        list[index].then((val) => {
                            count++;
                            _list[index] = val;
                            if (count === list.length - 1) {
                                reject(_list);
                            }
                        }, (err) => {
                            resolve(err);
                        })
                    })(i);
                }
            });
        }

```
