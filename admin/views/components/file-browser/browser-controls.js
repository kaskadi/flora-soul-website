/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'
import appendPath from './append-path.js'
import { getInit, uploadFiles } from './api-utils.js'

class BrowserControls extends KaskadiElement {
  static get properties () {
    return {
      selectedFile: { type: Object },
      apiUrl: {
        type: String,
        hasChanged: () => false // no rerender
      },
      path: {
        type: String,
        hasChanged: () => false // no rerender
      }
    }
  }

  static get styles () {
    return css`
      :host{
        display: inline-block;
      }
      #controls {
        display: flex;
        flex-flow: row nowrap;
        justify-content: center;
        align-items: center;
        padding: 10px 0;
        background: #DDD;
      }
      #controls button:not([disabled]):hover {
        cursor: pointer;
      }
    `
  }

  filePickHandler (e) {
    const filePicker = e.target
    const { files } = filePicker
    const { apiUrl, path } = this
    uploadFiles(files, { apiUrl, path })
  }

  uploadHandler () {
    this.shadowRoot.querySelector('#file-picker').click()
  }

  deleteHandler () {
    const key = this.selectedFile.key
    if (!window.confirm(`Do you really want to delete ${key}?`)) {
      return
    }
    const filePath = appendPath(this.path, key)
    window.fetch(`${this.apiUrl}/delete`, getInit('POST', { key: filePath }))
  }

  renameHandler () {
    let key = window.prompt('New file name')
    if (!key) {
      return
    }
    key = appendPath(this.path, key)
    const oldKey = appendPath(this.path, this.selectedFile.key)
    window.fetch(`${this.apiUrl}/rename`, getInit('POST', { oldKey, key }))
  }

  newFolderHandler () {
    const name = window.prompt('Folder name')
    if (!name) {
      return
    }
    window.fetch(`${this.apiUrl}/create`, getInit('POST', { key: appendPath(this.path, name) }))
  }

  render () {
    return html`
      <div id="controls">
        <button @click="${this.uploadHandler}">Upload</button>
        <input id="file-picker" type="file" accept="image/*" @change="${this.filePickHandler}" multiple hidden>
        <button @click="${this.newFolderHandler}">New folder</button>
        <button @click="${this.deleteHandler}" ?disabled="${!this.selectedFile}">Delete</button>
        <button @click="${this.renameHandler}" ?disabled="${!this.selectedFile}">Rename</button>
      </div>
    `
  }
}

customElements.define('fs-browser-controls', BrowserControls)
