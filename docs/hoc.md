# react HOC 一次应用
## 业务场景
需求
1. 博客正文页中，a标签的点击，要判断是否是博客的正文， 如果是，呼起app的正文页面。如果不是用普通的webview来打开这个额外的页面。
2. 点博客视频播放的时候，需要上报统计。（后期可能要整体改动这个video模块）
3. 图片的加载需要通过app的缓存（他们这个缓存策略有点傻啊，要是我来干，一定是劫持webview中发出去的请求。然后在这块进行请求数据然后缓存，在丢给webview）。
4. 点击图片要call native的一个展示图片的组件。

## 现有情况

后台给的数据如下：
```
{
    "code": "0",
    "data": {
        "article_id": "44de63be0102y5xt",
        "article_title": "\u535a\u6587\u5199\u4f5c\u7684\u610f\u5883\u4e0e\u9009\u6750",
        "article_body": "<div STYLE=\"text-indent:2em;\">\n<p STYLE=\"text-indent: 2em;\"><a HREF=\"http:\/\/photo.blog.sina.com.cn\/showpic.html#blogid=44de63be0102y5xt&url=http:\/\/album.sina.com.cn\/pic\/001gc2Syzy7pipXrXX2f0\" TARGET=\"_blank\"><img SRC=\"http:\/\/s1.sinaimg.cn\/mw690\/001gc2Syzy7pipXrXX2f0&amp;690\" NAME=\"image_operate_64091542537042321\" WIDTH=\"634\" HEIGHT=\"516\"  ALT=\"\u535a\u6587\u5199\u4f5c\u7684\u610f\u5883\u4e0e\u9009\u6750\"  TITLE=\"\u535a\u6587\u5199\u4f5c\u7684\u610f\u5883\u4e0e\u9009\u6750\" \/><\/A><br \/>\n<br \/><\/P>\n<p STYLE=\"text-indent: 2em;\"><font STYLE=\"font-size: 16px;\" FACE=\"\u5e7c\u5706\" COLOR=\"#313130\"><span STYLE=\"background: white;\"><br \/><\/SPAN><\/FONT><\/P>\n<p STYLE=\"text-indent: 2em;\"><font STYLE=\"font-size: 16px;\" FACE=\"\u5e7c\u5706\" COLOR=\"#3D3E3C\"><span STYLE=\"background: white;\">\u5927\u96e8\u843d\u5e7d\u71d5\uff0c\u767d\u6d6a\u6ed4\u5929\uff0c\u79e6\u7687\u5c9b\u5916\u6253\u9c7c\u8239\u3002\u4e00\u7247\u6c6a\u6d0b\u90fd\u4e0d\u89c1\uff0c\u77e5\u5411\u8c01\u8fb9\uff1f<\/SPAN><br \/>\n<span STYLE=\"background: white;\">&nbsp;\n&nbsp; &nbsp;\n\u5f80\u4e8b\u8d8a\u5343\u5e74\uff0c\u9b4f\u6b66\u6325\u97ad\uff0c\u4e1c\u4e34\u78a3\u77f3\u6709\u9057\u7bc7\u3002\u8427\u745f\u79cb\u98ce\u4eca\u53c8\u662f\uff0c\u6362\u4e86\u4eba\u95f4\u3002<\/SPAN><\/FONT><\/P>\n<p STYLE=\"text-indent: 2em;\"><font COLOR=\"#3D3E3C\"><font STYLE=\"text-indent: 32px; font-size: 16px;\" FACE=\"\u5e7c\u5706\"><span STYLE=\"background: white;\">\u8fd9\u9996\u300a\u6d6a\u6dd8\u6c99<\/SPAN><span STYLE=\"background: white;\">\u00b7<\/SPAN><span STYLE=\"background: white;\">\u5317\u6234\u6cb3<\/SPAN>\u300b\uff0c\u6211\u5728\u5b66\u751f\u65f6\u4ee3\u5c31\u8bfb\u8fc7\u3002\u6bdb\u4e3b\u5e2d\u8fd9\u9996\u8bcd\uff0c<\/FONT><span STYLE=\"text-indent: 2em; font-size: 16px;\"><font FACE=\"\u5e7c\u5706\">\u610f<\/FONT><\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\"><font FACE=\"\u5e7c\u5706\">\u5883<\/FONT><\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\"><font FACE=\"\u5e7c\u5706\">\u9ad8<\/FONT><\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\"><font FACE=\"\u5e7c\u5706\">\u8fdc<\/FONT><\/SPAN><font FACE=\"\u5e7c\u5706\" STYLE=\"text-indent: 32px; font-size: 16px;\">\u6c14\u52bf\u78c5\u7934\uff0c\u975e\u5927<\/FONT><span STYLE=\"text-indent: 2em; font-size: 16px;\"><font FACE=\"\u5e7c\u5706\">\u5bb6<\/FONT><\/SPAN><font FACE=\"\u5e7c\u5706\" STYLE=\"text-indent: 32px; font-size: 16px;\">\u4e0d\u80fd\u4e3a\uff0c\u540e\u4eba\u8bc4<\/FONT><span STYLE=\"text-indent: 2em; font-size: 16px;\"><font FACE=\"\u5e7c\u5706\">\u8bf4<\/FONT><\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; font-family: \u5e7c\u5706;\">\u6bd4\u66f9\u64cd\u7684\u300a\u89c2\u6ca7\u6d77\u300b\u5199\u5f97\u597d\u3002\u8fd9\u662f<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\"><font FACE=\"\u5e7c\u5706\">\u4e00<\/FONT><\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\"><font FACE=\"\u5e7c\u5706\">\u4e2a<\/FONT><\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\"><font FACE=\"\u5e7c\u5706\">\u4ec0<\/FONT><\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\"><font FACE=\"\u5e7c\u5706\">\u4e48<\/FONT><\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\"><font FACE=\"\u5e7c\u5706\">\u6837<\/FONT><\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\"><font FACE=\"\u5e7c\u5706\">\u7684<\/FONT><\/SPAN><span STYLE=\"text-indent: 2em; font-family: \u5e7c\u5706; font-size: 16px;\">\u597d\u5730\u65b9<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\"><font FACE=\"\u5e7c\u5706\">\u54df<\/FONT><\/SPAN><span STYLE=\"font-family: \u5e7c\u5706; font-size: 16px; text-indent: 2em;\">\uff0c\u6211\u795e\u5f80\u4e86\u5927\u534a\u8f88\u5b50\u3002\u524d\u4e0d\u4e45\u4e00\u4e2a\u5076\u7136\u7684\u673a\u4f1a\uff0c\u6211\u7ec8\u4e8e\u5982\u613f\u4ee5\u507f\u53bb\u4e86\u5317\u6234\u6cb3\uff0c\u4e14\u5728\u90a3\u91cc\u5c0f\u4f4f\u4e86\u4e00\u6bb5\u65f6\u95f4\u3002<\/SPAN><\/FONT><\/P>\n<p STYLE=\"text-indent: 2em;\"><font COLOR=\"#3D3E3C\"><span STYLE=\"background-color: white; font-size: 16px; text-indent: 2em;\">\u4e0a\u9762\u8fd9\u5e45\u56fe\u548c\u51e0\u884c\u6587\u5b57\uff0c\u662f\u6211\u8bfb\u67d0\u6587\u53cb\u300a\u51ac\u6e38\u5317\u6234\u6cb3\u300b\u535a<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u6587<\/SPAN><span STYLE=\"background-color: white; font-size: 16px; text-indent: 2em;\">\uff0c\u5efa\u8bae\u5176\u4ee5\u8fd9\u6837\u7684\u5f62\u5f0f\u5f00<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u7bc7<\/SPAN><span STYLE=\"background-color: white; font-size: 16px; text-indent: 2em;\">\uff0c<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u94fa<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5c55<\/SPAN><span STYLE=\"background-color: white; font-size: 16px; text-indent: 2em;\">\u6587\u7ae0\u610f\u5883\uff0c<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u7136<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u540e<\/SPAN><span STYLE=\"background-color: white; font-size: 16px; text-indent: 2em;\">\u518d<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5199<\/SPAN><span STYLE=\"background-color: white; font-size: 16px; text-indent: 2em;\">\u81ea\u5df1\u89c1\u95fb\u548c\u611f\u53d7\u3002<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u7136<\/SPAN><span STYLE=\"background-color: white; font-size: 16px; text-indent: 2em;\">\u6587\u53cb\u672a<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u4e88<\/SPAN><span STYLE=\"background-color: white; font-size: 16px; text-indent: 2em;\">\u91c7\u7eb3\uff0c\u8fd8\u662f\u4ee5\u201c\u6b63\u56e2\u804c\u5973\u513f\u4eab\u53d7\u7597\u517b\u5f85\u9047\uff0c\u6309\u519b\u89c4\u53ef\u4ee5\u5e26\u4e24\u540d\u4eb2\u5c5e\uff0c\u6211\u548c\u8001\u4f34\u4e00\u540c\u524d\u5f80\u201d\u5f00\u5934\u3002\u6211\u60f3\uff0c\u54ea<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u6837<\/SPAN><span STYLE=\"background-color: white; font-size: 16px; text-indent: 2em;\">\u5f00\u5934\u4e3a\u597d\uff0c\u8bfb\u8005\u770b\u5f97\u61c2\u3002<\/SPAN><\/FONT><\/P>\n<p STYLE=\"text-indent: 32px;\"><font COLOR=\"#3D3E3C\"><font STYLE=\"font-size: 16px;\" FACE=\"\u5e7c\u5706\"><span STYLE=\"background: white;\">\u53c8\u8bfb\u4e00\u7bc7\u300a\u5c0f\u8d26\u5355\u4e0e\u5927\u6570\u636e\u300b\uff0c\u4e5f\u662f\u4e00\u4f4d\u975e\u5e38\u719f\u6089\u7684\u6587\u53cb\u5199\u7684\u3002\u4f5c\u8005\u6587\u4e2d\u4ecb\u7ecd<\/SPAN><\/FONT><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u8bf4<\/SPAN><font STYLE=\"text-indent: 2em; font-size: 16px;\" FACE=\"\u5e7c\u5706\"><span STYLE=\"background: white;\">\uff0c\u65e0\u610f\u4e2d\u53d1\u73b0\u4e00\u672c38\u5e74\u524d\u7684\u5c0f\u8bb0\u4e8b\u672c\uff0c\u4e0a\u9762\u8bb0\u5f55\u7740<\/SPAN><\/FONT><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5f53<\/SPAN><span STYLE=\"font-size: 16px; text-indent: 2em; background: white;\">\u5e74\u53bb\u5317\u4eac\u5e2e\u540c\u4e8b\u4ee3\u8d2d\u7269<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u54c1<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u8d26<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u76ee<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">\uff1a\u4e00\u4ef6\u7f51\u773c\u80cc\u5fc3\uff0c\u89c6\u5927\u5c0f\u53f7\u5206\u522b\u4e3a<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">0.76~0.85<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">\u5143\uff0c\u4e00\u4ef6\u886c\u8863<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">7.2<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">\u5143\uff0c\u4e00\u53cc\u51c9\u978b<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">2.65<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">\u5143\u3001\u4e00\u53cc\u76ae\u978b<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">17<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">\u5143\u2026\u2026\u3002<\/SPAN><\/FONT><\/P>\n<p STYLE=\"text-indent: 32px;\"><font COLOR=\"#3D3E3C\"><font STYLE=\"font-size: 16px;\" FACE=\"\u5e7c\u5706\"><span STYLE=\"background: white;\">\u63a5\u7740\uff0c\u4f5c\u8005\u5199\u4e86\u4e00\u7ec4\u5927\u6570\u636e<\/SPAN><\/FONT><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u4e0e<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5f80<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u6614<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5bf9<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u7167<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">\uff1a\u6211\u56fd<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">GDP<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">\u4ece<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">1978<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">\u5e74\u7684<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">0.3645<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">\u4e07\u4ebf\u5143\uff0c\u589e\u957f\u5230<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">2017<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">\u5e74\u7684<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">82.7<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">\u4e07\u4ebf\u5143<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">\uff0c\u5df2\u8fbe\u5230\u4e2d\u7b49\u504f\u4e0a\u6536\u5165\u56fd\u5bb6\u7684\u6c34\u5e73\u3002\u57ce\u9547\u5c45\u6c11\u4eba\u5747\u53ef\u652f\u914d\u6536\u5165\u548c\u519c\u6751\u5c45\u6c11\u4eba\u5747\u53ef\u652f\u914d\u6536\u5165\uff0c\u5206\u522b\u4ece<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">1978<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">\u5e74\u7684<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">343.4<\/SPAN>\n<span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">\u5143\u3001<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">133.6<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">\u5143\u63d0\u9ad8\u5230<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">2017<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">\u5e74\u7684<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">36396<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">\u5143\u3001<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">13432<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">\u5143\u3002\u6700\u65b0\u7edf\u8ba1\u6570\u636e<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u8868<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u660e<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">\uff0c<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">2018<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">\u5e74\u524d\u4e09\u5b63\u5ea6\uff0c\u5168\u56fd\u5c45\u6c11\u4eba\u5747\u53ef\u652f\u914d\u6536\u5165<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">21035<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">\u5143\uff0c\u6bd4\u4e0a\u5e74\u540c\u671f\u589e\u957f<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">8.8%<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">\u3002<\/SPAN><\/FONT><\/P>\n<p STYLE=\"text-indent: 32px;\"><font COLOR=\"#3D3E3C\"><font STYLE=\"font-size: 16px;\" FACE=\"\u5e7c\u5706\"><span STYLE=\"background: white;\">\u4f5c\u8005<\/SPAN><\/FONT><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u7528<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u8fd9<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u4e24<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u7ec4<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u6570<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5b57<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5bf9<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u7167<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\uff0c<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u76db<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u8d5e<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background: white;\">\u6539\u9769\u5f00\u653e\u7855\u679c\u7d2f\u7d2f\uff0c\u5728\u5927\u6570\u636e\u80cc\u540e\uff0c\u8001\u767e\u59d3\u611f\u53d7\u5230\u751f\u6d3b\u6c34\u5e73\u7684\u63d0\u9ad8\u3002\u6211\u6b23\u8d4f\u4f5c\u8005\u6587\u7ae0\u7acb\u610f\uff0c\u6b4c\u9882\u6539\u9769\u5f00\u653e\u4f1f\u5927\u6210\u5c31\uff0c\u5f88\u6709\u6b63\u80fd\u91cf\u3002\u4f46\u540e\u9762\u9009\u53d6\u7684\u8fd9\u7ec4\u5bf9\u6bd4\u7d20\u6750\uff0c\u6211\u5c31\u89c9\u5f97\u83ab\u540d\u5176\u5999\u4e86\uff0c\u51e0\u5341\u5e74\u524d\u7684\u201c\u7ea2\u7f28\u67aa\u201d\u8ddf\u73b0\u5728\u7684\u201c\u6838\u6b66\u5668\u4ed3\u5e93\u201d\u600e\u4e48\u6bd4\u8f83\uff1f<\/SPAN><\/FONT><\/P>\n<p><font COLOR=\"#3D3E3C\"><span STYLE=\"text-indent: 2em; font-size: 16px;\">&nbsp;\u67d0<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u4ee5<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u4e3a\uff0c\u5c31\u8be5<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u6587<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u524d<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u9762<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u7684<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u94fa<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u57ab<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u800c<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u8a00\uff0c<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u8bba<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u8bc1\u6539\u9769\u5f00\u653e<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u7ed9\u8001\u767e\u59d3<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5e26<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u6765\u7684<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5b9e<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u60e0\uff0c<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u552f<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u6709<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u752838<\/SPAN><span STYLE=\"background-color: white; font-size: 16px; text-indent: 2em;\">\u5e74<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u524d<\/SPAN><span STYLE=\"background-color: white; font-size: 16px; text-indent: 2em;\">\u804c\u5de5\u5e73\u5747\u5de5\u8d44\u4e0e\u73b0\u5728\u7684\u804c\u5de5\u5e73\u5747\u5de5\u8d44\u76f8\u6bd4\u8f83\uff0c38<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5e74<\/SPAN><font STYLE=\"text-indent: 2em;\"><span STYLE=\"background-color: white; font-size: 16px; text-indent: 2em;\">\u524d\u90e8\u5206\u5546\u54c1\u7684\u4ef7\u683c\u4e0e\u73b0\u5728\u540c\u7c7b\u5546\u54c1\u4ef7\u683c<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u505a<\/SPAN><span STYLE=\"background-color: white; font-size: 16px; text-indent: 2em;\">\u6bd4\u8f83\uff0c\u4eba\u4eec\u624d\u4f1a\u89c9\u5f97<\/SPAN><\/FONT><span STYLE=\"text-indent: 2em; font-size: 16px; background-color: rgb(255, 255, 255);\">\u8d34<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5207<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u800c<\/SPAN><span STYLE=\"background-color: white; font-size: 16px; text-indent: 2em;\">\u4fe1<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u670d<\/SPAN><span STYLE=\"background-color: white; font-size: 16px; text-indent: 2em;\">\u3002\u90a3\u4e00\u5806<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5929<\/SPAN><span STYLE=\"background-color: white; font-size: 16px; text-indent: 2em;\">\u5927\u6570\u636e<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5c31<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u7b97<span STYLE=\"background-color: rgb(255, 255, 255);\">\u51c6\u786e<\/SPAN><\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\uff0c\u6050\u6015<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u4e5f<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u4e0d<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u662f<\/SPAN><span STYLE=\"background-color: white; font-size: 16px; text-indent: 2em;\">\u8001\u767e\u59d3\u80fd<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u4eb2<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u8eab<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background-color: rgb(255, 255, 255);\">\u4f53<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u9a8c<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5f97<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u51fa<\/SPAN><span STYLE=\"font-size: 16px; text-indent: 2em;\">\u7684\u3002<\/SPAN><\/FONT><\/P>\n<p STYLE=\"text-indent: 32px;\"><font COLOR=\"#3D3E3C\"><font STYLE=\"font-size: 16px;\" FACE=\"\u5e7c\u5706\"><span STYLE=\"background: white;\">\u6587\u7ae0<\/SPAN><\/FONT><font STYLE=\"font-size: 16px;\" FACE=\"\u5e7c\u5706\"><span STYLE=\"background: white;\">\u9700\u8981<\/SPAN><\/FONT><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u4e3b<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u65e8<\/SPAN><font STYLE=\"font-size: 16px;\" FACE=\"\u5e7c\u5706\"><span STYLE=\"background: white;\">\u80cc\u666f<\/SPAN><\/FONT><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u70d8<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u6258<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u70b9<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u67d3<\/SPAN><font FACE=\"\u5e7c\u5706\" STYLE=\"font-size: 16px;\"><span STYLE=\"background: white;\">\u3002\u8b6c\u5982\u6211\u53bb\u5317\u4eac\u529e\u4e8b\uff0c\u987a\u4fbf\u89c1\u4e86\u4e00\u4f4d\u535a\u53cb\uff0c\u8fd9\u4e8b\u8bfb\u8005<\/SPAN><\/FONT><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u4e0d<\/SPAN><font FACE=\"\u5e7c\u5706\" STYLE=\"font-size: 16px;\"><span STYLE=\"background: white;\">\u611f\u5174\u8da3\uff0c\u5173<\/SPAN><\/FONT><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u522b<\/SPAN><font FACE=\"\u5e7c\u5706\" STYLE=\"font-size: 16px;\"><span STYLE=\"background: white;\">\u4eba<\/SPAN><\/FONT><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u4ec0<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u4e48<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u4e8b<\/SPAN><span STYLE=\"text-indent: 2em; background-color: white; font-size: 16px;\">\uff1f\u4f46\u6211\u5199\u6210\u300a\u5356\u74dc\u59d1\u5a18\u300b\u5c31\u6709<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u53ef<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u8bfb<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u6027<\/SPAN><span STYLE=\"text-indent: 2em; background-color: white; font-size: 16px;\">\u4e86\uff0c\u5317\u4eac\u5c0f\u59d1\u5a18<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u62c9<\/SPAN><span STYLE=\"text-indent: 2em; background-color: white; font-size: 16px;\">\u7740\u9a6c\u8f66\u53bb<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u9655<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5317<\/SPAN><span STYLE=\"text-indent: 2em; background-color: white; font-size: 16px;\">\u5356\u897f\u74dc\u5f88\u6709\u770b\u70b9\uff0c\u5f53\u5e74\u77e5\u9752\u540e\u6765\u7684\u547d\u8fd0\u4e5f\u662f\u4eba\u4eec\u60f3\u77e5\u9053\u7684\u3002\u53c8\u5982\u6446\u5730\u644a\uff0c\u6709\u4ec0\u4e48\u7a00\u5947\uff0c\u8c01\u613f\u610f\u770b\u8fd9\u79cd\u62a5\u9053\uff1f\u4f46\u6211\u5199\u5168\u56fd\u52b3\u6a21\u6446\u5730\u644a\u5c31\u6709\u4eba\u770b\u4e86\uff0c\u4eba\u6c11\u65e5\u62a5\u52a0\u7f16\u8005\u6309\u53d1\u8868\uff0c\u56e0\u4e3a\u5b83\u6709<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u65f6<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u4ee3<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u7279<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5f81<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u548c<\/SPAN><span STYLE=\"text-indent: 2em; background-color: white; font-size: 16px;\">\u5bfc\u5411<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u6027<\/SPAN><span STYLE=\"background-color: white; font-size: 16px; text-indent: 2em;\">\u610f\u4e49\u3002<\/SPAN><\/FONT><\/P>\n<p STYLE=\"text-indent: 32px;\"><font COLOR=\"#3D3E3C\"><font STYLE=\"font-size: 16px;\" FACE=\"\u5e7c\u5706\"><span STYLE=\"background: white;\">\u6587\u7ae0<\/SPAN><\/FONT><span STYLE=\"background-color: white; font-size: 16px; text-indent: 2em;\">\u9700\u8981<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u7cbe<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5fc3<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u6311<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u9009<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u6070<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5f53<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u53d6<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u6750<\/SPAN><span STYLE=\"text-indent: 2em; background-color: white; font-size: 16px;\">\u3002<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u66fe<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u8bb0<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5f97<\/SPAN><span STYLE=\"text-indent: 2em; background-color: white; font-size: 16px;\">\u6539\u9769\u5f00\u653e\u4e8c\u5341\u5e74\u7684\u65f6\u5019\uff0c\u4eba\u6c11\u65e5\u62a5\u5411\u5168\u56fd\u53d1\u51fa<\/SPAN><span STYLE=\"text-indent: 2em; background-color: white; font-size: 16px;\">\u5f81\u7a3f<\/SPAN><span STYLE=\"text-indent: 2em; background-color: white; font-size: 16px;\">\u542f\u4e8b\u3002\u6539\u9769<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u4e8c<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5341<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5e74<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u53d8<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5316<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5de8<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5927\uff0c<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u6211<\/SPAN><span STYLE=\"text-indent: 2em; background-color: white; font-size: 16px;\">\u4e00<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u540d<\/SPAN><span STYLE=\"text-indent: 2em; background-color: white; font-size: 16px;\">\u57fa\u5c42\u5e72\u90e8<\/SPAN><span STYLE=\"text-indent: 2em; background-color: white; font-size: 16px;\">\u80fd<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background-color: rgb(255, 255, 255);\">\u6709<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u591a<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u9ad8<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u8fdc<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u7684<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5b8f<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u89c2<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u89c6<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u91ce<\/SPAN><span STYLE=\"text-indent: 2em; background-color: white; font-size: 16px;\">\uff1f<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u51b5<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u4e14<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u4f5c<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u6587<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u4e5f<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u4e0d\u5e94\u8be5\u9762\u9762\u4ff1\u5230\uff0c<\/SPAN><span STYLE=\"text-indent: 2em; background-color: white; font-size: 16px;\">\u90a3<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u53ea<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u80fd<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u4ece\u81ea\u5df1<\/SPAN><span STYLE=\"text-indent: 2em; background-color: white; font-size: 16px;\">\u8eab\u8fb9\u4e8b\u4e2d\u627e\u7d20\u6750\u3002\u6211\u628a\u6539\u9769\u5f00\u653e\u540e\u901a\u8baf\u5de5\u5177\u4e0e\u516d\u4e03\u5341\u5e74\u4ee3\u8fdb\u884c\u6bd4\u8f83\uff0c\u4e00\u7bc7\u300a\u7535\u8bdd\u68a6\u6210\u771f\u300b<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; background-color: rgb(255, 255, 255);\">\u5f88<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5feb<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u88ab<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u8be5<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u62a5<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u520a<\/SPAN><span STYLE=\"background-color: white; font-size: 16px; text-indent: 2em;\">\u767b\u3002\u56e0\u4e3a\u6211\u4e0d\u662f\u5199\u7684\u7a7a\u8bdd\u5927\u8bdd\uff0c\u6211\u662f\u7528\u5b9e\u5b9e\u5728\u5728\u7684\u4e8b\u4f8b\u6b4c\u9882\u793e\u4f1a\u8fdb\u6b65\u3002<\/SPAN><\/FONT><\/P>\n<p STYLE=\"text-indent: 32px;\"><font COLOR=\"#3D3E3C\"><span STYLE=\"font-family: \u5fae\u8f6f\u96c5\u9ed1, sans-serif; font-size: 12pt; text-indent: 2em;\">\n\u4ee5\u4e0a\u4e24\u4e2a\u89c2\u70b9\uff0c\u6211\u662f\u4ece\u65b0\u95fb\u5199\u4f5c\u5b66\u89c6\u89d2\u8bf4\u7684\u3002\u5e38\u89c1\u6709\u4eba\u53d1\u73b0\u522b\u4eba\u5199\u7684\u6587\u7ae0\u89c1\u8bf8\u5a92\u4f53\u5f88\u4e0d\u670d\u6c14\uff0c\u8bf4\u7c7b\u4f3c\u4e8b\u60c5\u6211\u4e5f\u5199\u8fc7\u554a\uff0c\u548b\u6ca1\u88ab\u9009\u7528\uff1f\u5176\u5b9e\uff0c\u95ee\u9898\u5728\u4e8e\u4f60\u6709\u6ca1\u6709\u4ece\u770b\u4f3c\u5e73\u5e38\u7684\u4e8b\u60c5\u4e2d\u6355\u6349<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\"><font FACE=\"\u5fae\u8f6f\u96c5\u9ed1, sans-serif\">\u5e76<\/FONT><\/SPAN><span STYLE=\"font-family: \u5fae\u8f6f\u96c5\u9ed1, sans-serif; font-size: 12pt; text-indent: 2em;\">\u8fd0\u7528\u95ea\u5149\u70b9\uff0c\u5728\u4e8e\u4f60\u6709\u6ca1\u6709\u5e94\u7528\u771f\u6b63\u53ef\u4ee5\u8bf4\u670d\u4eba\u3001\u6253\u52a8\u4eba\u7684\u7d20\u6750\uff0c\u5728\u4e8e\u8c0b\u7bc7\u5e03\u5c40\u662f\u5426<\/SPAN><\/FONT><span STYLE=\"text-indent: 2em; font-size: 16px;\"><font COLOR=\"#3D3E3C\" FACE=\"\u5fae\u8f6f\u96c5\u9ed1, sans-serif\">\u51fa<\/FONT><\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\"><font COLOR=\"#3D3E3C\" FACE=\"\u5fae\u8f6f\u96c5\u9ed1, sans-serif\">\u65b0<\/FONT><\/SPAN><span STYLE=\"text-indent: 2em; color: rgb(61, 62, 60); font-family: \u5fae\u8f6f\u96c5\u9ed1, sans-serif; font-size: 12pt;\">\u51fa\u5f69\u2014\u2014\u6709\u6ca1\u6709\u5199\u51fa\u4e0e\u4f17\u4e0d\u540c\u7684\u610f<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\"><font COLOR=\"#3D3E3C\" FACE=\"\u5fae\u8f6f\u96c5\u9ed1, sans-serif\">\u5883\u3001<\/FONT><\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\"><font COLOR=\"#3D3E3C\" FACE=\"\u5fae\u8f6f\u96c5\u9ed1, sans-serif\">\u9009<\/FONT><\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\"><font COLOR=\"#3D3E3C\" FACE=\"\u5fae\u8f6f\u96c5\u9ed1, sans-serif\">\u7528<\/FONT><\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\"><font COLOR=\"#3D3E3C\" FACE=\"\u5fae\u8f6f\u96c5\u9ed1, sans-serif\">\u6070<\/FONT><\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\"><font COLOR=\"#3D3E3C\" FACE=\"\u5fae\u8f6f\u96c5\u9ed1, sans-serif\">\u5f53<\/FONT><\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\"><font COLOR=\"#3D3E3C\" FACE=\"\u5fae\u8f6f\u96c5\u9ed1, sans-serif\">\u7684<\/FONT><\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\"><font COLOR=\"#3D3E3C\" FACE=\"\u5fae\u8f6f\u96c5\u9ed1, sans-serif\">\u7d20<\/FONT><\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\"><font COLOR=\"#3D3E3C\" FACE=\"\u5fae\u8f6f\u96c5\u9ed1, sans-serif\">\u6750\uff0c<\/FONT><\/SPAN><span STYLE=\"text-indent: 2em; color: rgb(61, 62, 60); font-family: \u5fae\u8f6f\u96c5\u9ed1, sans-serif; font-size: 12pt;\">\u80fd\u4e0d\u80fd\u4e00\u4e0b\u5b50\u5438\u5f15\u7f16\u8f91\u548c\u8bfb\u8005\u7684\u773c\u7403\u548c\u5fc3<\/SPAN><span STYLE=\"text-indent: 2em; color: rgb(61, 62, 60); font-size: 16px;\"><font FACE=\"\u5fae\u8f6f\u96c5\u9ed1, sans-serif\">\u7406<\/FONT><\/SPAN><span STYLE=\"text-indent: 2em; color: rgb(61, 62, 60); font-family: \u5fae\u8f6f\u96c5\u9ed1, sans-serif; font-size: 12pt;\">\u3002<\/SPAN><\/P>\n<p STYLE=\"text-indent: 32px;\"><font COLOR=\"#3D3E3C\"><font STYLE=\"font-size: 16px;\" FACE=\"\u5e7c\u5706\"><span STYLE=\"background: white;\">\u535a\u5ba2<\/SPAN><\/FONT><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u662f<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u4e00<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u79cd\u7fa4\u4f17<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u6587<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5316\uff0c<\/SPAN><span STYLE=\"background-color: white; font-size: 16px; text-indent: 2em;\">\u5927\u591a\u6570\u4eba<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u4e5f<\/SPAN><span STYLE=\"background-color: white; font-size: 16px; text-indent: 2em;\">\u5c31\u662f<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u60f3<\/SPAN><span STYLE=\"background-color: white; font-size: 16px; text-indent: 2em;\">\u8bf4\u4e2a\u4e8b\u3001\u53d1\u70b9\u611f\u6168<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\uff0c<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u4f3c<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u4e4e<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u65e0<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u9700<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u592a<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u8bb2<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u7a76\uff0c<\/SPAN><span STYLE=\"background-color: white; font-size: 16px; text-indent: 2em;\">\u4f46<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u6587<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u7ae0<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u610f<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5883<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u548c<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u9009<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u6750<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u8fd8<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u662f<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u5f97\u8003\u8651\u7684\u3002<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u6709<\/SPAN><span STYLE=\"text-indent: 2em; background-color: white; font-size: 16px;\">\u6545\u4e8b\u6c1b\u56f4\u3001<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u6709<\/SPAN><span STYLE=\"text-indent: 2em; background-color: white; font-size: 16px;\">\u4eba\u4eec<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u53ef<\/SPAN><span STYLE=\"text-indent: 2em; background-color: white; font-size: 16px;\">\u611f<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u53ef<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u53f9<\/SPAN><span STYLE=\"text-indent: 2em; background-color: white; font-size: 16px;\">\u7684<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u4e8b<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u7406<\/SPAN><span STYLE=\"text-indent: 2em; background-color: white; font-size: 16px;\">\uff0c\u624d\u4f1a\u5438\u5f15\u8bfb\u8005<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u800c<\/SPAN><span STYLE=\"text-indent: 2em; background-color: white; font-size: 16px;\">\u5f15<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px;\">\u53d1<\/SPAN><span STYLE=\"text-indent: 2em; background-color: white; font-size: 16px;\">\u5171\u9e23\u3002<\/SPAN><span STYLE=\"text-indent: 2em; font-size: 16px; font-family: \u5e7c\u5706;\">&nbsp;<\/SPAN><\/FONT><\/P>\n<p STYLE=\"text-indent: 32px;\"><font COLOR=\"#3D3E3C\"><br \/><\/FONT><\/P>\n<p STYLE=\"text-indent: 32px;\"><font COLOR=\"#3D3E3C\">&nbsp; &nbsp; &nbsp;\n&nbsp; &nbsp; &nbsp;\n&nbsp; &nbsp; &nbsp;\n&nbsp; &nbsp; &nbsp;\n&nbsp; &nbsp; &nbsp;\n&nbsp; &nbsp; &nbsp;\n&nbsp; &nbsp; &nbsp;\n&nbsp; &nbsp; &nbsp;\n&nbsp; &nbsp; &nbsp;\n&nbsp; &nbsp; &nbsp;\n&nbsp; &nbsp; &nbsp;\n&nbsp; &nbsp; &nbsp;\n&nbsp; &nbsp; &nbsp;\n&nbsp; &nbsp; &nbsp;\n&nbsp; &nbsp; &nbsp;\n&nbsp; &nbsp; &nbsp;\n&nbsp; &nbsp; &nbsp;\n&nbsp;<a HREF=\"http:\/\/photo.blog.sina.com.cn\/showpic.html#blogid=44de63be0102y5xt&url=http:\/\/album.sina.com.cn\/pic\/001gc2Syzy7pis4Tp50a2\" TARGET=\"_blank\"><img SRC=\"http:\/\/s3.sinaimg.cn\/small\/001gc2Syzy7pis4Tp50a2&amp;690\" NAME=\"image_operate_7181542538876820\"  ALT=\"\u535a\u6587\u5199\u4f5c\u7684\u610f\u5883\u4e0e\u9009\u6750\"  TITLE=\"\u535a\u6587\u5199\u4f5c\u7684\u610f\u5883\u4e0e\u9009\u6750\" \/><\/A><\/FONT><\/P>\n<p STYLE=\"text-indent: 32px;\"><font COLOR=\"#3D3E3C\"><br \/><\/FONT><\/P>\n<p STYLE=\"text-indent: 32px;\"><font COLOR=\"#3D3E3C\"><br \/><\/FONT><\/P>\n<p STYLE=\"text-indent: 32px;\"><font COLOR=\"#3D3E3C\">\u672c\u6587\u88ab\u9009\u7528\u5728\u65b0\u6d6a\u535a\u5ba2\u9996\u9875\u201c\u6587\u5b66\u201d\u9891\u9053&nbsp; &nbsp;\n&nbsp; &nbsp;2018.11.19&nbsp;\n&nbsp; &nbsp;\n&nbsp;\u8d23\u4efb\u7f16\u8f91\uff1a\u674e\u601d\u96e8&nbsp; &nbsp;\n&nbsp; &nbsp; &nbsp;\n&nbsp; &nbsp; &nbsp;\n&nbsp; &nbsp; &nbsp;\n&nbsp; &nbsp; &nbsp;\n&nbsp; &nbsp; &nbsp;\n&nbsp; &nbsp; 1<a HREF=\"http:\/\/photo.blog.sina.com.cn\/showpic.html#blogid=44de63be0102y5xt&url=http:\/\/album.sina.com.cn\/pic\/001gc2Syzy7pjAKNpuwe0\" TARGET=\"_blank\"><img SRC=\"http:\/\/s1.sinaimg.cn\/mw690\/001gc2Syzy7pjAKNpuwe0&amp;690\" WIDTH=\"662\" HEIGHT=\"210\" NAME=\"image_operate_26431542600679680\"  ALT=\"\u535a\u6587\u5199\u4f5c\u7684\u610f\u5883\u4e0e\u9009\u6750\"  TITLE=\"\u535a\u6587\u5199\u4f5c\u7684\u610f\u5883\u4e0e\u9009\u6750\" \/><\/A><\/FONT><\/P>\n<\/DIV>",
        "class_name": "\u706f\u4e0b\u6f2b\u7b14",
        "class_id": "4",
        "article_pubdate": "2018-11-18 19:45:00",
        "article_uppdate": "2018-11-22 17:25:40",
        "blog_uid": "1155425214",
        "user_nick": "\u6653\u821f\u540c\u5fd7",
        "allow_comment": "1",
        "article_tag": ["\u7f51\u53cb\u4e92\u52a8", "\u535a\u5ba2\u5199\u4f5c", "\u6539\u9769\u5f00\u653e", "\u610f\u5883", "\u968f\u7b14"],
        "article_read_num": "564",
        "comment_count": "97",
        "is_repost": 0,
        "allow_repost": 1,
        "is_secret": 0,
        "is_video": 0,
        "article_status": "1",
        "upload_pid": ["001gc2Syzy7pipXrXX2f0", "001gc2Syzy7pis4Tp50a2", "001gc2Syzy7pjAKNpuwe0"],
        "abstract": "\u5927\u96e8\u843d\u5e7d\u71d5\uff0c\u767d\u6d6a\u6ed4\u5929\uff0c\u79e6\u7687\u5c9b\u5916\u6253\u9c7c\u8239\u3002\u4e00\u7247\u6c6a\u6d0b\u90fd\u4e0d\u89c1\uff0c\u77e5\u5411\u8c01\u8fb9\uff1f \u5f80\u4e8b\u8d8a\u5343\u5e74\uff0c\u9b4f\u6b66\u6325\u97ad\uff0c\u4e1c\u4e34\u78a3\u77f3\u6709\u9057\u7bc7\u3002\u8427\u745f\u79cb\u98ce\u4eca\u53c8\u662f\uff0c\u6362\u4e86\u4eba\u95f4\u3002\u8fd9\u9996\u300a\u6d6a\u6dd8\u6c99\u00b7\u5317\u6234\u6cb3\u300b\uff0c\u6211\u5728\u5b66\u751f\u65f6\u4ee3\u5c31\u8bfb\u8fc7\u3002\u6bdb\u4e3b\u5e2d\u8fd9\u9996\u8bcd\uff0c\u610f\u5883\u9ad8\u8fdc\u6c14\u52bf",
        "serial_info": null,
        "is_attention": 0,
        "is_attention_by": 0,
        "is_module": 0,
        "is_favourite": 0,
        "vip_type": 0,
        "user_bgpic": "",
        "user_pic": "http:\/\/portrait7.sinaimg.cn\/1155425214\/blog\/180",
        "like_num": 57,
        "is_like": 0,
        "article_picurl": "001gc2Syzy7pipXrXX2f0,001gc2Syzy7pis4Tp50a2,001gc2Syzy7pjAKNpuwe0",
        "theme_info": [],
        "allow_deliver_times": 5,
        "had_deliver_times": 0
    },
    "msg": "\u83b7\u53d6\u6587\u7ae0\u6210\u529f",
    "duration": 770,
    "time_stamp": 1543196916
}
```

