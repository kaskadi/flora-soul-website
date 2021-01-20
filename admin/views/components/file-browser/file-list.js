/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'

function getData (file) {
  const src = file.querySelector('img').src
  return {
    key: file.querySelector('div').textContent,
    content: src.startsWith('data:') ? src : null
  }
}

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

  fileSelect (e) {
    const event = new CustomEvent('file-select', {
      detail: getData(e.path[0])
    })
    this.dispatchEvent(event)
  }

  fileOpen (e) {
    console.log(e)
    const event = new CustomEvent('file-open', {
      detail: getData(e.path[1])
    })
    this.dispatchEvent(event)
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
          <div class="file" tabindex="-1" @focus=${this.fileSelect} @dblclick="${this.fileOpen}">
            <img src="${file.content || 'static/folder.svg'}" height="40">
            <div>${file.key}</div>
          </div>`)
          : html`<div>This destination does not exist</div>`}
      </div>
    `
  }
}

customElements.define('fs-file-list', FileList)
