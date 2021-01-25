/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'

class StatusDisplay extends KaskadiElement {
  constructor () {
    super()
    this.statusText = 'loading...'
    this.status = 0
  }

  static get properties () {
    return {
      statusText: { type: String },
      status: { type: Number }
    }
  }

  statusUpdate (e) {
    this.statusText = e.detail.statusText
    this.status = e.detail.status
  }

  connectedCallback () {
    super.connectedCallback()
    // event listener for status update
    window.addEventListener('status-update', this.statusUpdate.bind(this))
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    // status update event listener removal
    window.removeEventListener('status-update', this.statusUpdate)
  }

  static get styles () {
    return css`
      :host {
        display: inline-block
      }
      div {
        font-weight: bold;
      }
      div span {
        color: orange;
      }
      .ready {
        color: green;
      }
    `
  }

  render () {
    return html`
      <div>Status: <span class="${this.status === 1 ? 'ready' : ''}">${this.statusText}<span></div>
    `
  }
}

customElements.define('fs-status', StatusDisplay)
