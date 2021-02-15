const express = require('express')
const app = express()
const cors = require('cors')
const port = 3120

app.use(express.json({ limit: '25mb', extended: false }))
app.use(cors())

app.get('/', require('./handlers/convert.js'))

app.listen(port, () => {
  console.log(`Fonts API running http://localhost:${port}`)
})
