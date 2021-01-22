import appendPath from './append-path.js'

export function getInit (method, body) {
  return {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
}

export function uploadFiles (files, opts, cb) {
  if (files.length === 0) {
    return
  }
  const { apiUrl, path } = opts
  let reqIndex = 0
  for (const file of Array.from(files)) {
    const reader = new window.FileReader()
    const loadHandler = async function (e) {
      const key = appendPath(path, file.name)
      const content = e.target.result
      const res = await window.fetch(`${apiUrl}/create`, getInit('POST', { key, content }))
      if (res.status === 400) {
        window.alert(await res.text())
      }
      reqIndex++
      if (reqIndex === files.length) {
        cb() // we want to call the callback once all files have been sent to the server
      }
    }
    reader.addEventListener('load', loadHandler, false)
    reader.readAsDataURL(file)
  }
}
