const verify = require('express-kaskadi-verify')('http://localhost:9192')
const express = require('express')
const app = express()
const WebSocket = require('ws')
const port = 3110

const getFiles = require('./handlers/utils/get-files.js')
const { dirname, join } = require('path')

require('dotenv').config({ path: join(__dirname, '.env') })

app.use(express.json({ limit: '25mb', extended: false }))

// enable cors in dev environment
if (process.env.NODE_ENV === 'dev') {
  const cors = require('cors')
  app.use(cors())
}

app.use(verify({ issuer: ['flora-soul.com'], audience: ['api'] }))

process.chdir(process.env.ROOT)

app.get('/', require('./handlers/get.js'))
app.get('/download', require('./handlers/download.js'))
app.post('/create', require('./handlers/create.js'), broadcast)
app.post('/rename', require('./handlers/rename.js'), broadcast)
app.post('/delete', require('./handlers/delete.js'), broadcast)

const server = app.listen(port, () => {
  console.log(`Images API running http://localhost:${port}`)
})

const wss = new WebSocket.Server({ server, path: '/ws' })

async function broadcast (req, res, next) {
  const { key } = res.locals
  const dir = dirname(key) === '.' ? '' : dirname(key)
  const files = await getFiles(dir)
  const originalFiles = await getFiles(join('.originals', dir))
  emitFiles(files, wss)
  emitFiles(originalFiles, wss)
  next()
}

function emitFiles (files, wss) {
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(files))
    }
  }
}
