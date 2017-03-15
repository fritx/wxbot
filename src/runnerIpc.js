let parent = require('./ipc')(process)

;['log', 'info', 'warn', 'error'].forEach(k => {
  let fn = console[k].bind(console)
  console[k] = (...args) => {
    fn(...args)
    parent.emit('runner', k, args)
  }
})
