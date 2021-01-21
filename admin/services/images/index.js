const express = require('express')
const app = express()
const cors = require('cors')
const port = 3101

require('dotenv').config()

app.use(express.json({ limit: '25mb', extended: false }))
app.use(cors())

app.use((req, res, next) => {
  process.chdir(process.env.ROOT)
  next()
})

app.get('/', require('./handlers/get.js'))
app.get('/download', require('./handlers/download.js'))
app.post('/', require('./handlers/upload.js'))
app.post('/', require('./handlers/rename.js'))
app.post('/', require('./handlers/delete.js'))

app.use((req, res, next) => {
  process.chdir(__dirname)
  next()
})

app.listen(port, () => {
  console.log(`Images API running http://localhost:${port}`)
})
