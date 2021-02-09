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
    if (isNaN(posX) || isNaN(posY)) return // only show if we pass number for positions
    items = items.filter(item => item.when)
    if (items.length === 0) return // only show if there is at least 1 item to show
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
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-start;
        align-items: center;
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
        ${this.items
          .map(item => html`
            <div @click="${this.clickHandler(item.handler)}">
              ${item.icon ? html`<img src="${item.icon}" height="18">` : ''}
              <div>${item.name}</div>
            </div>
          `)}
      </div>
    `
  }
}

customElements.define('fs-context-menu', ContextMenu)
