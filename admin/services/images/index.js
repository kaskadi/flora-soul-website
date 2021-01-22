const express = require('express')
const app = express()
const cors = require('cors')
const { Server } = require('ws')
const port = 3101

global.connections = []

require('dotenv').config()

app.use(express.json({ limit: '25mb', extended: false }))
app.use(cors())

app.use((req, res, next) => {
  process.chdir(process.env.ROOT)
  next()
})

app.get('/', require('./handlers/get.js'))
app.get('/download', require('./handlers/download.js'))
app.post('/create', require('./handlers/create.js'))
app.post('/rename', require('./handlers/rename.js'))
app.post('/delete', require('./handlers/delete.js'))

app.use((req, res, next) => {
  process.chdir(__dirname)
  next()
})

const server = app.listen(port, () => {
  console.log(`Images API running http://localhost:${port}`)
})

const wss = new Server({ server, path: '/ws' })

wss.on('connection', connection => {
  global.connections = [...global.connections, connection]
})
