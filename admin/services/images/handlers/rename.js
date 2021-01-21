const { renameSync, existsSync } = require('fs')

module.exports = (req, res) => {
  const { key, oldKey } = req.body
  if (!existsSync(oldKey)) {
    res.status(404).send(`No file named ${oldKey} found...`)
  } else {
    renameSync(oldKey, key)
    res.status(201).send(`File ${key} successfully updated!`)
  }
}
