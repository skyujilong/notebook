# BuildOwner & WidgetsBinding & SchedulerBinding

## WidgetsBinding widget tree -> element tree -> renderObject tree 

刷新流程核心

```dart
  // widgets对象 与 引擎的关联对象。
  // The glue between the widgets layer and the Flutter engine.
  mixin WidgetsBinding
    on
        BindingBase,
        ServicesBinding,
        SchedulerBinding,
        GestureBinding,
        RendererBinding,
        SemanticsBinding {

    @override
    void initInstances() {
      super.initInstances();
      _instance = this;

      // Initialization of [_buildOwner] has to be done after
      // [super.initInstances] is called, as it requires [ServicesBinding] to
      // properly setup the [defaultBinaryMessenger] instance.

      // 初始化buildOwner对象 element状态管理对象
      _buildOwner = BuildOwner();
      buildOwner!.onBuildScheduled = _handleBuildScheduled;
      window.onLocaleChanged = handleLocaleChanged;
      window.onAccessibilityFeaturesChanged = handleAccessibilityFeaturesChanged;
      SystemChannels.navigation.setMethodCallHandler(_handleNavigationInvocation);
      FlutterErrorDetails.propertiesTransformers.add(transformDebugCreator);
    }

    @override
    void drawFrame() {

      TimingsCallback? firstFrameCallback;
      if (_needToReportFirstFrame) {

        firstFrameCallback = (List<FrameTiming> timings) {
          if (!kReleaseMode) {
            developer.Timeline.instantSync('Rasterized first useful frame');
            developer.postEvent('Flutter.FirstFrame', <String, dynamic>{});
          }
          SchedulerBinding.instance!.removeTimingsCallback(firstFrameCallback!);
          firstFrameCallback = null;
          _firstFrameCompleter.complete();
        };
        // Callback is only invoked when FlutterView.render is called. When
        // sendFramesToEngine is set to false during the frame, it will not be
        // called and we need to remove the callback (see below).
        SchedulerBinding.instance!.addTimingsCallback(firstFrameCallback!);
      }

      try {
        /// 核心方法，调用了buildOwner的 buildScope方法去遍历刷新dirtyElements
        if (renderViewElement != null) buildOwner!.buildScope(renderViewElement!);
        /// pipelineOwner开始刷新对应dirty的renderObject对象
        super.drawFrame();
        /// 最终清理 dispose的相关elements
        buildOwner!.finalizeTree();
      } finally {

      }
      if (!kReleaseMode) {
        if (_needToReportFirstFrame && sendFramesToEngine) {
          developer.Timeline.instantSync('Widgets built first useful frame');
        }
      }
      _needToReportFirstFrame = false;
      if (firstFrameCallback != null && !sendFramesToEngine) {
        // This frame is deferred and not the first frame sent to the engine that
        // should be reported.
        _needToReportFirstFrame = true;
        SchedulerBinding.instance!.removeTimingsCallback(firstFrameCallback!);
      }
    }

    /// rootWidget对象 对应的element
    Element? get renderViewElement => _renderViewElement;
    Element? _renderViewElement;      
  }

```


### WidgetsBinding.drawFrame 方法

该方法是核心的方法，engine会在每帧刷新的时候调用该方法。

engine的执行流程如下：

1. 动画执行阶段，在handleBeginFrame方法，该方法在drawFrame之前执行。
2. Microtasks阶段
3. 执行drawFrame, rebuild dirtyElements & rebuild dirty renderObject
4. 渲染阶段【合成光栅等】，将渲染相关的数据发送给渲染引擎。
5. dispose 一些 删除的element元素
6. 执行addPostFrameCallback回调函数

上述过程执行完成一次就刷新了一次新帧。


## BuildOwner widget的管理者

```dart
class BuildOwner {
  final _InactiveElements _inactiveElements = _InactiveElements();
  /// 脏element队列
  final List<Element> _dirtyElements = <Element>[];
  
  /// 将elemnt对象放入脏element队列
  void scheduleBuildFor(Element element) {
    if (element._inDirtyList) {
      _dirtyElementsNeedsResorting = true;
      return;
    }
    if (!_scheduledFlushDirtyElements && onBuildScheduled != null) {
      _scheduledFlushDirtyElements = true;
      onBuildScheduled!();
    }
    _dirtyElements.add(element);
    element._inDirtyList = true;
  }

  /// 核心方法， 将dirtyElement重新build, 会被engine每一帧drawFrame调用
  void buildScope(Element context, [ VoidCallback? callback ]) {
    if (callback == null && _dirtyElements.isEmpty)
      return;
    Timeline.startSync('Build', arguments: timelineArgumentsIndicatingLandmarkEvent);
    try {
      _scheduledFlushDirtyElements = true;
      if (callback != null) {
        Element? debugPreviousBuildTarget;
        _dirtyElementsNeedsResorting = false;
        try {
          callback();
        } finally {
        }
      }
      _dirtyElements.sort(Element._sort);
      _dirtyElementsNeedsResorting = false;
      int dirtyCount = _dirtyElements.length;
      int index = 0;
      while (index < dirtyCount) {
        try {
          _dirtyElements[index].rebuild();
        } catch (e, stack) {
        }
        index += 1;
        if (dirtyCount < _dirtyElements.length || _dirtyElementsNeedsResorting!) {
          _dirtyElements.sort(Element._sort);
          _dirtyElementsNeedsResorting = false;
          dirtyCount = _dirtyElements.length;
          while (index > 0 && _dirtyElements[index - 1].dirty) {
            // It is possible for previously dirty but inactive widgets to move right in the list.
            // We therefore have to move the index left in the list to account for this.
            // We don't know how many could have moved. However, we do know that the only possible
            // change to the list is that nodes that were previously to the left of the index have
            // now moved to be to the right of the right-most cleaned node, and we do know that
            // all the clean nodes were to the left of the index. So we move the index left
            // until just after the right-most clean node.
            index -= 1;
          }
        }
      }
    } finally {
      for (final Element element in _dirtyElements) {
        assert(element._inDirtyList);
        element._inDirtyList = false;
      }
      _dirtyElements.clear();
      _scheduledFlushDirtyElements = false;
      _dirtyElementsNeedsResorting = null;
      Timeline.finishSync();
    }
  }

  /// 处理dispose的element对象
  void finalizeTree() {
    Timeline.startSync('Finalize tree', arguments: timelineArgumentsIndicatingLandmarkEvent);
    try {
      lockState(() {
        _inactiveElements._unmountAll(); // this unregisters the GlobalKeys
      });
    } catch (e, stack) {
    } finally {
      Timeline.finishSync();
    }
  }
}

```