var BrowserWindow = require('browser-window')
var app = require('app')

app.on('ready', function(){

	// var win = new BrowserWindow({})
	// win.loadUrl('file://' + __dirname + '/index.html')

	var win = new BrowserWindow({
		width: 900,
		height: 600,
		'web-preferences': {
			'node-integration': false,
			preload: __dirname + '/preload.js'
		}
	})
	win.loadUrl('https://wx.qq.com')

})

