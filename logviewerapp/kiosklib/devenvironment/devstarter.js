import { KioskApi } from "./devapputils.js";

window.addEventListener("load", () => {
  console.log("let's start...");
  let api = new KioskApi();
  api
    .initApi()
    .then((token) => {})
    .catch((e) => {
      console.log(`Exception when intializing: ${e}`);
      app.apiContext = api;
    })
    .finally(() => {
      let app = document.querySelector("#kiosk-app");
      if (app != undefined) {
        app.apiContext = api;
        console.log(app.apiContext);
      } else {
        console.log("there is no app.");
      }
    });
});
