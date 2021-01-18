const { unlinkSync } = require('fs')
const getPath = require('../utils/get-path.js')

module.exports = (req, res) => {
  const { key } = req.body
  const filePath = getPath(key)
  unlinkSync(filePath)
  res.status(200).send(`File ${key} successfully deleted!`)
}
