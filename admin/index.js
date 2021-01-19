const express = require('express')
const app = express()
const port = 3100

app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render('index', {})
})

app.listen(port, () => {
  console.log(`Admin page hosted at http://localhost:${port}`)
})
