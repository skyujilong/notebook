# flutter 开发中遇到的一些问题汇总

## flutter 2.0+ 

###  Flutter 更新SDK后,运行项目会出现 'flutter 无法打开“iproxy”，因为无法验证开发者。
```
sudo xattr -d com.apple.quarantine [your_flutter_path]/bin/cache/artifacts/usbmuxd/iproxy
```