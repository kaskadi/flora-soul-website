/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'
import appendPath from './append-path.js'

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

  async fetchApi (path, init) {
    const event = new CustomEvent('control-call', {
      detail: await window.fetch(`${this.apiUrl}${path}`, init)
    })
    this.dispatchEvent(event)
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

  uploadHandler () {
    const filePicker = this.shadowRoot.querySelector('#file-picker')
    const filePickHandler = function (e) {
      filePicker.removeEventListener('change', filePickHandler)
      const file = e.target.files[0]
      if (!file) {
        return
      }
      const key = appendPath(this.path, file.name)
      const reader = new window.FileReader()
      const loadHandler = function () {
        reader.removeEventListener('load', loadHandler)
        // convert image file to base64 string
        const content = reader.result
        this.fetchApi('/create', this.getInit('POST', { key, content }))
      }
      reader.addEventListener('load', loadHandler.bind(this), false)
      reader.readAsDataURL(file)
    }
    filePicker.addEventListener('change', filePickHandler.bind(this))
    filePicker.click()
  }

  deleteHandler () {
    const key = this.selectedFile.key
    if (!window.confirm(`Do you really want to delete ${key}?`)) {
      return
    }
    const filePath = appendPath(this.path, key)
    this.fetchApi('/delete', this.getInit('POST', { key: filePath }))
  }

  renameHandler () {
    let key = window.prompt('New file name')
    if (!key) {
      return
    }
    key = appendPath(this.path, key)
    const oldKey = appendPath(this.path, this.selectedFile.key)
    this.fetchApi('/rename', this.getInit('POST', { oldKey, key }))
  }

  newFolderHandler () {
    const name = window.prompt('Folder name')
    if (!name) {
      return
    }
    this.fetchApi('/create', this.getInit('POST', { key: appendPath(this.path, name) }))
  }

  render () {
    return html`
      <div id="controls">
        <button @click="${this.uploadHandler}">Upload</button>
        <input id="file-picker" type="file" accept="image/*" hidden>
        <button @click="${this.newFolderHandler}">New folder</button>
        <button @click="${this.deleteHandler}" ?disabled="${!this.selectedFile}">Delete</button>
        <button @click="${this.renameHandler}" ?disabled="${!this.selectedFile}">Rename</button>
      </div>
    `
  }
}

customElements.define('fs-browser-controls', BrowserControls)
