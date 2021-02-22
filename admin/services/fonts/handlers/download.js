const { unlinkSync } = require('fs')

module.exports = (req, res) => {
  res.download('fonts.zip', 'fonts.zip', clean)
}

function clean () {
  unlinkSync('fonts.zip')
}
