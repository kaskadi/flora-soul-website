/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'
import appendPath from './append-path.js'
import { uploadFiles } from './api-utils.js'
import './file-list.js'
import './browser-nav.js'
import './browser-controls.js'

const apiUrl = 'http://localhost:3101'

class FileBrowser extends KaskadiElement {
  constructor () {
    super()
    this.selectedFile = null
    this.path = (new URL(window.location)).searchParams.get('path') || '' // check if a path was provided as query string, else load the root of the folder
    this.dragCounter = 0
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

  controlHandler () {
    this.navigate(this.path)
  }

  updated (changedProperties) {
    if (changedProperties.has('path')) {
      this.navigate(this.path)
    }
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
    uploadFiles(e.dataTransfer.files, { apiUrl, path }, () => this.navigate(this.path))
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
    const dropbox = this.shadowRoot.querySelector('#dropbox')
    dropbox.removeEventListener('dragenter', this.dragenter, false)
    dropbox.removeEventListener('dragover', this.dragover, false)
    dropbox.removeEventListener('dragleave', this.dragleave, false)
    dropbox.removeEventListener('drop', this.drop, false)
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
        height: 500px;
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
        <fs-browser-controls .selectedFile="${this.selectedFile}" apiUrl="${apiUrl}" path="${this.path}" @control-call="${this.controlHandler}"></fs-browser-controls>
      </div>
    `
  }
}

customElements.define('fs-file-browser', FileBrowser)
