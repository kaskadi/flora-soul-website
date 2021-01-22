const getFiles = require('./get-files.js')
const { dirname } = require('path')

module.exports = key => {
  const dir = key.length > 0 ? dirname(key) : ''
  const files = getFiles(dir)
  for (const connection of global.connections) {
    connection.send(JSON.stringify(files))
  }
}
