import React from "react";
import ReactDOM from "react-dom/client";
import App from "./MainApp";
import "./index.css";

console.log("MAIN.TSX LOADED V2.2 - FORCE REFRESH");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
