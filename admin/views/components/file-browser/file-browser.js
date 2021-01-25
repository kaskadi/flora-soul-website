/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'
import appendPath from './append-path.js'
import { uploadFiles } from './api-utils.js'
import dispatchStatus from './status-dispatcher.js'
import './file-list.js'
import './browser-nav.js'
import './browser-controls.js'
import './status-display.js'

const apiUrl = 'http://localhost:3101'
const wsUrl = 'ws://localhost:3101'

class FileBrowser extends KaskadiElement {
  constructor () {
    super()
    this.selectedFile = null
    this.path = (new URL(window.location)).searchParams.get('path') || '' // check if a path was provided as query string, else load the root of the folder
    this.dragCounter = 0
    // connect to WebSocket and update files when receiving new data
    this.ws = new WebSocket(`${wsUrl}/ws`)
    this.ws.addEventListener('message', function (e) {
      const { files, dir } = JSON.parse(e.data)
      if (this.path === dir) {
        this.updateFiles(files)
      }
    }.bind(this))
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
      },
      dragCounter: {
        type: Number,
        attribute: false
      }
    }
  }

  updateFiles (files) {
    // reset focus
    this.shadowRoot.querySelector('fs-file-list').focus = null
    this.shadowRoot.querySelector('fs-file-list').files = files
  }

  async navigate (path) {
    const res = await fetch(`${apiUrl}?path=${path}`)
    const { status } = res
    if (status === 404) {
      this.updateFiles(null)
    } else if (status === 200) {
      const { files } = await res.json()
      this.updateFiles(files)
    }
  }

  selectHandler (e) {
    this.selectedFile = e.detail
  }

  openHandler (e) {
    const { content, key } = e.detail
    const filePath = appendPath(this.path, key)
    if (!content) {
      this.path = filePath
    } else {
      window.open(`${apiUrl}/download?key=${filePath}`)
    }
  }

  navHandler (e) {
    this.path = e.detail
  }

  dragenter (e) {
    e.stopPropagation()
    e.preventDefault()
    this.dragCounter++
  }

  dragleave (e) {
    e.stopPropagation()
    e.preventDefault()
    this.dragCounter--
  }

  dragover (e) {
    e.stopPropagation()
    e.preventDefault()
  }

  drop (e) {
    e.stopPropagation()
    e.preventDefault()
    this.dragCounter = 0
    const { path } = this
    uploadFiles(e.dataTransfer.files, { apiUrl, path })
  }

  firstUpdated (changedProperties) {
    // we need to attach event listener to drag & drop zone here instead of connectedCallback because at this point the div does not exist
    const dropbox = this.shadowRoot.querySelector('#dropbox')
    dropbox.addEventListener('dragenter', this.dragenter.bind(this), false)
    dropbox.addEventListener('dragover', this.dragover.bind(this), false)
    dropbox.addEventListener('dragleave', this.dragleave.bind(this), false)
    dropbox.addEventListener('drop', this.drop.bind(this), false)
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    // drag & drop event listeners removal
    const dropbox = this.shadowRoot.querySelector('#dropbox')
    dropbox.removeEventListener('dragenter', this.dragenter, false)
    dropbox.removeEventListener('dragover', this.dragover, false)
    dropbox.removeEventListener('dragleave', this.dragleave, false)
    dropbox.removeEventListener('drop', this.drop, false)
    // disconnect WebSocket
    this.ws.close()
  }

  async updated (changedProperties) {
    if (changedProperties.has('path')) {
      dispatchStatus('loading...')
      await this.navigate(this.path)
      dispatchStatus('ready', 1)
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
      #browser > * {
        width: 100%;
      }
      fs-browser-nav {
        border-bottom: 1px solid black;
      }
      #dropbox {
        position: relative;
        height: 450px;
        overflow-y: auto;
      }
      #dropbox > * {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
      }
      #drop-overlay {
        z-index: 1;
        background-color: rgba(238, 238, 238, 0.9);
      }
      #drop-overlay:not([hidden]) {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      fs-browser-controls {
        border-top: 1px solid black;
      }
      fs-status {
        position: absolute;
        bottom: 20px;
        right: 10px;
        background: #EEE;
        padding: 10px;
        border-radius: 10px;
      }
    `
  }

  render () {
    return html`
      <div id="browser">
        <fs-browser-nav path="${this.path}" @path-nav="${this.navHandler}"></fs-browser-nav>
        <div id="dropbox">
          <fs-file-list @file-select="${this.selectHandler}" @file-open="${this.openHandler}"></fs-file-list>
          <div id="drop-overlay" ?hidden="${this.dragCounter === 0}">
            <div>Drop your files here!</div>
          </div>
        </div>
        <fs-browser-controls .selectedFile="${this.selectedFile}" apiUrl="${apiUrl}" path="${this.path}"></fs-browser-controls>
      </div>
      <fs-status></fs-status>
    `
  }
}

customElements.define('fs-file-browser', FileBrowser)
