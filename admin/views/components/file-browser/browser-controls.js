/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'
import appendPath from './utils/append-path.js'
import { getInit, uploadFiles } from './utils/api-utils.js'
import dispatchStatus from './utils/status-dispatcher.js'

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

  async callApi (url, init, status) {
    dispatchStatus(status)
    await window.fetch(url, init)
    dispatchStatus('ready', 1)
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
    this.callApi(`${this.apiUrl}/delete`, getInit('POST', { key: filePath }), 'deleting...')
  }

  renameHandler () {
    let key = window.prompt('New file name')
    if (!key) {
      return
    }
    key = appendPath(this.path, key)
    const oldKey = appendPath(this.path, this.selectedFile.key)
    this.callApi(`${this.apiUrl}/rename`, getInit('POST', { oldKey, key }), 'renaming...')
  }

  newFolderHandler () {
    const name = window.prompt('Folder name')
    if (!name) {
      return
    }
    this.callApi(`${this.apiUrl}/create`, getInit('POST', { key: appendPath(this.path, name) }), 'creating...')
  }

  showOriginalHandler (e) {
    const event = new CustomEvent('show-original', { detail: e.target.checked })
    this.dispatchEvent(event)
  }

  static get styles () {
    return css`
      :host{
        display: inline-block;
        padding: 10px 0;
        background: #DDD;
      }
      .flex-center {
        display: flex;
        flex-flow: row nowrap;
        justify-content: center;
        align-items: center;
        padding: 2px 0;
      }
      #controls button:not([disabled]):hover {
        cursor: pointer;
      }
      #original-control input {
        margin-right: 10px;
      }
    `
  }

  render () {
    return html`
      <div id="controls" class="flex-center">
        <button @click="${this.uploadHandler}">Upload</button>
        <input id="file-picker" type="file" accept="image/*" @change="${this.filePickHandler}" multiple hidden>
        <button @click="${this.newFolderHandler}">New folder</button>
        <button @click="${this.deleteHandler}" ?disabled="${!this.selectedFile}">Delete</button>
        <button @click="${this.renameHandler}" ?disabled="${!this.selectedFile}">Rename</button>
      </div>
      <div id="original-control" class="flex-center">
        <input type="checkbox" name="show-original" @change="${this.showOriginalHandler}">
        <label for"show-original">show original images</label>
      </div>
    `
  }
}

customElements.define('fs-browser-controls', BrowserControls)
