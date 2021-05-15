# flutter 源码分析

## runApp 方法中都干了什么事情
```dart
void runApp(Widget app) {
  WidgetsFlutterBinding.ensureInitialized()
    ..attachRootWidget(app)
    ..scheduleWarmUpFrame();
}
/// WidgetsFlutterBinding 包含了 如下相关操作
class WidgetsFlutterBinding extends BindingBase
    with
        GestureBinding, // 手势
        ServicesBinding, // 消息处理
        SchedulerBinding, // 调度引擎 关于帧的刷新相关
        PaintingBinding, //  图片缓存相关
        SemanticsBinding,
        RendererBinding, // 渲染树相关，最后会给引擎进行渲染 PipelineOwner【重点 处理RenderObjectTree 与 RendererBinding之间的关系（脏RenderObject 渲染）】,同时给window上挂在一些对象。
        WidgetsBinding { //WidgetsBinding中最重要的是初始化 BuildOwner 用来管理Element的状态变化。
  /// Returns an instance of the [WidgetsBinding], creating and
  /// initializing it if necessary. If one is created, it will be a
  /// [WidgetsFlutterBinding]. If one was previously initialized, then
  /// it will at least implement [WidgetsBinding].
  ///
  /// You only need to call this method if you need the binding to be
  /// initialized before calling [runApp].
  ///
  /// In the `flutter_test` framework, [testWidgets] initializes the
  /// binding instance to a [TestWidgetsFlutterBinding], not a
  /// [WidgetsFlutterBinding].
  static WidgetsBinding ensureInitialized() {
    if (WidgetsBinding.instance == null) WidgetsFlutterBinding();
    return WidgetsBinding.instance;
  }
}

```

`runApp`方法，将会给初始化引擎，调度，图片缓存，手势等方法以及实例。

初始化后`attachRootWidget`方法


```dart
  /// rootWidget 是 runApp传进来的Widget对象。 
  void attachRootWidget(Widget rootWidget) {
    _readyToProduceFrames = true;
    // 注意这里。
    _renderViewElement = RenderObjectToWidgetAdapter<RenderBox>(
      container: renderView, // pipeline owner中 持有的RenderView 对象。
      debugShortDescription: '[root]',
      child: rootWidget,
    ).attachToRenderTree(buildOwner!, renderViewElement as RenderObjectToWidgetElement<RenderBox>?;
  }

```


RenderObjectToWidgetAdapter 对象。

```dart
  /// 其中 RenderObjectWidget 是抽象类，最终继承的是Widget 对象。
  /// Widget中包含 createElemnt方法 需要子类进行实现。
  /// abstract class RenderObjectWidget extends Widget
  class RenderObjectToWidgetAdapter<T extends RenderObject> extends RenderObjectWidget {
    RenderObjectToWidgetAdapter({
      this.child,
      required this.container,
      this.debugShortDescription,
    }) : super(key: GlobalObjectKey(container));

    @override
    RenderObjectToWidgetElement<T> createElement() => RenderObjectToWidgetElement<T>(this);

    @override
    RenderObjectWithChildMixin<T> createRenderObject(BuildContext context) => container;

    // 注意这里， 在最后 attachRootWidget方法后调用该对象的  attachToRenderTree 方法，并且传入了BuildOwner对象，以及根element对象。
    RenderObjectToWidgetElement<T> attachToRenderTree(BuildOwner owner, [  RenderObjectToWidgetElement<T>? element ]) {
      /// 在element为空的情况下去创建这个element
      if (element == null) {
        owner.lockState(() {
          element = createElement();
          element!.assignOwner(owner);
        });
        /// buildScope方法，会将__dirtyElementList中的内容都flush出去
        owner.buildScope(element!, () {
          /// 挂载插入child 会执行_rebuild方法，之后执行updateChild方法进行更新Element的child
          element!.mount(null, null);
        });
        // This is most likely the first time the framework is ready to produce
        // a frame. Ensure that we are asked for one.
        SchedulerBinding.instance!.ensureVisualUpdate();
      } else {
        /// 标记当前的widget为新，并且标记 element 为脏需要进行更新操作
        element._newWidget = this;
        element.markNeedsBuild();
      }
      return element!;
    }
  }

```

后续详情看element章节 以及 buildOwner章节。



`scheduleWarmUpFrame` 尽快进行首次渲染操作。 而不是等待Vsync信号。

