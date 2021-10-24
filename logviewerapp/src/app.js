//TODO: This needs to move to the shared javascript library in kiosk.
import { KioskApp } from "../kiosklib/kioskapp";

import { html, unsafeCSS } from "lit";
import local_css from "/src/static/logviewerapp.sass?inline";

export class LogViewerApp extends KioskApp {
    static styles = unsafeCSS(local_css);

    static get properties() {
        let props = { ...super.properties };

        props.logFilename = { type: String };
        props.logLines = { type: Array };

        return props;
    }

    constructor() {
        super();
        this.logFilename = "";
        this.logLines = [];
    }

    firstUpdated(_changedProperties) {
        console.log("firstUpdated", _changedProperties);
    }

    updated(_changedProperties) {
        super.updated(_changedProperties);
        if (
            _changedProperties.has("apiContext") ||
            _changedProperties.has("logFilename")
        ) {
            if (this.apiContext && this.logFilename) this._fetchLog();
        }
    }

    _fetchLog() {
        this.apiContext
            .fetchFromApi("logviewer", `${this.logFilename}/log-lines`, {
                caller: "logviewerapp._fetchLog",
            })
            .then((data) => {
                console.log("parsing");
                this.logLines = [];
                data.log_lines.map((rawLine) => {
                    if (rawLine.trim() !== "") {
                        let match =
                            /^>\[(?<pid>\d*)\/(?<tid>\d*)\:(?<type>.*) at (?<ts>.*)\]: (?<msg>.*)\n$/.exec(
                                rawLine,
                            );
                        if (match) {
                            let line = { ...match.groups, type: "info" };
                            if (/exception/i.exec(line.msg))
                                line.type = "error";
                            else {
                                let type = line.type.slice(-2).toLowerCase();
                                switch (type) {
                                    case "or":
                                        line.type = "error";
                                        break;
                                    case "ng":
                                        line.type = "warning";
                                        break;
                                    case "ug":
                                        line.type = "debug";
                                        break;
                                    default:
                                        line.type = "info";
                                }
                            }
                            this.logLines.push(line);
                        } else {
                            console.log("can't parse:", rawLine);
                        }
                    }
                });
                console.log("parsing done");
                this.requestUpdate();
            });
        // .catch((event) => {});
    }

    // apiRender is only called once the api is connected.
    apiRender() {
        return html`
            ${this.logLines.map(
                (logLine) => html`
                    <div class="logline ${logLine.type}">
                        <div>${logLine.pid}/${logLine.tid}</div>
                        <div>${logLine.ts}</div>
                        <div>${logLine.msg}</div>
                    </div>
                `,
            )}
        `;
    }

    _onClick() {
        this.count++;
    }
}

window.customElements.define("logviewer-app", LogViewerApp);
