# base type
## 用途
帮助你写出更好的javascript代码。运行前检查。强类型，在构建中大型项目的时候，更容易排查错误。代码提示（类型以及参数提示友好）。
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
