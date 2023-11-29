``` javascript
// 在main.js中设置请求拦截器
uni.addInterceptor('request', {
  invoke(args) {
    // 在发送请求前统一处理
    args.header = {
      ...args.header,
      'Authorization': 'Bearer ' + hl-// 添加token到请求头中
    };
  }
});

// 在具体的页面或组件中发起请求
uni.request({
  url: 'your/request/url',
  method: 'GET',
  success(res) {
    console.log(res.data);
  }
});
```