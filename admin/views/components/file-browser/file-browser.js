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

  appendPath (suffix) {
    return this._path.length > 0 ? `${this._path}/${suffix}` : suffix
  }

  fetchApi (init, url = apiUrl) {
    return fetch(url, init)
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

  naviguate (path) {
    return fetch(`${apiUrl}?path=${path}`)
      .then(async res => {
        const { status } = res
        if (status === 404) {
          this.shadowRoot.querySelector('fs-file-list').files = null
        } else if (status === 200) {
          this.shadowRoot.querySelector('fs-file-list').files = await res.json()
        }
      })
  }

  selectHandler (e) {
    this._selectedFile = e.detail.file
  }

  openHandler (e) {
    this._path = this.appendPath(e.detail.key)
    this.naviguate(this._path)
  }

  uploadHandler () {
    const filePicker = this.shadowRoot.querySelector('#file-picker')
    filePicker.click()
    const filePickHandler = function (e) {
      const file = e.target.files[0]
      if (!file) {
        return
      }
      const key = this.appendPath(file.name)
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
    const key = this.appendPath(this._selectedFile.key)
    const init = this.getInit('DELETE', { key })
    this.fetchApi(init)
  }

  renameHandler () {
    let key = window.prompt('New file name')
    if (!key) {
      return
    }
    key = this.appendPath(key)
    const oldKey = this.appendPath(this._selectedFile.key)
    const init = this.getInit('PATCH', { oldKey, key })
    this.fetchApi(init)
  }

  newFolderHandler () {
    const name = window.prompt('Folder name')
    if (!name) {
      return
    }
    this.fetchApi(this.getInit('PUT', { key: this.appendPath(this._path, name) }))
  }

  render () {
    return html`
      <div id="browser">
        <fs-file-list @file-select="${this.selectHandler}" @file-open="${this.openHandler}"></fs-file-list>
        <div id="controls">
          <button @click="${this.uploadHandler}">Upload</button>
          <input id="file-picker" type="file" hidden>
          <button @click="${this.newFolderHandler}">New folder</button>
          <button @click="${this.deleteHandler}">Delete</button>
          <button @click="${this.renameHandler}">Rename</button>
        </div>
      </div>
    `
  }
}

customElements.define('fs-file-browser', FileBrowser)
