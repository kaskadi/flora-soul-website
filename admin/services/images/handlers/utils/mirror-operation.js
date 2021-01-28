// this function allow to execute an operation on a key and its mirror key in the .originals folder
const { statSync } = require('fs')
const { join } = require('path')
const FileType = require('file-type')

module.exports = async (key, op, ...args) => {
  let originalKey = key
  if (!statSync(key).isDirectory()) {
    originalKey = await getOriginalKey(key)
  }
  const original = join('.originals', originalKey)
  op(key, ...args)
  op(original, ...args)
}

async function getOriginalKey (key) {
  const { mime } = await FileType.fromFile(key)
  if (mime === 'image/webp' && key.slice(-5) === '.webp') {
    // if the target file has been converted to webp, we need to update the pointer to the original image
    key = key.slice(0, -5)
  }
  return key
}
