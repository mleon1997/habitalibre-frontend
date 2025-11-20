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

import WizardHL from "./components/WizardHL.jsx"; // 👈 nuevo
import LeadModalBare from "./components/LeadModalBare.jsx";

import { LeadCaptureProvider } from "./context/LeadCaptureContext.jsx";

import "./App.css";
import AdminLeads from "./pages/AdminLeads.jsx";

function SimuladorPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl bg-slate-900/60 rounded-3xl shadow-[0_24px_80px_rgba(15,23,42,0.9)] border border-slate-800/80 px-5 py-6 md:px-8 md:py-8">
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
          <Route path="/" element={<Landing />} />
          <Route path="/simular" element={<SimuladorPage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/leads" element={<AdminLeads />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/gracias" element={<Gracias />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      <LeadModalBare />
    </LeadCaptureProvider>
  );
}
