import React from "react";
import { render, hydrate } from "react-dom";
import App from "./App";

// @ts-ignore
hydrate(<App {...window._APP_STATE_} />, document.getElementById("root"));