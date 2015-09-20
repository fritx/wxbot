// var ipc = require('ipc')
var clipboard = require('clipboard')

// var reddots = []

// 应对 微信网页偷换了console 使起失效
// 保住console引用 便于使用
window._console = window.console


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
	}, 500)
}

function onReddot($chat_item){
	$chat_item[0].click()

	setTimeout(function(){
	// var text = 'hello\ngay'
	var text = ''

	// 自动回复 相同的内容
	var $msg = $([
		// '.message_system',
		'.msg-img',
		'.js_message_plain'
	].join(', ')).last()
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
			text = '发毛表情'
		} else {
			text = '发毛图片'
		}
	} else {
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
	}
	_console.log('回复', text)

	// 借用clipboard 实现输入文字 更新ng-model=EditAreaCtn
	// 直接设#editArea的innerText无效 暂时找不到其他方法
	var oldHtml = clipboard.readHtml() 
	var oldText = clipboard.readText()
	clipboard.writeText(text)
	$('#editArea')[0].focus()
	document.execCommand('paste')
	clipboard.writeHtml(oldHtml)
	clipboard.writeText(oldText)


	// $('.web_wechat_face')[0].click()
	// $('[title=阴险]')[0].click()



	$('.btn_send')[0].click()
	// $('.chat_item').last()[0].click()
	$('img[src*=filehelper]').closest('.chat_item')[0].click()
	}, 100)
}
