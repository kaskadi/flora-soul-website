const { writeFileSync, createWriteStream, unlinkSync } = require('fs')
const FileType = require('file-type')
const archiver = require('archiver')

const fontFormats = ['ttf', 'woff', 'woff2', 'otf', 'eot', 'svg']
const acceptedMimes = ['font/ttf', 'font/woff', 'font/woff2', 'font/otf', 'application/vnd.ms-fontobject', 'image/svg+xml']

module.exports = async (req, res) => {
  const { data } = req.body
  let { name } = req.body
  name = name.split('.').slice(0, -1).join('.')
  const [header, content] = data.split(',')
  const mime = await getMime(header, content)
  if (!acceptedMimes.includes(mime)) {
    res.status(400).send('Only font files are allowed for conversion!')
    return
  }
  await convertFont(name, header, content)
  archiveFonts(name, res)
}

async function getMime (header, content) {
  const bytes = Buffer.from(content, 'base64')
  const mime = await FileType
    .fromBuffer(bytes)
    .then(mimeData => mimeData?.mime)
  if (mime === 'application/xml') {
    const parser = require('fast-xml-parser')
    const xmlData = parser.parse(bytes.toString())
    return xmlData.svg ? 'image/svg+xml' : undefined
  }
  return mime || header.split(':')[1].replace(';base64', '')
}

function fontConverter (src, dest) {
  const fontConverter = require('font-converter')
  return new Promise((resolve, reject) => {
    fontConverter(src, dest, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

async function convertFont (name, header, content) {
  let ext = (await getMime(header, content)).split('/').pop()
  if (ext === 'svg+xml') {
    ext = 'svg'
  }
  const src = `${name}.${ext}`
  writeFileSync(src, content, 'base64')
  const formats = fontFormats.filter(format => format !== ext)
  for (const format of formats) {
    await fontConverter(src, `${name}.${format}`)
  }
}

function archiveFonts (name, res) {
  const output = createWriteStream('fonts.zip')
  const archive = archiver('zip', {
    zlib: { level: 9 }
  })
  output.on('finish', function () {
    for (const format of fontFormats) {
      unlinkSync(`${name}.${format}`)
    }
    unlinkSync(`${name}.afm`)
    res.send('OK!')
  })
  archive.pipe(output)
  for (const format of fontFormats) {
    const fileName = `${name}.${format}`
    archive.file(fileName, { name: fileName })
  }
  archive.finalize()
}
