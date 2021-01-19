const express = require('express')
const app = express()
const port = 3100

app.set('view engine', 'pug')
app.use(express.static('views'))

app.get('/', (req, res) => {
  res.render('index', {})
})

app.listen(port, () => {
  console.log(`Admin page hosted at http://localhost:${port}. Don't forget to start all related APIs!`)
})
