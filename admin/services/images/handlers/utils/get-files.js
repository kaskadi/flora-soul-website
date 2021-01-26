const { readdirSync, readFileSync, statSync } = require('fs')
const { join } = require('path')
const { lookup } = require('mime-types')

module.exports = (dir = '') => {
  if (dir.length === 0) {
    dir = process.cwd()
  }
  return {
    dir: dir.replace(process.cwd(), ''),
    files: readdirSync(dir)
      .filter(filterFiles)
      .map(getData(dir))
      .sort(sortFiles)
  }
}

function filterFiles (file) {
  // filter out hidden file
  return !file.startsWith('.')
}

function getData (dir) {
  return file => {
    const filePath = join(dir, file)
    return {
      key: file,
      content: statSync(filePath).isDirectory() ? null : getContent(filePath)
    }
  }
}

function sortFiles (fileA, fileB) {
  // sort so that folders come before files
  const isContentString = obj => typeof obj.content === 'string'
  if (!isContentString(fileA) && isContentString(fileB)) {
    return -1
  } else if (isContentString(fileA) && !isContentString(fileB)) {
    return 1
  } else {
    return 0
  }
}

function getContent (file) {
  return `data:${lookup(file)};base64,${readFileSync(file, 'base64')}`
}
