const { readdirSync, readFileSync, statSync } = require('fs')
const { join } = require('path')
const FileType = require('file-type')

module.exports = async (dir = '') => {
  if (dir.length === 0) {
    dir = process.cwd()
  }
  const files = readdirSync(dir)
    .filter(filterFiles)
    .map(getData(dir))
  return {
    dir: dir.replace(process.cwd(), ''),
    publicUrl: process.env.PUBLIC_URL,
    files: (await Promise.all(files)).sort(sortFiles)
  }
}

function filterFiles (file) {
  // filter out hidden file
  return !file.startsWith('.')
}

function getData (dir) {
  return async file => {
    const filePath = join(dir, file)
    return {
      key: file,
      content: statSync(filePath).isDirectory() ? null : await getContent(filePath)
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

async function getContent (file) {
  const { mime } = await FileType.fromFile(file) || { mime: 'application/octet-stream' }
  return `data:${mime};base64,${readFileSync(file, 'base64')}`
}
