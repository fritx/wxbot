let { ipcRenderer } = require('electron')

;['log', 'info', 'warn', 'error'].forEach(k => {
  let fn = console[k].bind(console)
  console[k] = (...args) => {
    fn(...args)
    ipcRenderer.send('renderer', k, args)
  }
})
