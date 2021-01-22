/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'
import appendPath from './append-path.js'

function getInit (method, body) {
  return {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
}

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
    const res = await window.fetch(`${this.apiUrl}${path}`, init)
    const event = new CustomEvent('control-call', {
      detail: res
    })
    this.dispatchEvent(event)
    return res
  }

  uploadFile (filePicker, file) {
    const reader = new window.FileReader()
    const loadHandler = async function (e) {
      filePicker.value = ''
      const key = appendPath(this.path, file.name)
      const content = e.target.result
      const res = await this.fetchApi('/create', getInit('POST', { key, content }))
      window.alert(await res.text())
    }
    reader.addEventListener('load', loadHandler.bind(this), false)
    reader.readAsDataURL(file)
  }

  filePickHandler (e) {
    const filePicker = e.target
    const { files } = filePicker
    if (files.length === 0) {
      return
    }
    for (const file of Array.from(files)) {
      this.uploadFile(filePicker, file)
    }
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
    this.fetchApi('/delete', getInit('POST', { key: filePath }))
  }

  renameHandler () {
    let key = window.prompt('New file name')
    if (!key) {
      return
    }
    key = appendPath(this.path, key)
    const oldKey = appendPath(this.path, this.selectedFile.key)
    this.fetchApi('/rename', getInit('POST', { oldKey, key }))
  }

  newFolderHandler () {
    const name = window.prompt('Folder name')
    if (!name) {
      return
    }
    this.fetchApi('/create', getInit('POST', { key: appendPath(this.path, name) }))
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
