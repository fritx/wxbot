var ipc = require('ipc')
var clipboard = require('clipboard')

var reddots = []

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
	}, 1000)
}

function onLogin(){
	ipc.sendToHost('login')
	var checkForReddot = setInterval(function(){
		var $reddot = $('.web_wechat_reddot, .web_wechat_reddot_middle').last()
		if ($reddot.length) {
			var $chat_item = $reddot.closest('.chat_item')
			onReddot($chat_item)
		}
	}, 1000)
}

function onReddot($chat_item){
	$chat_item[0].click()
	// $('#ediArea').

	setTimeout(function(){
	// var text = 'hello\ngay'
	var $msg = $('.js_message_plain').last()
	var $img = $msg.find('img')
	if ($img.length) {
		text = $img.attr('text').replace(/_web$/, '')
	} else {
		text = $msg.html().replace('<br>', '\n')
	}

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
