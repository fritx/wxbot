var BrowserWindow = require('browser-window')
var app = require('app')
// var ipc = require('ipc')
var _ = require('lodash')
var fs = require('fs-extra')
var bytes = require('bytes')

function debug(/*args*/){
	var args = JSON.stringify(_.toArray(arguments))
	console.log(args)
}


var downloadDir = `${__dirname}/download`
fs.mkdirpSync(downloadDir)

app.on('ready', function(){

	// var win = new BrowserWindow({})
	// win.loadUrl('file://' + __dirname + '/index.html')

	var win = new BrowserWindow({
		width: 900,
		height: 610,
		'web-preferences': {
			'node-integration': false,
			preload: __dirname + '/preload.js'
		}
	})
	win.loadUrl('https://wx.qq.com/?lang=zh_CN&t=' + Date.now())

	// electron api DownloadItem
	// https://github.com/atom/electron/blob/master/docs/api/download-item.md
	win.webContents.session.on('will-download', function(e, item){
		//e.preventDefault()
		var url = item.url
		var mime = item.mimeType
		var filename = item.filename
		var total = item.getTotalBytes()
		debug('开始下载', filename, mime, bytes(total), url)
		item.setSavePath(`${downloadDir}/${filename}`)
		item.on('updated', function() {
	    // debug('下载中', filename, item.getReceivedBytes())
	  })
		item.on('done', function(e, state){
			if (state == 'completed') {
				debug('下载完成', filename)
			} else {
				debug('下载失败', filename)
			}
		})
	})

})

