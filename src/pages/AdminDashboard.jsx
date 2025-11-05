// src/pages/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { listarLeads, updateLead } from "../lib/api"; // updateLead es opcional; si no existe, se controla abajo
import { Bar, Doughnut, Line } from "react-chartjs-2";
import "chart.js/auto";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import LeadDrawer from "../components/LeadDrawer.jsx"; // 👈 nuevo

export default function AdminDashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState("30");
  const [afinidad, setAfinidad] = useState("all");

  // Drawer state
  const [selectedLead, setSelectedLead] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { ok, leads } = await listarLeads();
        if (!ok) throw new Error("No se pudo cargar leads");
        // Generar campo “etapa” si no existe
        const enriched = (leads || []).map((l) => ({
          ...l,
          etapa: l.etapa || asignarEtapaAuto(l),
        }));
        setLeads(enriched);
      } catch (e) {
        console.error(e);
        setErr(e.message || "Error al cargar leads");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const now = new Date();
  const minDate = useMemo(() => {
    if (range === "all") return null;
    const days = Number(range || 30);
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d;
  }, [range]);

  /* -------------------- FILTROS -------------------- */
  const filtered = useMemo(() => {
    return (leads || []).filter((l) => {
      if (minDate && new Date(l.createdAt) < minDate) return false;
      if (afinidad !== "all" && (l.afinidad || "").toLowerCase() !== afinidad.toLowerCase())
        return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        (l.nombre || "").toLowerCase().includes(q) ||
        (l.email || "").toLowerCase().includes(q) ||
        (l.telefono || "").toLowerCase().includes(q) ||
        (l.ciudad || "").toLowerCase().includes(q) ||
        (l.canal || "").toLowerCase().includes(q)
      );
    });
  }, [leads, minDate, query, afinidad]);

  const fmt = (n) => Number(n || 0).toLocaleString("es-EC");
  const formatDate = (s) =>
    new Date(s).toLocaleString("es-EC", { dateStyle: "medium", timeStyle: "short" });

  /* -------------------- KPI AGGREGATES -------------------- */
  const kpis = useMemo(() => {
    const total = filtered.length;
    const porCiudad = {};
    const porCanal = {};
    const porEtapa = {};
    const hoy = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let hoyCount = 0;

    filtered.forEach((l) => {
      porCiudad[l.ciudad || "—"] = (porCiudad[l.ciudad || "—"] || 0) + 1;
      porCanal[l.canal || "—"] = (porCanal[l.canal || "—"] || 0) + 1;
      porEtapa[l.etapa || "Nuevo"] = (porEtapa[l.etapa || "Nuevo"] || 0) + 1;
      const d = new Date(l.createdAt);
      if (d >= hoy) hoyCount++;
    });

    return {
      total,
      hoy: hoyCount,
      porCiudad,
      porCanal,
      porEtapa,
    };
  }, [filtered, now]);

  /* -------------------- CHARTS -------------------- */
  const ciudadData = {
    labels: Object.keys(kpis.porCiudad),
    datasets: [{ label: "Leads", data: Object.values(kpis.porCiudad) }],
  };
  const canalData = {
    labels: Object.keys(kpis.porCanal),
    datasets: [{ data: Object.values(kpis.porCanal) }],
  };
  const etapaData = {
    labels: Object.keys(kpis.porEtapa),
    datasets: [
      {
        data: Object.values(kpis.porEtapa),
        backgroundColor: ["#4ade80", "#facc15", "#60a5fa", "#cbd5e1"],
      },
    ],
  };

  const lineData = useMemo(() => {
    const days = 14;
    const labels = [];
    const counts = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      labels.push(
        d.toLocaleDateString("es-EC", { day: "2-digit", month: "short" }).replace(".", "")
      );
      const c = filtered.filter((l) => (l.createdAt || "").startsWith(key)).length;
      counts.push(c);
    }
    return {
      labels,
      datasets: [{ label: "Leads / día", data: counts, tension: 0.3, fill: true }],
    };
  }, [filtered]);

  /* -------------------- EXPORT CSV -------------------- */
  const handleExportCSV = () => {
    const csv = Papa.unparse(
      filtered.map((l) => ({
        Fecha: formatDate(l.createdAt),
        Nombre: l.nombre,
        Email: l.email,
        Telefono: l.telefono,
        Ciudad: l.ciudad,
        Canal: l.canal,
        Afinidad: l.afinidad,
        Etapa: l.etapa,
        Notas: l.notas || "",
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `leads_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  /* -------------------- Guardar cambios del drawer -------------------- */
  async function handleSaveLead(updatedLead) {
    // 1) Optimistic update en UI
    setLeads((prev) =>
      prev.map((l) => (l._id === updatedLead._id ? { ...l, ...updatedLead } : l))
    );

    // 2) Intento de persistir (si tienes updateLead en tu API client)
    try {
      if (typeof updateLead === "function") {
        await updateLead(updatedLead._id, {
          etapa: updatedLead.etapa,
          notas: updatedLead.notas || "",
        });
      }
    } catch (e) {
      console.warn("⚠️ No se pudo hacer PUT /api/leads/:id. Se mantuvo cambio local.", e);
    }
  }

  /* -------------------- UI -------------------- */
  if (loading)
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Cargando…</div>;
  if (err)
    return <div className="min-h-screen flex items-center justify-center text-red-600">{err}</div>;

  return (
    <div className="min-h-screen" style={{ background: "var(--brand-bg)" }}>
      <header className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--brand-text)" }}>
            Dashboard Comercial
          </h1>
          <p className="text-sm text-muted">
            Seguimiento de leads y performance por etapa y afinidad
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <select
            className="rounded-lg border px-3 py-2 text-sm"
            value={afinidad}
            onChange={(e) => setAfinidad(e.target.value)}
          >
            <option value="all">Todos los tipos</option>
            <option value="vis">VIS</option>
            <option value="vip">VIP</option>
            <option value="biess">BIESS</option>
            <option value="comercial">Banca Privada</option>
          </select>

          <select
            className="rounded-lg border px-3 py-2 text-sm"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            <option value="7">7 días</option>
            <option value="30">30 días</option>
            <option value="90">90 días</option>
            <option value="all">Todo</option>
          </select>

          <input
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="Buscar…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="bg-indigo-600 hover:opacity-90 text-white text-sm px-3 py-2 rounded-lg"
            onClick={handleExportCSV}
          >
            Exportar CSV
          </button>
        </div>
      </header>

      {/* KPIs y gráficos */}
      <section className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi title="Total" value={fmt(kpis.total)} />
        <Kpi title="Hoy" value={fmt(kpis.hoy)} />
        {Object.entries(kpis.porEtapa).map(([et, v]) => (
          <Kpi key={et} title={et} value={fmt(v)} />
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Leads por ciudad">
          <Bar data={ciudadData} options={{ plugins: { legend: { display: false } } }} />
        </Card>
        <Card title="Canales">
          <Doughnut data={canalData} />
        </Card>
        <Card title="Etapas">
          <Doughnut data={etapaData} />
        </Card>
      </section>

      <section className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 gap-6">
        <Card title="Tendencia 14 días">
          <Line data={lineData} options={{ plugins: { legend: { display: false } } }} />
        </Card>
      </section>

      {/* Tabla */}
      <section className="max-w-6xl mx-auto px-4 mt-8 pb-24">
        <div className="card overflow-x-auto">
          <div className="mb-3 text-sm text-muted">
            {fmt(filtered.length)} leads mostrados
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <Th>Fecha</Th>
                <Th>Nombre</Th>
                <Th>Contacto</Th>
                <Th>Ciudad</Th>
                <Th>Canal</Th>
                <Th>Afinidad</Th>
                <Th>Etapa</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr
                  key={l._id}
                  className="border-t cursor-pointer hover:bg-slate-50"
                  onClick={() => {
                    setSelectedLead(l);
                    setDrawerOpen(true);
                  }}
                >
                  <Td>{formatDate(l.createdAt)}</Td>
                  <Td>{l.nombre || "—"}</Td>
                  <Td>
                    <div>{l.email || "—"}</div>
                    <div className="text-[11px] text-muted">{l.telefono || "—"}</div>
                  </Td>
                  <Td>{l.ciudad || "—"}</Td>
                  <Td>{l.canal || "—"}</Td>
                  <Td>{l.afinidad || "—"}</Td>
                  <Td>
                    <EtapaBadge etapa={l.etapa} />
                  </Td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-muted">
                    No hay leads con el filtro actual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Drawer lateral */}
      <LeadDrawer
        open={drawerOpen}
        lead={selectedLead}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSaveLead}
      />
    </div>
  );
}

/* ---------------- UI Components ---------------- */
function Kpi({ title, value }) {
  return (
    <div className="card">
      <div className="text-xs uppercase tracking-wide text-muted">{title}</div>
      <div className="text-xl font-semibold text-slate-800">{value}</div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="card">
      <div className="mb-3 font-medium text-slate-800">{title}</div>
      {children}
    </div>
  );
}
function Th({ children }) {
  return <th className="py-2 pr-4">{children}</th>;
}
function Td({ children }) {
  return <td className="py-3 pr-4 align-top">{children}</td>;
}
function EtapaBadge({ etapa }) {
  const tones = {
    Nuevo: "bg-emerald-100 text-emerald-700",
    Contactado: "bg-yellow-100 text-yellow-700",
    "En proceso": "bg-blue-100 text-blue-700",
    Cerrado: "bg-slate-200 text-slate-700",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs ${
        tones[etapa] || "bg-slate-100 text-slate-600"
      }`}
    >
      {etapa}
    </span>
  );
}

/* ---------------- Helper ---------------- */
function asignarEtapaAuto(l) {
  if (l.canal?.toLowerCase().includes("whatsapp")) return "Contactado";
  if (l.afinidad?.toLowerCase().includes("biess")) return "En proceso";
  return "Nuevo";
}
