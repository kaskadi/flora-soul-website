/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'
import './context-menu.js'

function getData (file) {
  return {
    key: file.getAttribute('data-key'),
    content: file.getAttribute('data-content')
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
    const menu = this.shadowRoot.querySelector('fs-context-menu')
    menu.hide()
    const dispatchAction = action => () => this.dispatchEvent(new CustomEvent('context-action', { detail: action }))
    let items = [
      {
        name: 'Upload',
        icon: 'static/upload.svg',
        handler: dispatchAction('upload'),
        when: !this.path.startsWith('.originals')
      },
      {
        name: 'New folder',
        icon: 'static/plus.svg',
        handler: dispatchAction('new'),
        when: !this.path.startsWith('.originals')
      }
    ]
    let posX = 0
    let posY = 0
    if (this.focus) {
      items = [
        {
          name: 'Rename',
          icon: 'static/pen.svg',
          handler: dispatchAction('rename'),
          when: !this.path.startsWith('.originals')
        },
        {
          name: 'Delete',
          icon: 'static/trash.svg',
          handler: dispatchAction('delete'),
          when: !this.path.startsWith('.originals')
        },
        {
          name: 'Copy URL',
          icon: 'static/link.svg',
          handler: dispatchAction('copy-url'),
          when: getData(this.focus).content !== null
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
    this.addEventListener('contextmenu', this.openContextMenu.bind(this))
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    window.removeEventListener('keydown', this.unselectFileKey)
    this.removeEventListener('click', this.unselectFileClick)
    this.removeEventListener('contextmenu', this.openContextMenu)
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
    const getThumbnail = content => {
      if (content === null) return 'static/folder.svg'
      const mime = content.split(';')[0].replace('data:', '')
      if (mime === 'application/pdf') return 'static/pdf.svg'
      return content
    }
    return html`
      <div id="file-viewer">
        ${this.files
          ? this.files.map(file => {
            const { content } = file
            let { key } = file
            key = key.trim()
            return html`
              <div class="file" tabindex="-1" @focus=${this.fileFocus} @dblclick="${this.fileOpen}" data-content="${content}" data-key="${key}">
                <img src="${getThumbnail(content)}" height="40">
                <div>${key}</div>
              </div>`
            })
          : html`<div>This destination does not exist</div>`}
      </div>
      <fs-context-menu></fs-context-menu>
    `
  }
}

customElements.define('fs-file-list', FileList)
