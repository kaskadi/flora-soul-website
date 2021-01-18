const { readdirSync, readFileSync, statSync } = require('fs')
const { join, basename } = require('path')
const { lookup } = require('mime-types')

function getFiles (dir = process.cwd()) {
  return readdirSync(dir)
    .map(file => {
      const filePath = join(dir, file)
      const stat = statSync(filePath)
      return stat.isDirectory()
        ? {
            key: file,
            content: getFiles(filePath)
          }
        : {
            key: basename(filePath),
            content: getContent(filePath)
          }
    })
}

function getContent (file) {
  const mimeType = lookup(file)
  const content = readFileSync(file, 'base64')
  return `data:${mimeType};base64,${content}`
}

module.exports = getFiles
