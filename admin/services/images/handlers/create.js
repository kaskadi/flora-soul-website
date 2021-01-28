const { writeFileSync, existsSync, mkdirSync } = require('fs')
const sharp = require('sharp')
const FileType = require('file-type')
const passKey = require('./utils/pass-key.js')

const mapMime = namespace => mime => `${namespace}/${mime}`
const imageMimes = ['bmp', 'gif', 'vnd.microsoft.icon', 'jpeg', 'png', 'svg+xml', 'tiff', 'webp'].map(mapMime('image'))
const applicationMimes = ['pdf'].map(mapMime('application'))
const acceptedMimes = [...imageMimes, ...applicationMimes]

module.exports = async (req, res, next) => {
  const { key, content } = req.body
  const originalKey = `.originals/${key}`
  createStructure(key)
  createStructure(originalKey)
  if (content) {
    await writeFile(key, originalKey, content, res)
  } else {
    mkdirSync(key)
    mkdirSync(originalKey)
    res.status(201).send(`File ${key} successfully saved!`)
  }
  passKey(key, res, next)
}

function createStructure (key) {
  const dirs = key.split('/').slice(0, -1)
  for (let i = 0; i < dirs.length; i++) {
    const dirPath = dirs.slice(0, i + 1).join('/')
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath)
    }
  }
}

async function writeFile (key, originalKey, content, res) {
  const fileContent = content.replace(/^data:[a-z]+\/[a-z]+;base64,/, '') // strip off base64 URL header from string to retrieve actual encoded data
  const bytes = Buffer.from(fileContent, 'base64')
  let { mime } = await FileType.fromBuffer(bytes) || {} // we provide an empty object as fallback for when we can't detect mime type which happens mostly for non-binary files
  mime = mime || isSvg(bytes)
  if (acceptedMimes.includes(mime)) {
    if (imageMimes.includes(mime) && mime !== 'image/webp') {
      // we convert images to webp
      await writeAsWebP(bytes, key, mime)
    } else {
      writeFileSync(key, fileContent, 'base64')
    }
    res.status(201).send(`File ${key} successfully saved!`)
    writeFileSync(originalKey, fileContent, 'base64') // write into folder for original images
  } else {
    res.status(400).send('Invalid file format...')
  }
}

function isSvg (bytes) {
  let binary = ''
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return binary.startsWith('<svg') ? 'image/svg+xml' : undefined
}

function writeAsWebP (bytes, key, mime) {
  return sharp(bytes, { animated: mime === 'image/gif' })
    .webp(
      {
        quality: 100,
        lossless: true
      }
    )
    .toFile(`${key}.webp`)
}
