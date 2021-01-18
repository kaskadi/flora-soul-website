const fs = require('fs')
const path = require('path')
const mime = require('mime-types')

function getFiles (dir) {
  return fs.readdirSync(dir)
    .map(file => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      return stat.isDirectory()
        ? {
            key: file,
            content: getFiles(filePath)
          }
        : {
            key: path.basename(filePath),
            content: getContent(filePath)
          }
    })
}

function getContent (file) {
  const mimeType = mime.lookup(file)
  const content = fs.readFileSync(file, 'base64')
  return `data:${mimeType};base64,${content}`
}

module.exports = getFiles
