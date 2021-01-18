const { readFileSync, writeFileSync, unlinkSync, existsSync } = require('fs')
const getPath = require('../utils/get-path.js')

module.exports = (req, res) => {
  const { key, oldKey } = req.body
  const filePath = getPath(key)
  const oldFilePath = getPath(oldKey)
  if (!existsSync(oldFilePath)) {
    res.status(404).send(`No file named ${oldKey} found...`)
  } else {
    const oldFile = readFileSync(oldFilePath, 'base64')
    unlinkSync(oldFilePath)
    writeFileSync(filePath, oldFile, 'base64')
    res.status(201).send(`File ${key} successfully updated!`)
  }
}
