/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'
import './file-list.js'

const apiUrl = 'http://localhost:3101'

class FileBrowser extends KaskadiElement {
  constructor () {
    super()
    this.selectedFile = null
    this.path = ''
  }

  static get properties () {
    return {
      selectedFile: {
        type: Object,
        attribute: false
      },
      path: {
        type: String,
        attribute: false
      }
    }
  }

  appendPath (suffix) {
    return this.path.length > 0 ? `${this.path}/${suffix}` : suffix
  }

  async fetchApi (init, path = '') {
    await fetch(`${apiUrl}${path}`, init)
    return this.navigate(this.path)
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

  async navigate (path) {
    const res = await fetch(`${apiUrl}?path=${path}`)
    // reset focus
    this.shadowRoot.querySelector('fs-file-list').focus = null
    const { status } = res
    if (status === 404) {
      this.shadowRoot.querySelector('fs-file-list').files = null
    } else if (status === 200) {
      this.shadowRoot.querySelector('fs-file-list').files = await res.json()
    }
  }

  selectHandler (e) {
    this.selectedFile = e.detail
  }

  openHandler (e) {
    const { content, key } = e.detail
    const filePath = this.appendPath(key)
    if (!content) {
      this.path = filePath
    } else {
      window.open(`${apiUrl}/download?key=${filePath}`)
    }
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
        this.fetchApi(this.getInit('POST', { key, content }), '/create')
      }
      reader.addEventListener('load', loadHandler.bind(this), false)
      reader.readAsDataURL(file)
      filePicker.removeEventListener('change', filePickHandler)
    }
    filePicker.addEventListener('change', filePickHandler.bind(this))
  }

  deleteHandler () {
    const key = this.selectedFile.key
    if (!window.confirm(`Do you really want to delete ${key}?`)) {
      return
    }
    const filePath = this.appendPath(key)
    this.fetchApi(this.getInit('POST', { key: filePath }), '/delete')
  }

  renameHandler () {
    let key = window.prompt('New file name')
    if (!key) {
      return
    }
    key = this.appendPath(key)
    const oldKey = this.appendPath(this.selectedFile.key)
    this.fetchApi(this.getInit('POST', { oldKey, key }), '/rename')
  }

  newFolderHandler () {
    const name = window.prompt('Folder name')
    if (!name) {
      return
    }
    this.fetchApi(this.getInit('POST', { key: this.appendPath(name) }), '/create')
  }

  updated (changedProperties) {
    if (changedProperties.has('path')) {
      this.navigate(this.path)
    }
  }

  static get styles () {
    return css`
      :host{
        display: block;
        user-select: none;
      }
      #browser {
        width: 100%;
        border: 1px solid black;
      }
      #browser fs-file-list {
        width: 100%;
        height: 500px;
        overflow-y: auto;
      }
      #controls {
        width: 100%;
        display: flex;
        flex-flow: row nowrap;
        justify-content: center;
        align-items: center;
        border-top: 1px solid black;
        padding: 10px 0;
        background: #DDD;
      }
      #controls button:not([disabled]):hover {
        cursor: pointer;
      }
      nav {
        border-bottom: 1px solid black;
        padding: 5px;
      }
      nav div {
        display: inline-block;
      }
      .path-part:hover {
        cursor: pointer;
        background: #DDD;
      }
      .bold {
        font-weight: bold;
      }
    `
  }

  render () {
    const pathParts = this.path.split('/').filter(part => part.length > 0)
    const createNavPart = (part, i, isBold) => html`
      <div>></div>
      <div class="path-part ${isBold ? 'bold' : ''}" data-index="${i}" @click="${(e) => { this.path = pathParts.slice(0, Number(e.path[0].getAttribute('data-index'))).join('/') }}">${part}</div>
    `
    return html`
      <div id="browser">
        <nav>
          ${createNavPart('Root', 0, pathParts.length === 0)}
          ${pathParts.map((part, i) => html`
            ${createNavPart(part, i + 1, i === pathParts.length - 1)}
          `)}
        </nav>
        <fs-file-list @file-select="${this.selectHandler}" @file-open="${this.openHandler}"></fs-file-list>
        <div id="controls">
          <button @click="${this.uploadHandler}">Upload</button>
          <input id="file-picker" type="file" accept="image/*" hidden>
          <button @click="${this.newFolderHandler}">New folder</button>
          <button @click="${this.deleteHandler}" ?disabled="${!this.selectedFile}">Delete</button>
          <button @click="${this.renameHandler}" ?disabled="${!this.selectedFile}">Rename</button>
        </div>
      </div>
    `
  }
}

customElements.define('fs-file-browser', FileBrowser)
