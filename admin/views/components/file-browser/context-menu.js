/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'

class ContextMenu extends KaskadiElement {
  constructor () {
    super()
    this.items = []
  }

  static get properties () {
    return {
      items: {
        type: Array,
        attribute: false
      }
    }
  }

  show ({ posX, posY }, items) {
    if (isNaN(posX) || isNaN(posY)) {
      // only show if we pass number for positions
      return
    }
    const menu = this.shadowRoot.querySelector('#menu')
    menu.style.top = posX
    menu.style.left = posY
    this.items = items
    menu.style.display = 'block'
  }

  hide () {
    this.shadowRoot.querySelector('#menu').style.display = 'none'
  }

  clickHandler (handler) {
    return function (e) {
      handler(e)
      this.hide()
    }.bind(this)
  }

  static get styles () {
    return css`
      :host{
        display: inline-block;
      }
      #menu {
        position: absolute;
        z-index: 1000;
        background: #FFF;
        border: 1px solid black;
      }
      #menu div {
        padding: 5px 10px;
      }
      #menu div:hover {
        background: #DDD;
      }
    `
  }

  render () {
    return html`
      <div id="menu">
        ${this.items.map(item => html`
          <div @click="${this.clickHandler(item.handler)}">
            ${item.name}
          </div>
        `)}
      </div>
    `
  }
}

customElements.define('fs-context-menu', ContextMenu)
