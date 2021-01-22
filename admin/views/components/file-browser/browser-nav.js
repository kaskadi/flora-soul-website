/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'

class BrowserNav extends KaskadiElement {
  constructor () {
    super()
    this.path = ''
    this.setPathParts()
    this._history = []
    this._historyPointer = -1
  }

  static get properties () {
    return {
      path: { type: String },
      pathParts: {
        type: Array,
        attribute: false
      }
    }
  }

  setPathParts () {
    this.pathParts = this.path.split('/').filter(part => part.length > 0)
  }

  dispatchNav (detail) {
    const event = new CustomEvent('path-nav', { detail })
    this.dispatchEvent(event)
  }

  pathNav (e) {
    const targetPath = this.pathParts.slice(0, Number(e.path[0].getAttribute('data-index'))).join('/')
    this.dispatchNav(targetPath)
  }

  upNav () {
    const targetPath = this.pathParts.slice(0, -1).join('/')
    this.dispatchNav(targetPath)
  }

  prevNav () {
    this._historyPointer--
    const targetPath = this._history[this._historyPointer]
    this.dispatchNav(targetPath)
  }

  nextNav () {
    this._historyPointer++
    const targetPath = this._history[this._historyPointer]
    this.dispatchNav(targetPath)
  }

  updated (changedProperties) {
    if (changedProperties.has('path')) {
      this.setPathParts()
      if (this._history[this._historyPointer] !== this.path) {
        // we only update the history if the new path is not the one we are currently at
        this._history.push(this.path)
        this._historyPointer++
      }
    }
  }

  static get styles () {
    return css`
      :host{
        display: inline-block;
      }
      .flex-row {
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-start;
        align-items: center;
      }
      .nav-cell {
        box-sizing: border-box;
        padding: 5px 10px;
      }
      #nav-controls {
        border-right: 1px solid black;
      }
      #nav-controls button {
        width: 32px;
        height: 32px;
      }
      #nav-controls button:nth-of-type(1) {
        margin-right: 10px;
      }
      #nav-controls button:not([disabled]):hover {
        cursor: pointer;
      }
      .path-part {
        margin: 0 3px;
      }
      .path-part:hover {
        cursor: pointer;
        background: #DDD;
      }
      .bold {
        font-weight: bold;
      }
    `
  }

  render () {
    const createNavPart = (part, i, isBold) => html`
      <div>></div>
      <div class="path-part ${isBold ? 'bold' : ''}" data-index="${i}" @click="${this.pathNav}">${part}</div>
    `
    return html`
      <nav class="flex-row">
        <div class="nav-cell flex-row" id="nav-controls">
          <button @click="${this.upNav}" ?disabled="${this.path.length === 0}">&#11180;</button>
          <button @click="${this.prevNav}" ?disabled="${this._historyPointer < 1}">&#8592;</button>
          <button @click="${this.nextNav}" ?disabled="${this._historyPointer < 0 || this._historyPointer === this._history.length - 1}">&#8594;</button>
        </div>
        <div class="nav-cell flex-row" id="path-nav">
          ${createNavPart('Root', 0, this.pathParts.length === 0)}
          ${this.pathParts.map((part, i) => html`
            ${createNavPart(part, i + 1, i === this.pathParts.length - 1)}
          `)}
        </div>
      </nav>
    `
  }
}

customElements.define('fs-browser-nav', BrowserNav)
