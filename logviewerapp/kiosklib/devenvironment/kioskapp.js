import { html, css, LitElement } from "lit";
import { API_STATE_ERROR, API_STATE_READY } from "./devapputils";

export class KioskApp extends LitElement {
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
    return html` please wait ... `;
  }
  renderApiError() {
    return html`
      Error. Cannot connect to Kiosk API: ${this.apiContext.lastErrorMessage}
    `;
  }
}
