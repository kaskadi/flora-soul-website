const FileType = require('file-type')

module.exports = async (req, res) => {
  const { data } = req.body
  const { mime } = await FileType.fromBuffer(Buffer.from(data))
  console.log(mime)
}
