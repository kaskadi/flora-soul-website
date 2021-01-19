/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'
import './file-list.js'

class FileBrowser extends KaskadiElement {
  constructor () {
    super()
    this._selectedFile = null
  }

  static get styles () {
    return css`
      :host{
        display: block;
      }
    `
  }

  selectHandler (e) {
    console.log(e)
    this._selectedFile = e.detail.file
  }

  openHandler (e) {
    console.log(e)
    fetch(`http://localhost:3101?path=${e.detail.key}`)
      .then(async res => {
        const { status } = res
        const files = await res.json()
        if (status === 404) {
          this.shadowRoot.querySelector('fs-file-list').files = null
        } else if (status === 200) {
          this.shadowRoot.querySelector('fs-file-list').files = files
        }
      })
  }

  render () {
    return html`
      <fs-file-list @file-select="${this.selectHandler}" @file-open="${this.openHandler}"></fs-file-list>
    `
  }
}

customElements.define('fs-file-browser', FileBrowser)
