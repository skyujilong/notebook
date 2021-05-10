# vue 3.0

## 响应性【hooks】


### setup 函数

执行次数：一个生命周期内仅仅执行一次

执行周期:setup函数会在 beforeCreate之后 created之前执行.所以导致没有this.

接收参数：props、context

返回的值：相当于之前设置的data属性，用来在模版中进行展示内容


### ref

用来给原子数据创建响应式的。

eg:

```javascript
import { ref } from 'vue'
// 从ref中创建的相应最好 后缀名都是Ref结尾，方便在使用的时候知道该用.value
const counterRef = ref(0);

console.log(counterRef) // { value: 0 }
console.log(counterRef.value) // 0

counterRef.value++
console.log(counterRef.value) // 1

```

为何会这样：

`在对象中包装值似乎不必要，但在 JavaScript 中保持不同数据类型的行为统一是必需的。这是因为在 JavaScript 中，Number 或 String 等基本类型是通过值传递的，而不是通过引用传递的：`


### reactive

同样是创建相应的，与`ref`的区别在于，ref理想情况下都是用在原子属性上，而reactive用在对象上面。

等价于vue2.0的等价于 Vue.observable () API

```javascript
setup() {
    // 这个类似于vue2中的data()返回的响应式对象
    const count = reactive({ count: 0 }) 
    return {
    	count
    }
}
```