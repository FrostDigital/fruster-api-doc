import React from "react";
import { hydrate } from "react-dom";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";

registerServiceWorker();

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded, hydrating react app");
    // @ts-ignore
    hydrate(<App {...window._APP_STATE_} />, document.getElementById("root"));
});