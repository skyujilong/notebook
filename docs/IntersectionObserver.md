# IntersectionObserver
## 效果
被观测者与设置的可视区域，可视与不可视之前的切换（scrolling）
## 用法
```javascript
let colors = ['#FFFFCC','#CCFFFF','#FFCCCC','#99CCCC','#FFCC99','#FFCCCC'];
let dcf = document.createDocumentFragment();
for(let i = 0 ; i<24; i++){
    let div = document.createElement('div');
    div.innerHTML = i + ':没有展示在可视区内！';
    div.style.background = `${colors[i%colors.length]}`;
    dcf.appendChild(div);
}
document.body.appendChild(dcf);

//添加ob方法观测 div的进入可视区域的情况 
let ob = new IntersectionObserver(function(entries){
    //console.log(entries);
    for(let entry of entries){
        console.log('------------------------');
        console.log(entry.target);//目标被检测的文件
        console.log(entry.isIntersecting);//目标进入可视区域
        console.log(entry.intersectionRatio);//可视区域的百分比
        console.log(entry.intersectionRect);
        console.log('------------------------');
    }
},{//设置可视区域位置等信息
    root:null,//没有dom就是 可视窗口
    rootMarge:'0px',
    threshold:0
});
for(let dom of document.querySelectorAll('div')){
    ob.observe(dom);
}

```
## 浏览器兼容
不支持ie

## 为什么单独说这个api

Intersection Observer API 会注册一个回调方法，每当期望被监视的元素进入或者退出另外一个元素的时候(或者浏览器的视口)该回调方法将会被执行，或者两个元素的交集部分大小发生变化的时候回调方法也会被执行。通过这种方式，网站将不需要为了监听两个元素的交集变化而在主线程里面做任何操作，并且浏览器可以帮助我们优化和管理两个元素的交集变化。


主要是能够优化onscroll事件，该事件全程在主线程中执行，如果多个scroll事件+耗时多的操作，会导致页面的卡顿！

反观这个observer，只有元素进入和移出的时候才能触发，再配合requestIdleCallback函数，我们可以给网页巨大的优化提升。

另外，quicklink就是通过上述两个api去扫描可视区域内的a标签，进行页面的预缓存操作。