// src/App.jsx
import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import "./App.css";

// Pages públicas
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

// Layouts / wrappers
import AppLayoutShell from "./layouts/AppLayoutShell.jsx";

// Auth & guards
import CustomerProtectedRoute from "./components/CustomerProtectedRoute.jsx";
import AdminProtectedRoute from "./components/AdminProtectedRoute.jsx";
import CustomerAuthListener from "./components/CustomerAuthListener.jsx";

// Lead capture (Quick Win)
import { LeadCaptureProvider } from "./context/LeadCaptureContext.jsx";
import LeadModalBare from "./components/LeadModalBare.jsx";

export default function App() {
  return (
    <Router>
      <LeadCaptureProvider>
        {/* escucha auth del customer */}
        <CustomerAuthListener />

        {/* modal global de lead (WizardHL, etc.) */}
        <LeadModalBare />

        <Routes>
          {/* =========================
              APP PÚBLICA (con layout)
             ========================= */}
          <Route element={<AppLayoutShell />}>
            <Route path="/" element={<Landing />} />
            <Route path="/simular" element={<SimuladorPage />} />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

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

          {/* Login admin (NO protegido) */}
          <Route path="/admin" element={<Admin />} />

          {/* Admin protegido */}
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
              OTROS
             ========================= */}
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LeadCaptureProvider>
    </Router>
  );
}
