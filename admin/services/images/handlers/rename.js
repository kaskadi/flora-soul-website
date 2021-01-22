const { renameSync, existsSync } = require('fs')
const passKey = require('./utils/pass-key.js')

module.exports = (req, res, next) => {
  const { key, oldKey } = req.body
  if (!existsSync(oldKey)) {
    res.status(404).send(`No file named ${oldKey} found...`)
  } else {
    renameSync(oldKey, key)
    res.status(201).send(`File ${key} successfully updated!`)
  }
  passKey(key, res, next)
}
