import axios from 'axios'
import QRious from 'qrious'
import io from 'socket.io-client'
let timer = null
function Qrcode (el, options) {
  this.size = options.size || 200
  const fontLinkStyle = document.createElement('link')
  fontLinkStyle.rel = 'stylesheet'
  fontLinkStyle.type= 'text/css'
  fontLinkStyle.href= '//at.alicdn.com/t/font_982599_n93kex1pbic.css'
  document.getElementsByTagName('head')[0].appendChild(fontLinkStyle);
  const style = document.createElement('style')
  style.type = 'text/css';
  style.innerHTML = `#qrcode-login-wrap{position: relative;width:${this.size}px;height:${this.size}px;margin: auto;}` +
    ' #qrcode-login-wrap .qrcode-error { background: hsla(0,0%,100%,.95);position: absolute;left: 0;top: 0;z-index: 9999;width: 100%;height: 100%; }' +
    `#qrcode-login-wrap .qrcode-error p {margin-top: ${this.size * 0.3}px;margin-bottom: 8px;text-align: center;}` +
    '#qrcode-login-wrap .qrcode-error .refresh {width: 110px;height: 34px;line-height: 34px;text-align: center;margin: 0 auto;background: #ff9000;border-color: #ff9000;display: block;color: #fff;border-radius: 3px;font-size: 14px;cursor: pointer;}' +
    '#qrcode-login-wrap .qrcode-success {background: #fff;position: absolute;left: 0;top: 0;z-index: 9999;width: 100%;height: 100%;}' +
    '#qrcode-login-wrap .qrcode-success .iconfont {font-size: 36px; color: #59c828;}' +
    '#qrcode-login-wrap .qrcode-success p, #qrcode-login-wrap .qrcode-success h4 {font-size: 14px;}';
  document.getElementsByTagName('head')[0].appendChild(style);
  this.el = el
  this.element = document.querySelector(el)
  if (!this.element) {
    throw new Error('element 不存在')
  }
  let { app_id, time_stamp, nonce_str, sign } = options
  if (!app_id || !time_stamp || !nonce_str || !sign) {
    throw new Error('配置不完整')
  }
  this.apiHost = options.apiHost || 'http://192.168.0.197:8087'
  this.getQrcodeUrl = `${this.apiHost}/getQrcode`
  this.reloadCallback = options.reloadCallback
  this.loginCallback = options.loginCallback
  this.getQrcodeData = function (params) {
    return axios.get(this.getQrcodeUrl, { params })
  }
  this.getQrcodeData({ app_id, time_stamp, nonce_str, sign }).then(response => {
    initElement({
      qrcode: response.data.data.qrcode,
      size:this.size,
      element: this.element,
      expire: response.data.data.expire,
      reloadCallback: this.reloadCallback,
      tipDivEle: this.tipDivEle
    })
  }).catch(error => {
    throw error
  })
  const socket = io(`${this.apiHost}?app_id=${app_id}`, {
    transports: ['websocket']
  })
  this.socket = socket

  socket.on('connect', () => {
    LoginSuccessSocket(this.socket, this.loginCallback, this.reloadCallback)
  })
  socket.on('disconnect', () => {
    socket.off('login-success')
  })
}

function LoginSuccessSocket(socket, loginCallback, reloadCallback) {
  socket.on('login-success', (data) => {
    console.log(data)
    const wrap = document.querySelector('#qrcode-login-wrap');
    if (data.action === "cancel" && timer) {
      const scanSuccessEle = wrap.querySelector('.qrcode-success')
      console.log(scanSuccessEle)
      if (scanSuccessEle) {
        wrap.removeChild(scanSuccessEle)
      }
      clearInterval(timer)
      timer = null
      const tipDivEle = generateTipDiv(reloadCallback)
      setTimeout(() => {
        wrap.appendChild(tipDivEle.firstChild)
      })
    }
    if (data.action === "scan") {
      const scanDivEle = generateScanDic()
      wrap.appendChild(scanDivEle.firstChild)
    }
    if (loginCallback)
      loginCallback(data)
  })
}

function generateTipDiv(reloadCallback) {
  const tipHtml = '<div class="qrcode-error"><p>二维码已失效</p><button class="refresh" type="button">刷新二维码</button></div>'
  const tipDivEle = document.createElement('DIV')
  tipDivEle.innerHTML = tipHtml
  tipDivEle.querySelector('button').onclick = function () {
    if (reloadCallback) {
      reloadCallback()
    }
  }
  return tipDivEle
}

function generateScanDic() {
  const scanHtml = '<div class="qrcode-success"><i class="iconfont icon-success"></i><p>扫描成功！</p><h4>请在手机上根据提示确认登录</h4></div>'
  const scanDivEle = document.createElement('DIV')
  scanDivEle.innerHTML = scanHtml
  return scanDivEle
}

function initElement (options) {
  const wrap = document.createElement('DIV')
  options.element.appendChild(wrap)
  wrap.id = 'qrcode-login-wrap'
  const tipDivEle = generateTipDiv(options.reloadCallback)
  const qrcanvas = document.createElement('CANVAS')
  new QRious({
    element: qrcanvas,
    value: options.qrcode,
    size: options.size,
  })
  wrap.appendChild(qrcanvas)
  timer = setInterval(() => {
    console.log(1)
    if (options.expire < new Date().getTime()) {
      wrap.appendChild(tipDivEle.firstChild)
      clearInterval(timer)
      timer = null
      const scanSuccessEle = wrap.querySelector('.qrcode-success')
      if (scanSuccessEle) {
        wrap.removeChild(scanSuccessEle)
      }
    }
  }, 1000)
}

Qrcode.prototype.reloadQrcode = function (params) {
  this.element = document.querySelector(this.el)
  if (!this.element) {
    throw new Error('element 不存在')
  }
  this.getQrcodeData(params).then(response => {
    this.destroy()
    initElement({
      qrcode: response.data.data.qrcode,
      size:this.size,
      element: this.element,
      expire: response.data.data.expire,
      reloadCallback: this.reloadCallback,
    })
    LoginSuccessSocket(this.socket, this.loginCallback, this.reloadCallback)
  }).catch(error => {
    throw error
  })
}

Qrcode.prototype.destroy = function () {
  this.element.innerHTML = ''
  if (timer) {
    clearInterval(timer)
  }
  this.socket.off('login-success')
}
export default Qrcode
