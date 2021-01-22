const { rmSync, existsSync } = require('fs')
const wsSend = require('./utils/ws-send.js')

module.exports = (req, res) => {
  const { key } = req.body
  if (!existsSync(key)) {
    res.status(404).send(`No file named ${key} found...`)
  } else {
    rmSync(key, { force: true, recursive: true })
    wsSend(key)
    res.status(200).send(`File ${key} successfully deleted!`)
  }
}
