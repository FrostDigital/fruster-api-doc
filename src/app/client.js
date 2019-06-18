import React from "react";
import { hydrate } from "react-dom";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";

hydrate(<App {...window._APP_STATE_} />, document.getElementById("root"));

registerServiceWorker();