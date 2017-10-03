function debug(...args){
  var json = JSON.stringify(args)
  console.log(json)
}

module.exports = parseMsg

// msg = {
//   from, room, style,
//   type:
//     not supported|not recognized
//     text|picture|app|card|location|attach
//     sticker|emoticon|transfer
//     voice|video|microvideo|video/voice call
//     real-time location|real-time voice
//     ----
//     red packet|recall
//     new member|member is stranger
//     real-time location ended|real-time voice ended
//   text|title|desc|src|poster...
// }
function parseMsg ($msg) {
  var msg = {}
  var $message = $msg.closest('.message')
  var $nickname = $message.find('.nickname')
  var $titlename = $('.title_name')

  if ($nickname.length) { // 群聊
    var from = $nickname.text()
    var room = $titlename.text()
  } else { // 单聊
    var from = $titlename.text()
    var room = null
  }
  Object.assign(msg, {
    from, room
  })
  debug('来自', from, room) // 这里的nickname会被remark覆盖

  if ($msg.is('.message_system')) {
    var ctn = $msg.find('.content').text()
    debug('接收', '系统标记', ctn)
    Object.assign(msg, {
      style: 'system',
      text: ctn
    })

    var mat
    if (ctn === '收到红包，请在手机上查看' ||
        ctn === 'Red packet received. View on phone.') {
      // text = '发毛红包'
      Object.assign(msg, {
        type: 'red packet'
      })
    } else if (ctn === '位置共享已经结束' ||
        ctn === 'Real-time Location session ended.') {
      // text = '位置共享已经结束'
      Object.assign(msg, {
        type: 'real-time location ended'
      })
    } else if (ctn === '实时对讲已经结束') {
      // text = '实时对讲已经结束'
      Object.assign(msg, {
        type: 'real-time voice ended'
      })
    } else if (mat = ctn.match(/"(.+)"邀请"(.+)"加入了群聊/)) {
      // text = '加毛人'
      Object.assign(msg, {
        type: 'new member',
        by: mat[1],
        who: mat[2]
      })
    } else if (mat = ctn.match(/"(.+)"与群里其他人都不是微信朋友关系，请注意隐私安全/)) {
      // text = '加毛人'
      Object.assign(msg, {
        type: 'member is stranger',
        who: mat[1]
      })
    } else if (mat = ctn.match(/You were removed from the group chat by "(.+)"/)) {
      Object.assign(msg, {
        type: 'removed',
        by: mat[1]
      })
    } else if (mat = ctn.match(/(.+)(撤回了一条消息| withdrew a message)/)) {
      // text = '撤你妹'
      Object.assign(msg, {
        type: 'recall',
        by: mat[1]
      })
    } else {
      // 无视
      Object.assign(msg, {
        type: 'not recognized',
        text: ctn
      })
    }
  } else if ($msg.is('.emoticon')) { // 用户自定义表情
    var src = $msg.find('.msg-img').prop('src')
    debug('接收', 'emoticon', src)
    // reply.text = '发毛表情'
    Object.assign(msg, {
      type: 'emoticon',
      src
    })
  } else if ($msg.is('.picture')) {
    var src = $msg.find('.msg-img').prop('src')
    debug('接收', 'picture', src)
    // reply.text = '发毛图片'
    // reply.image = join(__dirname, '../fuck.jpeg')
    Object.assign(msg, {
      type: 'picture',
      src
    })
  } else if ($msg.is('.location')) {
    var src = $msg.find('.img').prop('src')
    var desc = $msg.find('.desc').text()
    debug('接收', 'location', desc)
    // reply.text = desc
    Object.assign(msg, {
      type: 'location',
      src, desc
    })
  } else if ($msg.is('.attach')) {
    var title = $msg.find('.title').text()
    var size = $msg.find('span:first').text()
    var $download = $msg.find('a[download]') // 可触发下载
    var src = $download.prop('href')
    debug('接收', 'attach', title, size)
    // reply.text = title + '\n' + size
    Object.assign(msg, {
      type: 'attach',
      title, size, src
    })
  } else if ($msg.is('.microvideo')) {
    var poster = $msg.find('img').prop('src') // 限制
    var src = $msg.find('video').prop('src') // 限制
    debug('接收', 'microvideo', poster)
    // reply.text = '发毛小视频'
    Object.assign(msg, {
      type: 'microvideo',
      poster, src
    })
  } else if ($msg.is('.video')) {
    var poster = $msg.find('.msg-img').prop('src') // 限制
    debug('接收', 'video', poster)
    // reply.text = '发毛视频'
    Object.assign(msg, {
      type: 'video',
      poster
    })
  } else if ($msg.is('.voice')) {
    $msg[0].click()
    var duration = parseInt($msg.find('.duration').text())
    var src = $('#jp_audio_1').prop('src') // 认证限制
    debug('接收', 'voice', `${duration}s`, src)
    // reply.text = '发毛语音'
    Object.assign(msg, {
      type: 'voice',
      duration, src
    })
  } else if ($msg.is('.card')) {
    var name = $msg.find('.display_name').text()
    var wxid = $msg.find('.signature').text() // 微信注释掉了
    var img = $msg.find('.img').prop('src') // 认证限制
    debug('接收', 'card', name, wxid)
    // reply.text = name + '\n' + wxid
    Object.assign(msg, {
      type: 'card',
      name, img
    })
  } else if ($msg.is('a.app')) {
    var url = $msg.attr('href')
    url = decodeURIComponent(url.match(/requrl=(.+?)&/)[1])
    var title = $msg.find('.title').text()
    var desc = $msg.find('.desc').text()
    var img = $msg.find('.cover').prop('src') // 认证限制
    debug('接收', 'link', title, desc, url)
    // reply.text = title + '\n' + url
    Object.assign(msg, {
      type: 'app',
      url, title, desc, img
    })
  } else if ($msg.is('.plain')) {
    var text = ''
    var ctn = ''
    var normal = false
    var $text = $msg.find('.js_message_plain')
    $text.contents().each(function(i, node){
      if (node.nodeType === Node.TEXT_NODE) {
        ctn += node.nodeValue
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        var $el = $(node)
        if ($el.is('br')) ctn += '\n'
        else if ($el.is('.qqemoji, .emoji')) {
          ctn += $el.attr('text').replace(/_web$/, '')
        }
      }
    })
    if (ctn === '[收到了一个表情，请在手机上查看]' ||
        ctn === '[Send an emoji, view it on mobile]' ||
        ctn === '[Received a sticker. View on phone]') { // 微信表情包
      // text = '发毛表情'
      Object.assign(msg, {
        type: 'sticker' // 微信内部表情
      })
    } else if (ctn === '[收到一条微信转账消息，请在手机上查看]' ||
        ctn === '[Received a micro-message transfer message, please view on the phone]' ||
        ctn === '[Received transfer. View on phone.]') {
      // text = '转毛帐'
      Object.assign(msg, {
        type: 'transfer'
      })
    } else if (ctn === '[收到一条视频/语音聊天消息，请在手机上查看]' ||
        ctn === '[Receive a video / voice chat message, view it on your phone]' ||
        ctn === '[Received video/voice chat message. View on phone.]') {
      // text = '聊jj'
      Object.assign(msg, {
        type: 'video/voice call'
      })
    } else if (ctn === '我发起了实时对讲') {
      // text = '对讲你妹'
      Object.assign(msg, {
        type: 'real-time voice'
      })
    } else if (ctn === '该类型暂不支持，请在手机上查看' ||
        ctn === '[收到一条网页版微信暂不支持的消息类型，请在手机上查看]') {
      // text = '不懂'
      Object.assign(msg, {
        type: 'not supported'
      })
    } else if (ctn.match(/(.+)发起了位置共享，请在手机上查看/) ||
        ctn.match(/(.+)Initiated location sharing, please check on the phone/) ||
        ctn.match(/(.+)started a real\-time location session\. View on phone/)) {
      // text = '发毛位置共享'
      Object.assign(msg, {
        type: 'real-time location'
      })
    } else {
      normal = true
      // text = ctn
      Object.assign(msg, {
        type: 'text',
        text: ctn
      })
    }
    debug('接收', 'text', ctn)
    // if (normal && !text.match(/叼|屌|diao|丢你|碉堡/i)) text = ''
    // reply.text = text
  } else {
    console.log('未成功解析消息', $msg.html())
    Object.assign(msg, {
      type: 'not recognized'
    })
  }

  return msg
}
