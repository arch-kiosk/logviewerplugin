// TODO: This needs to point to the kiosk library
import {
  KioskApi,
  API_STATE_ERROR,
  API_STATE_INITIALIZING,
  API_STATE_READY,
  API_STATE_UNINITIALZED,
} from "./kioskapi.js";

export class DevKioskApi extends KioskApi {
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

  async fetchFromApi(
    apiUrl,
    apiToken,
    apiMethod,
    fetchParams,
    apiVersion = "v1",
    urlSearchParams = "",
    mimetype = "application/json"
  ) {
    let headers = new Headers();
    headers.append("Content-Type", mimetype);
    headers.append("Accept", mimetype);
    headers.append("Authorization", `Bearer ${apiToken}`);
    let address = `${apiUrl}/${apiVersion}/${apiMethod}`;
    if ("caller" in fetchParams)
      console.log(`${fetchParams.caller} fetching from ${address}`);
    else console.log("fetching from " + address);
    let init = { ...fetchParams };
    init["headers"] = headers;
    if (urlSearchParams) {
      address += "?" + urlSearchParams;
    }
    let response;
    try {
      console.log("fetching " + address);
      response = await fetch(address, init);
    } catch (err) {
      console.log(`caught ${err} in fetchFromApi after fetch`);
      throw new FetchException(err);
    }
    if (response.ok) {
      return await response.json();
    } else {
      console.log(`caught ${response.status} in fetchFromApi`);
      throw new FetchException(response.statusText, response);
    }
  }
}
