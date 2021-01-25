import appendPath from './append-path.js'
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

export function uploadFiles (files, opts) {
  if (files.length === 0) {
    return
  }
  const { apiUrl, path } = opts
  dispatchStatus('uploading...')
  let fileIndex = -1
  const filesArray = Array.from(files)
  for (const file of filesArray) {
    const reader = new window.FileReader()
    const loadHandler = async function (e) {
      const key = appendPath(path, file.name)
      const content = e.target.result
      const res = await window.fetch(`${apiUrl}/create`, getInit('POST', { key, content }))
      fileIndex++
      if (res.status === 400) {
        window.alert(await res.text())
      }
      if (fileIndex === filesArray.length - 1) {
        dispatchStatus('ready', 1)
      }
    }
    reader.addEventListener('load', loadHandler, false)
    reader.readAsDataURL(file)
  }
}
