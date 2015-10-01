// var ipc = require('ipc')
var clipboard = require('clipboard')
var NativeImage = require('native-image')
var _ = require('lodash')
var debug = require('debug')('wxbot')

// 应对 微信网页偷换了console 使起失效
// 保住console引用 便于使用
window._console = window.console

// hack for atom/node setImmediate bug
// https://github.com/atom/electron/issues/2916
debug = _.wrap(debug, function(){
	var args = JSON.stringify(_.toArray(arguments).slice(1))
	var fn = arguments[0]
	try {
		return fn.apply(null, args)
	} catch(err) {
		_console.debug(args)
	}
})

var free = true
// setTimeout(function(){
	init()
// }, 3000)

function init(){
	var checkForQrcode = setInterval(function(){
		var qrimg = document.querySelector('.qrcode img')
		if (qrimg && qrimg.src.match(/\/qrcode/)) {
			debug('二维码', qrimg.src)
			clearInterval(checkForQrcode)
		}
	}, 100)
	var checkForLogin = setInterval(function(){
		var chat_item = document.querySelector('.chat_item')
		if (chat_item) {
			onLogin()
			clearInterval(checkForLogin)
		}
	}, 500)
}

function onLogin(){
	// ipc.sendToHost('login')
	$('img[src*=filehelper]').closest('.chat_item')[0].click()
	var checkForReddot = setInterval(function(){
		var $reddot = $('.web_wechat_reddot, .web_wechat_reddot_middle').last()
		if ($reddot.length) {
			var $chat_item = $reddot.closest('.chat_item')
			onReddot($chat_item)
		}
	}, 200)
}

function onReddot($chat_item){
	if (!free) return
	free = false
	$chat_item[0].click()

	setTimeout(function(){
	var reply = {}

	// 自动回复 相同的内容
	var $msg = $([
		// '.message_system',
		'.msg-img',
		'.location',
		'.voice',
		'.card',
		'a.app',
		'.js_message_plain'
	].join(', ')).last()

	// 系统消息暂时无法捕获
	// 因为不产生红点 而目前我们依靠红点 可以改善
	/*if ($msg.is('.message_system')) {
		var ctn = $msg.find('.content').text()
		if (ctn === '收到红包，请在手机上查看') {
			text = '发毛红包'
		} else if (ctn === '位置共享已经结束') {
			text = '位置共享已经结束'
		} else if (ctn.match(/(.+)邀请(.+)加入了群聊/)) {
			text = '加毛人'
		} else {
			// 无视
		}
	} else*/

	if ($msg.is('.msg-img')) {
		if ($msg.is('.custom_emoji')) { // 用户表情
			reply.text = '发毛表情'
		} else {
			// reply.text = '发毛图片'
			reply.image = './fuck.jpeg'
		}
	} else if ($msg.is('.location')) {
		//var src = $msg.find('.img').prop('src')
		var desc = $msg.find('.desc').text()
		debug('接收', 'location', desc)
		reply.text = desc
	} else if ($msg.is('.voice')) {
		$msg[0].click()
		var duration = parseInt($msg.find('.duration').text())
		var src = $('#jp_audio_1').prop('src') // 认证限制
		var msgid = src.match(/msgid=(\d+)/)[1]
		var date = new Date().toJSON()
			.replace(/\..+/, '')
			.replace(/[\-:]/g, '')
			.replace('T', '-')
		// 20150927-164539_5656119287354277662.mp3
		var filename = `${date}_${msgid}.mp3`
		$('<a>').attr({
			download: filename,
			href: src
		})[0].click() // 触发下载
		debug('接收', 'voice', `${duration}s`, src)
		reply.text = '发毛语音'
	} else if ($msg.is('.card')) {
		var name = $msg.find('.display_name').text()
		var wxid = $msg.find('.signature').text()
		var img = $msg.find('.img').prop('src') // 认证限制
		debug('接收', 'card', name, wxid)
		reply.text = name + '\n' + wxid
	} else if ($msg.is('a.app')) {
		var url = $msg.attr('href')
		url = decodeURIComponent(url.match(/requrl=(.+?)&/)[1])
		var title = $msg.find('.title').text()
		var desc = $msg.find('.desc').text()
		var img = $msg.find('.cover').prop('src') // 认证限制
		debug('接收', 'link', title, desc, url)
		reply.text = title + '\n' + url
	}else {
		var text = ''
		var normal = false
		$msg.contents().each(function(i, node){
			if (node.nodeType === Node.TEXT_NODE) {
				text += node.nodeValue
			} else if (node.nodeType === Node.ELEMENT_NODE) {
				var $el = $(node)
				if ($el.is('br')) text += '\n'
				else if ($el.is('.qqemoji, .emoji')) {
					text += $el.attr('text').replace(/_web$/, '')
				}
			}
		})
		if (text === '[收到了一个表情，请在手机上查看]') { // 微信表情包
			text = '发毛表情'
		} else if (text.match(/(.+)发起了位置共享，请在手机上查看/)) {
			text = '发毛位置共享'
		} else {
			normal = true
		}
		// if (normal && !text.match(/叼|屌|diao/i)) text = ''
		reply.text = text
	}
	debug('回复', reply)

	// 借用clipboard 实现输入文字 更新ng-model=EditAreaCtn
	// ~~直接设#editArea的innerText无效 暂时找不到其他方法~~
	paste(reply)

	// 发送text 可以直接更新scope中的变量 @昌爷 提点
	// 但不知为毛 发不了表情
	// if (reply.image) {
	// 	paste(reply)
	// } else {
	// 	angular.element('#editArea').scope().editAreaCtn = reply.text
	// }


	// $('.web_wechat_face')[0].click()
	// $('[title=阴险]')[0].click()

	if (reply.image) {
		setTimeout(function(){
			var tryClickBtn = setInterval(function(){
				var $btn = $('.dialog_ft .btn_primary')
				if ($btn.length) {
					$('.dialog_ft .btn_primary')[0].click()
				} else {
					clearInterval(tryClickBtn)
					$('img[src*=filehelper]').closest('.chat_item')[0].click()
					free = true
				}
			}, 200)
		}, 100)
	} else {
		$('.btn_send')[0].click()
		// $('.chat_item').last()[0].click()
		$('img[src*=filehelper]').closest('.chat_item')[0].click()
		free = true
	}

	
	
	}, 100)
}


function paste(opt){
	var oldImage = clipboard.readImage()
	var oldHtml = clipboard.readHtml()
	var oldText = clipboard.readText()
	clipboard.clear() // 必须清空
	if (opt.image) {
		clipboard.writeImage(NativeImage.createFromPath(opt.image))
	}
	if (opt.html) clipboard.writeHtml(opt.html)
	if (opt.text) clipboard.writeText(opt.text)
	$('#editArea')[0].focus()
	document.execCommand('paste')
	clipboard.writeImage(oldImage)
	clipboard.writeHtml(oldHtml)
	clipboard.writeText(oldText)
}

