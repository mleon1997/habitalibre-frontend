// src/pages/AdminLeads.jsx
import React, { useEffect, useState } from "react";
import AdminLogin from "../components/AdminLogin.jsx";
import { PhoneIcon, EnvelopeIcon } from "@heroicons/react/24/outline"; // 👈 IMPORTADO

// =====================================================
// BACKEND HabitaLibre (Render)
// =====================================================
const API_BASE_URL = "https://habitalibre-backend.onrender.com";

const AdminLeads = () => {
  // Filtros
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [tiempoCompra, setTiempoCompra] = useState(""); // horizonte
  const [sustentoFiltro, setSustentoFiltro] = useState(""); // sustento ingresos

  // Datos tabla
  const [leads, setLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔐 Auth admin
  const [token, setToken] = useState(
    () => localStorage.getItem("hl_admin_token") || ""
  );
  const [adminEmail, setAdminEmail] = useState(
    () => localStorage.getItem("hl_admin_email") || ""
  );

  // KPIs rápidos
  const [stats, setStats] = useState({
    total: 0,
    hoy: 0,
    semanaActual: 0,
    semanaAnterior: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  const pageSize = 10;

  // =====================================================
  // Helpers
  // =====================================================
  const mostrarDesde = totalLeads === 0 ? 0 : (pagina - 1) * pageSize + 1;
  const mostrarHasta =
    totalLeads === 0 ? 0 : Math.min(pagina * pageSize, totalLeads);

  const formatTiempoCompra = (t) => {
    switch (t) {
      case "0-3":
        return "0–3 meses";
      case "3-12":
        return "3–12 meses";
      case "12-24":
        return "12–24 meses";
      case "explorando":
        return "Explorando";
      default:
        return t || "-";
    }
  };

  const chipSustento = (s) => {
    if (!s) {
      return <span className="text-xs text-slate-400">-</span>;
    }

    if (s === "declaracion") {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">
          Declaración IR
        </span>
      );
    }

    if (s === "movimientos") {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-medium">
          Movimientos 6 meses
        </span>
      );
    }

    if (s === "ninguno") {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
          Ninguno
        </span>
      );
    }

    return <span className="text-xs text-slate-400">-</span>;
  };

  const chipScore = (score) => {
    if (score == null) return <span className="text-xs text-slate-400">-</span>;
    let color = "bg-slate-100 text-slate-800";
    if (score >= 80) color = "bg-emerald-50 text-emerald-700";
    else if (score >= 60) color = "bg-sky-50 text-sky-700";
    else if (score >= 40) color = "bg-amber-50 text-amber-700";
    else color = "bg-rose-50 text-rose-700";

    return (
      <span
        className={`inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded-full text-xs font-semibold ${color}`}
      >
        {score}
      </span>
    );
  };

  // =====================================================
  // Fetch Leads
  // =====================================================
  const fetchLeads = async (paginaNueva = 1) => {
    try {
      setLoading(true);
      setError("");

      const currentToken = localStorage.getItem("hl_admin_token");
      if (!currentToken) {
        setError("No autorizado: inicia sesión nuevamente.");
        setLeads([]);
        setTotalLeads(0);
        setTotalPaginas(1);
        setToken("");
        return;
      }

      const params = new URLSearchParams();

      if (email.trim()) params.append("email", email.trim());
      if (telefono.trim()) params.append("telefono", telefono.trim());
      if (ciudad.trim()) params.append("ciudad", ciudad.trim());
      if (tiempoCompra.trim())
        params.append("tiempoCompra", tiempoCompra.trim());
      if (sustentoFiltro.trim())
        params.append("sustentoIndependiente", sustentoFiltro.trim());

      params.append("pagina", paginaNueva);
      params.append("limit", pageSize);

      const url = `${API_BASE_URL}/api/leads?${params.toString()}`;
      console.log("🌐 Fetch leads a:", url);

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("hl_admin_token");
        localStorage.removeItem("hl_admin_email");
        setToken("");
        setAdminEmail("");
        throw new Error("No autorizado: tu sesión ha expirado.");
      }

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

  // =====================================================
  // Fetch Stats (KPIs rápidos)
  // =====================================================
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const currentToken = localStorage.getItem("hl_admin_token");
      if (!currentToken) return;

      const res = await fetch(`${API_BASE_URL}/api/leads/stats`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (!res.ok) {
        console.warn("No se pudieron cargar stats de leads");
        return;
      }

      const data = await res.json();
      setStats({
        total: data.total ?? totalLeads,
        hoy: data.hoy ?? data.totalHoy ?? 0,
        semanaActual: data.semanaActual ?? 0,
        semanaAnterior: data.semanaAnterior ?? 0,
      });
    } catch (err) {
      console.warn("Error cargando stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  // =====================================================
  // Handlers UI
  // =====================================================
  const handleBuscar = () => {
    fetchLeads(1);
  };

  const handleLimpiar = () => {
    setEmail("");
    setTelefono("");
    setCiudad("");
    setTiempoCompra("");
    setSustentoFiltro("");
    fetchLeads(1);
  };

  const handleAnterior = () => {
    if (pagina > 1) fetchLeads(pagina - 1);
  };

  const handleSiguiente = () => {
    if (pagina < totalPaginas) fetchLeads(pagina + 1);
  };

  const handleLogout = () => {
    localStorage.removeItem("hl_admin_token");
    localStorage.removeItem("hl_admin_email");
    setToken("");
    setAdminEmail("");
  };

  // =====================================================
  // Efectos
  // =====================================================
  useEffect(() => {
    if (!token) return;
    fetchLeads(1);
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // =====================================================
  // Gate: si no hay token → login admin
  // =====================================================
  if (!token) {
    return (
      <AdminLogin
        onSuccess={(newToken, emailFromLogin) => {
          setToken(newToken);
          setAdminEmail(emailFromLogin);
        }}
      />
    );
  }

  // =====================================================
  // UI
  // =====================================================
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* HEADER PRINCIPAL */}
        <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Dashboard de Leads
            </h1>
            <p className="text-sm text-slate-500">
              Vista interna. Solo para uso del equipo HabitaLibre.
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span>
                Total leads:{" "}
                <span className="font-semibold text-slate-900">
                  {totalLeads}
                </span>
              </span>
              <span className="text-slate-300">•</span>
              <span>
                Página {pagina} de {totalPaginas}
              </span>
              {loading && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1 text-sky-600">
                    <span className="inline-block h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                    Actualizando…
                  </span>
                </>
              )}
            </div>
          </div>

          {/* SESIÓN + LOGOUT */}
          <div className="flex items-center gap-3 self-start">
            {adminEmail && (
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-600">
                  Sesión iniciada como{" "}
                  <span className="font-medium text-slate-900">
                    {adminEmail}
                  </span>
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="h-9 px-4 rounded-full border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100 shadow-sm"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        {/* KPIs RÁPIDOS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard
            label="Leads hoy"
            value={stats.hoy}
            subtitle={loadingStats ? "Calculando…" : "Ingresados en las últimas 24h"}
          />
          <KpiCard
            label="Esta semana"
            value={stats.semanaActual}
            subtitle="Total captados desde lunes"
          />
          <KpiCard
            label="Semana anterior"
            value={stats.semanaAnterior}
            subtitle="Para comparar rendimiento"
          />
          <KpiCard
            label="Total en base"
            value={stats.total || totalLeads}
            subtitle="Leads históricos registrados"
          />
        </section>

        {/* FILTROS */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 px-5 py-4 md:px-6 md:py-5">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">
                Email
              </label>
              <input
                type="text"
                placeholder="Ej: gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
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
                className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">
                Ciudad
              </label>
              <input
                type="text"
                placeholder("Quito, Guayaquil…")
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">
                Horizonte de compra
              </label>
              <select
                value={tiempoCompra}
                onChange={(e) => setTiempoCompra(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                <option value="">Todos</option>
                <option value="0-3">0–3 meses</option>
                <option value="3-12">3–12 meses</option>
                <option value="12-24">12–24 meses</option>
                <option value="explorando">Explorando</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">
                Sustento ingresos
              </label>
              <select
                value={sustentoFiltro}
                onChange={(e) => setSustentoFiltro(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                <option value="">Todos</option>
                <option value="declaracion">Declaración IR</option>
                <option value="movimientos">Movimientos 6 meses</option>
                <option value="ninguno">Ninguno</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleLimpiar}
              className="h-9 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
              disabled={loading}
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={handleBuscar}
              className="h-9 px-5 rounded-xl bg-sky-600 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Buscando..." : "Aplicar filtros"}
            </button>
          </div>

          {error && (
            <div className="mt-3 text-sm text-red-500">{error}</div>
          )}
        </section>

        {/* TABLA */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto max-h-[65vh]">
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
                    Sustento ingresos
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Horizonte
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Score HL
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {!loading && leads.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
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

                    <td className="px-4 py-3 text-sm">
                      {chipSustento(lead.sustentoIndependiente)}
                    </td>

                    <td className="px-4 py-3 text-sm text-slate-700">
                      {formatTiempoCompra(lead.tiempoCompra)}
                    </td>

                    <td className="px-4 py-3 text-sm text-slate-700">
                      {lead.producto || lead.tipoProducto || "-"}
                    </td>

                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                      {lead.scoreHL != null ? lead.scoreHL : "-"}
                    </td>

                    {/* ⭐ ACCIONES */}
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        {/* WhatsApp */}
                        {lead.telefono && (
                          <a
                            href={`https://wa.me/${lead.telefono}?text=Hola%20${encodeURIComponent(
                              lead.nombre || ""
                            )},%20soy%20HabitaLibre.%20Vimos%20tu%20simulación.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-green-100 hover:bg-green-200 transition"
                            title="Enviar WhatsApp"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 448 512"
                              className="w-4 h-4 text-green-600"
                              fill="currentColor"
                            >
                              <path d="M380.9 97.1C339-... recortado ..." />
                            </svg>
                          </a>
                        )}

                        {/* Llamar */}
                        {lead.telefono && (
                          <a
                            href={`tel:${lead.telefono}`}
                            className="p-1.5 rounded-lg bg-sky-100 hover:bg-sky-200 transition"
                            title="Llamar"
                          >
                            <PhoneIcon className="w-4 h-4 text-sky-600" />
                          </a>
                        )}

                        {/* Email */}
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}`}
                            className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 transition"
                            title="Enviar email"
                          >
                            <EnvelopeIcon className="w-4 h-4 text-amber-600" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {loading && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-6 text-center text-sm text-slate-400"
                    >
                      Cargando leads…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER TABLA */}
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
        </section>
      </div>
    </div>
  );
};

// =====================================================
// KpiCard – componente pequeño reutilizable
// =====================================================
function KpiCard({ label, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-slate-900">
        {Number(value || 0).toLocaleString("es-EC")}
      </p>
      {subtitle && (
        <p className="mt-1 text-[11px] text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}

export default AdminLeads;
