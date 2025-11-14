// src/App.jsx
import React from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing.jsx";
import Leads from "./pages/Leads.jsx";
import Admin from "./pages/Admin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Gracias from "./pages/Gracias.jsx";

import SimulatorWizard from "./components/SimulatorWizard.jsx";
import { LeadCaptureProvider } from "./context/LeadCaptureContext.jsx";

import "./App.css"; // 👈 solo para margin:0 del body

function SimuladorPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-slate-950/70 backdrop-blur-xl border border-violet-500/30 rounded-3xl shadow-[0_24px_80px_rgba(15,23,42,0.9)] px-5 py-6 md:px-8 md:py-8">
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

          <Route path="/simular" element={<SimuladorPage />} />

          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/gracias" element={<Gracias />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </LeadCaptureProvider>
  );
}
