// src/App.jsx
import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import "./App.css";
import ResetPassword from "./pages/ResetPassword.jsx";
import Landing from "./pages/Landing.jsx";
import Leads from "./pages/Leads.jsx";
import Admin from "./pages/Admin.jsx";
import Gracias from "./pages/Gracias.jsx";
import AdminLeads from "./pages/AdminLeads.jsx";
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad.jsx";
import TerminosUso from "./pages/TerminosUso.jsx";
import PoliticaCookies from "./pages/PoliticaCookies.jsx";
import LandingAds from "./pages/LandingAds.jsx";
import SimuladorPage from "./pages/SimuladorPage.jsx";

import Progreso from "./pages/Progreso.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import CustomerProtectedRoute from "./components/CustomerProtectedRoute.jsx";

import AppLayoutShell from "./layouts/AppLayoutShell.jsx";
import CustomerAuthListener from "./components/CustomerAuthListener.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";

// ✅ Opción A: Quick Win modal global (usa TU ModalLead.jsx)
import { LeadCaptureProvider } from "./context/LeadCaptureContext.jsx";
import LeadModalBare from "./components/LeadModalBare.jsx";

export default function App() {
  return (
    <Router>
      <LeadCaptureProvider>
        {/* escucha auth / sesión */}
        <CustomerAuthListener />

        {/* ✅ modal global (se abre desde WizardHL con openLead(result)) */}
        <LeadModalBare />

        <Routes>
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

          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/leads" element={<AdminLeads />} />

          <Route path="/reset-password" element={<ResetPassword />} />
<Route path="/admin/users" element={<AdminUsers />} />
<Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </LeadCaptureProvider>
    </Router>
  );
}
