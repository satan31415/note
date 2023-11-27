

```
这几个二进制文件来源 cdk8s-golang-study 仓库下的 big-text-replacer 项目


打包的时候会根据不同系统环境自动被编译进去的原因是：electron-builder.json 配置
经过测试：${platform} 值的是当前开发环境的平台，所以如果你要打包各个平台的时候还是的自己改动这个配置，没办法做到根据 package.json 构建的目标平台参数自动传值进来

"files": [
    {
      "from": "./",
      "to": "./",
      "filter": [
        "dist",
        "bin/text-replacer-${platform}*"
      ]
    }
],

```
