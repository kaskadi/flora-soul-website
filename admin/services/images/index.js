const express = require('express')
const app = express()
const cors = require('cors')
const WebSocket = require('ws')
const port = 3101

const getFiles = require('./handlers/utils/get-files.js')
const { dirname } = require('path')

require('dotenv').config()

app.use(express.json({ limit: '25mb', extended: false }))
app.use(cors())

app.use((req, res, next) => {
  process.chdir(process.env.ROOT)
  next()
})

app.get('/', require('./handlers/get.js'))
app.get('/download', require('./handlers/download.js'))
app.post('/create', require('./handlers/create.js'), broadcast)
app.post('/rename', require('./handlers/rename.js'), broadcast)
app.post('/delete', require('./handlers/delete.js'), broadcast)

app.use((req, res, next) => {
  process.chdir(__dirname)
  next()
})

const server = app.listen(port, () => {
  console.log(`Images API running http://localhost:${port}`)
})

const wss = new WebSocket.Server({ server, path: '/ws' })

function broadcast (req, res, next) {
  const { key } = res.locals
  const dir = key.length > 0 ? dirname(key) : ''
  const files = getFiles(dir)
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(files))
    }
  }
  next()
}
