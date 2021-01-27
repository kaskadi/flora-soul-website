// this function allow to execute an operation on a key and its mirror key in the .originals folder
const { join, extname } = require('path')

module.exports = (key, op, ...args) => {
  const original = join('.originals', key.replace(extname(key), ''))
  op(key, ...args)
  op(original, ...args)
}
