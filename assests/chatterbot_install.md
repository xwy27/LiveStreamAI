# 安装

## chatterbot

chatterbot 推荐的python版本是 3.7，但本项目使用的 bilibili-api-python 库的 python 最低要求版本是3.8。作者在 Mac 上是直接成功的，但在 Windows 上按照正常方法安装失败了。下面提供解决方案。


如果是提示：`Encountered error while trying to install package. blis`，这是因为`chatterbot`依赖的`Spacy`，依赖了较低版本的`blis`，导致无法从源码build出wheel给pip安装。

1. 直接跳过依赖进行安装：`pip install chatterbot --no-deps`
2. 然后安装`blis`：`pip install blis`。本身需要低版本的`blis`，但高版本也是可以运行的
3. 上一步的时候，`pip`会提示`blis`版本和`chatterbot`依赖版本不兼容，同时给出未安装的库，譬如`SQLAlchemy`
4. 根据提示缺失的库和最低版本，用`pip install <lib>==<version>`进行安装

## chatterbot-corpus

直接通过命令`pip install chatterbot-corpus`安装

## 最终运行

到`Chatterbot`目录下运行`TrainChatterBot.py`，可能会出现`time.clock is not an attribute`报错，那就直接根据报错给出的代码位置，把它改成`time.perf_counter()`。这是因为python3.8去掉了`time.clock`。
