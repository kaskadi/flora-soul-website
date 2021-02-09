const { existsSync } = require('fs')
const getFiles = require('./utils/get-files.js')

module.exports = async (req, res) => {
  const { path } = req.query
  if (path && !existsSync(path)) {
    res.status(404).send('No file found...')
  } else {
    res.json(await getFiles(path))
  }
}
