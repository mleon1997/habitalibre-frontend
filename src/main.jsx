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
 * ✅ Detecta “Capacitor NATIVO” (Android/iOS) de forma segura
 * - En web puede existir window.Capacitor, pero isNativePlatform() debe ser false.
 */
function isNativeCapacitor() {
  try {
    const C = window?.Capacitor;

    // Capacitor moderno
    if (typeof C?.isNativePlatform === "function") {
      return C.isNativePlatform() === true;
    }

    // Fallback (Capacitor.getPlatform)
    if (typeof C?.getPlatform === "function") {
      return C.getPlatform() !== "web";
    }

    // Si no hay API, asumimos NO nativo (web)
    return false;
  } catch {
    return false;
  }
}

/**
 * ✅ Redirect SOLO en app nativa
 * - En web: NUNCA redirige
 */
function ensureCorrectEntryForNativeApp() {
  try {
    if (!isNativeCapacitor()) return;

    const hash = String(window.location.hash || "");
    const isAlreadyInApp = hash.startsWith("#/app");

    if (!isAlreadyInApp) {
      window.location.replace("#/app?mode=mobile");
    }
  } catch {
    // no-op
  }
}

ensureCorrectEntryForNativeApp();

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