const { rmSync, existsSync } = require('fs')
const mirrorOperation = require('./utils/mirror-operation.js')
const passKey = require('./utils/pass-key.js')

module.exports = (req, res, next) => {
  const { key } = req.body
  if (!existsSync(key)) {
    res.status(404).send(`No file named ${key} found...`)
  } else {
    const op = file => rmSync(file, { force: true, recursive: true })
    mirrorOperation(key, op)
    res.status(200).send(`File ${key} successfully deleted!`)
  }
  passKey(key, res, next)
}
