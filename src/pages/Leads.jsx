// src/pages/Leads.jsx
import React, { useEffect, useMemo, useState } from "react";
import AdminLogin from "../components/AdminLogin.jsx";
import { listarLeads } from "../lib/api.js";

export default function Leads() {
  const [token, setToken] = useState(
    () =>
      localStorage.getItem("hl_admin_token") ||
      localStorage.getItem("HL_ADMIN_TOKEN") ||
      ""
  );

  const [leads, setLeads] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    cargarLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function cargarLeads() {
    try {
      setCargando(true);
      setError("");

      const resp = await listarLeads();

      // ✅ Caso A: api.js devuelve wrapper de error { ok:false, status, error }
      if (resp && resp.ok === false) {
        const status = resp.status;
        const msg = resp.error || "No se pudo cargar leads";

        if (status === 401 || status === 403) {
          localStorage.removeItem("hl_admin_token");
          localStorage.removeItem("HL_ADMIN_TOKEN");
          setToken("");
          setError("Sesión expirada. Vuelve a iniciar sesión.");
          return;
        }

        throw new Error(msg);
      }

      // ✅ Caso B: backend devuelve { ok:true, leads:[...] }
      // ✅ Caso C: backend devuelve { leads:[...] }
      // ✅ Caso D: backend devuelve directamente [...]
      const nextLeads = Array.isArray(resp)
        ? resp
        : Array.isArray(resp?.leads)
          ? resp.leads
          : Array.isArray(resp?.data?.leads)
            ? resp.data.leads
            : [];

      setLeads(nextLeads);
    } catch (err) {
      console.error("Error cargando leads:", err);
      setError(err?.message || "Error cargando leads");
    } finally {
      setCargando(false);
    }
  }

  if (!token) {
    return (
      <AdminLogin
        onSuccess={(newToken) => {
          const t = String(newToken || "").trim();
          if (!t) return;
          localStorage.setItem("hl_admin_token", t);
          setToken(t);
        }}
      />
    );
  }

  const leadsFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return leads;

    return (leads || []).filter((l) => {
      const nombre = (l?.nombre || "").toLowerCase();
      const email = (l?.email || "").toLowerCase();
      const ciudad = (l?.ciudad || "").toLowerCase();
      const codigo = (l?.codigoHL || l?.codigoUnico || l?.codigo || "").toLowerCase();

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

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              localStorage.removeItem("hl_admin_token");
              localStorage.removeItem("HL_ADMIN_TOKEN");
              setToken("");
            }}
            className="px-3 py-2 text-sm bg-white border rounded-lg hover:bg-gray-50"
          >
            Cerrar sesión
          </button>

          <button
            onClick={cargarLeads}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:opacity-90"
          >
            {cargando ? "Actualizando..." : "↻ Actualizar"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-4 flex items-center">
        <input
          type="text"
          placeholder="Buscar por nombre, email, ciudad o código HL..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-md rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-100"
        />
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-100 text-gray-600 uppercase text-[11px]">
            <tr>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Código HL</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Teléfono</th>
              <th className="px-4 py-2 text-left">Ciudad</th>
              <th className="px-4 py-2 text-left">Canal</th>
              <th className="px-4 py-2 text-left">Producto</th>
              <th className="px-4 py-2 text-left">Capacidad Pago</th>
              <th className="px-4 py-2 text-left">Monto Máx.</th>
              <th className="px-4 py-2 text-left">Score HL</th>
              <th className="px-4 py-2 text-left">Fecha</th>
            </tr>
          </thead>

          <tbody>
            {leadsFiltrados.length === 0 && (
              <tr>
                <td colSpan="11" className="px-4 py-6 text-center text-gray-400">
                  {cargando ? "Cargando leads..." : "No se encontraron leads."}
                </td>
              </tr>
            )}

            {leadsFiltrados.map((lead) => {
              const capacidadPago =
                lead?.resultado?.capacidadPago ??
                lead?.decision?.capacidadPago ??
                lead?.decision?.capacidadPago ??
                null;

              const montoMaximo =
                lead?.resultado?.montoMaximo ??
                lead?.decision?.montoMaximo ??
                null;

              // ✅ Prioridad real (según tu documento):
              // lead.scoreHL (top-level) -> lead.decision.scoreHL -> resultado.puntajeHabitaLibre
              const score =
                lead?.scoreHL ??
                lead?.decision?.scoreHL ??
                lead?.resultado?.puntajeHabitaLibre?.score ??
                lead?.resultado?.scoreHL?.total ??
                null;

              return (
                <tr
                  key={lead?._id || lead?.id}
                  className="border-t hover:bg-indigo-50/40 transition-colors"
                >
                  <td className="px-4 py-2 font-medium text-gray-800">
                    {lead?.nombre || "—"}
                  </td>

                  <td className="px-4 py-2 text-xs font-mono text-gray-700">
                    {lead?.codigoHL || lead?.codigoUnico || "—"}
                  </td>

                  <td className="px-4 py-2">{lead?.email || "—"}</td>
                  <td className="px-4 py-2">{lead?.telefono || "—"}</td>
                  <td className="px-4 py-2">{lead?.ciudad || "—"}</td>

                  <td className="px-4 py-2 text-xs">
                    <Badge tipo={lead?.canal || "—"} />
                  </td>

                  <td className="px-4 py-2 text-xs">
                    <Badge
                      tipo={lead?.producto || lead?.resultado?.productoSugerido || "—"}
                    />
                  </td>

                  <td className="px-4 py-2">
                    {capacidadPago != null
                      ? `$${Number(capacidadPago).toLocaleString("es-EC")}`
                      : "—"}
                  </td>

                  <td className="px-4 py-2">
                    {montoMaximo != null
                      ? `$${Number(montoMaximo).toLocaleString("es-EC")}`
                      : "—"}
                  </td>

                  <td className="px-4 py-2 font-semibold">
                    {score != null ? Number(score) : "—"}
                  </td>

                  <td className="px-4 py-2 text-xs text-gray-500">
                    {lead?.createdAt
                      ? new Date(lead.createdAt).toLocaleDateString("es-EC", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[11px] text-gray-500 text-center">
        📈 Total de leads: {leadsFiltrados.length.toLocaleString("es-EC")}
      </p>
    </div>
  );
}

/* ===========================================================
   🏷️ Badge pequeño
=========================================================== */
function Badge({ tipo }) {
  const key = String(tipo || "").toLowerCase();

  const map = {
    simulador: "bg-indigo-100 text-indigo-700",
    landing: "bg-emerald-100 text-emerald-700",
    referidos: "bg-amber-100 text-amber-700",
    web: "bg-slate-100 text-slate-700",
    whatsapp: "bg-green-100 text-green-700",
    instagram: "bg-pink-100 text-pink-700",
    vip: "bg-indigo-100 text-indigo-700",
    vis: "bg-emerald-100 text-emerald-700",
    biess: "bg-amber-100 text-amber-700",
    "sin oferta viable hoy": "bg-red-100 text-red-700",
  };

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
