## 二维码登录 web js sdk

配合[二维码登录服务](https://github.com/yunmoon/qrcode-login-server)使用


#### 安装方式
```bash
npm i qrcode-login-sdk
```

#### 使用方式

在vue中使用
```js
    const options = Object.assign({
      apiHost: 'http://192.168.0.197:8087', //二维码服务地址
      app_id: '5c14ea728eb53e11b9de7f3a',
      time_stamp: '1544947749678',
      nonce_str: '123',
      sign: '565b6d96b9eee6f17bc699b1a08860b6',
      size: 200, //二维码大小
      reloadCallback () {
        // 二维码过期后 点击刷新二维码 按钮的回调方法
        // do something reload qrcode
      },
      loginCallback (data) {
        // app扫描成功后返回的数据，处理登录跳转业务
      }
    })
    this.qrClient = new QrcodeLogin(`#${this.$refs['qrcode'].getAttribute('id')}`, options)
```
#### methods

- reloadQrcode(options)  
刷新二维码
```js
const options = {
    app_id: '5c14ea728eb53e11b9de7f3a',
    time_stamp: '1544947749678',
    nonce_str: '123',
    sign: '565b6d96b9eee6f17bc699b1a08860b6'
}
```

- destroy()  
销毁二维码
