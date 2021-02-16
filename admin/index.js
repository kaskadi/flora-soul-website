const verify = require('express-kaskadi-verify')('http://localhost:9192')
const express = require('express')
const app = express()
const port = 3100

const { existsSync } = require('fs')
const { join } = require('path')

require('dotenv').config({ path: join(__dirname, '.env') })

app.set('view engine', 'pug')
const viewsPath = join(__dirname, 'views')
app.set('views', viewsPath)
app.use(express.static(viewsPath))

app.use(verify({ issuer: ['flora-soul.com'], audience: ['admin'] }))

app.use((req, res, next) => {
  res.clearCookie('API_KEY')
  next()
})

app.get('/', (req, res) => {
  res.render('index', {})
})

app.get('/:view', (req, res) => {
  const { view } = req.params
  if (!existsSync(join(__dirname, 'views', `${view}.pug`))) {
    res.status(404).send('This page does not exist')
    return
  }
  if (view !== 'index') {
    res.cookie('API_KEY', process.env.API_TOKEN)
  }
  const apiDomain = process.env.NODE_ENV === 'dev'
    ? 'localhost'
    : 'api.flora-soul.com'
  res.render(view, { apiDomain })
})

app.listen(port, () => {
  console.log(`Admin page hosted at http://localhost:${port}. Don't forget to start all related APIs!`)
})
