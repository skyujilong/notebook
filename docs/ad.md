# 广告

## 关于部署广告的一些心得

页面上的dom结构如下：

```html
<textarea data-type="ad-scripts" style="display:none">
        <img src="http://sax.sina.com.cn/view?type=nonstd&t=REowMDAxNDU4Ng%3D%3D?p=1490601555">
%3Cscript%20type%3D%22text%2Fjavascript%22%3Evar%20cpro_id%20%3D%20%22u2812028%22%3B%3C%2Fscript%3E%3Cscript%20type%3D%22text%2Fjavascript%22%20src%3D%22http%3A%2F%2Fcpro%2Fui%2Fcm.js%22%3E%3C%2Fscript%3E        
</textarea>
```

其中textarea中的内容就是广告的链接地址以及，以及对应的统计img。

这里的统计，利用浏览器，请求img的方法进行请求一个地址。优点有，不需要单独的编写代码，支持跨域，比script的src请求安全。

后续操作就是读取textarea中的内容，之后进行页面的渲染，渲染的流程主要是用iframe进行渲染，优点是，即使广告内容发生错误也不会影响整体页面的逻辑错误。iframe的创建如下：

html模板如下：

```javascript
var TPL = $tpl({
    html : [
        '<!DOCTYPE HTML>',
        '<html>',
            '<head>',
                '<meta charset=UTF-8>',
                '<title>mblog-proxy</title>',
                '<style>',
                'html,body,*{margin:0;padding:0}',
                '</style>',
            '</head>',
            '<body marginwidth="0" marginheight="0">',
                '{{{scripts}}}',
            '</body>',
        '</html>'
    ]
});
```

动态生成ad的代码如下：

```javascript
        //el是传递进来的textarea dom元素
        el = $(el);
        var scripts = el.val();

        //contentM在翻页时会过滤掉script标签包含的内容。
        //所以通过encode来避开这个问题。
        scripts = decodeURIComponent(scripts);
        options = $.extend({
            width : '100%',
            height : 'auto',
            success : $.noop
        }, options);
        var iframe = $('<iframe></iframe>');

        iframe.attr({
            scrolling : 'no',
            frameborder : 0
        }).css({
            display : 'none',
            width : options.width,
            height : options.height === 'auto' ? 0 : options.height
        });

        var onload = function(){
            var win, doc, body, height;
            iframe.css({'display' : ''});
            if(options.height === 'auto'){
                win = iframe.get(0).contentWindow;
                if(win){
                    doc = win.document;
                    if(doc){
                        body = doc.body;
                        //height = Math.max(body.scrollHeight, body.offsetHeight);
                        height = body.offsetHeight;
                    }
                }
                height = height || 0;
                //根据需求动态设置可是区域的大小
                iframe.css('height', height + 'px');
            }
        };
        iframe.on('load', onload);

        var html = TPL.get('html');
        html = $mustache.render(html, {
            scripts : scripts
        });
        html = html.replace(/\"/g, '\\"');

        var src = [
            'javascript',
            ':(function(){',
                'document.open();',
                'document.write("',html,'");',
                'document.close();',
            '})();',
        ].join('');
        //直接用replaceWith和insertAfter操作iframe会导致iframe中的脚本被执行2遍
        //需要一个延时操作避免脚本的重复执行
        var div = $('<div></div>').css({
            //'line-height' : 'normal',
            'font-size' : '0',
            'text-align': 'center'
        });
        el.replaceWith(div);
        setTimeout(function(){
            div.append(iframe);
        });
        //这里用到了伪协议，javascript: 这样能够进行执行javascript的写操作，注意字符串的长度，因为是get请求。
        iframe.attr('src', src);
```

如上源码，就可以动态的创建一个广告了。
