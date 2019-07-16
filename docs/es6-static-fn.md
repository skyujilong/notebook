# es6 class static function
```javascript

class Test1{
    age=10
    constructor(){
        console.log(this.age);
    }
    static testStatic(){
        console.log(this);// 指向 Test1这个函数上 不注册在Test1的prototype上
        console.log(this.age); // undefined 因为 这个age只有 实例上才挂载
        console.log('Test1.testStatic');
    }
    testCall(){
        console.log(this.age);
        Test1.testStatic(); // 调用静态方法
        //this.testStatic() 会报错， 在实例以及实例的原型链上找不到该方法
    }
}
console.log(Test1.age);//undefined
console.log(Test1.prototype.age);//undefined
//testStatic 挂载在Test1 上！
let test = new Test1();
console.log(test);
test.testCall();


//测试继承
class Test2 extends Test1{

}
console.log('------------------------------------')
let test2 = new Test2;
console.log(Test2.testStatic);// 有输出 竟然继承过来了。。。。。
// 能重写覆盖
Test2.testStatic = ()=>{
    console.log('test2.testStatic')
}
console.log(Test2.testStatic);
console.log(test2.age);
test2.testCall();//这里当然走的依然是test1的流程
```

react component 中的 static getDerivedStateFromProps 方法，就是采用static的特性来隔离来this，从而让你不再使用this.setState方法，构建一个安全的使用方式。