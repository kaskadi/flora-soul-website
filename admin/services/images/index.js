const express = require('express')
const app = express()
const port = 3101

require('dotenv').config()

app.use(express.json({ limit: '25mb', extended: false }))

app.get('/', require('./handlers/get.js'))
app.put('/', require('./handlers/put.js'))
app.delete('/', require('./handlers/delete.js'))
app.patch('/', require('./handlers/patch.js'))

app.listen(port, () => {
  console.log(`Images API running http://localhost:${port}`)
})
