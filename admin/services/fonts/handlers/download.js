const { unlinkSync } = require('fs')
const fontFormats = ['ttf', 'woff', 'woff2', 'otf']

module.exports = (req, res) => {
  res.download('fonts.zip', 'fonts.zip', clean)
}

function clean () {
  for (const format of fontFormats) {
    unlinkSync(`font.${format}`)
  }
  unlinkSync('font.afm')
  unlinkSync('fonts.zip')
}
