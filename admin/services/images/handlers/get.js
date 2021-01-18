const getFiles = require('../utils/get-files.js')
const getPath = require('../utils/get-path.js')

module.exports = (req, res) => {
  res.json(getFiles(getPath()))
}
