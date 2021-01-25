/* eslint-env browser, mocha */
export default function (status) {
  const customEvent = new CustomEvent('status-update', { detail: status })
  window.dispatchEvent(customEvent)
}
