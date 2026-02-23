// src/App.jsx
import React from "react";
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
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

/**
 * ✅ Layout mínimo para APP móvil (/app)
 */
function AppMobileLayout() {
  console.log("🔥 AppMobileLayout mounted");

  return (
    <div className="min-h-screen bg-[#060B14] text-slate-50">
      
      {/* DEBUG VISUAL */}
      <div
        style={{
          position: "fixed",
          top: 10,
          left: 10,
          zIndex: 9999,
          fontSize: 12,
          background: "rgba(0,0,0,0.6)",
          padding: "4px 8px",
          borderRadius: 6
        }}
      >
        APP LAYOUT OK
      </div>

      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <LeadCaptureProvider>
        <CustomerAuthListener />
        <AdminAuthListener />

        <LeadModalBare />

        <Routes>
          {/* =========================
              ✅ APP MÓVIL AISLADA
             ========================= */}
          <Route path="/app" element={<AppMobileLayout />}>
            <Route index element={<AppJourney />} />
            <Route path="precalificar" element={<AppJourney />} />
            <Route
              path="progreso"
              element={
                <CustomerProtectedRoute>
                  <Progreso />
                </CustomerProtectedRoute>
              }
            />
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

          {/* DEFAULT */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LeadCaptureProvider>
    </Router>
  );
}