import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import * as fareEstimation from "./lib/fare-estimation";

declare global {
  interface Window {
    fareEstimation?: typeof fareEstimation;
  }
}

if (import.meta.env.DEV) {
  window.fareEstimation = fareEstimation;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
