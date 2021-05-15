# Element 对象分析

接着 上文 flutter-code runApp方法进行后续分析

## RenderObjectToWidgetElement 对象 rootElement对应

```dart 
/// RootRenderObjectElement 是抽象类 继承 RenderObjectElement 而 RenderObjectElement 继承自 Element对象
class RenderObjectToWidgetElement<T extends RenderObject> extends RootRenderObjectElement {
  /// Creates an element that is hosted by a [RenderObject].
  ///
  /// The [RenderObject] created by this element is not automatically set as a
  /// child of the hosting [RenderObject]. To actually attach this element to
  /// the render tree, call [RenderObjectToWidgetAdapter.attachToRenderTree].
  RenderObjectToWidgetElement(RenderObjectToWidgetAdapter<T> widget) : super(widget);

  @override
  RenderObjectToWidgetAdapter<T> get widget => super.widget as RenderObjectToWidgetAdapter<T>;

  Element? _child;

  static const Object _rootChildSlot = Object();

  @override
  void visitChildren(ElementVisitor visitor) {
    if (_child != null)
      visitor(_child!);
  }

  @override
  void forgetChild(Element child) {
    assert(child == _child);
    _child = null;
    super.forgetChild(child);
  }
  /// 在attachToRenderTree 方法中被调用。
  @override
  void mount(Element? parent, dynamic newSlot) {
    assert(parent == null);
    super.mount(parent, newSlot);
    _rebuild();
  }

  @override
  void update(RenderObjectToWidgetAdapter<T> newWidget) {
    super.update(newWidget);
    assert(widget == newWidget);
    _rebuild();
  }

  // When we are assigned a new widget, we store it here
  // until we are ready to update to it.
  Widget? _newWidget;

  @override
  void performRebuild() {
    if (_newWidget != null) {
      // _newWidget can be null if, for instance, we were rebuilt
      // due to a reassemble.
      final Widget newWidget = _newWidget!;
      _newWidget = null;
      update(newWidget as RenderObjectToWidgetAdapter<T>);
    }
    super.performRebuild();
    assert(_newWidget == null);
  }
  // build 自己的child
  void _rebuild() {
      /// 核心方法  Element.updateChild  看下方的Element源码分析
    _child = updateChild(_child, widget.child, _rootChildSlot);
  }

  @override
  RenderObjectWithChildMixin<T> get renderObject => super.renderObject as RenderObjectWithChildMixin<T>;

  @override
  void insertRenderObjectChild(RenderObject child, dynamic slot) {
    assert(slot == _rootChildSlot);
    assert(renderObject.debugValidateChild(child));
    renderObject.child = child as T;
  }

  @override
  void moveRenderObjectChild(RenderObject child, dynamic oldSlot, dynamic newSlot) {
    assert(false);
  }

  @override
  void removeRenderObjectChild(RenderObject child, dynamic slot) {
    assert(renderObject.child == child);
    renderObject.child = null;
  }
}

```

attachToRenderTree方法中调用了mount方法，mount调用了rebuild方法。


### Element源码

