// this server is just there for testing public URL copy feature on the client side. It just serves static content (which at the end would be achieved via NGinx)
const express = require('express')
const app = express()
const port = 3111

require('dotenv').config()

app.use(express.static(process.env.ROOT))

app.listen(port, () => {
  console.log(`Image server running http://localhost:${port}`)
})