## 分析
首先我们的正文页中的内容，都在article_body字段中。这个东西是整体，我们同时又需要能知道a标签的href是具体跳转到哪里，另外还要考虑img标签的按需加载以及点击重新加载，或者点击展示客户端的控件。

## 首次粗暴的实现
这里定义了一个ArticleBody组件。
粗略实现如下：
```javascript
import './scss/index.scss';
import React,{PureComponent} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
//common2Native 代码块是用来请求native相关的操作
import { common2Native} from '../../interface/common';

class ArticleBody extends PureComponent{
    constructor(){
        super();
        this.tap = this.tap.bind(this);
        this.scrollFn = this.scrollFn.bind(this);
        this.countVideo = this.countVideo.bind(this);
        this.state = {
            onScrollFn:false
        };
    }
    render(){
        let {content,fontSize} = this.props;
        let fontClz = 'middle';
        switch(fontSize){
            case 1:
                fontClz = 'small';
                break;
            case 2:
                fontClz = 'middle';
                break;
            case 3:
                fontClz = 'large';
                break;
            case 4:
                fontClz = 'xlarge';
                break;
            default:
                fontClz = 'middle';
        }
        return (
            <article onClick={this.tap} className={'article-body ' + fontClz} dangerouslySetInnerHTML={{__html:content}}></article>
        );
    }
    componentDidMount(){
        if (!document.querySelectorAll('.unloaded') || document.querySelectorAll('.unloaded').length !== 0){
            this.scrollFn();
            window.addEventListener('scroll', this.scrollFn, false);
            this.setState({
                onScrollFn:true
            });
        }

        let videos = document.querySelectorAll('video');
        if(videos.length !== 0){
            for(let i = 0; i<videos.length; i++){
                videos[i].addEventListener('play',this.countVideo,false);
            }
        }
        
    }
    componentWillUnmount(){
        let { onScrollFn} = this.state;
        if (onScrollFn){
            window.removeEventListener('scroll',this.scrollFn);
        }

        let videos = document.querySelectorAll('video');
        if (videos.length !== 0) {
            for (let i = 0; i < videos.length; i++) {
                videos[i].removeEventListener('play', this.countVideo, false);
            }
        }
    }
    tap(e){
        e.preventDefault();
        e.stopPropagation();
        let el = e.target;
        let {tagName} = el;
        this.tapImg(el);
        if (tagName.toLocaleLowerCase() === 'a'){
            //处理跳转逻辑
            this.tapATag(el);
        }
    }
    countVideo(event){
        let el = event.target;
        //上报 用户播放video的统计
        if (el.dataset.ableCount - 0 === 1){
            //上报点击播放视频
            common2Native.countVideo({url:el.src});
            el.dataset.ableCount = 0;
        }
    }
    tapATag(el){
        let {href} = el;
        if(!href){
            return;
        }
        if ( href.indexOf('javascript:') != -1){
            return;
        }
        /**
         * 获取url参数对应的值
         * @param {*} url 地址
         * @param {*} obj 要获取的参数对象，eg，url: http://blog.sina.com.cn/?a=2233&b=23 传递{a:'',b:''},返回 {a:2233,b:23}
         */
        let getParams = (url,obj)=>{
            let paramsReg = /[?&]{1}([^=]*)=([^&]*)/g;
            let result;
            while (result = paramsReg.exec(url)){
                let [,paramKey,paramVal] = result;
                for(let key in obj){
                    if (key === paramKey){
                        obj[key] = paramVal || ''
                    }
                }
            }
            return obj;
        }
        try{
            //http://blog.sina.cn/dpool/blog/newblog/mblog/controllers/user.php?uid=1259295385
            if(/blog\.sina\.cn\/dpool\/blog\/newblog\/mblog\/controllers\/user\.php/.test(href)){
                //跳转到人。
                let data = getParams(href,{
                    'uid':''
                });
                common2Native.jump2Native({
                    type:'user',
                    data
                });
            }else if(/blog\.sina\.cn\/dpool\/blog\/newblog\/mblog\/controllers\/articletopic\.php/.test(href)){
                //跳转到主题
                //http://blog.sina.cn/dpool/blog/newblog/mblog/controllers/articletopic.php?topicId=41879f3321000063
                let data = getParams(href, {
                    'topicId': ''
                });
                common2Native.jump2Native({
                    type:'topic',
                    data:{
                        channelId: data.topicId
                    }
                });
            }else if(/blog\.sina\.cn\/dpool\/blog\/newblog\/mblog\/controllers\/articleserial.php/.test(href)){
                //连载详情
                //http://blog.sina.cn/dpool/blog/newblog/mblog/controllers/articleserial.php?blog_uid=1566335543&class_id=16
                let data = getParams(href, {
                    blog_uid:'',
                    class_id:''
                });
                common2Native.jump2Native({
                    type:'serial',
                    data:{
                        classId: data.class_id,
                        uid: data.blog_uid
                    }
                });
            } else if (/blog\.sina\.cn\/dpool\/blog\/s\/blog_/.test(href) || /blog\.sina\.com\.cn\/s\/blog_/.test(href)){
                //博文正文页面
                //http://blog.sina.cn/dpool/blog/s/blog_475bc9a50102y18v.html?cre=blogpagew&mod=f&loc=2&r=0&doct=0&rfunc=99&tj=none
                let reg = /blog_([^\.]*)/;
                let articleId = reg.exec(href)[1];
                common2Native.jump2Native({
                    type:'article',
                    data:{
                        articleId
                    }
                })
            } else if(/blog\.sina\.cn\/dpool\/blog\/u\//.test(href) || /blog\.sina\.com\.cn\/u\//.test(href)){
                //个人页面
                //http://blog.sina.cn/dpool/blog/u/1197197733#type=-1
                let reg = /u\/(\d+)/;
                let uid = reg.exec(href)[1];
                common2Native.jump2Native({
                    type:'user',
                    data:{
                        uid
                    }
                });
            } else {
                common2Native.jump2Native({
                    type:'webview',
                    data:{
                        url:href
                    }
                })
            }
        }catch(e){
            //如果解析过程中发生错误， 直接采用webview的方式打开
            console.log(e.stack);
            common2Native.jump2Native({
                type: 'webview',
                data: {
                    url: href
                }
            })
        }
    }

    tapImg(el){
        let { bodyImgList } = this.props;
        //重新加载 或者是点击呼唤起来app浏览图片页面
        if (el.className.indexOf('reload') != -1) {
            //点击的重新加载图片
            this.loadImg(el);
            return;
        }
        if (el.className.indexOf('able-tap-img') != -1) {
            let orgUrl = decodeURIComponent(el.dataset.src);
            // call native view pic 
            let index = bodyImgList.findIndex((val) => {
                return val === orgUrl;
            })
            common2Native.showNativeImgViewer(index, bodyImgList.toJS());
        }
    }

    scrollFn(){
        let listImg = document.querySelectorAll('.unloaded');
        if (!listImg || listImg.length === 0){
            return;
        }
        let offsetScroll = document.body.scrollTop + document.documentElement.scrollTop;
        let offset = 500;
        //低版本的android webview 没有实现nodelist对象的syobol对象
        for (let i = 0; i < listImg.length; i++){
            let el = listImg[i];
            if (el.offsetTop < offsetScroll + offset + window.innerHeight){
                el.className = 'loading-img';
                //请求native 缓存组件加载图片
                this.loadImg(el);        
            }
        }
    }
    loadImg(el){
        let realSrc = decodeURIComponent(el.dataset.src);
        let {articleWidth} = this.props;
        common2Native.loadImg(realSrc).then((localUrl)=>{
            el.className = 'able-tap-img';
            el.src = localUrl;
            //是pc的正常图片的
            if(el.dataset.type === 'pc'){
                let img = new Image();
                img.onload = ()=>{
                    //低于50 * 50 的图片剧中，原图大小展示， 高于这个尺寸的， 直接满屏幕拉满！
                    if(img.width >= getComputedStyle(document.documentElement).fontSize.replace('px','') * articleWidth || (img.width>50 && img.height > 50)){
                        el.style.width = articleWidth + 'rem';
                        el.style.height = 'auto';
                    }else{
                        el.style.width = 'auto';
                        el.style.height = 'auto';
                    }
                    img.onload = null;
                    img = null;
                }
                img.src = localUrl;
                
            }
        },()=>{
            //下载失败，展示点击下载图片
            el.className = 'reload'
        });
    }
}
ArticleBody.proptypes = {
    content: PropTypes.string.isRequired,
    fontSize: PropTypes.number.isRequired,
    bodyImgList: PropTypes.array.isRequired,
    articleWidth: PropTypes.number.isRequired
}
// function mapStateToProps(state){
//     let {article} = state;
//     // let {body,fontSize} = article.toJS();
//     return {
//         content: article.get('body'),
//         fontSize: article.get('fontSize'),
//         bodyImgList: article.get('bodyImgList')
//     };
// }
// function mapDispatchToProps(dispatch){
//     return {};
// }
// export default connect(mapStateToProps, mapDispatchToProps)(ArticleBody);
export default ArticleBody;

```


