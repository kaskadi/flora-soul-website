const verify = require('express-kaskadi-verify')('http://localhost:9192')
const express = require('express')
const { join } = require('path')
const app = express()
const port = 3100

require('dotenv').config({ path: join(__dirname, '.env') })

// rendering engine settings
app.set('view engine', 'pug')
const viewsPath = join(__dirname, 'views')
app.set('views', viewsPath)
app.use(express.static(viewsPath))

// authorization
app.use(verify({ issuer: ['flora-soul.com'], audience: ['admin'] }))

// clear cookies
app.use(require('./middlewares/clear-cookies.js'))

// endpoints
app.get('/', require('./controllers/render-root.js'))
app.get('/:view', require('./controllers/render.js')(join))

app.listen(port, () => {
  console.log(`Admin page hosted at http://localhost:${port}. Don't forget to start all related APIs!`)
})
