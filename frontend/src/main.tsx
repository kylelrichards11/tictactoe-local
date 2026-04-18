import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { client } from "./client/client.gen";

client.setConfig({ baseUrl: "/api" });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
