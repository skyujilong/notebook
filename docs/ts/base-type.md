# base type
## 用途
帮助你写出更好的javascript代码。运行前检查。强类型，在构建中大型项目的时候，更容易排查错误。代码提示（类型以及参数提示友好）。

## 检测
采用鸭式辨型法。 所谓的鸭式，就是，我刚开始有一个类型是鸭子。鸭子会嘎嘎叫！这个时候来来个牛逼的狗子！也会嘎嘎叫， 那么在类型检测的时候， 我也会把这个狗子当成鸭子来进行处理！主意原因是因为他俩都同时拥有**嘎嘎叫**!

## 类型介绍
### 基本类型
```javascript
    // 数字类型
    let num:number = 2;
    
    // 字符串类型
    let str:string = '2333';
    
    // 布尔类型
    let boo:boolean = true;
    
    // boo = 'string'; 只能赋值boolean类型，or undefined 或者 null， null是否能够复制，取决于你ts中的一项配置参数strictNullChecks 当有strictNullChecks的时候， 不允许null以及undefine 赋值给其他的类型上。 只能赋值到void以及他们自己
    
    // 数组
    let list:string[] = ['12','23'];
    
    // Tuple 元组
    // 元组类型允许表示一个已知元素数量和类型的数组，各元素的类型不必相同。 比如，你可以定义一对值分别为 string和number类型的元组。
    let x: [string, number];
    x = ['123',123];//通过；
    // x = [123,123] 不能通过

    // 枚举
    // enum类型是对JavaScript标准数据类型的一个补充。 像C#等其它语言一样，使用枚举类型可以为一组数值赋予友好的名字。
    enum Color {Red, Green, Blue}
    // 默认情况下，从0开始为元素编号。 你也可以手动的指定成员的数值。 
    console.log(Color.Red);//输出 0；
    // 可以定义枚举的值。
    enum Color1 {Red = 1, Green, Blue}
    console.log(Color1.Red); // 输出 1；
    console.log(Color1.Green); // 输出 2；
    console.log(Color1.Blue); // 输出3；
    // 被赋值之后的枚举 按照没有赋值的进行递增。
    console.log(Color1[0]);// 输出undefined，这里，因为0 没有对应的枚举name！！
    console.log(Color1[1]);//输出Red 输出的是枚举的名字

    // Any 
    // 有时候，我们会想要为那些在编程阶段还不清楚类型的变量指定一个类型。
    let list: any[] = [1, true, "free"];

    // void
    // 一般用在function中， 表示该函数没有返回值。
    function test():void{

        // return 'test'; 会报错！
    }

    // Null 和 Undefined
    // 默认情况下null和undefined是所有类型的子类型。 就是说你可以把 null和undefined赋值给number类型的变量。
    //然而，当你指定了--strictNullChecks标记，null和undefined只能赋值给void和它们各自。 这能避免 很多常见的问题。 也许在某处你想传入一个 string或null或undefined，你可以使用联合类型string | null | undefined。 再次说明，稍后我们会介绍联合类型。


    // Never
    // never类型表示的是那些永不存在的值的类型。 例如， never类型是那些总是会抛出异常或根本就不会有返回值的函数表达式或箭头函数表达式的返回值类型； 变量也可能是 never类型，当它们被永不为真的类型保护所约束时。
    // 用法是在function中抛出的异常。
    function error(message: string): never {
        throw new Error(message);
    }

    // Object
    // object表示非原始类型，也就是除number，string，boolean，symbol，null或undefined之外的类型。

    // 类型断言
    // 规定当前的属性或者对象，是什么类型。
    let someValue: any = "this is a string";

    let strLength: number = (<string>someValue).length;

    // 强制转换 someValue中的any类型， 判断成string,之后，获取string的length属性，返回的是数字类型。
```

### interface 接口
接口可以定义类型, 可以用接口定义的类型去进行数据类型的检测工作。

