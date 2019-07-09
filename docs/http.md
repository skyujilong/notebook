# 一次web http请求都发生了什么

## dns 解析
解析域名，查找自身的dns缓存，没有命中查找host中的，之后是运营商的。
解析出对应服务器的ip的地址。
## http请求发出&socket的建立
### 3次tcp握手
1. client 发送第一次请求，请求链接
1. server 发送接受请求给client（进入等待确认client状态）
1. client 发送收到server同意请求（server收到后 TCP进入Established状态，准备发起http请求）
### 数据传输
1. client 反复发送确认针
1. server 反复发送数据
### 4次tcp挥手
1. client 发送结束报文
1. server 发送等待确认结束报文（收到结束报文，等待数据全部传输完毕）
1. server 发送结束报文（服务器关闭链接）
1. client 发生确认结束报文（发送请求后等待回复，超时，关闭连接）

## 浏览器解析html
### html 
构建dom tree
### css
```html
<link href="http://mjs.sinajs.cn/blog/items/2018/blogIndex/css/index-541260.css" rel="stylesheet">
```
阻赛当前dom树的构建，加载css样式，构建cssom

### script
```html
<script>
    /* 代码片段 */
</script>
```
阻赛当前dom树的构建，执行代码片段
```html
<script src="http://n.sinaimg.cn/blog/lib/es6-promise.min.js"></script>
```
阻赛当前dom树的构建，加载js文件，并执行js文件

### link相关（优化）
```html
<!-- 加载img文件 -->
<link rel="preload" href="http://img.mjs.sinajs.cn/blog/items/2018/blogIndex/img/normal-sprite-c19a2e.png" as="image">
<!-- 加载js文件，并不执行该文件，优先级高（带有as的情况，不带优先级普通） -->
<link rel="preload" href="http://n2.sinaimg.cn/blog/lib/es6-promise.min.js" as="script">
<!-- 查询解析dns -->
<link rel="dns-prefetch" href="//mjs.sinajs.cn" /> 
<!-- 提前预加载文件。不执行，优先级最低 -->
<link rel="prefetch" href="http://n2.sinaimg.cn/blog/lib/es6-promise.min.js">
```
### 渲染
dom tree + cssom = render tree

反复回流(Reflow) + 重绘(Repaint) 最终呈现内容
