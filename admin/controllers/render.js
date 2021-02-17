const { existsSync } = require('fs')

module.exports = (join) => (req, res) => {
  const { view } = req.params
  if (!existsSync(join(__dirname, '..', 'views', `${view}.pug`))) {
    res.status(404).send('This page does not exist')
    return
  }
  if (view !== 'index') {
    res.cookie('API_KEY', process.env.API_TOKEN)
  }
  res.render(view, getViewData(view))
}

function getViewData (view) {
  const { port, prodPath, hasWS } = require('../views/data/data.json').views[view].api
  const isTest = process.env.NODE_ENV === 'dev'
  const domain = isTest ? `localhost:${port}` : 'api.flora-soul.com'
  const path = isTest ? '' : prodPath
  const origin = `${domain}/${path}`
  const getProtocol = (protocol) => `${protocol}${isTest ? '' : 's'}://`
  return {
    apiUrl: `${getProtocol('http')}${origin}`,
    ...hasWS && { wsApiUrl: `${getProtocol('ws')}${origin}` }
  }
}
