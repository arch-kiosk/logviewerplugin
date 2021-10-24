import { KioskApp } from "../kiosklib/kioskapp"; //TODO: This needs to move to the shared javascript library in kiosk.
import { DateTime } from "luxon";

import { html, unsafeCSS } from "lit";
import local_css from "/src/static/logviewerapp.sass?inline";

export class LogViewerApp extends KioskApp {
    static styles = unsafeCSS(local_css);

    static get properties() {
        let props = { ...super.properties };

        props.logFilename = { type: String };
        props.logLines = { type: Array };
        props.selectedHourIndex = { type: Number };

        return props;
    }

    constructor() {
        super();
        this.logFilename = "";
        this.logLines = [];
        this.hours = [];
        this.selectedHourIndex = 0;
    }

    firstUpdated(_changedProperties) {
        console.log("firstUpdated", _changedProperties);
    }

    updated(_changedProperties) {
        super.updated(_changedProperties);
        if (_changedProperties.has("apiContext") || _changedProperties.has("logFilename")) {
            if (this.apiContext && this.logFilename) this._fetchLog();
        }
    }

    _fetchLog() {
        this.apiContext
            .fetchFromApi("logviewer", `${this.logFilename}/log-lines`, {
                caller: "logviewerapp._fetchLog",
            })
            .then((data) => {
                this.logLines = [];
                this.hours = [];
                let lastHour = 0;
                let c = 0;
                data.log_lines.map((rawLine) => {
                    if (rawLine.trim() !== "") {
                        let match = /^>\[(?<pid>\d*)\/(?<tid>\d*)\:(?<type>.*) at (?<ts>.*)\]: (?<msg>.*)\n$/.exec(
                            rawLine,
                        );
                        if (match) {
                            let line = { ...match.groups, ts: DateTime.fromSQL(match.groups.ts) };
                            line.date = line.ts.toLocaleString(DateTime.DATE_SHORT);
                            line.time = line.ts.toLocaleString(DateTime.TIME_24_WITH_SECONDS);
                            if (line.ts.hour > lastHour) {
                                this.hours.push({ hour: line.ts.hour, index: c });
                                lastHour = line.ts.hour;
                            }

                            if (/exception/i.exec(line.msg)) line.type = "error";
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
                            c++;
                        } else {
                            console.log("can't parse:", rawLine);
                        }
                    }
                });
                this.requestUpdate();
            });
        // .catch((event) => {});
    }

    renderFilter() {
        return html` <div class="toolbar"></div>`;
    }

    hourButtonClicked(e) {
        let clickedHour = Number(e.target.dataset.hour);
        this.hours.find((hour, index) => {
            if (hour.hour === clickedHour) {
                this.selectedHourIndex = index;
                return true;
            } else return false;
        });
    }

    renderHourSelector() {
        if (this.hours.length > 0) {
            let selectedHour = this.hours[this.selectedHourIndex].hour;
            return html`
                <div class="hour-selector">
                    ${this.hours.map(
                        (hour) => html`
                            <div
                                class="hour-button${hour.hour === selectedHour ? " selected" : undefined}"
                                @click="${this.hourButtonClicked}"
                                data-hour=${hour.hour}
                            >
                                ${String(hour.hour).padStart(2, "0")}:00
                            </div>
                        `,
                    )}
                </div>
            `;
        }
        return undefined;
    }

    // apiRender is only called once the api is connected.
    apiRender() {
        let startIndex;
        let endIndex;

        if (this.logLines.length > 0) {
            startIndex = this.hours[this.selectedHourIndex].index;
            endIndex =
                this.hours.length - 1 > this.selectedHourIndex
                    ? this.hours[this.selectedHourIndex + 1].index
                    : this.logLines.length - 1;
        }
        return html`
            ${this.renderFilter()} ${this.renderHourSelector()}
            ${this.logLines.length > 0
                ? html` <div class="logline-grid">
                      ${this.logLines.slice(startIndex, endIndex).map(
                          (logLine) => html`
                              <div class="logline ${logLine.type} col-1">${logLine.pid}/${logLine.tid}</div>
                              <div class="logline ${logLine.type} col-2">
                                  <span class="ts-date">${logLine.date}</span>
                                  <span class="ts-time">${logLine.time}</span>
                              </div>
                              <div class="logline ${logLine.type}">${logLine.msg}</div>
                          `,
                      )}
                  </div>`
                : undefined}
        `;
    }

    _onClick() {
        this.count++;
    }
}

window.customElements.define("logviewer-app", LogViewerApp);
