# DOM节点插入（字符串）
## 核心API element.insertAdjacentHTML
### 该API用法如下：
```javascript
    element.insertAdjacentHTML(position,text);
```
position: 插入元素的相对位置。   

* 'beforebegin':元素自身的前面。
* 'afterbegin':插入元素内部的第一个子节点之前。
* 'beforeend':插入元素内部的最后一个子节点之后。
* 'afterend':元素自身的后面。

text:是要解析为html的字符串。

### 位置名称的可视化

```html
<!-- beforebegin -->
<p>
<!-- afterbegin -->
foo
<!-- beforeend -->
</p>
<!-- afterend -->
```

### 与element.innerHTML对比

将指定的文本解析为HTML或XML，并将结果节点插入到DOM树中的指定位置。它不会重新解析它正在使用的元素，因此它不会破坏元素内的现有元素。这避免了额外的序列化步骤，使其比直接innerHTML操作更快。

### 浏览器支持
ie4.0以上。


## 另外的一个核心api，range.createContextualFragment

eg:
```javascript
var tagString = "<div>I am a div node</div>";
var range = document.createRange();
// make the parent of the first div in the document becomes the context node
range.selectNode(document.getElementsByTagName("div").item(0));
var documentFragment = range.createContextualFragment(tagString);
document.body.appendChild(documentFragment);
```

### 浏览器兼容性
ie 11 以上。
