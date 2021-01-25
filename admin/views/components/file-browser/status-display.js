/* eslint-env browser, mocha */
import { KaskadiElement, css, html } from 'https://cdn.klimapartner.net/modules/@kaskadi/kaskadi-element/kaskadi-element.js'

class StatusDisplay extends KaskadiElement {
  static get properties () {
    return {
      status: { type: String }
    }
  }

  statusUpdate (e) {
    this.status = e.detail
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
        position: absolute;
        bottom: 20px;
        right: 10px;
        background: #EEE;
        padding: 10px;
        border-radius: 10px;
      }
      div {
        font-weight: bold;
      }
    `
  }

  render () {
    return html`
      <div>Status: ${this.status}</div>
    `
  }
}

customElements.define('fs-status', StatusDisplay)
