/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'

class FileList extends KaskadiElement {
  constructor () {
    super()
    this.files = []
  }

  static get properties () {
    return {
      files: { type: Array }
    }
  }

  static get styles () {
    return css`
      :host{
        display: inline-block;
      }
      #file-viewer {
        display: flex;
        flex-flow: row wrap;
        justify-content: space-between;
        align-items: flex-start;
      }
      .file {
        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        align-items: center;
        margin: 5px 10px;
      }
      .file:hover {
        cursor: pointer;
        user-select: none;
      }
    `
  }

  focusHandler (e) {
    const { target } = e
    const parent = target.parentNode
    const isFile = elem => Array.from(elem.classList).includes('file')
    const setFocus = elem => {
      this._focus = elem
    }
    if (isFile(target)) {
      setFocus(target)
    } else if (parent && isFile(parent)) {
      setFocus(parent)
    } else {
      setFocus(null)
    }
    console.log(this._focus)
  }

  firstUpdated (changedProperties) {
    fetch('http://localhost:3101')
      .then(res => res.json())
      .then(files => {
        this.files = files
      })
  }

  render () {
    return html`
      <div id="file-viewer">
        ${this.files.map(file => html`
        <div class="file" tabindex="-1" @click=${this.focusHandler} data-file-type=${file.content ? 'file' : 'folder'}>
          <img src="${file.content || 'static/folder.svg'}" height="40">
          <div>${file.key}</div>
        </div>`)}
      </div>
    `
  }
}

customElements.define('fs-file-list', FileList)
