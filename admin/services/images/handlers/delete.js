const { unlinkSync, existsSync } = require('fs')
const getPath = require('../utils/get-path.js')

module.exports = (req, res) => {
  const { key } = req.body
  const filePath = getPath(key)
  if (!existsSync(filePath)) {
    res.status(404).send(`No file named ${key} found...`)
  } else {
    unlinkSync(filePath)
    res.status(200).send(`File ${key} successfully deleted!`)
  }
}
