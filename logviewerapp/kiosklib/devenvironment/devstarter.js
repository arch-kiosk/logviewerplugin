import { KioskApi } from "./devapputils.js";

window.addEventListener("load", () => {
  console.log("let's start...");
  let api = new KioskApi();
  api
    .initApi()
    .then((token) => {
      console.log(`Got a token: ${api.token}`);
      let app = document.querySelector("#kiosk-app");
      if (app != undefined) {
        app.apiContext = api;
        console.log(app.apiContext);
      } else {
        console.log("there is no app.");
      }
    })
    .catch((e) => {
      console.log(e);
    });
});
