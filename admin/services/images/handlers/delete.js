const { unlinkSync, existsSync } = require('fs')

module.exports = (req, res) => {
  const { key } = req.body
  if (!existsSync(key)) {
    res.status(404).send(`No file named ${key} found...`)
  } else {
    unlinkSync(key)
    res.status(200).send(`File ${key} successfully deleted!`)
  }
}
