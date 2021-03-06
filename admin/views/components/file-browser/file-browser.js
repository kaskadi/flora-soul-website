/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'
import join from './utils/join.js'
import { uploadFiles } from './utils/api-utils.js'
import { chop, add } from './utils/original-paths.js'
import dispatchStatus from './utils/status-dispatcher.js'
import { getKey, clearKey } from '../utils/cookies.js'
import './file-list.js'
import './browser-nav.js'
import './browser-controls.js'
import './status-display.js'

class FileBrowser extends KaskadiElement {
  constructor () {
    super()
    const apiTokenName = 'API_KEY'
    this._apiToken = getKey(apiTokenName)
    clearKey(apiTokenName)
    this.selectedFile = null
    this.path = (new URL(window.location)).searchParams.get('path') || '' // check if a path was provided as query string, else load the root of the folder
    this.showOriginal = false
    this.dragCounter = 0
  }

  static get properties () {
    return {
      apiUrl: {
        type: String,
        attribute: 'api-url'
      },
      wsUrl: {
        type: String,
        attribute: 'web-socket-url'
      },
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
      },
      showOriginal: {
        type: Boolean,
        attribute: false
      }
    }
  }

  updateFiles (files, publicUrl = this.publicUrl) {
    // reset focus
    this.shadowRoot.querySelector('fs-file-list').focus = null
    this.publicUrl = publicUrl
    this.shadowRoot.querySelector('fs-file-list').files = files
  }

  async navigate (path) {
    const res = await fetch(`${this.apiUrl}?path=${path}&token=${this._apiToken}`)
    const { status } = res
    dispatchStatus('loading...')
    if (status === 404) {
      this.updateFiles(null)
    } else if (status === 200) {
      const { files, publicUrl } = await res.json()
      this.updateFiles(files, publicUrl)
    }
    dispatchStatus('ready', 1)
  }

  selectHandler (e) {
    this.selectedFile = e.detail
  }

  openHandler (e) {
    const { content, key } = e.detail
    const filePath = join(this.path, key)
    if (!content) {
      this.path = filePath
    } else {
      dispatchStatus('downloading...')
      window.open(`${this.apiUrl}download?key=${filePath}&token=${this._apiToken}`)
      dispatchStatus('ready', 1)
    }
  }

  async contextActionHandler (e) {
    const controls = this.shadowRoot.querySelector('fs-browser-controls')
    const operations = {
      upload: controls.uploadHandler.bind(controls),
      new: controls.newFolderHandler.bind(controls),
      rename: controls.renameHandler.bind(controls),
      delete: controls.deleteHandler.bind(controls),
      'copy-url': function () {
        return navigator.clipboard.writeText(join(this.publicUrl, this.path, this.selectedFile.key))
      }.bind(this)
    }
    await operations[e.detail]()
  }

  navHandler (e) {
    this.path = e.detail
  }

  showOriginalHandler (e) {
    this.showOriginal = e.detail
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
    const { apiUrl, path } = this
    uploadFiles(e.dataTransfer.files, { apiUrl, path, apiToken: this._apiToken })
  }

  firstUpdated (changedProperties) {
    // we need to attach event listener to drag & drop zone here instead of connectedCallback because at this point the div does not exist
    const dropbox = this.shadowRoot.querySelector('#dropbox')
    dropbox.addEventListener('dragenter', this.dragenter.bind(this), false)
    dropbox.addEventListener('dragover', this.dragover.bind(this), false)
    dropbox.addEventListener('dragleave', this.dragleave.bind(this), false)
    dropbox.addEventListener('drop', this.drop.bind(this), false)
    // connect to WebSocket and update files when receiving new data. This needs to be here and not in the constructor because we need the data from this.wsUrl
    this.ws = new WebSocket(`${this.wsUrl}ws`)
    this.ws.addEventListener('message', function (e) {
      const { files, dir, publicUrl } = JSON.parse(e.data)
      if (this.path === dir) {
        this.updateFiles(files, publicUrl)
      }
    }.bind(this))
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

  updated (changedProperties) {
    if (changedProperties.has('path')) {
      this.navigate(this.path)
    }
    if (changedProperties.has('showOriginal')) {
      this.path = this.showOriginal ? add(this.path) : chop(this.path)
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
        <fs-browser-nav path="${this.path}" ?showOriginal="${this.showOriginal}" @path-nav="${this.navHandler}"></fs-browser-nav>
        <div id="dropbox">
          <fs-file-list path="${this.path}" @file-select="${this.selectHandler}" @file-open="${this.openHandler}" @context-action="${this.contextActionHandler}"></fs-file-list>
          <div id="drop-overlay" ?hidden="${this.dragCounter === 0}">
            <div>Drop your files here!</div>
          </div>
        </div>
        <fs-browser-controls ._apiToken="${this._apiToken}" .selectedFile="${this.selectedFile}" apiUrl="${this.apiUrl}" path="${this.path}" ?showOriginal="${this.showOriginal}" @show-original="${this.showOriginalHandler}"></fs-browser-controls>
      </div>
      <fs-status></fs-status>
    `
  }
}

customElements.define('fs-file-browser', FileBrowser)
