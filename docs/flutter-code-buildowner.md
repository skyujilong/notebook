# BuildOwner & WidgetsBinding & SchedulerBinding

## BuildOwner widget的管理者




```dart
class BuildOwner {
  final _InactiveElements _inactiveElements = _InactiveElements();
  /// 脏标记
  final List<Element> _dirtyElements = <Element>[];

}

```