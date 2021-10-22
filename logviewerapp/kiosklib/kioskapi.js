export const API_STATE_UNINITIALZED = 0;
export const API_STATE_INITIALIZING = 1;
export const API_STATE_READY = 2;
export const API_STATE_ERROR = 3;

//abstract
export class KioskApi {
  const;
  token = "";
  lastErrorMessage = "";

  status = API_STATE_UNINITIALZED;

  getKioskRoute(route_name) {}

  getApiUrl(apiAddress = "") {
    //abstract method
    throw "KioskApi.getApiUrl is abstract and must not be called";
  }

  async initApi() {
    //abstract method
    throw "KioskApi.initApi is abstract and must not be called";
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
