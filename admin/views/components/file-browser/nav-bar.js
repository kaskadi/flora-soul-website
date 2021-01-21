/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'

class NavBar extends KaskadiElement {
  constructor () {
    super()
    this.path = ''
  }

  static get properties () {
    return {
      path: { type: String }
    }
  }

  static get styles () {
    return css`
      :host{
        display: inline-block;
      }
      nav div {
        display: inline-block;
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

  clickHandler (pathParts) {
    return function (e) {
      const path = pathParts.slice(0, Number(e.path[0].getAttribute('data-index'))).join('/')
      const event = new CustomEvent('file-nav', {
        detail: path
      })
      this.dispatchEvent(event)
    }.bind(this)
  }

  render () {
    const pathParts = this.path.split('/').filter(part => part.length > 0)
    const createNavPart = (part, i, isBold) => html`
      <div>></div>
      <div class="path-part ${isBold ? 'bold' : ''}" data-index="${i}" @click="${this.clickHandler(pathParts)}">${part}</div>
    `
    return html`
      <nav>
        ${createNavPart('Root', 0, pathParts.length === 0)}
        ${pathParts.map((part, i) => html`
          ${createNavPart(part, i + 1, i === pathParts.length - 1)}
        `)}
      </nav>
    `
  }
}

customElements.define('fs-nav-bar', NavBar)
