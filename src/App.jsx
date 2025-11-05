// src/App.jsx
import { useEffect, useState } from "react";
import { Home, ShieldCheck, Calculator } from "lucide-react";

import Landing from "./pages/Landing.jsx";
import Gracias from "./pages/Gracias.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Leads from "./pages/Leads.jsx";

import Hero from "./components/Hero.jsx";
import SimulatorWizard from "./components/SimulatorWizard.jsx";
import ResultCard from "./components/ResultCard.jsx";

import { usePersistUTM } from "./lib/useUTM.js";
import "./index.css";

export default function App() {
  // --- routing simple por hash ---
  const [route, setRoute] = useState(window.location.hash || "#/");

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash || "#/");
    window.addEventListener("hashchange", onHash);
    if (!window.location.hash) window.location.hash = "#/"; // normaliza vacío
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // --- persistir UTM al cargar cualquier ruta ---
  usePersistUTM();

  // --- estado global del simulador ---
  const [resultado, setResultado] = useState(null);
  const [score, setScore] = useState(0);

  // ============ RUTAS ============

  // 1) Gracias
  if (route.startsWith("#/gracias")) return <Gracias />;

  // 2) Admin
  if (route.startsWith("#/admin")) {
    // Soporta #/admin y #/admin/dashboard
    if (route === "#/admin" || route.startsWith("#/admin/dashboard")) {
      return <AdminDashboard />;
    }
    // #/admin/leads
    if (route.startsWith("#/admin/leads")) {
      return <Leads />;
    }
  }

  // 3) Simulador
  if (route.startsWith("#/simular")) {
    return (
      <div className="min-h-screen" style={{ background: "var(--brand-bg)" }}>
        {/* Header */}
        <header className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-soft"
              style={{
                background:
                  "linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))",
              }}
            >
              <Home size={20} />
            </div>
            <div>
              <h1 className="text-xl font-semibold" style={{ color: "var(--brand-text)" }}>
                HabitaLibre
              </h1>
              <p className="text-xs text-muted">
                Descubre cuánto puedes comprar en 2 minutos
              </p>
            </div>
          </div>
          <div className="hidden md:flex gap-3 text-xs text-muted">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} /> Datos protegidos
            </div>
            <div className="flex items-center gap-2">
              <Calculator size={16} /> Progreso: {Math.max(0, Math.min(100, score))}%
            </div>
          </div>
        </header>

        {/* Hero */}
        <Hero />

        {/* Simulador + Resultado */}
        <main className="max-w-6xl mx-auto px-4 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="card">
            <div className="mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "var(--brand-text)" }}>
                Simulador de crédito
              </h2>
              <p className="text-sm text-muted">
                Completa tus datos y calcula tu capacidad
              </p>
            </div>
            <SimulatorWizard onResult={setResultado} onScoreChange={setScore} />
          </section>

          <aside className="card">
            <ResultCard data={resultado} />
          </aside>
        </main>

        {/* Footer */}
        <footer className="max-w-6xl mx-auto px-4 pb-10 text-center text-xs text-muted">
          <a className="underline hover:text-slate-700" href="#/privacidad">
            Privacidad
          </a>
          <span className="mx-2">•</span>
          <a className="underline hover:text-slate-700" href="#/terminos">
            Términos
          </a>
          <span className="mx-2">•</span>
          <a className="underline hover:text-slate-700" href="#/admin">
            Admin
          </a>
        </footer>
      </div>
    );
  }

  // 4) Landing por defecto
  return <Landing />;
}
