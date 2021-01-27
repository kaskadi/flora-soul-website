/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'

class ContextMenu extends KaskadiElement {
  constructor () {
    super()
    this.items = []
    this.showMenu = false
  }

  static get properties () {
    return {
      items: {
        type: Array,
        attribute: false
      },
      showMenu: {
        type: Boolean,
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
    menu.style.left = posX
    menu.style.top = posY
    this.items = items
    this.showMenu = true
  }

  hide () {
    this.showMenu = false
  }

  clickHandler (handler) {
    return function (e) {
      this.hide()
      handler(e)
    }.bind(this)
  }

  static get styles () {
    return css`
      :host{
        display: inline-block;
      }
      #menu {
        display: block;
        position: absolute;
        z-index: 1000;
        background: #FFF;
        border: 1px solid black;
      }
      #menu[hidden] {
        display: none;
      }
      #menu div {
        padding: 5px 10px;
      }
      #menu div:hover {
        background: #DDD;
        cursor: pointer;
      }
    `
  }

  render () {
    return html`
      <div id="menu" ?hidden="${!this.showMenu}">
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
