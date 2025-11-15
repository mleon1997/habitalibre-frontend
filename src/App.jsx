// src/App.jsx
import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Leads from "./pages/Leads.jsx";
import Admin from "./pages/Admin.jsx";
import Gracias from "./pages/Gracias.jsx";

import SimulatorWizard from "./components/SimulatorWizard.jsx";
import LeadModalBare from "./components/LeadModalBare.jsx";

import { LeadCaptureProvider } from "./context/LeadCaptureContext.jsx";

import "./App.css";
import AdminLeads from "./pages/AdminLeads.jsx";

// 👉 Nuevo hero world-class
import HeroHabitaLibre from "./components/HeroHabitaLibre.jsx";


function SimuladorPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-slate-900/60 rounded-3xl shadow-[0_24px_80px_rgba(15,23,42,0.9)] border border-slate-800/80 px-5 py-6 md:px-8 md:py-8">
        <SimulatorWizard />
      </div>
    </div>
  );
}


export default function App() {
  return (
    <LeadCaptureProvider>
      <Router>
        <Routes>

          {/* ============================ */}
          {/*  LANDING PRINCIPAL (NUEVA)  */}
          {/* ============================ */}
          <Route path="/" element={<HeroHabitaLibre />} />


          {/* Simulador */}
          <Route path="/simular" element={<SimuladorPage />} />

          {/* Admin general */}
          <Route path="/admin" element={<Admin />} />

          {/* Dashboard interno de leads */}
          <Route path="/admin/leads" element={<AdminLeads />} />

          {/* Ruta antigua /leads (opcional) */}
          <Route path="/leads" element={<Leads />} />

          {/* Página de agradecimiento */}
          <Route path="/gracias" element={<Gracias />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      {/* Modal global */}
      <LeadModalBare />
    </LeadCaptureProvider>
  );
}
