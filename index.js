var BrowserWindow = require('browser-window')
var app = require('app')

app.on('ready', function(){

	var win = new BrowserWindow({})
	win.loadUrl('file://' + __dirname + '/index.html')

})

