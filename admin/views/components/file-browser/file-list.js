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
    this.focus = null
  }

  static get properties () {
    return {
      files: { type: Array },
      focus: {
        type: Object,
        attribute: false
      }
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
        margin: 5px 5px;
        padding: 5px;
      }
      .file:hover {
        cursor: pointer;
        user-select: none;
        background: #DDD;
      }
      .file:focus {
        outline: none;
      }
      .selected {
        background: #DDD;
      }
    `
  }

  fileFocus (e) {
    const target = e.path[0]
    this.focus = target
    const event = new CustomEvent('file-select', {
      detail: getData(target)
    })
    this.dispatchEvent(event)
  }

  fileOpen (e) {
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

  updated (changedProperties) {
    // if we reset focus
    if (changedProperties.has('focus')) {
      if (this.focus) {
        this.focus.classList.add('selected')
      }
      changedProperties.get('focus').classList.remove('selected')
    }
  }

  render () {
    return html`
      <div id="file-viewer">
        ${this.files
          ? this.files.map(file => html`
          <div class="file" tabindex="-1" @focus=${this.fileFocus} @dblclick="${this.fileOpen}">
            <img src="${file.content || 'static/folder.svg'}" height="40">
            <div>${file.key}</div>
          </div>`)
          : html`<div>This destination does not exist</div>`}
      </div>
    `
  }
}

customElements.define('fs-file-list', FileList)
