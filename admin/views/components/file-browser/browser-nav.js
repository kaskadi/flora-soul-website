/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'

class BrowserNav extends KaskadiElement {
  constructor () {
    super()
    this.path = ''
    this.showOriginal = false
    this.setPathParts()
    this.resetHistory()
  }

  static get properties () {
    return {
      path: { type: String },
      showOriginal: { type: Boolean },
      pathParts: {
        type: Array,
        attribute: false
      }
    }
  }

  setPathParts () {
    this.pathParts = this.path.split('/').filter(part => part.length > 0)
  }

  resetHistory () {
    this._history = []
    this._historyPointer = -1
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
      if (this._history[this._historyPointer] === this.path) {
        // if we are already at the good path in history (i.e. we navigate via prev/next) then we just stop here
        return
      }
      if (this._history[this._historyPointer + 1] !== this.path) {
        // we only want to push the new path in the history if it's not already the next path in line
        this._history = [
          ...this._history.slice(0, this._historyPointer + 1),
          this.path,
          ...this._history.slice(this._historyPointer + 1)
        ]
      }
      this._historyPointer++
    }
    if (changedProperties.has('showOriginal')) {
      // everytime we switch between original images and regular images we want to reset the history to not cross between via navigation
      this.resetHistory()
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
          <button @click="${this.upNav}" ?disabled="${this.path.length === 0 || (this.showOriginal && this.path.length > 1)}">&#11180;</button>
          <button @click="${this.prevNav}" ?disabled="${this._historyPointer < 1}">&#8592;</button>
          <button @click="${this.nextNav}" ?disabled="${this._historyPointer < 0 || this._historyPointer === this._history.length - 1}">&#8594;</button>
        </div>
        <div class="nav-cell flex-row" id="path-nav">
          ${!this.showOriginal
            ? createNavPart('Root', 0, this.pathParts.length === 0)
            : html`<div></div>`
          }
          ${this.pathParts.map((part, i) => html`
            ${createNavPart(part, i + 1, i === this.pathParts.length - 1)}
          `)}
        </div>
      </nav>
    `
  }
}

customElements.define('fs-browser-nav', BrowserNav)
