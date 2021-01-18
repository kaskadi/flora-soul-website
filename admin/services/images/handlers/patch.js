const { readFileSync, writeFileSync, unlinkSync } = require('fs')
const getPath = require('../utils/get-path.js')

module.exports = (req, res) => {
  const { key, oldKey } = req.body
  const filePath = getPath(key)
  const oldFilePath = getPath(oldKey)
  const oldFile = readFileSync(oldFilePath, 'base64')
  unlinkSync(oldFilePath)
  writeFileSync(filePath, oldFile, 'base64')
  res.status(201).send(`File ${key} successfully updated!`)
}