```dart
/// Element是抽象类，并且实现了 BuildContext的相关方法
/// BuildContext 抽象类拥有widget 以及 buildOwner，所以Element也同样持有这俩东西
abstract class Element extends DiagnosticableTree implements BuildContext {
  // 子级，在parent的位置。 为何dynamic的，因为不同Element的实现，子的位置信息也不同。
  dynamic get slot => _slot;
  dynamic _slot;

  /// The configuration for this element.
  @override
  Widget get widget => _widget;
  Widget _widget;

   /// The object that manages the lifecycle of this element.
  @override
  BuildOwner? get owner => _owner;
  BuildOwner? _owner;

  /// 生命周期
  @mustCallSuper
  @protected
  void reassemble() {
    markNeedsBuild();
    visitChildren((Element child) {
      child.reassemble();
    });
  }

  /// 并不是所有的Element的实现，都有对应的RenderObject的， 要拆分到子的实现上，才会有对应的RenderObject的。eg：Component就没有自己的RenderObject
  RenderObject? get renderObject {
    RenderObject? result;
    void visit(Element element) {
      assert(result == null); // this verifies that there's only one child
      if (element is RenderObjectElement)
        result = element.renderObject;
      else
        element.visitChildren(visit);
    }
    visit(this);
    return result;
  }
  

  /// 核心方法 updateChild 
  /// newWidget 为null的时候删除child， newWidget不为空的时候，删除child并返回新的element对象。
  @protected
  Element? updateChild(Element? child, Widget? newWidget, dynamic newSlot) {
    if (newWidget == null) {
      if (child != null)
        deactivateChild(child);
      return null;
    }
    final Element newChild;
    if (child != null) {
      bool hasSameSuperclass = true;
      
      if (hasSameSuperclass && child.widget == newWidget) {
        if (child.slot != newSlot)
          updateSlotForChild(child, newSlot);
        newChild = child;
      } else if (hasSameSuperclass && Widget.canUpdate(child.widget, newWidget)) {
        if (child.slot != newSlot)
          updateSlotForChild(child, newSlot);
        child.update(newWidget);
        newChild = child;
      } else {
        deactivateChild(child);
        newChild = inflateWidget(newWidget, newSlot);
      }
    } else {
      newChild = inflateWidget(newWidget, newSlot);
    }

    return newChild;
  }

  /// Change the widget used to configure this element.
  ///
  /// The framework calls this function when the parent wishes to use a
  /// different widget to configure this element. The new widget is guaranteed
  /// to have the same [runtimeType] as the old widget.
  ///
  /// This function is called only during the "active" lifecycle state.
  /// 更新截断。
  @mustCallSuper
  void update(covariant Widget newWidget) {
    // This code is hot when hot reloading, so we try to
    // only call _AssertionError._evaluateAssertion once.
    assert(_lifecycleState == _ElementLifecycle.active
        && widget != null
        && newWidget != null
        && newWidget != widget
        && depth != null
        && Widget.canUpdate(widget, newWidget));
    /// widget.canUpdate方法 oldWidget.runtimeType == newWidget.runtimeType && oldWidget.key == newWidget.key;
    /// 判断是否类型相同，然后在判断key是否相同。 其中一个不同则进行更新操作。
    // This Element was told to update and we can now release all the global key
    // reservations of forgotten children. We cannot do this earlier because the
    // forgotten children still represent global key duplications if the element
    // never updates (the forgotten children are not removed from the tree
    // until the call to update happens)
    _widget = newWidget;
  }    
  

  /// updateChild中会调用这个方法，用来检测，当widget的key是GlobalKey的时候，并且能在缓存中找到这个key，就不在新建这个Element，直接拿缓存的，否则新建
  Element inflateWidget(Widget newWidget, dynamic newSlot) {
    final Key key = newWidget.key;
    if (key is GlobalKey) {
        final Element newChild = _retakeInactiveElement(key, newWidget);
        if (newChild != null) {
        newChild._activateWithParent(this, newSlot);
        final Element updatedChild = updateChild(newChild, newWidget, newSlot);
        return updatedChild;
        }
    }

    final Element newChild = newWidget.createElement();
    newChild.mount(this, newSlot);
    return newChild;
  }

  
  /// 设置需要build
  void markNeedsBuild() {
    if (_lifecycleState != _ElementLifecycle.active)
      return;
    if (dirty)
      return;
    _dirty = true;
    /// owner是BuildOwner,会将当前的element 加入到_dirtyElements 数组中，等待flush
    owner!.scheduleBuildFor(this);
  }

  /// 会被BuildOwner进行调用，用来更新当前的Element
  void rebuild() {
    if (_lifecycleState != _ElementLifecycle.active || !_dirty)
      return;
    Element? debugPreviousBuildTarget;
    performRebuild();
  }
  /// 由子类 进行具体的build操作
  @protected
  void performRebuild();
}


```


Element 核心方法：

1. updateChild 更新自组件
2. update 更新自己的widget
3. markNeedsBuild 给buildOwner的dirtyElement添加自己，用来等待更新。
4. rebuild engine drawFrame的时候，执行该方法。更新element
5. performRebuild 由子类 进行具体的build操作