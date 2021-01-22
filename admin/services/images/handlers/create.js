const { writeFileSync, existsSync, mkdirSync } = require('fs')
const passKey = require('./utils/pass-key.js')

const mimeSignatures = {
  'image/bmp': ['424d'],
  'image/gif': ['47494638'],
  'image/vnd.microsoft.icon': ['00000100'],
  'image/jpeg': ['ffd8ffdb', 'ffd8ffee', 'ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', 'ffd8ffe3', 'ffd8ffe8'],
  'image/png': ['89504e47'],
  'image/svg+xml': [],
  'image/tiff': ['492049', '49492a00', '4d4d002a', '4d4d002b'],
  'image/webp': ['52494646', '57454250']
}

function isSvg (bytes) {
  let binary = ''
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return binary.startsWith('<svg')
}

function checkMimeSignature (header) {
  const compareSig = header => sig => {
    const chars = header.split('').slice(0, sig.length) // we get characters from header and match to the signature length for checking
    return !chars.some((char, i) => char !== sig[i])
  }
  for (const mime in mimeSignatures) {
    if (mimeSignatures[mime].some(compareSig(header))) {
      return mime
    }
  }
  return null
}

function getMime (bytes) {
  const headerArr = bytes.subarray(0, 4)
  let header = ''
  for (let i = 0; i < headerArr.length; i++) {
    header += headerArr[i].toString(16)
  }
  return checkMimeSignature(header)
}

module.exports = (req, res, next) => {
  const { key, content } = req.body
  createStructure(key)
  if (content) {
    const fileContent = content.replace(/^data:[a-z]+\/[a-z]+;base64,/, '') // strip off base64 URL header from string to retrieve actual encoded data
    const bytes = Buffer.from(fileContent, 'base64')
    if (Object.keys(mimeSignatures).includes(getMime(bytes)) || isSvg(bytes)) {
      writeFileSync(key, fileContent, 'base64')
      res.status(201).send(`File ${key} successfully saved!`)
    } else {
      res.status(400).send('Invalid file format: only images are allowed for upload...')
    }
  } else {
    mkdirSync(key)
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
