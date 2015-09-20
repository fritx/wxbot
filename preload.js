// var ipc = require('ipc')
var clipboard = require('clipboard')
var NativeImage = require('native-image')

// var reddots = []

// 应对 微信网页偷换了console 使起失效
// 保住console引用 便于使用
window._console = window.console


var free = true
// setTimeout(function(){
	init()
// }, 3000)

function init(){
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
		'.voice',
		'a.app',
		'.js_message_plain'
	].join(', ')).last()

	// 系统消息暂时无法捕获
	// 因为不产生红点 而目前我们依靠红点 可以改善
	/*if ($msg.is('.message_system')) {
		var ctn = $msg.find('.content').text()
		if (ctn === '收到红包，请在手机上查看') {
			text = '发毛红包'
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
	} else if ($msg.is('.voice')) {
		reply.text = '发毛语音'
	} else if ($msg.is('a.app')) {
		reply.text = '转发jj'
	} else {
		var text = ''
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
		}
		reply.text = text
	}
	_console.log('回复', reply)

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

