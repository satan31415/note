# electron-vite-vue

- 项目来源：<https://github.com/electron-vite/electron-vite-vue>

## 目录结构

一旦启动或打包脚本执行过，会在根目录产生 **`dist` 文件夹，里面的文件夹同 `packages` 一模一样**；在使用一些路径计算时，尤其是相对路径计算；`dist` 与 `packages` 里面保持相同的目录结构能避开好多问题

```tree
.
├── bin
│     ├── README.md                            Go 编译出来的二进制文件，用来被 electron 的 shell 包调用
│     ├── text-replacer-darwin
│     ├── text-replacer-darwin-arm64
│     ├── text-replacer-linux
│     └── text-replacer-win32.exe
├── buildResources                             electron 打包过程需要静态资源
├── dist                                       electron 开发运行时编译出来的目录，与 packages 对应
│     ├── main
│     ├── preload
│     └── renderer
├── electron-builder.json
├── output
├── package.json
├── packages
│     ├── main                                 主线程核心代码
│     │     ├── index.ts
│     │     ├── services                          主线程业务逻辑
│     │     ├── settings
│     │     └── vite.config.ts
│     ├── preload                              预加载脚本源码
│     │     ├── index.ts
│     │     ├── loading.ts
│     │     ├── utils.ts
│     │     └── vite.config.ts
│     └── renderer                             渲染进程，vue 项目内容
│         ├── index.html
│         ├── public                           
│         ├── src
│         ├── tsconfig.json
│         └── vite.config.ts
├── postcss.config.js
├── scripts
│     ├── build.mjs                            electron 打包过程的脚本配置
│     └── watch.mjs                            electron 开发过程的脚本配置
├── tailwind.config.js
├── tsconfig.json
├── types.d.ts
├── yarn-error.log
└── yarn.lock

```

## 一般开发业务流程

```
主线程相关：

在此目录上：/Users/meek/my-code/gitee-code/vue3-vite-electron/electron-vite-vue-tailwindcss-element-plus/packages/main/services
基于 simpleDownloadHandle.service.ts 复制一个新的业务处理文件。此文件写主线程的主要业务逻辑。

写完之后，打开 /Users/meek/my-code/gitee-code/vue3-vite-electron/electron-vite-vue-tailwindcss-element-plus/packages/main/index.ts
在尾部补充一个 listen() 方法


渲染线程相关：
打开 /Users/meek/my-code/gitee-code/vue3-vite-electron/electron-vite-vue-tailwindcss-element-plus/packages/renderer/src/utils/ipc-util.ts
照着 sendSimpleDownloadToMainWindowInvoke() 方法复制一个新方法，调用主线程的 Invoke 方法

仿照它复制一个新的 vue 页面：/Users/meek/my-code/gitee-code/vue3-vite-electron/electron-vite-vue-tailwindcss-element-plus/packages/renderer/src/pages/gitTestPage.vue
然后里面有按钮调用 ipc-util.ts 方法即可。
```



