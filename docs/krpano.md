# krpano web vr创建｜二次开发工具学习

## 官网
https://krpano.com/home/


## 推荐学习中文网站

http://www.krpano360.com/

## 学习路径

建议先从krpano360的入门教程看起，先看明白几个概念。


## 安装 macos

[地址](https://krpano.com/download/)

1. 选择Mac OSX
2. 下载成功后，执行FIX INSTALL OSX.command
3. 执行没有成功，需要在安全中，允许三方内容


## krpano lib 文件夹下内容粗略解释

- krpanotools **重要** 
  - 本文件是一个脚本，命令行，底层都是通过这个，来创建的vr web预览图。
- krpano Tools
  - 可视化操作，底层调用的krpanotools命令进行处理。
- templates
  - *.config 文件， 在执行krpanotools 可以指定具体执行那个配置文件上的配置。 默认采用的是normal.config


## 如何生成你的第一个vr

- 素材
  - 一张宽高比为2比1的全景图片，看起来有点拉伸的感觉。
  - 或者六张1比1的图片，正好对应正方体的6个面。
- 执行命令行
  - ``` ./krpanotools makepano -config=[替换这里为你的*.confg文件，eg templates文件中的normal.config文件] [图片路径1 ... 图片路径n]```
- output产出物，会在你输入图片的同目录下。如果更改了*.config文件中的output选项，可能会出现在你更改的位置上。
- 预览
  - 直接在产出物目录下执行 ```http-server ./ -p 8080```
  - 浏览器访问http://localhost:8080/index.html 就能进行预览了。
  - tips http-server是一个node模块，提供的ftp服务。没有的话可以使用，krpano的 ```./krpanotools testserver``` 命令。

建议一直使用命令行来处理生成pano。这样扩展性比较强。学这玩意，估计自己都要弄出来一套ui来提供给客户。客户上传素材。底层由krpanotools来生成预览文件，等操作。
