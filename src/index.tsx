import React from "react";
import ReactDOM from "react-dom";
import { injectSpeedInsights } from "@vercel/speed-insights";
import "./index.css";
import "./i18n";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// Use the framework-independent SDK because this app uses React 17.
injectSpeedInsights();

// Remove registrations left by older versions of the application.
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
