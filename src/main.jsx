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
    <CustomerAuthProvider>
      <LeadCaptureProvider>
        <App />
      </LeadCaptureProvider>
    </CustomerAuthProvider>
  </React.StrictMode>
);npm