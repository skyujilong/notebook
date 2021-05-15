# Widget 对象

## StatelessWidget
```dart
abstract class StatelessWidget extends Widget {
  /// Initializes [key] for subclasses.
  const StatelessWidget({ Key? key }) : super(key: key);

  @override
  StatelessElement createElement() => StatelessElement(this);

  @protected
  Widget build(BuildContext context);
}
```

**Element 中的 updateChild方法会调用 inflateWidget方法，在这个方法中会进行调用Widget的 createElement方法**


## StatelessElement 对象

```dart 
class StatelessElement extends ComponentElement {
  /// Creates an element that uses the given widget as its configuration.
  StatelessElement(StatelessWidget widget) : super(widget);

  @override
  StatelessWidget get widget => super.widget as StatelessWidget;

  /// 这里调用了widget的build方法
  @override
  Widget build() => widget.build(this);

  @override
  void update(StatelessWidget newWidget) {
    super.update(newWidget);
    assert(widget == newWidget);
    _dirty = true;
    rebuild();
  }
}

```


### ComponentElement

```dart
abstract class ComponentElement extends Element {
  @override
  void mount(Element? parent, dynamic newSlot) {
    super.mount(parent, newSlot);
    assert(_child == null);
    assert(_lifecycleState == _ElementLifecycle.active);
    _firstBuild();
    assert(_child != null);
  }

  void _firstBuild() {
    rebuild();
  }

  @override
  void performRebuild() {
    if (!kReleaseMode && debugProfileBuildsEnabled)
      Timeline.startSync('${widget.runtimeType}',  arguments: timelineArgumentsIndicatingLandmarkEvent);
    Widget? built;
    try {
      built = build();
      debugWidgetBuilderValue(widget, built);
    } catch (e, stack) {
      _debugDoingBuild = false;
      built = ErrorWidget.builder(
        _debugReportException(
          ErrorDescription('building $this'),
          e,
          stack,
          informationCollector: () sync* {
            yield DiagnosticsDebugCreator(DebugCreator(this));
          },
        ),
      );
    } finally {
      // We delay marking the element as clean until after calling build() so
      // that attempts to markNeedsBuild() during build() will be ignored.
      _dirty = false;
    }
    try {
      _child = updateChild(_child, built, slot);
    } catch (e, stack) {
      built = ErrorWidget.builder(
        _debugReportException(
          ErrorDescription('building $this'),
          e,
          stack,
          informationCollector: () sync* {
            yield DiagnosticsDebugCreator(DebugCreator(this));
          },
        ),
      );
      _child = updateChild(null, built, slot);
    }

    if (!kReleaseMode && debugProfileBuildsEnabled)
      Timeline.finishSync();
  }
}
```

*注意：*，之前我们在分析element对象的时候，有一个重点的方法就是**Element.rebuild方法**，该方当element对象第一次mount或者有更改被标记为dirty的时候，会在**drawFrame方法**所调用，而调用该方法后，会去调用子实现的**performRebuild方法**，上述就是**StatelessWidget->ComponentElement.performRebuild的实现**。



----

## StateFullWidget

```dart
abstract class StatefulWidget extends Widget {
    const StatefulWidget({ Key? key }) : super(key: key);

    @override
    StatefulElement createElement() => StatefulElement(this);

    @protected
    @factory
    State createState(); 
}

```

## StatefulElement

```dart
class StatefulElement extends ComponentElement {
    /// 注意这里，widget.createState() 相当于继承的是State的对象的类了
  StatefulElement(StatefulWidget widget)
      : state = widget.createState(),
        super(widget) {
    state._element = this;
    state._widget = widget;
  }

  @override
  Widget build() => state.build(this);
}
```

## State 对象

```dart
abstract class State<T extends StatefulWidget> with Diagnosticable {
    // 核心方法， 持有element
  StatefulElement? _element;
  @protected  
  void setState(VoidCallback fn) {
    
      if (_debugLifecycleState == _StateLifecycle.created && !mounted) {
        throw FlutterError.fromParts(<DiagnosticsNode>[
          ErrorSummary('setState() called in constructor: $this'),
          ErrorHint(
            'This happens when you call setState() on a State object for a widget that '
            "hasn't been inserted into the widget tree yet. It is not necessary to call "
            'setState() in the constructor, since the state is already assumed to be dirty '
            'when it is initially created.'
          ),
        ]);
      }
      return true;
    }());
    final dynamic result = fn() as dynamic;
    
    _element!.markNeedsBuild();
  }
}
```
**核心**
持有 element 对象。 在调用setState的时候，将element标记为dirty