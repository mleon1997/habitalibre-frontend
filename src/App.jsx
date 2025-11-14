// src/App.jsx
import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing.jsx";
import Leads from "./pages/Leads.jsx";
import Admin from "./pages/Admin.jsx";
import Gracias from "./pages/Gracias.jsx";

import SimulatorWizard from "./components/SimulatorWizard.jsx";
import LeadModalBare from "./components/LeadModalBare.jsx";

import { LeadCaptureProvider } from "./context/LeadCaptureContext.jsx";

import "./App.css";
import { Routes, Route } from "react-router-dom";
import AdminLeads from "./pages/AdminLeads.jsx";

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
          {/* Landing pública */}
          <Route
            path="/"
            element={
              <Landing
                onStart={() => {
                  window.location.hash = "#/simular";
                }}
              />
            }
          />

          {/* Simulador */}
          <Route path="/simular" element={<SimuladorPage />} />

          {/* Rutas admin */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/gracias" element={<Gracias />} />
          <Route path="/" element={<Home />} />
          <Route path="/gracias" element={<Gracias />} />
          {/* 🔐 Ruta interna de dashboard */}
          <Route path="/admin/leads" element={<AdminLeads />} />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      {/* 🔹 Modal global de captura de lead */}
      <LeadModalBare />
    </LeadCaptureProvider>
  );
}
