const { renameSync, existsSync } = require('fs')
const { join } = require('path')
const passKey = require('./utils/pass-key.js')
const mirrorOperation = require('./utils/mirror-operation.js')

module.exports = (req, res, next) => {
  const { key, oldKey } = req.body
  if (!existsSync(oldKey)) {
    res.status(404).send(`No file named ${oldKey} found...`)
  } else {
    const op = (file, key) => {
      const newKey = file.startsWith('.originals') ? join('.originals', key) : key
      renameSync(file, newKey)
    }
    mirrorOperation(oldKey, op, key)
    res.status(201).send(`File ${key} successfully updated!`)
  }
  passKey(key, res, next)
}
