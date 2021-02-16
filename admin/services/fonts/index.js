const verify = require('express-kaskadi-verify')('http://localhost:9192')
const express = require('express')
const app = express()
const cors = require('cors')
const port = 3120

app.use(express.json({ limit: '25mb', extended: false }))
app.use(cors())

app.use(verify({ issuer: ['flora-soul.com'], audience: ['api'] }))

app.post('/', require('./handlers/convert.js'))
app.get('/', require('./handlers/download.js'))

app.listen(port, () => {
  console.log(`Fonts API running http://localhost:${port}`)
})
