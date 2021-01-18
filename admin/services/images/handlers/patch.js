const { readFileSync, writeFileSync, unlinkSync, existsSync } = require('fs')

module.exports = (req, res) => {
  const { key, oldKey } = req.body
  if (!existsSync(oldKey)) {
    res.status(404).send(`No file named ${oldKey} found...`)
  } else {
    const oldFile = readFileSync(oldKey, 'base64')
    unlinkSync(oldKey)
    writeFileSync(key, oldFile, 'base64')
    res.status(201).send(`File ${key} successfully updated!`)
  }
}
