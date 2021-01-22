/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'
import appendPath from './append-path.js'

const mimeSignatures = {
  'image/bmp': ['424d'],
  'image/gif': ['47494638'],
  'image/vnd.microsoft.icon': ['00000100'],
  'image/jpeg': ['ffd8ffdb', 'ffd8ffee', 'ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', 'ffd8ffe3', 'ffd8ffe8'],
  'image/png': ['89504e47'],
  'image/svg+xml': [],
  'image/tiff': ['492049', '49492a00', '4d4d002a', '4d4d002b'],
  'image/webp': ['52494646', '57454250']
}
const acceptedMimes = Object.keys(mimeSignatures)

function bytesToBase64 (bytes) {
  let binary = ''
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return window.btoa(binary)
}

function isSvg (bytes) {
  let binary = ''
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return binary.startsWith('<svg')
}

function checkMimeSignature (header) {
  const compareSig = header => sig => {
    const chars = header.split('').slice(0, sig.length) // we get characters from header and match to the signature length for checking
    return !chars.some((char, i) => char !== sig[i])
  }
  for (const mime in mimeSignatures) {
    if (mimeSignatures[mime].some(compareSig(header))) {
      return mime
    }
  }
  return null
}

function getMime (bytes) {
  const headerArr = bytes.subarray(0, 4)
  let header = ''
  for (let i = 0; i < headerArr.length; i++) {
    header += headerArr[i].toString(16)
  }
  return checkMimeSignature(header)
}

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
    const event = new CustomEvent('control-call', {
      detail: await window.fetch(`${this.apiUrl}${path}`, init)
    })
    this.dispatchEvent(event)
  }

  uploadFile (filePicker, file) {
    const reader = new window.FileReader()
    const loadHandler = async function () {
      filePicker.value = ''
      const { name } = file
      const key = appendPath(this.path, name)
      const bytes = new Uint8Array(reader.result)
      if (acceptedMimes.includes(getMime(bytes)) || isSvg(bytes)) {
        const content = bytesToBase64(bytes)
        await this.fetchApi('/create', getInit('POST', { key, content }))
      } else {
        window.alert(`Invalid file type for ${name}: only images are allowed for upload!`)
      }
    }
    reader.addEventListener('load', loadHandler.bind(this), false)
    reader.readAsArrayBuffer(file)
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
        <input id="file-picker" type="file" accept="${acceptedMimes.join(', ')}" @change="${this.filePickHandler}" multiple hidden>
        <button @click="${this.newFolderHandler}">New folder</button>
        <button @click="${this.deleteHandler}" ?disabled="${!this.selectedFile}">Delete</button>
        <button @click="${this.renameHandler}" ?disabled="${!this.selectedFile}">Rename</button>
      </div>
    `
  }
}

customElements.define('fs-browser-controls', BrowserControls)
