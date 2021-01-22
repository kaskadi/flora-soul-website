const { rmSync, existsSync } = require('fs')
const passKey = require('./utils/pass-key.js')

module.exports = (req, res, next) => {
  const { key } = req.body
  if (!existsSync(key)) {
    res.status(404).send(`No file named ${key} found...`)
  } else {
    rmSync(key, { force: true, recursive: true })
    res.status(200).send(`File ${key} successfully deleted!`)
  }
  passKey(key, res, next)
}
