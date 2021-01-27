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
      #status {
        font-weight: bold;
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        align-items: center;
        height: 24px;
      }
      #header {
        margin-right: 5px;
      }
      #status-text {
        color: orange;
      }
      #status-text.ready {
        color: green;
      }
      #status img {
        margin-left: 5px;
      }
      #status img[hidden] {
        display: none;
      }
    `
  }

  render () {
    return html`
      <div id="status">
        <div id="header">Status:</div>
        <div id="status-text" class="${this.status === 1 ? 'ready' : ''}">${this.statusText}</div>
        <img src="static/spinner.svg" height="24" ?hidden="${this.status === 1}">
      </div>
    `
  }
}

customElements.define('fs-status', StatusDisplay)
