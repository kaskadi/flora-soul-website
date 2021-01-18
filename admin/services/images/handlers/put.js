const { writeFileSync, existsSync, mkdirSync } = require('fs')
const getPath = require('../utils/get-path.js')

module.exports = (req, res) => {
  const { key, content } = req.body
  createStructure(key)
  const filePath = getPath(key)
  const fileContent = content.replace(/^data:[a-z]+\/[a-z]+;base64,/, '') // strip off base64 URL header from string to retrieve actual encoded data
  writeFileSync(filePath, fileContent, 'base64')
  res.status(201).send(`File ${key} successfully saved!`)
}

function createStructure (key) {
  const dirs = key.split('/').slice(0, -1)
  for (let i = 0; i < dirs.length; i++) {
    let dirPath = dirs.slice(0, i + 1).join('/')
    dirPath = getPath(dirPath)
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath)
    }
  }
}
