import { html, css, LitElement } from "lit";
import { API_STATE_ERROR, API_STATE_READY } from "./kioskapi";

export class KioskApp extends LitElement {
  kiosk_base_url = import.meta.env.VITE_KIOSK_BASE_URL;

  static get properties() {
    return {
      /**
       * The Api Context
       */
      apiContext: { type: Object },
    };
  }

  constructor() {
    super();
    this.apiContext = undefined;
  }

  render() {
    if (this.apiContext && this.apiContext.status == API_STATE_READY) {
      return this.apiRender();
    } else {
      if (this.apiContext && this.apiContext.status == API_STATE_ERROR)
        return this.renderApiError();
      else return this.renderNoContextYet();
    }
  }

  renderNoContextYet() {
    return html`
      <link rel="stylesheet" href="${this.kiosk_base_url}static/styles.css" />
      <h1>please wait ...</h1>
    `;
  }
  renderApiError() {
    return html`
      <link rel="stylesheet" href="${this.kiosk_base_url}static/styles.css" />
      Error. Cannot connect to Kiosk API: ${this.apiContext.lastErrorMessage}
    `;
  }
}
