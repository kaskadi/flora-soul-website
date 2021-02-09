const { existsSync } = require('fs')
const { basename } = require('path')

module.exports = (req, res) => {
  const { key } = req.query
  if (!key) {
    res.status(400).send('Please provide a key query string parameter for the file to download')
  } else {
    if (!existsSync(key)) {
      res.status(404).send('No file found')
    } else {
      res.download(key, basename(key))
    }
  }
}
