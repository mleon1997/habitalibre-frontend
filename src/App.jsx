// src/App.jsx
import React, { useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import AdminAuthListener from "./components/AdminAuthListener.jsx";
import CustomerAuthListener from "./components/CustomerAuthListener.jsx";
import AdminProtectedRoute from "./components/AdminProtectedRoute.jsx";
import CustomerProtectedRoute from "./components/CustomerProtectedRoute.jsx";

// Lead capture
import { LeadCaptureProvider } from "./context/LeadCaptureContext.jsx";
import LeadModalBare from "./components/LeadModalBare.jsx";

// Layout público
import AppLayoutShell from "./layouts/AppLayoutShell.jsx";

// Páginas
import AppJourney from "./pages/AppJourney.jsx";
import Landing from "./pages/Landing.jsx";
import LandingAds from "./pages/LandingAds.jsx";
import SimuladorPage from "./pages/SimuladorPage.jsx";
import Gracias from "./pages/Gracias.jsx";
import Leads from "./pages/Leads.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Progreso from "./pages/Progreso.jsx";

// Admin pages
import Admin from "./pages/Admin.jsx";
import AdminLeads from "./pages/AdminLeads.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";

// Legal
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad.jsx";
import TerminosUso from "./pages/TerminosUso.jsx";
import PoliticaCookies from "./pages/PoliticaCookies.jsx";

/** ✅ Overlay global para ver errores en WebView */
function GlobalErrorOverlay() {
  const [err, setErr] = useState(null);

  useEffect(() => {
    const onError = (event) => {
      try {
        const message =
          event?.message ||
          event?.error?.message ||
          "Unknown error (window.onerror)";

        const stack =
          event?.error?.stack ||
          (typeof event?.error === "string" ? event.error : "") ||
          "";

        setErr({ type: "error", message, stack });
      } catch {
        setErr({ type: "error", message: "Unknown error", stack: "" });
      }
    };

    const onRejection = (event) => {
      try {
        const reason = event?.reason;
        const message =
          reason?.message ||
          (typeof reason === "string" ? reason : "Unhandled promise rejection");

        const stack = reason?.stack || "";

        setErr({ type: "rejection", message, stack });
      } catch {
        setErr({ type: "rejection", message: "Unhandled rejection", stack: "" });
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    // Útil para confirmar que JS está corriendo
    console.log("✅ GlobalErrorOverlay mounted");

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  if (!err) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "rgba(0,0,0,0.92)",
        color: "#fff",
        padding: 14,
        overflow: "auto",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 2, opacity: 0.7 }}>
            HABITALIBRE · ERROR OVERLAY
          </div>
          <div style={{ marginTop: 8, fontSize: 14 }}>
            <b>{err.type.toUpperCase()}</b>: {err.message}
          </div>
        </div>

        <button
          onClick={() => setErr(null)}
          style={{
            background: "transparent",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.35)",
            borderRadius: 10,
            padding: "8px 10px",
            height: 38,
          }}
        >
          Cerrar
        </button>
      </div>

      {err.stack ? (
        <pre style={{ marginTop: 12, fontSize: 12, lineHeight: 1.35, opacity: 0.95 }}>
          {err.stack}
        </pre>
      ) : (
        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.85 }}>
          (Sin stack. Igual ya sabemos que algo está reventando.)
        </div>
      )}
    </div>
  );
}

/** ✅ Pantalla ultra-simple para probar /app sin imports pesados */
function AppPing() {
  return (
    <div style={{ minHeight: "100vh", background: "#060B14", color: "#fff", padding: 20 }}>
      <div style={{ fontSize: 12, opacity: 0.7, letterSpacing: 2 }}>HABITALIBRE · /app</div>
      <h1 style={{ marginTop: 10, fontSize: 28 }}>PING ✅</h1>
      <p style={{ marginTop: 8, opacity: 0.85 }}>
        Si ves esto, el Router y React están bien. El problema está dentro de AppJourney o algún import.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <GlobalErrorOverlay />

      <LeadCaptureProvider>
        <CustomerAuthListener />
        <AdminAuthListener />

        <LeadModalBare />

        <Routes>
          {/* ✅ TEST: primero confirmamos que /app pinta algo */}
          <Route path="/app" element={<AppPing />} />

          {/* ✅ App real */}
          <Route path="/app/journey" element={<AppJourney />} />
          <Route path="/app/precalificar" element={<AppJourney />} />

          <Route
            path="/app/progreso"
            element={
              <CustomerProtectedRoute>
                <Progreso />
              </CustomerProtectedRoute>
            }
          />

          {/* WEB */}
          <Route element={<AppLayoutShell />}>
            <Route path="/" element={<Landing />} />
            <Route path="/precalificar" element={<SimuladorPage />} />
            <Route path="/simulador" element={<SimuladorPage />} />
            <Route path="/simular" element={<Navigate to="/precalificar" replace />} />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route
              path="/progreso"
              element={
                <CustomerProtectedRoute>
                  <Progreso />
                </CustomerProtectedRoute>
              }
            />

            <Route path="/ads" element={<LandingAds />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/gracias" element={<Gracias />} />

            <Route path="/privacidad" element={<PoliticaPrivacidad />} />
            <Route path="/terminos" element={<TerminosUso />} />
            <Route path="/cookies" element={<PoliticaCookies />} />
          </Route>

          {/* ADMIN */}
          <Route path="/admin" element={<Admin />} />
          <Route
            path="/admin/leads"
            element={
              <AdminProtectedRoute>
                <AdminLeads />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminProtectedRoute>
                <AdminUsers />
              </AdminProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LeadCaptureProvider>
    </Router>
  );
}