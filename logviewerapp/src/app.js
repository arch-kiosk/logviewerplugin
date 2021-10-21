import { KioskApp } from "/kiosklib/devenvironment/kioskapp";
import { html, css } from "lit";
import local_css from "/src/static/logviewerapp.sass";

export class LogViewerApp extends KioskApp {
  static get styles() {
    return local_css;
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
  }

  // apiRender is only called once the api is connected.
  apiRender() {
    return html`
      <link rel="stylesheet" href="${this.kiosk_base_url}static/styles.css" />
      <h1>ready!</h1>
    `;
  }

  _onClick() {
    this.count++;
  }
}

window.customElements.define("logviewer-app", LogViewerApp);
