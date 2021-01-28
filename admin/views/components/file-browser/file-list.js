/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'
import './context-menu.js'

function getData (file) {
  const src = file.querySelector('img').src
  return {
    key: file.querySelector('div').textContent.trim(),
    content: src.startsWith('data:') ? src : null
  }
}

class FileList extends KaskadiElement {
  constructor () {
    super()
    this.files = []
    this.focus = null
    this.path = ''
  }

  static get properties () {
    return {
      files: { type: Array },
      focus: {
        type: Object,
        attribute: false
      },
      path: {
        type: String,
        hasChanged: () => false // no rerender
      }
    }
  }

  openContextMenu (e) {
    e.preventDefault()
    if (this.path.startsWith('.originals')) return
    const menu = this.shadowRoot.querySelector('fs-context-menu')
    menu.hide()
    const handler = op => () => {
      const event = new CustomEvent('context-action', { detail: op })
      this.dispatchEvent(event)
    }
    let items = [
      {
        name: 'Upload',
        icon: 'static/upload.svg',
        handler: handler('upload')
      },
      {
        name: 'New folder',
        icon: 'static/plus.svg',
        handler: handler('new')
      }
    ]
    let posX = 0
    let posY = 0
    if (this.focus) {
      items = [
        {
          name: 'Rename',
          icon: 'static/pen.svg',
          handler: handler('rename')
        },
        {
          name: 'Delete',
          icon: 'static/trash.svg',
          handler: handler('delete')
        },
        {
          name: 'Copy URL',
          icon: 'static/link.svg',
          handler: handler('copy-url')
        }
      ]
      const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = this.focus
      posX = offsetLeft + offsetWidth / 2
      posY = offsetTop + offsetHeight / 2
    }
    menu.show({ posX, posY }, items)
  }

  fileFocus (e) {
    this.focus = e.path[0]
  }

  fileOpen (e) {
    const event = new CustomEvent('file-open', {
      detail: getData(e.path[1])
    })
    this.dispatchEvent(event)
    this.unselectFile()
  }

  unselectFile () {
    this.shadowRoot.querySelector('fs-context-menu').hide()
    if (this.focus) {
      this.focus.blur()
    }
    this.focus = null
  }

  unselectFileKey (e) {
    if (e.key === 'Escape') {
      this.unselectFile()
    }
  }

  unselectFileClick (e) {
    if (!e.path.some(elem => elem.classList && elem.classList.contains('file'))) {
      this.unselectFile()
    }
  }

  connectedCallback () {
    super.connectedCallback()
    window.addEventListener('keydown', this.unselectFileKey.bind(this))
    this.addEventListener('click', this.unselectFileClick.bind(this))
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    window.removeEventListener('keydown', this.unselectFileKey)
    this.removeEventListener('click', this.unselectFileClick)
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
        height: 100%;
      }
      .file {
        box-sizing: border-box;
        text-align: center;
        display: flex;
        flex-flow: column nowrap;
        justify-content: center;
        align-items: center;
        margin: 5px 5px;
        padding: 5px;
        user-select: none;
      }
      .file div {
        width: 150px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .file:hover {
        cursor: pointer;
        background: #DDD;
      }
      .file:focus {
        outline: none;
      }
      .file:focus div {
        white-space: unset;
        overflow: unset;
        text-overflow: unset;
        overflow-wrap: break-word;
        word-wrap: break-word;
        word-break: break-word;
      }
      .selected {
        background: #DDD;
      }
    `
  }

  render () {
    return html`
      <div id="file-viewer" @contextmenu="${this.openContextMenu}">
        ${this.files
          ? this.files.map(file => html`
          <div class="file" tabindex="-1" @focus=${this.fileFocus} @dblclick="${this.fileOpen}">
            <img src="${file.content || 'static/folder.svg'}" height="40">
            <div>${file.key}</div>
          </div>`)
          : html`<div>This destination does not exist</div>`}
      </div>
      <fs-context-menu></fs-context-menu>
    `
  }
}

customElements.define('fs-file-list', FileList)
