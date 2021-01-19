const express = require('express')
const app = express()
const port = 3100

const { existsSync } = require('fs')

app.set('view engine', 'pug')
app.use(express.static('views'))

app.get('/', (req, res) => {
  res.render('index', {})
})

app.get('/:view', (req, res) => {
  const { view } = req.params
  if (!existsSync(`views/${view}.pug`)) {
    res.status(404).send('This page does not exist')
  } else {
    res.render(view, {})
  }
})

app.listen(port, () => {
  console.log(`Admin page hosted at http://localhost:${port}. Don't forget to start all related APIs!`)
})
