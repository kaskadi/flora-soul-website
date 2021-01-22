const { readdirSync, readFileSync, statSync } = require('fs')
const { join } = require('path')
const { lookup } = require('mime-types')

module.exports = (dir = process.cwd()) => {
  if (dir.length === 0) {
    dir = process.cwd()
  }
  const files = readdirSync(dir)
    .map(file => {
      const filePath = join(dir, file)
      return {
        key: file,
        content: statSync(filePath).isDirectory() ? null : getContent(filePath)
      }
    })
  return {
    dir: dir.replace(process.cwd(), ''),
    files
  }
}

function getContent (file) {
  return `data:${lookup(file)};base64,${readFileSync(file, 'base64')}`
}
