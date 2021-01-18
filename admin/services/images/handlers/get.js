const getFiles = require('../utils/get-files.js')

module.exports = (req, res) => {
  res.json(getFiles())
}