分析上述代码：

1. constructor 函数中，初始化了滚动的状态。
2. componentDidMount 函数中，我们注册了window.onscroll函数，以及video的播放事件，用于上报统计。
3. 监听了click事件。然后让事件根据e.target的不同类型， 分发到不同的函数处理对应的业务逻辑。

整体的逻辑， 我们就都写在了这个组件内了。

错没有大错。但是前一阵子听闻了我们的产品，要强化video的交互工作，比方说，播放的视频滚动出可视区域后， 我们将期关闭播放！

我这一听，大惊失色啊！我现在代码，在往下写下去。会有问题的啊。不够方便维护啊！有没有什么方案来将图片处理逻辑，a标签的处理逻辑以及video的标签的处理逻辑分离那！这样我们的维护将会大大的方便了！

有！就是react的hoc。我们接下来分析。

# hoc
## hoc 是什么
**hoc 分离逻辑以及封装通用逻辑。(本质上是装饰着设计模式的一种实现)**

## 新的hoc后的代码
hoc
```javascript
import React, {
    Component
} from 'react';
/**
 * 正文页内容高阶组件，用于处理正文当中的a标签，video标签，以及img标签等。 将不同的标签分开进行处理，方便后期对不同的标签维护升级！
 * @param {*} opt 
 */
export default function articleProcessHoc(opt) {
    let isMove = false;
    return (WrappedComponent) => {
        if(opt.init){
            opt.init();
        }
        return class ArticleProcessed extends Component {
            constructor() {
                super();
                // this.click = this.click.bind(this);
                this.touchStart = this.touchStart.bind(this);
                this.touchMove = this.touchMove.bind(this);
                this.touchEnd = this.touchEnd.bind(this);
            }
            UNSAFE_componentWillUpdate(nextProps, nextState){
                opt.setProps(nextProps);
            }
            componentDidMount(){
                opt.setProps(this.props);
                if(opt.didMount){
                    opt.didMount();
                }
            }
            componentWillUnmount(){
                if(opt.willUnmount){
                    opt.willUnmount(this.props);
                }
            }
            touchStart(e) {
                isMove = false;
            }
            touchMove() {
                isMove = true;
            }
            touchEnd(e) {
                if (!isMove) {
                    opt.tap(e,this.props);
                }
            }
            // click() {

            // }
            render() {
                let {
                    onTouchStart,
                    onTouchMove,
                    onTouchEnd,
                    // onClick
                } = this.props;
                let props = {
                    onTouchStart: !onTouchStart ? this.touchStart : (e)=>{
                        this.touchStart(e);
                        onTouchStart(e);
                    },
                    onTouchMove: !onTouchMove ? this.touchMove : (e)=>{
                        this.touchMove(e);
                        onTouchMove(e);
                    },
                    onTouchEnd: !onTouchEnd ? this.touchEnd : (e)=>{
                        this.touchEnd(e);
                        onTouchEnd(e);
                    },
                    // onClick: !onClick ? this.click : (e)=>{
                    //     this.click(e);
                    //     onClick(e);
                    // },
                    // TODO: style以及class的样式穿透调整
                    style: {
                        ...this.props.style
                    }
                };
                return React.cloneElement( <WrappedComponent/> , { ...this.props, ...props});
            }
        }
    }
}

```