```javascript
interface Itest{
    name:string;//属性
    ():void;//描述的方法
    getVal(name:string):string;
    val?:string; // 可选属性。 可以有val 也可以没有val
    readonly key:string; // 只读 不可更改
}

// 定义一个符合Idemo的数组集合。
interface Idemo{
    name:string;
    value:string;
}
let list:Idemo[];
list = [];
list.push({
    name:'jilong5',
    value:'23333'
});

// 定义参数
interface Iparams {
    name:string;
    sayHello(text:string):string;
}

function testIparams(params:Iparams):void{
    let whatSay = params.sayHello(params.name);
    console.log(whatSay);
}
testIparams({
    name:'jilong5',
    sayHello(name:string):string{
        return '我说了什么？' + name;
    }
});// 输出 我说了什么？jilong5


// 定义函数

interface ItestFun{
    (name:string):void;
}
let testFun:ItestFun;
testFun = function(name){
    console.log(name);
}
testFun('233'); //输出 233


```

## 类型别名 type
类型别名会给一个类型起个新名字。 类型别名有时和接口很像，但是可以作用于原始值，联合类型，元组以及其它任何你需要手写的类型。

```javascript
    type ItestFun = (name:string)=>void;
    let testFun:ItestFun;
    testFun = function(name){
        console.log(name);
    }
    testFun('233'); //输出 233

    // 思考上面的例子与前面的interface定义的有何不同？
    
    // 像我们提到的，类型别名可以像接口一样；然而，仍有一些细微差别。
    //
    type Alias = { num: number }
    interface Interface {
        num: number;
    }
    //鼠标悬停在 arg上 aliased返回的是字面量提示
    declare function aliased(arg: Alias): Alias;
    // interfaced 的 arg上是Interface
    declare function interfaced(arg: Interface): Interface;
    // 另外的区分就是在于type类型别名不能被 extends和 implements ！！

```

## class 类
```javascript
class Greeter {
    greeting: string;
    constructor(message: string) {
        this.greeting = message;
    }
    greet() {
        return "Hello, " + this.greeting;
    }
}
let instance:Greeter = new Greeter();

```

### 继承
```javascript
class Animal {
    name:string;
    constructor(name:string){
        this.name = name;
    }
    move(distanceInMeters: number = 0) {
        console.log(`Animal moved ${distanceInMeters}m.`);
    }
}

class Dog extends Animal {
    constructor(name:string){
        // 继承在这里 在有参数的情况下，或者你实现了constructor的时候需要优先调用super函数。
        super(name);
    }
    bark() {
        console.log('Woof! Woof!');
    }
}

const dog = new Dog('hashiqi');
dog.bark(); //  输出 Woof! Woof!
dog.move(10);// 输出 Animal moved 10m.
dog.bark();// 输出 Woof! Woof!

```

### 公共，私有与受保护的修饰符
TypeScript里，成员都默认为 public。
1. public 都可以访问到
1. private 它就不能在声明它的类的外部访问
1. protected 派生类中能够访问到

### 存取器
```javascript
let passcode = "secret passcode";

class Employee {
    private _fullName: string;

    get fullName(): string {
        return this._fullName;
    }

    set fullName(newName: string) {
        if (passcode && passcode == "secret passcode") {
            this._fullName = newName;
        }
        else {
            console.log("Error: Unauthorized update of employee!");
        }
    }
}

let employee = new Employee();
employee.fullName = "Bob Smith";// 会调用 set fullName这个函数！
if (employee.fullName) { // 这里会调用get fullName函数
    alert(employee.fullName);
}
// 主意该特性是基于Object.defineProperty方法的， 他原理应该是去劫持了该方法中的set以及get方法。 同时因为该api编译的target应该为 ecma5以及以上！
```

首先，存取器要求你将编译器设置为输出ECMAScript 5或更高。 不支持降级到ECMAScript 3。 其次，只带有 get不带有 set的存取器自动被推断为 readonly。 这在从代码生成 .d.ts文件时是有帮助的，因为利用这个属性的用户会看到不允许够改变它的值。


### 抽象类
```javascript
abstract class Animal {
    abstract makeSound(): void;
    move(): void {
        console.log('roaming the earch...');
    }
}
// 抽象类，主要是继承该类的派生类， 必须要实现abstract修饰的方法！
```

### 静态方法
```javascript
class Animal{
    static name = 'hello!'
}
// 访问该全局属性
console.log(Animal.name); // 输出： hello!
```

### 类当作接口使用
```javascript
class Point {
    x: number;
    y: number;
}
// 接口能够继承类，来进行属性的扩展！
interface Point3d extends Point {
    z: number;
}

let point3d: Point3d = {x: 1, y: 2, z: 3};
```