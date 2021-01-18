const { writeFileSync } = require('fs')
const getPath = require('../utils/get-path.js')

module.exports = (req, res) => {
  const { key, content } = req.body
  const filePath = getPath(key)
  const fileContent = content.replace(/^data:[a-z]+\/[a-z]+;base64,/, '') // strip off base64 URL header from string to retrieve actual encoded data
  writeFileSync(filePath, fileContent, 'base64')
  res.status(201).send(`File ${key} successfully saved!`)
}
