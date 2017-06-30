# npm发布的那些事情

## 先决条件npm账号
### 注册npm账号
官网注册一个账户

在本地的cli模式下运行npm adduser或者npm login。
按照提示填写，用户名、密码与email等。

## 如何发布一个非全局包
npm 有个命令
```
npm publish [<tarball>|<folder>] [--tag <tag>] [--access <public|restricted>]

Publishes '.' if no argument supplied
Sets tag 'latest' if no --tag specified
```

简单的发布非常简单，只需要执行：

npm publish .

即可。

发布出去内容，主要是依据于package.json。最好在发布之前或者项目建立之前，先初始化这个package.json。初始化的方法为，```npm init```。
```
npm init [-f|--force|-y|--yes]
```

初始化出来的简易结构如下：

```
{
  "name": "test-play-ground",
  "version": "1.0.0",
  "description": "hello world",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "jilong5",
  "license": "MIT"
}
```
在非全举包的情况下，重点关注main属性，这个是入口文件，如果你开发了一个模块，**那么你的入口文件一定是main属性指定的文件**。

name属性说明：

注意一点npm的包都是有命名规范的，都是**小写字母+扩折号的方式**，eg：test-npm-publish

license：字母均是大写，代表你开源的协议。

version: 发布的版本号。

version的版本号规则：

>版本格式：主版本号.次版本号.修订号           
>版本号递增规则如下：                  
>主版本号：当你做了不兼容的API 修改.                  
>次版本号：当你做了向下兼容的功能性新增.                 
>修订号：当你做了向下兼容的问题修正。 先行版本号及版本编译信息可以加到“主版本号.次版本号.修订号”的后面，作为延伸。            

npm publish . 命令发布的都是基于你当前的package.json文件的，上面的属性都是最重要的属性。

发布结束，在npm上搜索，name就能找到你新鲜发布的包，version是你当前发布的版本号。**记得每次发布的时候都要version版本+1**。


## 发布一个全局包
发布一个全局包，需要上面的注意等，还需要如下内容。
### package.json中的bin属性 ###
```
{
  "name": "test-play-ground",
  "version": "1.0.0",
  "description": "hello world",
  "main": "index.js",
  "bin": "../bin/test-play-ground",
  "files": ["bin"],
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "jilong5",
  "license": "MIT"
}
```
bin 指向你的要运行命令的文件路径。（*注：这种情况下好像bin文件指向的文件名字需要与name属性的名字一致。*）
这时的命令为```test-play-ground```。

bin 属性可以是对象，也可以是字符串。
```
"bin":{
    "test-play-ground":"../bin/test-play-ground",
    "tpg":"../bin/test-play-ground"
}
```
这是会注册两条全局命令，分别是```test-play-ground```与```tpg```。

### test-play-ground文件
文件头部需要写入如下代码：
```
#!/usr/bin/env node
```
