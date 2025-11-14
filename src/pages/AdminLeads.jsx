// src/pages/AdminLeads.jsx
// src/pages/AdminLeads.jsx
import React, { useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://habitalibre-backend.onrender.com";

function formatFecha(fechaStr) {
  if (!fechaStr) return "-";
  const d = new Date(fechaStr);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);

  const [emailFiltro, setEmailFiltro] = useState("");
  const [telefonoFiltro, setTelefonoFiltro] = useState("");
  const [ciudadFiltro, setCiudadFiltro] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function fetchLeads(page = 1) {
    try {
      setLoading(true);
      setErr("");

      const params = new URLSearchParams();
      params.set("pagina", String(page));
      params.set("limit", String(limit));
      if (emailFiltro.trim()) params.set("email", emailFiltro.trim());
      if (telefonoFiltro.trim()) params.set("telefono", telefonoFiltro.trim());
      if (ciudadFiltro.trim()) params.set("ciudad", ciudadFiltro.trim());

      const url = `${API_BASE_URL}/api/leads?${params.toString()}`;

      const resp = await fetch(url);
      const data = await resp.json().catch(() => ({}));

      if (!resp.ok || !data.ok) {
        throw new Error(data?.error || "No se pudieron cargar los leads");
      }

      setLeads(data.items || []);
      setPagina(data.pagina || 1);
      setTotalPaginas(data.totalPaginas || 1);
      setTotal(data.total || 0);
    } catch (e) {
      console.error("❌ Error cargando leads:", e);
      setErr(e.message || "Error cargando leads");
    } finally {
      setLoading(false);
    }
  }

  // Cargar al inicio
  useEffect(() => {
    fetchLeads(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handler de aplicar filtros
  function handleBuscar(e) {
    e.preventDefault();
    fetchLeads(1);
  }

  function handleLimpiar() {
    setEmailFiltro("");
    setTelefonoFiltro("");
    setCiudadFiltro("");
    fetchLeads(1);
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Dashboard de Leads
            </h1>
            <p className="text-sm text-slate-500">
              Vista interna. Solo para uso del equipo HabitaLibre.
            </p>
          </div>
          <div className="flex flex-col items-start gap-1 text-sm text-slate-500 md:items-end">
            <span>
              Total leads:{" "}
              <span className="font-semibold text-slate-900">{total}</span>
            </span>
            <span>
              Página {pagina} de {totalPaginas}
            </span>
          </div>
        </header>

        {/* Filtros */}
        <form
          onSubmit={handleBuscar}
          className="mb-4 grid gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-4"
        >
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              value={emailFiltro}
              onChange={(e) => setEmailFiltro(e.target.value)}
              placeholder="Ej: gmail.com"
            />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input
              className="input"
              value={telefonoFiltro}
              onChange={(e) => setTelefonoFiltro(e.target.value)}
              placeholder="Contiene..."
            />
          </div>
          <div>
            <label className="label">Ciudad</label>
            <input
              className="input"
              value={ciudadFiltro}
              onChange={(e) => setCiudadFiltro(e.target.value)}
              placeholder="Quito, Guayaquil..."
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="btn-primary w-full md:w-auto"
              disabled={loading}
            >
              {loading ? "Buscando..." : "Aplicar filtros"}
            </button>
            <button
              type="button"
              onClick={handleLimpiar}
              className="btn-secondary w-full md:w-auto"
            >
              Limpiar
            </button>
          </div>
        </form>

        {/* Errores */}
        {err && (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}

        {/* Tabla */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-slate-600">
                    Fecha
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-600">
                    Nombre
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-600">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-600">
                    Teléfono
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-600">
                    Ciudad
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-600">
                    Producto
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-slate-600">
                    Score HL
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-slate-400"
                    >
                      No hay leads registrados con los filtros actuales.
                    </td>
                  </tr>
                )}

                {leads.map((lead) => {
                  const resultado = lead.resultado || {};
                  const producto =
                    resultado.productoElegido ||
                    resultado.producto ||
                    "-";
                  const score =
                    resultado?.puntajeHabitaLibre?.score ??
                    resultado?.score ??
                    "-";
                  const label =
                    resultado?.puntajeHabitaLibre?.label || "";

                  return (
                    <tr key={lead._id}>
                      <td className="px-4 py-2 whitespace-nowrap text-slate-700">
                        {formatFecha(lead.createdAt)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {lead.nombre || "-"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                          {lead.email || "-"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {lead.telefono || "-"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {lead.ciudad || "-"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {producto}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {score !== "-" ? (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                            {score}
                            {label ? ` · ${label}` : ""}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            <span>
              Mostrando página {pagina} de {totalPaginas} · {total} leads
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-secondary px-3 py-1 text-xs"
                disabled={pagina <= 1 || loading}
                onClick={() => fetchLeads(pagina - 1)}
              >
                Anterior
              </button>
              <button
                type="button"
                className="btn-secondary px-3 py-1 text-xs"
                disabled={pagina >= totalPaginas || loading}
                onClick={() => fetchLeads(pagina + 1)}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
