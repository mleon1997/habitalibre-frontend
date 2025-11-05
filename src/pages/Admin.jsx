// src/pages/Admin.jsx
import { useEffect, useMemo, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Admin() {
  const [leads, setLeads] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/leads`);
      const json = await res.json();
      setLeads(json.leads || []);
    } catch (e) {
      console.error(e);
      alert("No se pudo cargar leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const filtered = useMemo(() => {
    if (!q) return leads;
    const t = q.toLowerCase();
    return leads.filter(l =>
      [l.nombre, l.email, l.telefono, l.ciudad].some(v => (v||"").toLowerCase().includes(t))
    );
  }, [leads, q]);

  const toCSV = () => {
    const cols = ["fecha","nombre","email","telefono","ciudad","ingreso","deudas","valorVivienda","entrada","edad","tipoIngreso","capacidadPago","montoMaximo","ltv","riesgo","fuente"];
    const rows = filtered.map(l => ({
      fecha: new Date(l.createdAt).toLocaleString("es-EC"),
      nombre: l.nombre, email: l.email, telefono: l.telefono, ciudad: l.ciudad,
      ingreso: l.ingresoNetoMensual, deudas: l.otrasDeudasMensuales, valorVivienda: l.valorVivienda,
      entrada: l.entradaDisponible, edad: l.edad, tipoIngreso: l.tipoIngreso,
      capacidadPago: l.capacidadPago, montoMaximo: l.montoMaximo, ltv: (l.ltv*100).toFixed(2)+"%",
      riesgo: l.riesgo, fuente: l?.origen || ""
    }));
    const csv = [
      cols.join(","),
      ...rows.map(r => cols.map(c => `"${(r[c]??"").toString().replace(/"/g,'""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csv], { type:"text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `leads-habitalibre-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-slate-900">Leads</h1>
          <div className="flex gap-2">
            <button onClick={fetchLeads} className="px-3 py-2 rounded-lg bg-slate-900 text-white hover:opacity-90">
              Refrescar
            </button>
            <button onClick={toCSV} className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-white">
              Exportar CSV
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <input
            placeholder="Buscar (nombre, email, teléfono, ciudad)"
            value={q} onChange={e=>setQ(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-slate-300 bg-white"
          />
          {loading && <span className="text-sm text-slate-500">Cargando…</span>}
        </div>

        <div className="overflow-x-auto mt-4 bg-white rounded-xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-slate-600">
                <th className="text-left p-3">Fecha</th>
                <th className="text-left p-3">Nombre</th>
                <th className="text-left p-3">Contacto</th>
                <th className="text-left p-3">Ciudad</th>
                <th className="text-right p-3">Ingreso</th>
                <th className="text-right p-3">Monto máx</th>
                <th className="text-right p-3">LTV</th>
                <th className="text-left p-3">Riesgo</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l._id} className="border-t">
                  <td className="p-3">{new Date(l.createdAt).toLocaleString("es-EC")}</td>
                  <td className="p-3">{l.nombre}</td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <span>{l.email}</span>
                      <span className="text-slate-500">{l.telefono}</span>
                    </div>
                  </td>
                  <td className="p-3">{l.ciudad}</td>
                  <td className="p-3 text-right">${l.ingresoNetoMensual?.toLocaleString("es-EC")}</td>
                  <td className="p-3 text-right">${(l.montoMaximo||0).toLocaleString("es-EC")}</td>
                  <td className="p-3 text-right">{((l.ltv||0)*100).toFixed(1)}%</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-lg text-xs
                      ${l.riesgo==="bajo" ? "bg-green-100 text-green-700" :
                        l.riesgo==="medio" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"}`}>
                      {l.riesgo}
                    </span>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan="8" className="p-6 text-center text-slate-500">Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
