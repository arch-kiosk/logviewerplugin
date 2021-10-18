import { KioskApp } from "/kiosklib/devenvironment/kioskapp";
import { html, css } from "lit";
/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class LogViewerApp extends KioskApp {
  static get styles() {
    return css`
      :host {
        display: block;
        border: solid 1px gray;
        padding: 16px;
        max-width: 800px;
      }
    `;
  }

  static get properties() {
    let props = super.properties;

    /**
     * The name to say "Hello" to.
     */
    props.name = { type: String };

    /**
     * The number of times the button has been clicked.
     */
    props.count = { type: Number };

    return props;
  }

  constructor() {
    super();
    this.name = "World";
    this.count = 0;
  }

  // apiRender is only called once the api is connected.
  apiRender() {
    return html`
      <h1>Hello, ${this.name}!</h1>
      <button @click=${this._onClick} part="button">
        Click Count: ${this.count}
      </button>
      <slot></slot>
    `;
  }

  _onClick() {
    this.count++;
  }
}

window.customElements.define("logviewer-app", LogViewerApp);
