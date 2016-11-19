var BrowserWindow = require('electron').BrowserWindow
var app = require('electron').app
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

var win

// 解决奇葩问题: 一旦登录进去 app.quit无法关闭窗口及退出应用
// 命令行Ctrl+C也无法退出
// 只能通过kill进程 彻底退出
// win.destroy则可以成功关闭窗口
function quitApp () {
	if (win) {
		win.destroy()
	} else {
		app.quit()
	}
}

// 因为本应用有一个主窗口 默认隐藏不关闭
// 所以可以将 窗口全部关闭 视为退出应用 方便管理
app.on('window-all-closed', () => {
	app.quit()
})
app.on('activate', () => {
	if (win) win.show()
})

app.on('ready', function(){

	// var win = new BrowserWindow({})
	// win.loadURL('file://' + __dirname + '/index.html')

	win = new BrowserWindow({
		width: 900,
		height: 610,
		webPreferences: {
			nodeIntegration: false,
			preload: __dirname + '/preload.js'
		}
	})

	// Ctrl+C只会发送win.close 并且如果已登录  窗口还关不掉
	// 所以干脆改为窗口关闭 直接退出
	// https://github.com/electron/electron/issues/5273
	win.on('close', e => {
		e.preventDefault()
		quitApp()
	})

	win.loadURL('https://wx.qq.com/?lang=zh_CN&t=' + Date.now())

	// electron api DownloadItem
	// https://github.com/atom/electron/blob/master/docs/api/download-item.md
	win.webContents.session.on('will-download', function(e, item){
		//e.preventDefault()
		var url = item.getURL()
		var mime = item.getMimeType()
		var filename = item.getFilename()
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

