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

  fetchApi (init, url = apiUrl) {
    return fetch(url, init)
      .then(() => {
        this.navigate(this.path)
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

  navigate (path) {
    return fetch(`${apiUrl}?path=${path}`)
      .then(async res => {
        const { status } = res
        if (status === 404) {
          this.shadowRoot.querySelector('fs-file-list').files = null
        } else if (status === 200) {
          this.shadowRoot.querySelector('fs-file-list').files = await res.json()
        }
      })
      .then(() => {
        // reset focus
        this.shadowRoot.querySelector('fs-file-list').focus = null
      })
  }

  selectHandler (e) {
    this.selectedFile = e.detail
  }

  openHandler () {
    const { content, key } = this.selectedFile
    const filePath = this.appendPath(key)
    if (!content) {
      this.path = filePath
      this.navigate(this.path)
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
        this.fetchApi(this.getInit('PUT', { key, content }))
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
    this.fetchApi(this.getInit('DELETE', { key: filePath }))
  }

  renameHandler () {
    let key = window.prompt('New file name')
    if (!key) {
      return
    }
    key = this.appendPath(key)
    const oldKey = this.appendPath(this.selectedFile.key)
    this.fetchApi(this.getInit('PATCH', { oldKey, key }))
  }

  newFolderHandler () {
    const name = window.prompt('Folder name')
    if (!name) {
      return
    }
    this.fetchApi(this.getInit('PUT', { key: this.appendPath(name) }))
  }

  static get styles () {
    return css`
      :host{
        display: block;
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
    `
  }

  render () {
    return html`
      <div id="browser">
        <fs-file-list @file-select="${this.selectHandler}" @file-open="${this.openHandler}"></fs-file-list>
        <div id="controls">
          <button @click="${this.uploadHandler}">Upload</button>
          <input id="file-picker" type="file" hidden>
          <button @click="${this.newFolderHandler}">New folder</button>
          <button @click="${this.deleteHandler}" ?disabled="${!this.selectedFile}">Delete</button>
          <button @click="${this.renameHandler}" ?disabled="${!this.selectedFile}">Rename</button>
        </div>
      </div>
    `
  }
}

customElements.define('fs-file-browser', FileBrowser)
