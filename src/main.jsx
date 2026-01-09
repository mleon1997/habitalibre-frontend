// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";

import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";

import App from "./App.jsx";
import "./index.css";

import { CustomerAuthProvider } from "./context/CustomerAuthContext.jsx";
import { LeadCaptureProvider } from "./context/LeadCaptureContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CustomerAuthProvider>
      <LeadCaptureProvider>
        <App />
      </LeadCaptureProvider>
    </CustomerAuthProvider>
  </React.StrictMode>
);
