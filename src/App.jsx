// src/App.jsx
import React from "react";
import "./App.css";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import AdminAuthListener from "./components/AdminAuthListener.jsx";
import CustomerAuthListener from "./components/CustomerAuthListener.jsx";
import AdminProtectedRoute from "./components/AdminProtectedRoute.jsx";
import CustomerProtectedRoute from "./components/CustomerProtectedRoute.jsx";
import LeadModalBare from "./components/LeadModalBare.jsx";

import AppLayoutShell from "./layouts/AppLayoutShell.jsx";

import AppJourney from "./pages/AppJourney.jsx";
import Landing from "./pages/Landing.jsx";
import LandingAds from "./pages/LandingAds.jsx";
import SimuladorPage from "./pages/SimuladorPage.jsx";
import Gracias from "./pages/Gracias.jsx";
import Leads from "./pages/Leads.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";

import Progreso from "./pages/Progreso.jsx";
import Match from "./pages/Match.jsx";
import Ruta from "./pages/Ruta.jsx";
import Capacidad from "./pages/Capacidad.jsx";
import Perfil from "./pages/Perfil.jsx";
import PropertyDetail from "./pages/PropertyDetail.jsx";
import ChecklistDocumentos from "./pages/ChecklistDocumentos.jsx";
import SiguientePaso from "./pages/SiguientePaso.jsx";
import Caso from "./pages/Caso.jsx";
import Asesor from "./pages/Asesor.jsx";
import QueMeFalta from "./pages/QueMeFalta.jsx";
import MejorarPerfil from "./pages/MejorarPerfil.jsx";
import HipotecaDetail from "./pages/HipotecaDetail.jsx";
import Unlock from "./pages/Unlock.jsx";

import Soporte from "./pages/Soporte.jsx";
import DeleteAccountWeb from "./pages/DeleteAccountWeb.jsx";

import Admin from "./pages/Admin.jsx";
import AdminLeads from "./pages/AdminLeads.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";

import PoliticaPrivacidad from "./pages/PoliticaPrivacidad.jsx";
import TerminosUso from "./pages/TerminosUso.jsx";
import PoliticaCookies from "./pages/PoliticaCookies.jsx";

function AppMobileLayout() {
  return (
    <div className="min-h-screen bg-[#060B14] text-slate-50">
      <Outlet />
    </div>
  );
}

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
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, err: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, err: error };
  }

  componentDidCatch(error, info) {
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
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontSize: 12,
              whiteSpace: "pre-wrap",
              lineHeight: 1.35,
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 8 }}>
              💥 Crasheó una pantalla
            </div>
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
      <CustomerAuthListener />
      <AdminAuthListener />
      <LeadModalBare />

      <Routes>
        {/* Journey / simulación */}
        <Route path="/app" element={<AppMobileLayout />}>
          <Route index element={<AppJourneySafe />} />
          <Route path="precalificar" element={<AppJourneySafe />} />
        </Route>

        {/* Website público + preview app */}
        <Route element={<AppLayoutShell />}>
          <Route path="/" element={<Landing />} />

          <Route path="/precalificar" element={<SimuladorPage />} />
          <Route path="/simulador" element={<SimuladorPage />} />
          <Route path="/simular" element={<Navigate to="/precalificar" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/unlock" element={<Unlock />} />

          {/* ✅ Estas rutas deben ser públicas para permitir preview locked sin cuenta */}
          <Route path="/progreso" element={<Progreso />} />
          <Route path="/capacidad" element={<Capacidad />} />
          <Route path="/match" element={<Match />} />
          <Route path="/ruta" element={<Ruta />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
          <Route path="/hipoteca-detalle" element={<HipotecaDetail />} />

          <Route path="/ads" element={<LandingAds />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/gracias" element={<Gracias />} />
          <Route path="/soporte" element={<Soporte />} />

          <Route path="/privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/terminos" element={<TerminosUso />} />
          <Route path="/cookies" element={<PoliticaCookies />} />
          <Route path="/eliminar-cuenta" element={<DeleteAccountWeb />} />
        </Route>

        {/* Rutas que sí requieren sesión */}
        <Route
          path="/perfil"
          element={
            <CustomerProtectedRoute>
              <Perfil />
            </CustomerProtectedRoute>
          }
        />

        <Route
          path="/checklist-documentos"
          element={
            <CustomerProtectedRoute>
              <ChecklistDocumentos />
            </CustomerProtectedRoute>
          }
        />

        <Route
          path="/siguiente-paso"
          element={
            <CustomerProtectedRoute>
              <SiguientePaso />
            </CustomerProtectedRoute>
          }
        />

        <Route
          path="/caso"
          element={
            <CustomerProtectedRoute>
              <Caso />
            </CustomerProtectedRoute>
          }
        />

        <Route
          path="/asesor"
          element={
            <CustomerProtectedRoute>
              <Asesor />
            </CustomerProtectedRoute>
          }
        />

        <Route
          path="/mejorar-perfil"
          element={
            <CustomerProtectedRoute>
              <MejorarPerfil />
            </CustomerProtectedRoute>
          }
        />

        <Route
          path="/que-me-falta"
          element={
            <CustomerProtectedRoute>
              <QueMeFalta />
            </CustomerProtectedRoute>
          }
        />

        {/* Admin */}
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
    </Router>
  );
}