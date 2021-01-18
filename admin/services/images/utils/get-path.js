const { join } = require('path')

module.exports = (key = '') => join(process.env.ROOT, key)
