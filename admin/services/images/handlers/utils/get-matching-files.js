// this utility will retrieve all files matching a given key
const { readdirSync } = require('fs')
const { extname, basename, dirname, join } = require('path')

module.exports = (key) => {
  const fileName = stripExt(key)
  const dir = dirname(key)
  return readdirSync(dir)
    .filter(file => stripExt(file) === fileName)
    .map(file => join(dir, file))
}

function stripExt (key) {
  return basename(key).replace(extname(key), '')
}
