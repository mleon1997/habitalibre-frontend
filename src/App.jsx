// src/App.jsx
import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Landing from "./pages/Landing.jsx";
import Leads from "./pages/Leads.jsx";
import Admin from "./pages/Admin.jsx";
import Gracias from "./pages/Gracias.jsx";

import WizardHL from "./components/WizardHL.jsx";
import LeadModalBare from "./components/LeadModalBare.jsx";

import { LeadCaptureProvider } from "./context/LeadCaptureContext.jsx";

import "./App.css";
import AdminLeads from "./pages/AdminLeads.jsx";
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad.jsx";
import TerminosUso from "./pages/TerminosUso.jsx";
import PoliticaCookies from "./pages/PoliticaCookies.jsx";

function SimuladorPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-slate-900/60 rounded-3xl shadow-[0_24px_80px_rgba(15,23,42,0.9)] border border-slate-800/80 px-5 py-6 md:px-8 md:py-8">
        {/* 👉 Usamos el wizard nuevo */}
        <WizardHL />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LeadCaptureProvider>
      <Router>
        <Routes>
          {/* Landing */}
          <Route path="/" element={<Landing />} />

          {/* Simulador */}
          <Route path="/simular" element={<SimuladorPage />} />

          {/* Admin viejo */}
          <Route path="/admin" element={<Admin />} />

          {/* Dashboard interno de leads */}
          <Route path="/admin/leads" element={<AdminLeads />} />

          {/* Ruta antigua (opcional) */}
          <Route path="/leads" element={<Leads />} />

          {/* Gracias */}
          <Route path="/gracias" element={<Gracias />} />

          {/* Páginas legales */}
          <Route path="/privacidad" element={<PoliticaPrivacidad />} />
          <Route path="/terminos" element={<TerminosUso />} />
          <Route path="/cookies" element={<PoliticaCookies />} />

          {/* Fallback SIEMPRE al final */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* 👇 Modal global, DEBE IR DENTRO DEL ROUTER */}
        <LeadModalBare />
      </Router>
    </LeadCaptureProvider>
  );
}
