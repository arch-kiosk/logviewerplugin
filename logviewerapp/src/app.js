import { KioskApp } from "../../../../static/scripts/kioskapplib/kioskapp";
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
        props.filters = { type: Object };

        return props;
    }

    constructor() {
        super();
        this.logFilename = "";
        this.logLines = [];
        this.hours = [];
        this.selectedHourIndex = 0;
        this.filters = { debug: false, info: true, warning: true, error: true };
        this.MAX_LINES = 200;
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
        this.showProgress = true;
        this.apiContext
            .fetchFromApi("logviewer", `${this.logFilename}/log-lines`, {
                caller: "logviewerapp._fetchLog",
            })
            .then((data) => {
                this.logLines = [];
                this.hours = [];
                let lastTS = 0;
                let c = 0;
                let severity = 0;
                // noinspection JSUnresolvedVariable
                data.log_lines.map((rawLine) => {
                    if (rawLine.trim() !== "") {
                        // noinspection RegExpRedundantEscape
                        let match = /^>\[(?<pid>\d*)\/(?<tid>\d*)\:(?<type>.*) at (?<ts>.*)\]: (?<msg>.*)\n$/.exec(
                            rawLine,
                        );
                        if (match) {
                            let line = { ...match.groups, ts: DateTime.fromSQL(match.groups.ts) };
                            line.date = line.ts.toLocaleString(DateTime.DATE_SHORT);
                            line.time = line.ts.toLocaleString(DateTime.TIME_24_WITH_SECONDS);
                            if (c > 0 && c % this.MAX_LINES === 0) {
                                // if (line.ts.hour > lastHour) {
                                let hour = `${this.logLines[lastTS].time} - ${line.time}`;
                                this.hours.push({ hour: hour, index: c, severity: severity });
                                lastTS = c + 1;
                                severity = 0;
                            }

                            if (/exception/i.exec(line.msg)) line.type = "error";
                            else {
                                let type = line.type.slice(-2).toLowerCase();
                                switch (type) {
                                    case "or":
                                        line.type = "error";
                                        if (severity < 3) severity = 3;
                                        break;
                                    case "ng":
                                        line.type = "warning";
                                        if (severity < 2) severity = 2;
                                        break;
                                    case "ug":
                                        line.type = "debug";
                                        break;
                                    default:
                                        line.type = "info";
                                        if (severity < 1) severity = 1;
                                }
                            }
                            this.logLines.push(line);
                            c++;
                        } else {
                            console.log("can't parse:", rawLine);
                        }
                    }
                });
                if (c && c % this.MAX_LINES !== 0) {
                    let line = this.logLines[this.logLines.length - 1];
                    let hour = `${this.logLines[lastTS].time} - ${line.time}`;
                    this.hours.push({ hour: hour, index: c, severity: severity });
                }
                this.requestUpdate();
            })
            .finally(() => {
                this.showProgress = false;
            });
    }

    filterClicked(e) {
        let newFilter = { ...this.filters };
        switch (e.currentTarget.id) {
            case "filter-bt-debug":
                newFilter.debug = !newFilter.debug;
                break;
            case "filter-bt-info":
                newFilter.info = !newFilter.info;
                break;
            case "filter-bt-warning":
                newFilter.warning = !newFilter.warning;
                break;
            case "filter-bt-error":
                newFilter.error = !newFilter.error;
                break;
        }
        this.filters = newFilter;
    }

    renderFilter() {
        return html` <div class="toolbar">
            <div class="toolbar-buttons">
                <div
                    id="filter-bt-debug"
                    class="toolbar-button${this.filters.debug ? " pressed" : undefined}"
                    @click="${this.filterClicked}"
                >
                    <i class="fas bt-debug"></i>
                </div>
                <div
                    id="filter-bt-info"
                    class="toolbar-button${this.filters.info ? " pressed" : undefined}"
                    @click="${this.filterClicked}"
                >
                    <i class="fas bt-info"></i>
                </div>
                <div
                    id="filter-bt-warning"
                    class="toolbar-button${this.filters.warning ? " pressed" : undefined}"
                    @click="${this.filterClicked}"
                >
                    <i class="fas bt-warning"></i>
                </div>
                <div
                    id="filter-bt-error"
                    class="toolbar-button${this.filters.error ? " pressed" : undefined}"
                    @click="${this.filterClicked}"
                >
                    <i class="fas bt-error"></i>
                </div>
            </div>
        </div>`;
    }

    hourButtonClicked(e) {
        let clickedHour = e.target.dataset.hour;
        console.log(clickedHour);
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
                                class="hour-button${hour.hour === selectedHour
                                    ? " selected"
                                    : undefined} severity${hour.severity}"
                                @click="${this.hourButtonClicked}"
                                data-hour=${hour.hour}
                            >
                                ${String(hour.hour)}
                            </div>
                        `,
                    )}
                </div>
            `;
        }
        return undefined;
    }
    showLine(type) {
        switch (type) {
            case "debug":
                return this.filters.debug;
            case "info":
                return this.filters.info;
            case "warning":
                return this.filters.warning;
            case "error":
                return this.filters.error;
            default:
                return false;
        }
    }
    // apiRender is only called once the api is connected.
    apiRender() {
        let startIndex;
        let endIndex;

        if (this.logLines.length > 0) {
            startIndex = this.selectedHourIndex > 0 ? this.hours[this.selectedHourIndex - 1].index : 0;

            endIndex = this.hours[this.selectedHourIndex].index;
        }
        return html`
            ${this.renderFilter()} ${this.renderHourSelector()}
            ${this.logLines.length > 0
                ? html` <div class="logline-grid">
                      ${this.logLines.slice(startIndex, endIndex).map(
                          (logLine) => html`
                              ${this.showLine(logLine.type)
                                  ? html`
                                        <div class="logline ${logLine.type} col-1">${logLine.pid}/${logLine.tid}</div>
                                        <div class="logline ${logLine.type} col-2">
                                            <span class="ts-date">${logLine.date}</span>
                                            <span class="ts-time">${logLine.time}</span>
                                        </div>
                                        <div class="logline ${logLine.type}">${logLine.msg}</div>
                                    `
                                  : undefined}
                          `,
                      )}
                  </div>`
                : undefined}
        `;
    }
}

window.customElements.define("logviewer-app", LogViewerApp);
