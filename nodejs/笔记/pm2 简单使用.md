### 安装
` npm install pm2 -g `
### 启用应用
```
pm2 start app.js

// 命名
pm2 start app.js --name xxxx

// 命名加监听
pm2 start app.js --name xxxx --watch

// 看都启动了哪些应用
pm2 list
pm2 ls

// 关闭进程
pm2 delete [appname] | id
pm2 delete all

// 停止进程
pm2 stop [name]

// 查看进程详情
pm2 describe app
pm2 show [name]


// 查看日志
pm2 log [name]

// 集群启动
pm2 start app.js -i max

// pm2 开机自启
pm2 startup centos

```