核心通过 **React.cloneElement** api来复制了 wrappedComponent组件。同时将props对象传递到，新的组件上。

在看这个articleProcessHoc 方法， 该方法是返回了一个function，这样我们可以在这个function中去做我们的业务需求。

比方说，这里我将touch一系列的事件劫持了，这样，我们可以模拟初来一个tap事件，解决click的延迟执行的问题。

注意这里的写法
```javascript
let props = {
    onTouchStart: !onTouchStart ? this.touchStart : (e)=>{
        this.touchStart(e);
        onTouchStart(e);
    },
    onTouchMove: !onTouchMove ? this.touchMove : (e)=>{
        this.touchMove(e);
        onTouchMove(e);
    },
    onTouchEnd: !onTouchEnd ? this.touchEnd : (e)=>{
        this.touchEnd(e);
        onTouchEnd(e);
    },
    // onClick: !onClick ? this.click : (e)=>{
    //     this.click(e);
    //     onClick(e);
    // },
    // TODO: style以及class的样式穿透调整
    style: {
        ...this.props.style
    }
}; 
```
因为事件是采用react的事件机制，所以在多个高阶组件串联的时候， 我们需要将之前的事件也一样进行派发出去，否则后来的高阶组件的事件会将之前的事件覆盖掉。

因为我们对react的生命周期也有需求，所以我们也同样劫持了react的生命周期函数。该函数会进行对应的事件派发。

