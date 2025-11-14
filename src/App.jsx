// src/App.jsx
import React from "react";

import Landing from "./pages/Landing.jsx";
import Gracias from "./pages/Gracias.jsx";
import Admin from "./pages/Admin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Leads from "./pages/Leads.jsx";

import SimulatorWizard from "./components/SimulatorWizard.jsx";
import { LeadCaptureProvider } from "./context/LeadCaptureContext.jsx";

// Router muy simple basado en el hash (#/)
function useHashRoute() {
  const [hash, setHash] = React.useState(() => window.location.hash || "#/");

  React.useEffect(() => {
    const onHashChange = () => {
      setHash(window.location.hash || "#/");
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return hash || "#/";
}

export default function App() {
  const route = useHashRoute();

  let content;

  // Rutas admin
  if (route.startsWith("#/admin/leads")) {
    content = <Leads />;
  } else if (route.startsWith("#/admin/dashboard")) {
    content = <AdminDashboard />;
  } else if (route.startsWith("#/admin")) {
    content = <Admin />;

    // Rutas públicas
  } else if (route.startsWith("#/gracias")) {
    content = <Gracias />;
  } else if (route.startsWith("#/simular")) {
    content = (
      <div className="min-h-screen bg-[#f6f7fb] flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg p-6 md:p-8">
          <SimulatorWizard />
        </div>
      </div>
    );
  } else {
    // Landing principal
    content = (
      <div className="min-h-screen bg-[#f6f7fb]">
        <Landing />
      </div>
    );
  }

  return <LeadCaptureProvider>{content}</LeadCaptureProvider>;
}