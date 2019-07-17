# js 继承
## es6 extends
```javascript
//父类
class Foo{
	constructor(a, b){
		this.a = a; this.b = b;
	}
	say(){
		return this.a + this.b;
	}
}
//子类
class Xoo extends Foo{}
let testXoo1 = new Xoo(1,2);
```
输出testXoo1的内容如下：

![testXoo1的结构](https://github.com/skyujilong/notebook/blob/master/src/testXoo1-inner.png)

## es5 实现
```javascript
function Foo(a,b){
    this.a = a;
    this.b = b;
} 
Foo.prototype.say = function (){
    return this.a + this.b;
}

function Xoo (a,b){
    Foo.call(this,a,b);// 调用父类的方法， 只不过替换称自己的scope
}
Xoo.prototype = new Foo();// 相当于将Foo的实例的__proto__进行赋值操作
Xoo.prototype.constructor = Xoo;// constructor重新指向Xoo

let es5 = new Xoo(1,2);// es5.__proto__ === Xoo.prototype true   es5.__proto__.__proto__ === Foo.prototype true
```
输出的es5对象如下：

![es5的结构](https://github.com/skyujilong/notebook/blob/master/src/es5-inner.png)

## Object.create方法的实现
```javascript
function Foo(a,b){
    this.a = a;
    this.b = b;
} 
Foo.prototype.say = function (){
    return this.a + this.b;
}

function Xoo (a,b){
    Foo.call(this,a,b);// 调用父类的方法， 只不过替换称自己的scope
}
Xoo.prototype = Object.create(Foo.prototype);
Xoo.prototype.constructor = Xoo;

let objectCreate = new Xoo(1,2);
```
输出的结构对象如下：

![objectCreate结构](https://github.com/skyujilong/notebook/blob/master/src/es5-inner.png)

## Object.create定义

**方法创建一个新对象，使用现有的对象来提供新创建的对象的__proto__。**

### 语法
Object.create(proto, [propertiesObject])
### 参数
1. proto 新创建对象的原型对象
2. propertiesObject 可选。如果没有指定为 undefined，则是要添加到新创建对象的可枚举属性（即其自身定义的属性，而不是其原型链上的枚举属性）对象的属性描述符以及相应的属性名称。这些属性对应Object.defineProperties()的第二个参数。

### 返回值
一个新对象，带着指定的原型对象和属性。

### 核心代码实现

```javascript
Obeject.create = functioin (proto){
    function F() {}
    F.prototype = proto;
    return new F(); //同样是挂载__proto__属性
}

```