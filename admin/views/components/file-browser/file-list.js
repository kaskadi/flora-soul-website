/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'

function getFile (elem) {
  const getData = elem => {
    const src = elem.querySelector('img').src
    return {
      key: elem.querySelector('div').textContent,
      content: src.startsWith('data:') ? src : null
    }
  }
  if (Array.from(elem.classList).includes('file')) {
    return getData(elem)
  }
  return getData(elem.parentNode)
}

class FileList extends KaskadiElement {
  constructor () {
    super()
    this.files = []
    this._focus = null
    this._clickCount = 0
    this._clickTimeout = 500
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
        justify-content: flex-start;
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
        background: #DDD;
      }
    `
  }

  clickHandler (e) {
    this._clickCount++
    if (this._clickCount === 1) {
      this._focus = getFile(e.target)
      this.fileSelect()
      setTimeout(() => {
        if (this._clickCount > 1) {
          this.fileOpen()
        }
        this._clickCount = 0
      }, this._clickTimeout)
    }
  }

  fileSelect () {
    const event = new CustomEvent('file-select', {
      detail: {
        file: this._focus
      }
    })
    this.dispatchEvent(event)
  }

  fileOpen () {
    if (!this._focus.content) {
      const event = new CustomEvent('file-open', {
        detail: {
          key: this._focus.key
        }
      })
      this.dispatchEvent(event)
    }
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
        ${this.files
          ? this.files.map(file => html`
          <div class="file" tabindex="-1" @click=${this.clickHandler} data-file-type=${file.content ? 'file' : 'folder'}>
            <img src="${file.content || 'static/folder.svg'}" height="40">
            <div>${file.key}</div>
          </div>`)
          : html`<div>This destination does not exist</div>`}
      </div>
    `
  }
}

customElements.define('fs-file-list', FileList)
