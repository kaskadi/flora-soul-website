const { renameSync, existsSync } = require('fs')
const wsSend = require('./utils/ws-send.js')

module.exports = (req, res) => {
  const { key, oldKey } = req.body
  if (!existsSync(oldKey)) {
    res.status(404).send(`No file named ${oldKey} found...`)
  } else {
    renameSync(oldKey, key)
    wsSend(key)
    res.status(201).send(`File ${key} successfully updated!`)
  }
}
