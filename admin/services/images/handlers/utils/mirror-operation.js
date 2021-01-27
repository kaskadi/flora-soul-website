// this function allow to execute an operation on a key and all its mirror keys in the .originals folder
const getMatchingFiles = require('./get-matching-files.js')

module.exports = (key, op, ...args) => {
  const originals = getMatchingFiles(`.originals/${key}`)
  for (const file of [...originals, key]) {
    op(file, ...args)
  }
}
