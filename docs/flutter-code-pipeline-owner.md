# RendererBinding & pipelineOwner

pipelineOwner 负责 ui layout相关操作。


## RendererBinding

```dart
void initInstances() {
    super.initInstances();
    _instance = this;
    // 初始化PipelineOwner
    _pipelineOwner = PipelineOwner(
        /// onNeedVisualUpdate 在渲染的最后阶段会被调用，用来通知引擎。最终调用的是scheduleFrame 用来生成下一帧
      onNeedVisualUpdate: ensureVisualUpdate,
      onSemanticsOwnerCreated: _handleSemanticsOwnerCreated,
      onSemanticsOwnerDisposed: _handleSemanticsOwnerDisposed,
    );
    // window上挂在方法
    window
      ..onMetricsChanged = handleMetricsChanged
      ..onTextScaleFactorChanged = handleTextScaleFactorChanged
      ..onPlatformBrightnessChanged = handlePlatformBrightnessChanged
      ..onSemanticsEnabledChanged = _handleSemanticsEnabledChanged
      ..onSemanticsAction = _handleSemanticsAction;
    // 给他 root RenderObject 初始化 renderView对象。 规定了root的渲染画布的大小等信息
    initRenderView();
    _handleSemanticsEnabledChanged();
    assert(renderView != null);
    addPersistentFrameCallback(_handlePersistentFrameCallback);
    initMouseTracker();
    if (kIsWeb) {
      addPostFrameCallback(_handleWebFirstFrame);
    }
  }


  /// Creates a [RenderView] object to be the root of the
  /// [RenderObject] rendering tree, and initializes it so that it
  /// will be rendered when the next frame is requested.
  ///
  /// Called automatically when the binding is created.
  void initRenderView() {
    /// 调用了 下面的 set renderView 方法 从而给 pipeOwner 设置了 rootNode
    renderView = RenderView(configuration: createViewConfiguration(), window: window);
    // 开始调用pipelineOwner 进行渲染操作
    renderView.prepareInitialFrame();
  }
  
  /// 给 piplieOwner 设置 rootNode
  set renderView(RenderView value) {
    assert(value != null);
    _pipelineOwner.rootNode = value;
  }

```


`类RendererBinding`中将会初始化**PipelineOwner** 
以及通过方法**initRenderView()**初始化rootView的可视区域的大小 ，并且开始rootView的渲染操作。


## RenderView 类
```dart 
  /// Bootstrap the rendering pipeline by preparing the first frame.
  ///
  /// This should only be called once, and must be called before changing
  /// [configuration]. It is typically called immediately after calling the
  /// constructor.
  ///
  /// This does not actually schedule the first frame. Call
  /// [PipelineOwner.requestVisualUpdate] on [owner] to do that.
  void prepareInitialFrame() {
    scheduleInitialLayout();
    scheduleInitialPaint(_updateMatricesAndCreateNewRootLayer());
  }
```

**scheduleInitialLayout**方法 将会调用 PipelineOwner 将RenderObject标记为脏，等待下一帧进行重新渲染。

```dart
/// Bootstrap the rendering pipeline by scheduling the very first layout.
  ///
  /// Requires this render object to be attached and that this render object
  /// is the root of the render tree.
  ///
  /// See [RenderView] for an example of how this function is used.
  void scheduleInitialLayout() {
    _relayoutBoundary = this;
    owner!._nodesNeedingLayout.add(this);
  }
```


## PipelineOwner

```dart
class PipelineOwner {
  /// Creates a pipeline owner.
  ///
  /// Typically created by the binding (e.g., [RendererBinding]), but can be
  /// created separately from the binding to drive off-screen render objects
  /// through the rendering pipeline.
  PipelineOwner({
    this.onNeedVisualUpdate,
    this.onSemanticsOwnerCreated,
    this.onSemanticsOwnerDisposed,
  });
  /// 等待重新layout的队列
  List<RenderObject> _nodesNeedingLayout = <RenderObject>[];
  
  /// 设立根结点。
  set rootNode(AbstractNode? value) {
    if (_rootNode == value)
      return;
    _rootNode?.detach();
    _rootNode = value;
    _rootNode?.attach(this);
  }

  /// 更新renderObject 操作。
  void flushLayout() {
    if (!kReleaseMode) {
      Timeline.startSync('Layout', arguments: timelineArgumentsIndicatingLandmarkEvent);
    }
    
    try {
      // TODO(ianh): assert that we're not allowing previously dirty nodes to redirty themselves
      // 判断_nodesNeedingLayout队列非空的情况下 执行layout操作。
      while (_nodesNeedingLayout.isNotEmpty) {
        final List<RenderObject> dirtyNodes = _nodesNeedingLayout;
        _nodesNeedingLayout = <RenderObject>[];
        for (final RenderObject node in dirtyNodes..sort((RenderObject a, RenderObject b) => a.depth - b.depth)) {
          if (node._needsLayout && node.owner == this)
            node._layoutWithoutResize();
        }
      }
    } finally {
      if (!kReleaseMode) {
        Timeline.finishSync();
      }
    }
  }

  void flushPaint() {
    if (!kReleaseMode) {
      Timeline.startSync('Paint', arguments: timelineArgumentsIndicatingLandmarkEvent);
    }
    try {
      final List<RenderObject> dirtyNodes = _nodesNeedingPaint;
      _nodesNeedingPaint = <RenderObject>[];
      // Sort the dirty nodes in reverse order (deepest first).
      for (final RenderObject node in dirtyNodes..sort((RenderObject a, RenderObject b) => b.depth - a.depth)) {
        if (node._needsPaint && node.owner == this) {
          if (node._layer!.attached) {
            PaintingContext.repaintCompositedChild(node);
          } else {
            node._skippedPaintingOnLayer();
          }
        }
      }
      assert(_nodesNeedingPaint.isEmpty);
    } finally {
      assert(() {
        _debugDoingPaint = false;
        return true;
      }());
      if (!kReleaseMode) {
        Timeline.finishSync();
      }
    }
  }


}


```

pipelineOwner 负责 ui layout相关操作。

pipelineOwner 核心方法：
1. flushLayout 将所有被标记为dirty的RenderObject 进行重新layout
2. flushCompositingBits 
3. flushPaint 
4. flushSemantics 语义话相关的东西


RenderObject 核心标记方法【执行顺序也是如下】：
1. markNeedsLayout 标记需要进行layout【尺寸变换的】
2. markNeedsCompositingBitsUpdate 标记合成层是脏的[当子树发生了改变的时候]
3. markNeedsPaint 标记RenderObject 已经更改了视觉外观
4. markNeedsSemanticsUpdate

其中 RenderObject 上述4个方法执行结束后 均会调用 **ensureVisualUpdate** 方法，该方法，底层调用的 **window.scheduleFrame()** 方法 ，用来生成新的下一帧。

同时**SchedulerBinding.scheduleFrame**方法，会被硬件Vsync信号，通知到引擎，然后引擎会来调用这个方法，来进行页面的刷新绘制。

