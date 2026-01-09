// src/layouts/AppLayoutShell.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import LeadModalBare from "../components/LeadModalBare.jsx";

export default function AppLayoutShell() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <LeadModalBare />
      <Outlet />
    </div>
  );
}
