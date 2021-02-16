const verify = require('express-kaskadi-verify')('http://localhost:9192')
const express = require('express')
const app = express()
const port = 3100

const { existsSync } = require('fs')
const { join } = require('path')

app.set('view engine', 'pug')
const viewsPath = join(__dirname, 'views')
app.set('views', viewsPath)
app.use(express.static(viewsPath))

app.use(verify({ issuer: ['flora-soul.com'] }))

app.get('/', (req, res) => {
  res.render('index', {})
})

app.get('/:view', (req, res) => {
  const { view } = req.params
  if (!existsSync(join(__dirname, 'views', `${view}.pug`))) {
    res.status(404).send('This page does not exist')
  } else {
    res.render(view, {})
  }
})

app.listen(port, () => {
  console.log(`Admin page hosted at http://localhost:${port}. Don't forget to start all related APIs!`)
})
