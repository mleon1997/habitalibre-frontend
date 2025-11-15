// src/pages/AdminLeads.jsx
import React, { useEffect, useState } from "react";

// =====================================================
// BACKEND HabitaLibre (Render)
// =====================================================
const API_BASE_URL = "https://habitalibre-backend.onrender.com";

const AdminLeads = () => {
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");

  const [leads, setLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pageSize = 10; // leads por página

  const fetchLeads = async (paginaNueva = 1) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (email.trim()) params.append("email", email.trim());
      if (telefono.trim()) params.append("telefono", telefono.trim());
      if (ciudad.trim()) params.append("ciudad", ciudad.trim());

      params.append("pagina", paginaNueva);
      params.append("limit", pageSize);

      const url = `${API_BASE_URL}/api/leads?${params.toString()}`;
      console.log("🌐 Fetch leads a:", url);

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`No se pudo cargar los leads (status ${res.status})`);
      }

      const data = await res.json();

      setLeads(data.leads || []);
      setTotalLeads(data.total || 0);
      setTotalPaginas(data.totalPaginas || 1);
      setPagina(data.pagina || paginaNueva);
    } catch (err) {
      console.error("❌ Error en fetchLeads:", err);
      setError(err.message || "Error al cargar leads");
      setLeads([]);
      setTotalLeads(0);
      setTotalPaginas(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBuscar = () => {
    fetchLeads(1);
  };

  const handleLimpiar = () => {
    setEmail("");
    setTelefono("");
    setCiudad("");
    fetchLeads(1);
  };

  const handleAnterior = () => {
    if (pagina > 1) fetchLeads(pagina - 1);
  };

  const handleSiguiente = () => {
    if (pagina < totalPaginas) fetchLeads(pagina + 1);
  };

  const mostrarDesde =
    totalLeads === 0 ? 0 : (pagina - 1) * pageSize + 1;
  const mostrarHasta =
    totalLeads === 0 ? 0 : Math.min(pagina * pageSize, totalLeads);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-10">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Dashboard de Leads
        </h1>
        <p className="text-sm text-slate-500">
          Vista interna. Solo para uso del equipo HabitaLibre.
        </p>

        <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
          <span>
            Total leads:{" "}
            <span className="font-semibold text-slate-900">
              {totalLeads}
            </span>
          </span>
          <span>
            Página {pagina} de {totalPaginas}
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-5 py-4 md:px-6 md:py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">
                Email
              </label>
              <input
                type="text"
                placeholder="Ej: gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                placeholder="Contiene…"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">
                Ciudad
              </label>
              <input
                type="text"
                placeholder="Quito, Guayaquil…"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleLimpiar}
              className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
              disabled={loading}
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={handleBuscar}
              className="h-10 px-5 rounded-xl bg-sky-600 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Buscando..." : "Aplicar filtros"}
            </button>
          </div>

          {error && (
            <div className="mt-3 text-sm text-red-500">{error}</div>
          )}
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Teléfono
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Ciudad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Score HL
                  </th>
                </tr>
              </thead>
              <tbody>
                {!loading && leads.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-sm text-slate-400"
                    >
                      No hay leads para los filtros seleccionados.
                    </td>
                  </tr>
                )}

                {leads.map((lead) => (
                  <tr
                    key={lead._id}
                    className="border-t border-slate-100 hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {lead.createdAt
                        ? new Date(lead.createdAt).toLocaleString("es-EC", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {lead.nombre || lead.nombreCompleto || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {lead.email || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {lead.telefono || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {lead.ciudad || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {lead.producto || lead.tipoProducto || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                      {lead.scoreHL != null ? lead.scoreHL : "-"}
                    </td>
                  </tr>
                ))}

                {loading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-sm text-slate-400"
                    >
                      Cargando leads…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer tabla */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
            <div>
              Mostrando{" "}
              <span className="font-semibold text-slate-900">
                {mostrarDesde}
              </span>{" "}
              –
              <span className="font-semibold text-slate-900">
                {" "}
                {mostrarHasta}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-slate-900">
                {totalLeads}
              </span>{" "}
              leads
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAnterior}
                disabled={pagina === 1 || loading}
                className="h-8 px-3 rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-700 disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={handleSiguiente}
                disabled={pagina === totalPaginas || loading}
                className="h-8 px-3 rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-700 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLeads;
