/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'
import appendPath from './append-path.js'
import './file-list.js'
import './browser-nav.js'
import './browser-controls.js'

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
      #browser fs-browser-nav {
        width: 100%;
        box-sizing: border-box;
        border-bottom: 1px solid black;
        padding: 5px;
      }
      #browser fs-file-list {
        width: 100%;
        height: 500px;
        overflow-y: auto;
      }
      #browser fs-browser-controls {
        width: 100%;
        border-top: 1px solid black;
      }
    `
  }

  render () {
    return html`
      <div id="browser">
        <fs-browser-nav path="${this.path}" @file-nav="${this.navHandler}"></fs-browser-nav>
        <fs-file-list @file-select="${this.selectHandler}" @file-open="${this.openHandler}"></fs-file-list>
        <fs-browser-controls .selectedFile="${this.selectedFile}" apiUrl="${apiUrl}" path="${this.path}" @control-call="${this.controlHandler}"></fs-browser-controls>
      </div>
    `
  }
}

customElements.define('fs-file-browser', FileBrowser)
