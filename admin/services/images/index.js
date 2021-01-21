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
app.put('/', require('./handlers/upload.js'))
app.delete('/', require('./handlers/delete.js'))
app.patch('/', require('./handlers/rename.js'))
app.get('/download', require('./handlers/download.js'))

app.use((req, res, next) => {
  process.chdir(__dirname)
  next()
})

app.listen(port, () => {
  console.log(`Images API running http://localhost:${port}`)
})
