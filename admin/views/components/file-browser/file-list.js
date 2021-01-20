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
        user-select: none;
      }
      .file:hover {
        cursor: pointer;
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
    this.focus = e.path[0]
  }

  fileOpen (e) {
    const event = new CustomEvent('file-open', {
      detail: getData(e.path[1])
    })
    this.dispatchEvent(event)
  }

  unselectFile (e) {
    if (e.key === 'Escape') {
      if (this.focus) {
        this.focus.blur()
      }
      this.focus = null
    }
  }

  connectedCallback () {
    super.connectedCallback()
    window.addEventListener('keydown', this.unselectFile.bind(this))
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    window.removeEventListener('keydown', this.unselectFile)
  }

  firstUpdated (changedProperties) {
    fetch('http://localhost:3101')
      .then(res => res.json())
      .then(files => {
        this.files = files
      })
  }

  updated (changedProperties) {
    if (changedProperties.has('focus')) {
      const oldFocus = changedProperties.get('focus')
      const { focus } = this
      const event = new CustomEvent('file-select', {
        detail: focus ? getData(focus) : null
      })
      this.dispatchEvent(event)
      if (focus) {
        focus.classList.add('selected')
      }
      if (oldFocus) {
        oldFocus.classList.remove('selected')
      }
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
