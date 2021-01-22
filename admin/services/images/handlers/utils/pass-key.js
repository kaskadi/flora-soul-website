module.exports = (key, res, next) => {
  res.locals.key = key
  next()
}
