const express = require('express')
const app = express()
const port = 3101

require('dotenv').config()

const fs = require('fs')
const path = require('path')
const mime = require('mime-types')

app.use(express.json({ limit: '25mb', extended: false }))

app.get('/', (req, res) => {
  res.json(getFiles(getPath()))
})

app.put('/', (req, res) => {
  const { key, content } = req.body
  const filePath = getPath(key)
  const fileContent = content.replace(/^data:[a-z]+\/[a-z]+;base64,/, '') // strip off base64 URL header from string to retrieve actual encoded data
  fs.writeFileSync(filePath, fileContent, 'base64')
  res.status(201).send(`File ${key} successfully saved!`)
})

app.delete('/', (req, res) => {
  const { key } = req.body
  const filePath = getPath(key)
  fs.unlinkSync(filePath)
  res.status(200).send(`File ${key} successfully deleted!`)
})

app.patch('/', (req, res) => {
  const { key, oldKey } = req.body
  const filePath = getPath(key)
  const oldFilePath = getPath(oldKey)
  const oldFile = fs.readFileSync(oldFilePath, 'base64')
  fs.unlinkSync(oldFilePath)
  fs.writeFileSync(filePath, oldFile, 'base64')
  res.status(201).send(`File ${key} successfully updated!`)
})

function getPath (key = '') {
  return path.join(process.env.ROOT, key)
}

function getFiles (dir) {
  return fs.readdirSync(dir)
    .map(file => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      return stat.isDirectory()
        ? {
            name: file,
            content: getFiles(filePath)
          }
        : {
            name: path.basename(filePath),
            content: getContent(filePath)
          }
    })
}

function getContent (file) {
  const mimeType = mime.lookup(file)
  const content = fs.readFileSync(file, 'base64')
  return `data:${mimeType};base64,${content}`
}

app.listen(port, () => {
  console.log(`Images API running http://localhost:${port}`)
})
