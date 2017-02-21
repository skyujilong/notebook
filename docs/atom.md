# ATOM 编辑器相关随笔
## window下，启动apm命令行
在windows下，有时候可能是不支持apm命令的，那么我们可以将```C:\Users\jilong5\AppData\Local\atom\app-1.14.3\resources\app\apm\bin```这个路径放入到环境变量中，这样apm命令就可以使用了。
## 关于atom安装package翻墙的问题
apm本质上是在npm的一种封装，自然我们可以采用taobao的镜像去拉取资源内容。

配置如下：

找到文件```C:\Users\jilong5\.atom\.apmrc```,没有就新建立一个。

添加内容为：

```
registry=https://registry.npm.taobao.org/  
strict-ssl=false
```

这样我们就能采用taobao的镜像去翻墙了。

## atom安装包
```
$ apm install [你的包的名字，去atom上搜索]//eg:apm install linter
$ apm list //返回所有你安装包的名字
$ apm uninstall [package name] //删除这个包
$ apm upgrade [升级包的名字]//更新这个包的版本
```

## atom常用包
```
├── atom-beautify@0.29.17 //代码格式化
├── atom-material-syntax@1.0.2// ui
├── atom-material-ui@1.3.9//ui
├── atom-ternjs@0.17.2//一个很好用的引擎
├── autocomplete-paths@1.0.5//自动填充地址
├── csslint@1.1.5// css验证
├── docblockr@0.9.1// TODO 包
├── file-icons@2.0.15// 文件icon
├── highlight-selected@0.12.0//选中高亮
├── hyperclick@0.0.40// 变量跳转
├── js-hyperclick@1.10.1// 变量跳转
├── linter@1.11.23// 基础引擎（验证方向）
├── linter-jshint@3.0.2//js校验
├── markdown-scroll-sync@2.1.2//markdown自动滚动
├── minimap@4.26.8// 右侧的代码导航区
├── minimap-pigments@0.2.2// 增强代码导航添加颜色显示
├── pigments@0.39.0// 代码颜色显示
├── seti-ui@1.6.1// ui
└── todo-show@1.11.0//这玩意忘记了

```
