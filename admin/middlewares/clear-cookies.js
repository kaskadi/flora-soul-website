module.exports = (req, res, next) => {
  res.clearCookie('API_KEY')
  next()
}
