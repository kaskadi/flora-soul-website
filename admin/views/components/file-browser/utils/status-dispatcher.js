/* eslint-env browser, mocha */
export default function (statusText, status = 0) {
  const detail = { statusText, status }
  const customEvent = new CustomEvent('status-update', { detail })
  window.dispatchEvent(customEvent)
}
