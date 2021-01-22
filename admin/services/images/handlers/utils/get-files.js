const { readdirSync, readFileSync, statSync } = require('fs')
const { join } = require('path')
const { lookup } = require('mime-types')

module.exports = (dir = process.cwd()) => {
  if (dir.length === 0) {
    dir = process.cwd()
  }
  return readdirSync(dir)
    .map(file => {
      const filePath = join(dir, file)
      return statSync(filePath).isDirectory()
        ? {
            key: file,
            content: null
          }
        : {
            key: file,
            content: getContent(filePath)
          }
    })
}

function getContent (file) {
  return `data:${lookup(file)};base64,${readFileSync(file, 'base64')}`
}
