const path = require('path')

module.exports = (key = '') => path.join(process.env.ROOT, key)