还有一个地方，我们需要用到props相关的属性， 这个时候我在UNSAFE_componentWillUpdate 以及 componentDidMount 将props重新赋值了回去。方便在我们抽离出来的逻辑中进行操作。


使用：

视频播放统计逻辑
```javascript
import articleProcessHoc from './hoc';
import BaseOpt from './base-opt';
import { common2Native } from '../../interface/common';

class VideoHandler extends BaseOpt {
    constructor(){
        super();
        this.countVideo = this.countVideo.bind(this);
    }
    didMount() {
        // 挂载事件
        let videos = document.querySelectorAll('video');
        if (videos.length !== 0) {
            for (let i = 0; i < videos.length; i++) {
                videos[i].addEventListener('play', this.countVideo, false);
            }
        }
    }
    willUnmount() {
        // 卸载事件
        let videos = document.querySelectorAll('video');
        if (videos.length !== 0) {
            for (let i = 0; i < videos.length; i++) {
                videos[i].removeEventListener('play', this.countVideo, false);
            }
        }
    }
    countVideo(event) {
        let el = event.target;
        //上报 用户播放video的统计
        if (el.dataset.ableCount - 0 === 1) {
            //上报点击播放视频
            common2Native.countVideo({ url: el.src });
            el.dataset.ableCount = 0;
        }
    }
}

const articleVideoProcess = articleProcessHoc(new VideoHandler());

export default articleVideoProcess;

```
高阶函数的使用：
```javascript
    let Comp = articleVideoProcess(WrapperedComponent);
    //然后直接在render中进行使用<Comp {...props}></Comp> 就可以了
```
参数上， 我们将主要的业务组件放进去， 这样我们的video相关的代码就被剥离出来了

