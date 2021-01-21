const { writeFileSync, existsSync, mkdirSync } = require('fs')

module.exports = (req, res) => {
  const { key, content } = req.body
  createStructure(key)
  if (content) {
    const fileContent = content.replace(/^data:[a-z]+\/[a-z]+;base64,/, '') // strip off base64 URL header from string to retrieve actual encoded data
    writeFileSync(key, fileContent, 'base64')
  } else {
    mkdirSync(key)
  }
  res.status(201).send(`File ${key} successfully saved!`)
}

function createStructure (key) {
  const dirs = key.split('/').slice(0, -1)
  for (let i = 0; i < dirs.length; i++) {
    const dirPath = dirs.slice(0, i + 1).join('/')
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath)
    }
  }
}
