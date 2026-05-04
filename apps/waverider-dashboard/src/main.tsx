import React from "react";
import { createRoot } from "react-dom/client";
import WaveRiderDashboard from "./App";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WaveRiderDashboard />
  </React.StrictMode>,
);
