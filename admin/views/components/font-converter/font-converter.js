/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'

class FontConverter extends KaskadiElement {
  static get properties () {
    return {
      apiUrl: {
        type: String,
        attribute: 'api-url'
      }
    }
  }

  uploadFont (files, filePicker) {
    if (files.length === 0) return
    const file = Array.from(files)[0]
    const reader = new window.FileReader()
    const loadHandler = async function (e) {
      const data = e.target.result
      const init = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data })
      }
      const res = await window.fetch(this.apiUrl, init)
      if (res.status === 400) {
        window.alert(await res.text())
      } else {
        window.open(this.apiUrl)
      }
      if (filePicker) {
        filePicker.value = ''
      }
    }
    reader.addEventListener('load', loadHandler.bind(this), false)
    reader.readAsDataURL(file)
  }

  filePickHandler (e) {
    const filePicker = e.target
    const { files } = filePicker
    this.uploadFont(files, filePicker)
  }

  uploadHandler () {
    this.shadowRoot.querySelector('#file-picker').click()
  }

  static get styles () {
    return css`
      :host{
        display: block;
        user-select: none;
      }
    `
  }

  render () {
    return html`
      <button @click="${this.uploadHandler}">Convert!</button>
      <input id="file-picker" type="file" accept="font/*" @change="${this.filePickHandler}" hidden>
    `
  }
}

customElements.define('fs-font-converter', FontConverter)
