export function chop (path) {
  return path.split('/').length === 1
    ? ''
    : path.split('/').slice(1).join('/')
}

export function add (path) {
  return `.originals${path.length === 0 ? '' : '/'}${path}`
}
