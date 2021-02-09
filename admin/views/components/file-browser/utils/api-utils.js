import join from './join.js'
import dispatchStatus from './status-dispatcher.js'

export function getInit (method, body) {
  return {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
}

export function uploadFiles (files, opts, filePicker) {
  if (files.length === 0) return
  dispatchStatus('uploading...')
  let fileIndex = -1
  const filesArray = Array.from(files)
  for (const file of filesArray) {
    const reader = new window.FileReader()
    const loadHandler = async function (e) {
      const key = join(opts.path, file.name)
      const content = e.target.result
      const res = await window.fetch(`${opts.apiUrl}/create`, getInit('POST', { key, content }))
      fileIndex++
      if (res.status === 400) {
        window.alert(await res.text())
      }
      if (fileIndex === filesArray.length - 1) {
        dispatchStatus('ready', 1)
        if (filePicker) {
          filePicker.value = ''
        }
      }
    }
    reader.addEventListener('load', loadHandler, false)
    reader.readAsDataURL(file)
  }
}
