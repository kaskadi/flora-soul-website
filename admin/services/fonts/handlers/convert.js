const { writeFileSync, createWriteStream } = require('fs')
const FileType = require('file-type')
const archiver = require('archiver')

const fontFormats = ['ttf', 'woff', 'woff2', 'otf', 'eot', 'svg']
const acceptedMimes = ['font/ttf', 'font/woff', 'font/woff2', 'font/otf', 'application/vnd.ms-fontobject', 'image/svg+xml']

module.exports = async (req, res) => {
  const { data } = req.body
  const [header, content] = data.split(',')
  const mime = await getMime(header, content)
  if (!acceptedMimes.includes(mime)) {
    res.status(400).send('Only font files are allowed for conversion!')
    return
  }
  await convertFont(header, content)
  archiveFonts(res)
}

async function getMime (header, content) {
  return await FileType.fromBuffer(Buffer.from(content)) || header.replace('data:', '').replace(';base64', '')
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

async function convertFont (header, content) {
  let ext = (await getMime(header, content)).split('/').pop()
  if (ext === 'svg+xml') {
    ext = 'svg'
  }
  const src = `font.${ext}`
  writeFileSync(src, content, 'base64')
  const formats = fontFormats.filter(format => format !== ext)
  for (const format of formats) {
    await fontConverter(src, `font.${format}`)
  }
}

function archiveFonts (res) {
  const output = createWriteStream('fonts.zip')
  const archive = archiver('zip', {
    zlib: { level: 9 }
  })
  output.on('finish', function () {
    res.send('OK!')
  })
  archive.pipe(output)
  for (const format of fontFormats) {
    const fileName = `font.${format}`
    archive.file(fileName, { name: fileName })
  }
  archive.finalize()
}
