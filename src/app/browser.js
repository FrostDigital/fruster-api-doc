import React from "react";
import { render } from "react-dom";
import App from "./index";

render(<App {...window._APP_STATE_} />, document.getElementById("root"));