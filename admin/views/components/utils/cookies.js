export function getKey (key) {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith(`${key}=`))
    .split('=')[1]
}

export function clearKey (key) {
  document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}
