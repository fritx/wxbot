let { spawn } = require('child_process')
let { join } = require('path')
let ipc = require('./ipc')

let electron = require('electron')
let runner = join(__dirname, 'runner.js')
let proc = spawn(electron, ['--js-flags="--harmony"', runner], {
  stdio: [null, null, null, 'ipc']
})

let child = ipc(proc)
child.on('runner', (k, args) => {
  console[k](`runner:${k}`, ...args)
})

process.on('exit', end)
process.on('SIGINT', end)
process.on('SIGTERM', end)
process.on('SIGQUIT', end)
process.on('SIGHUP', end)
process.on('SIGBREAK', end)

function end () {
  if (proc.connected) proc.disconnect()
  proc.kill()
}
