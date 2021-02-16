/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'
import { getKey, clearKey } from '../utils/cookies.js'

class FontConverter extends KaskadiElement {
  constructor () {
    super()
    const apiTokenName = 'API_KEY'
    this._apiToken = getKey(apiTokenName)
    clearKey(apiTokenName)
  }

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
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this._apiToken}`
        },
        body: JSON.stringify({ data })
      }
      const res = await window.fetch(this.apiUrl, init)
      if (res.status === 400) {
        window.alert(await res.text())
      } else {
        window.open(`${this.apiUrl}?token=${this._apiToken}`)
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
      #converter {
        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 500px;
      }
      #converter h1 {
        color: rebeccapurple;
      }
      #converter button {
        font-size: 24px;
      }
      #converter button:hover {
        cursor: pointer;
      }
      #note {
        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        align-items: center;
        font-style: italic;
        margin-top: 15px;
      }
    `
  }

  render () {
    return html`
      <div id="converter">
        <h1>Font converter</h1>
        <button @click="${this.uploadHandler}">Start converting!</button>
        <input id="file-picker" type="file" accept="font/*" @change="${this.filePickHandler}" hidden>
        <div id="note">
          <div>Supports .ttf, .woff, .woff2, .svg</div>
          <div>Will download an archive (.zip) containing the original font in the following formats: .ttf, .woff, .woff2, .svg, .eot, .otf</div>
        </div>
      </div>
    `
  }
}

customElements.define('fs-font-converter', FontConverter)
