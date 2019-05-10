# 小程序
## 代码构成
### *.json
根目录的.json文件设置的全局的一些page的属性，以及注册页面上的路由地址。

子目录上的.json文件设置一些当前页面的属性。

### *.wxml
页面展示的dom模板，类似于html，但是能够双向绑定page中的data数据，以及绑定事件。


### *.wxss
用来对wxml文件中的dom进行设定样式。

### *.js
交互逻辑，主要是负责，事件，以及数据的更新。 数据到视图上的更改，由小程序来完成。


## 生命周期

### App生命周期
1. onLaunch 生命周期回调——监听小程序初始化。
1. onShow 生命周期回调——监听小程序启动或切前台。
1. onHide 生命周期回调——监听小程序切后台。
1. onError 错误监听函数。
1. onPageNotFound 页面不存在监听函数。

App上的定义的属性

```javascript
App({
  onLaunch(options) {
    // Do something initial when launch.
  },
  onShow(options) {
    // Do something when show.
  },
  onHide() {
    // Do something when hide.
  },
  onError(msg) {
    console.log(msg)
  },
  globalData: 'I am global data'// globalData 在其他的页面中都能够访问到，可以将全局的一些数据存储在这里。 其他页面访问 getApp 方法，直接获取 app实例
})

//在其他page中的生命周期中 可以调用如下方法
const appInstance = getApp()
console.log(appInstance.globalData);//输出：I am global data

```


### page生命周期

1. onLoad 生命周期回调—监听页面加载
1. onShow 生命周期回调—监听页面显示
1. onReady 生命周期回调—监听页面初次渲染完成
1. onHide 生命周期回调—监听页面隐藏
1. onUnload 生命周期回调—监听页面卸载


### page 其他属性
1. data 页面的初始数据(与wxml进行双向绑定的数据)
1. onPullDownRefresh 监听用户下拉动作（下拉feed刷新）
1. onReachBottom 页面上拉触底事件的处理函数（上啦，分页加载更多内容）
1. onShareAppMessage 用户点击右上角转发
1. onPageScroll 页面滚动触发事件的处理函数


### 获取page实例
getCurrentPages

返回的是数组对象。数组是成栈的形式，栈顶，为当前活动page的实例。

### 自定义组件

参考文档如下：

https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/