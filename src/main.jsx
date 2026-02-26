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

function BootBanner() {
  // 👇 opcional: puedes borrar este componente cuando ya todo esté estable
  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        left: 10,
        zIndex: 9999999,
        background: "rgba(16,185,129,0.18)",
        border: "1px solid rgba(16,185,129,0.35)",
        color: "#eafff6",
        padding: "8px 10px",
        borderRadius: 12,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 12,
        letterSpacing: 1.5,
      }}
    >
      BOOT OK ✅ (main.jsx)
    </div>
  );
}

/**
 * ✅ Redirect SOLO en app nativa (Capacitor)
 * - En web: NO toca el hash.
 * - En Android/iOS: si estás en "/" te manda a "#/app?mode=mobile"
 */
function ensureCorrectEntryForCapacitor() {
  try {
    const isCapacitor = !!window?.Capacitor;
    if (!isCapacitor) return;

    const hash = String(window.location.hash || ""); // "#/app?mode=mobile"
    const isAlreadyInApp = hash.startsWith("#/app");

    if (!isAlreadyInApp) {
      // OJO: replace para no ensuciar historial
      window.location.replace("#/app?mode=mobile");
    }
  } catch {
    // no-op
  }
}

ensureCorrectEntryForCapacitor();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BootBanner />
    <CustomerAuthProvider>
      <LeadCaptureProvider>
        <App />
      </LeadCaptureProvider>
    </CustomerAuthProvider>
  </React.StrictMode>
);