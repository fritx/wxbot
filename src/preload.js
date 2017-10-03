require('./preloadIpc')
let { clipboard, nativeImage } = require('electron')
let { s, sa, delay, download } = require('./util')
let parseMsg = require('./parseMsg')
let replyMsg = require('./replyMsg')

// 禁用微信网页绑定的beforeunload
// 导致页面无法正常刷新和关闭
window.__defineSetter__('onbeforeunload', () => {
  // noop
})

document.addEventListener('DOMContentLoaded', () => {
  // 禁止外层网页滚动 影响使用
  document.body.style.overflow = 'hidden'

  detectPage()
})

async function autoReply () {
  while (true) { // 保持回复消息
    try {
      let msg = await detectMsg()
      console.log('解析得到msg', JSON.stringify(msg))

      let reply = await replyMsg(msg)
      console.log('reply', JSON.stringify(reply))

      if (reply) {
        // continue // test: 不作回复
        pasteMsg(reply)
        await clickSend(reply)
      }
    } catch (err) {
      console.error('自动回复出现err', err)
    }
  }
}

async function detectMsg () {
  // 重置回"文件传输助手" 以能接收未读红点
  s('img[src*=filehelper]').closest('.chat_item').click()

  let reddot
  while (true) {
    await delay(100)
    reddot = s('.web_wechat_reddot, .web_wechat_reddot_middle')
    if (reddot) break
  }

  let item = reddot.closest('.chat_item')
  item.click()

  await delay(100)
  let $msg = $([
    '.message:not(.me) .bubble_cont > div',
    '.message:not(.me) .bubble_cont > a.app',
    '.message:not(.me) .emoticon',
    '.message_system'
  ].join(', ')).last()

  let msg = parseMsg($msg)
  return msg
}

async function clickSend (opt) {
  if (opt.text) {
    s('.btn_send').click()
  } else if (opt.image) {
    // fixme: 超时处理
    while (true) {
      await delay(300)
      let btn = s('.dialog_ft .btn_primary')
      if (btn) {
        btn.click() // 持续点击
      } else {
        return
      }
    }
  }
}

// 借用clipboard 实现输入文字 更新ng-model=EditAreaCtn
function pasteMsg (opt) {
  let oldImage = clipboard.readImage()
  let oldHtml = clipboard.readHtml()
  let oldText = clipboard.readText()

  clipboard.clear() // 必须清空
  if (opt.image) {
    // 不知为啥 linux上 clipboard+nativeimage无效
    try {
      clipboard.writeImage(nativeImage.createFromPath(opt.image))
    } catch (err) {
      opt.image = null
      opt.text = '妈蛋 发不出图片'
    }
  }
  if (opt.html) clipboard.writeHtml(opt.html)
  if (opt.text) clipboard.writeText(opt.text)
  s('#editArea').focus()
  document.execCommand('paste')

  clipboard.writeImage(oldImage)
  clipboard.writeHtml(oldHtml)
  clipboard.writeText(oldText)
}

function detectPage () {
  let ps = [
    detectCache(), // 协助跳转
    detectLogin(),
    detectChat()
  ]

  // 同时判断login和chat 判断完成则同时释放
  Promise.race(ps)
    .then(data => {
      ps.forEach(p => p.cancel())

      let { page, qrcode } = data
      console.log(`目前处于${page}页面`)

      if (page === 'login') {
        download(qrcode)
      } else if (page === 'chat') {
        autoReply()
      }
    })
}

// 需要定制promise 提供cancel方法
function detectChat () {
  let toCancel = false

  let p = (async () => {
    while (true) {
      if (toCancel) return
      await delay(300)

      let item = s('.chat_item')
      if (item) {
        return { page: 'chat' }
      }
    }
  })()

  p.cancel = () => {
    toCancel = true
  }
  return p
}

// 需要定制promise 提供cancel方法
function detectLogin () {
  let toCancel = false

  let p = (async () => {
    while (true) {
      if (toCancel) return
      await delay(300)

      // 共有两次load事件 仅处理后一次
      // 第1次src https://res.wx.qq.com/a/wx_fed/webwx/res/static/img/2z6meE1.gif
      // 第2次src https://login.weixin.qq.com/qrcode/IbAG40QD6A==
      let img = s('.qrcode img')
      if (img && img.src.endsWith('==')) {
        return {
          page: 'login',
          qrcode: img.src
        }
      }
    }
  })()

  p.cancel = () => {
    toCancel = true
  }
  return p
}

// 需要定制promise 提供cancel方法
// 可能跳到缓存了退出登陆用户头像的界面，手动点一下切换用户，以触发二维码下载
function detectCache () {
  let toCancel = false

  let p = (async () => {
    while (true) {
      if (toCancel) return
      await delay(300)

      let btn = s('.association .button_default')
      if (btn) btn.click() // 持续点击
    }
  })()

  p.cancel = () => {
    toCancel = true
  }
  return p
}
