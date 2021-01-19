/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'
import './file-list.js'

class FileBrowser extends KaskadiElement {
  static get styles () {
    return css`
      :host{
        display: inline-block;
      }
    `
  }

  render () {
    return html`
      <fs-file-list></fs-file-list>
    `
  }
}

customElements.define('fs-file-browser', FileBrowser)