如上，我们仅仅是剥离了我们的视频业务代码。 那么其他的怎么办那？

要是能够这么写就清晰多了：

```javascript
import articleImgProcess from '../article-process/img';
import articleVideoProcess from '../article-process/video';
import articleATagProcess from '../article-process/a-tag';

import hocConnect from '../../../lib/kit/util/hoc-connect';
// 正文页内容处理， 图片处理， 视频处理， a标签的处理！
let ArticleContent = hocConnect(articleImgProcess, articleVideoProcess, articleATagProcess)(ArticleBody);
```

那么怎么做那：

如下我们来看一下hocConnect的代码：
```javascript
export default function hocConnect(){
    let args = Array.prototype.slice.call(arguments);
    return (WrapperedComment)=>{
        let tmpComment = WrapperedComment;
        for(let i = 0; i<args.length; i++){
            tmpComment = args[i](tmpComment);
        }
        return tmpComment;
    }
}
```
这个代码做了什么那， 就是将articleImgProcess(ArticleBody)运行的结果，放在articleVideoProcess函数中运行，之后在放在articleATagProcess中进行运行。

上述的hocConnect实际上是可以翻译成的结果如下：

*articleATagProcess(articleVideoProcess(articleImgProcess(ArticleBody)))*

不过这样不好看，我们采用上述的方式将其拉平！

至此我们一个能够分解功能逻辑，公用代码的hoc就完成了。

当然这个并不是一个标准的hoc，这个有点变种了，相当于，做了一次串联操作，方便我们的功能拆分，以及代码的维护。


## 注意事项
因为hoc每次返回的都是一个新的组件，因此尽量不要在render中返回，这样的话，会每次都重新渲染新的对象。

应该在静态的位置去生成这个新的组件，比方说在import其他资源的下方位置。

eg:

```javascript
import articleImgProcess from '../article-process/img';
import articleVideoProcess from '../article-process/video';
import articleATagProcess from '../article-process/a-tag';

import hocConnect from '../../../lib/kit/util/hoc-connect';
// 正文页内容处理， 图片处理， 视频处理， a标签的处理！
let ArticleContent = hocConnect(articleImgProcess, articleVideoProcess, articleATagProcess)(ArticleBody);
class BaseWrapper extends Component{
    render(){
        return (<ArticleContent/>);
    }
}
```

参考文献：

[深入理解React 高阶组件](http://www.voidcn.com/article/p-axmxqahg-bmq.html)

[Higher-Order Components](https://reactjs.org/docs/higher-order-components.html)


