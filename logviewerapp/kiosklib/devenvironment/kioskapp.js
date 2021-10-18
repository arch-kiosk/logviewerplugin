import { html, css, LitElement } from "lit";
/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
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
    if (this.apiContext) {
      return this.apiRender();
    } else {
      return this.renderNoContextYet();
    }
  }

  renderNoContextYet() {
    return html` please wait ... `;
  }
}
