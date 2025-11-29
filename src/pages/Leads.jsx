// src/pages/Leads.jsx
import React, { useEffect, useState, useMemo } from "react";
import { listarLeads } from "../lib/api";
import AdminLogin from "../components/AdminLogin.jsx"; // ⬅️ Login admin

export default function Leads() {
  const [token, setToken] = useState(
    () => localStorage.getItem("hl_admin_token") || ""
  );
  const [leads, setLeads] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);

  // Si no hay token, no intentamos cargar leads todavía
  useEffect(() => {
    if (!token) return;
    cargarLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function cargarLeads() {
    try {
      setCargando(true);
      const data = await listarLeads();

      // Si tu API devuelve { leads: [...] }, descomenta esta línea:
      // setLeads(data?.leads || []);

      // Si ya devuelve un array directo, deja esta:
      setLeads(data || []);
    } catch (err) {
      console.error("Error cargando leads:", err);

      // Si el backend respondió 401/403, forzamos logout y mostramos login
      if (err?.message?.includes("No autorizado")) {
        localStorage.removeItem("hl_admin_token");
        setToken("");
      }
    } finally {
      setCargando(false);
    }
  }

  // 🔐 Gate: si no hay token, mostramos el login admin
  if (!token) {
    return <AdminLogin onSuccess={setToken} />;
  }

  // Filtrado rápido por nombre, email, ciudad o código HL
  const leadsFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) => {
      const nombre = l.nombre?.toLowerCase() || "";
      const email = l.email?.toLowerCase() || "";
      const ciudad = l.ciudad?.toLowerCase() || "";
      const codigo = l.codigoUnico?.toLowerCase() || "";
      return (
        nombre.includes(q) ||
        email.includes(q) ||
        ciudad.includes(q) ||
        codigo.includes(q)
      );
    });
  }, [busqueda, leads]);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Leads</h1>
          <p className="text-sm text-gray-500">
            Monitorea los contactos generados por el simulador y landing.
          </p>
        </div>
        <button
          onClick={cargarLeads}
          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:opacity-90"
        >
          {cargando ? "Actualizando..." : "↻ Actualizar"}
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-4 flex items-center">
        <input
          type="text"
          placeholder="Buscar por nombre, email, ciudad o código HL..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-100"
        />
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-100 text-gray-600 uppercase text-[11px]">
            <tr>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Código HL</th>{/* ⭐ NUEVO */}
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Teléfono</th>
              <th className="px-4 py-2 text-left">Ciudad</th>
              <th className="px-4 py-2 text-left">Origen</th>
              <th className="px-4 py-2 text-left">Capacidad Pago</th>
              <th className="px-4 py-2 text-left">Monto Máx.</th>
              <th className="px-4 py-2 text-left">Score HL</th>
              <th className="px-4 py-2 text-left">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {leadsFiltrados.length === 0 && (
              <tr>
                <td colSpan="10" className="px-4 py-6 text-center text-gray-400">
                  {cargando ? "Cargando leads..." : "No se encontraron leads."}
                </td>
              </tr>
            )}
            {leadsFiltrados.map((lead) => (
              <tr
                key={lead._id}
                className="border-t hover:bg-indigo-50/40 transition-colors"
              >
                <td className="px-4 py-2 font-medium text-gray-800">
                  {lead.nombre || "—"}
                </td>
                <td className="px-4 py-2 text-xs font-mono text-gray-700">
                  {lead.codigoUnico || "—"}
                </td>
                <td className="px-4 py-2">{lead.email || "—"}</td>
                <td className="px-4 py-2">{lead.telefono || "—"}</td>
                <td className="px-4 py-2">{lead.ciudad || "—"}</td>
                <td className="px-4 py-2 text-xs">
                  <Badge tipo={lead.origen || "—"} />
                </td>
                <td className="px-4 py-2">
                  {lead.resultado?.capacidadPago
                    ? `$${lead.resultado.capacidadPago.toLocaleString()}`
                    : "—"}
                </td>
                <td className="px-4 py-2">
                  {lead.resultado?.montoMaximo
                    ? `$${lead.resultado.montoMaximo.toLocaleString()}`
                    : "—"}
                </td>
                <td className="px-4 py-2">
                  {lead.resultado?.puntajeHabitaLibre?.score ?? "—"}
                </td>
                <td className="px-4 py-2 text-xs text-gray-500">
                  {lead.createdAt
                    ? new Date(lead.createdAt).toLocaleDateString("es-EC", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[11px] text-gray-500 text-center">
        📈 Total de leads: {leadsFiltrados.length.toLocaleString()}
      </p>
    </div>
  );
}

/* ===========================================================
   🏷️ Badge de origen (Landing / Simulador)
   =========================================================== */
function Badge({ tipo }) {
  const map = {
    simulador: "bg-indigo-100 text-indigo-700",
    landing: "bg-emerald-100 text-emerald-700",
    referidos: "bg-amber-100 text-amber-700",
  };
  const key = (tipo || "").toLowerCase();
  const cls = map[key] || "bg-gray-100 text-gray-600";
  const label =
    typeof tipo === "string" && tipo.length > 0
      ? tipo.charAt(0).toUpperCase() + tipo.slice(1)
      : "—";

  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] ${cls}`}>
      {label}
    </span>
  );
}
