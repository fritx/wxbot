exports.s = s
exports.sa = sa
exports.download = download
exports.delay = delay

async function delay (duration) {
  return new Promise(rs => {
    setTimeout(() => rs(), duration)
  })
}

function download (href, filename = '') {
  console.log('触发下载', filename, href)
  let a = document.createElement('a')
  a.download = filename
  a.href = href
  a.click()
}

function s (selector) {
  return document.querySelector(selector)
}
function sa (selector) {
  return document.querySelectorAll(selector)
}
