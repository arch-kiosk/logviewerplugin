export const API_STATE_UNINITIALZED = 0;
export const API_STATE_INITIALIZING = 1;
export const API_STATE_READY = 2;
export const API_STATE_ERROR = 3;

export class KioskApi {
  const;
  token = "";
  lastErrorMessage = "";

  status = API_STATE_UNINITIALZED;

  getKioskRoute(route_name) {}

  getApiUrl(apiAddress = "") {
    let route = import.meta.env.VITE_DEV_API_URL;
    if (apiAddress) {
      return `${route}/v1/${apiAddress}`;
    } else {
      return route;
    }
  }

  async initApi() {
    this.status = API_STATE_INITIALIZING;
    let headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");
    headers.append("Origin", import.meta.env.VITE_DEV_API_URL);

    let address = this.getApiUrl("login");
    let response;
    try {
      response = await fetch(address, {
        headers: headers,
        body: JSON.stringify({
          userid: import.meta.env.VITE_DEV_API_USER,
          password: import.meta.env.VITE_DEV_API_PWD,
        }),
        method: "POST",
      });
    } catch (e) {
      // console.log(`throwing FetchException after caught ${e}`)
      this.status = API_STATE_ERROR;
      this.lastErrorMessage = e.message;
      throw new FetchException(e, null);
    }
    if (response.ok) {
      let data = await response.json();
      this.token = data["token"];
      this.status = API_STATE_READY;
    } else {
      // console.log(`throwing FetchException ${response.statusText}`)
      this.status = API_STATE_ERROR;
      this.lastErrorMessage = response.statusText;
      throw new FetchException(response.statusText, response);
    }
  }
}
