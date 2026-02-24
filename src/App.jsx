// src/App.jsx
import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import AdminAuthListener from "./components/AdminAuthListener.jsx";
import CustomerAuthListener from "./components/CustomerAuthListener.jsx";
import AdminProtectedRoute from "./components/AdminProtectedRoute.jsx";
import CustomerProtectedRoute from "./components/CustomerProtectedRoute.jsx";

// modal global (requiere LeadCaptureProvider en main.jsx)
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

/**
 * ✅ Layout mínimo para APP móvil (/app)
 */
function AppMobileLayout() {
  return (
    <div className="min-h-screen bg-[#060B14] text-slate-50">
      <Outlet />
    </div>
  );
}

/* =========================
   ✅ Debug pill para ver location real
========================= */
function DebugLocationPill({ label = "APP" }) {
  const loc = useLocation();
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  const href = typeof window !== "undefined" ? window.location.href : "";
  return (
    <div
      style={{
        position: "fixed",
        top: 44,
        left: 10,
        zIndex: 9999999,
        background: "rgba(59,130,246,0.16)",
        border: "1px solid rgba(59,130,246,0.35)",
        color: "#eaf2ff",
        padding: "8px 10px",
        borderRadius: 12,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: 11,
        maxWidth: 360,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
      title={`href=${href}\npathname=${loc.pathname}\nsearch=${loc.search}\nhash=${hash}`}
    >
      {label} · {loc.pathname}
      {loc.search ? ` ${loc.search}` : ""} · hash:{hash ? "✅" : "—"}
    </div>
  );
}

/* =========================
   ✅ ErrorBoundary visible en pantalla (crashes silenciosos)
========================= */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, err: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, err: error };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("💥 ErrorBoundary caught:", error, info);
    this.setState({ info });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, color: "#fff" }}>
          <div
            style={{
              border: "1px solid rgba(248,113,113,0.5)",
              background: "rgba(248,113,113,0.12)",
              borderRadius: 14,
              padding: 14,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontSize: 12,
              whiteSpace: "pre-wrap",
              lineHeight: 1.35,
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 8 }}>💥 Crasheó una pantalla</div>
            {String(this.state.err?.message || this.state.err || "Unknown error")}
            {"\n\n"}
            {String(this.state.err?.stack || "").slice(0, 2000)}
          </div>

          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 12,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* =========================
   Helper wrapper para AppJourney
========================= */
function AppJourneySafe() {
  return (
    <ErrorBoundary>
      <AppJourney />
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <Router>
      {/* Listeners */}
      <CustomerAuthListener />
      <AdminAuthListener />

      {/* ✅ Debug location */}
      <DebugLocationPill label="ROUTER" />

      {/* ✅ modal global (provider está en main.jsx) */}
      <LeadModalBare />

      <Routes>
        {/* =========================
            ✅ APP MÓVIL AISLADA
           ========================= */}
        <Route path="/app" element={<AppMobileLayout />}>
          <Route index element={<AppJourneySafe />} />
          <Route path="precalificar" element={<AppJourneySafe />} />
        </Route>

        {/* =========================
            WEB PÚBLICA
           ========================= */}
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

        {/* =========================
            ADMIN
           ========================= */}
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

        {/* =========================
            DEFAULT
           ========================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}