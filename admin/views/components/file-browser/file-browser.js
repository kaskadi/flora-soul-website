/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'
import './file-list.js'

const apiUrl = 'http://localhost:3101'

class FileBrowser extends KaskadiElement {
  constructor () {
    super()
    this._selectedFile = null
    this._path = ''
  }

  static get styles () {
    return css`
      :host{
        display: block;
      }
    `
  }

  fetchApi (init, url = apiUrl) {
    fetch(url, init)
      .then(() => {
        this.naviguate(this._path)
      })
  }

  getInit (method, body) {
    return {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  }

  selectHandler (e) {
    this._selectedFile = e.detail.file
  }

  openHandler (e) {
    this._path = e.detail.key
    this.naviguate(this._path)
  }

  uploadHandler () {
    const filePicker = this.shadowRoot.querySelector('#file-picker')
    filePicker.click()
    const filePickHandler = function (e) {
      const file = e.target.files[0]
      const key = file.name
      if (!file) {
        return
      }
      const reader = new window.FileReader()
      const loadHandler = function () {
        // convert image file to base64 string
        const content = reader.result
        this.fetchApi(this.getInit('PUT', { key, content }))
      }
      reader.addEventListener('load', loadHandler.bind(this), false)
      reader.readAsDataURL(file)
      filePicker.removeEventListener('change', filePickHandler)
    }
    filePicker.addEventListener('change', filePickHandler.bind(this))
  }

  deleteHandler () {
    const init = this.getInit('DELETE', { key: this._selectedFile.key })
    this.fetchApi(init)
  }

  renameHandler () {
    const key = window.prompt('New file name')
    const init = this.getInit('PATCH', { oldKey: this._selectedFile.key, key })
    this.fetchApi(init)
  }

  naviguate (path) {
    fetch(`${apiUrl}?path=${path}`)
      .then(async res => {
        const { status } = res
        if (status === 404) {
          this.shadowRoot.querySelector('fs-file-list').files = null
        } else if (status === 200) {
          this.shadowRoot.querySelector('fs-file-list').files = await res.json()
        }
      })
  }

  render () {
    return html`
      <div id="browser">
        <fs-file-list @file-select="${this.selectHandler}" @file-open="${this.openHandler}"></fs-file-list>
        <div id="controls">
          <button @click="${this.uploadHandler}">Upload</button>
          <input id="file-picker" type="file" hidden>
          <button @click="${this.deleteHandler}">Delete</button>
          <button @click="${this.renameHandler}">Rename</button>
        </div>
      </div>
    `
  }
}

customElements.define('fs-file-browser', FileBrowser)
