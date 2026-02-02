// src/pages/AdminLeads.jsx
import React, { useEffect, useState, useCallback } from "react";
import AdminLogin from "../components/AdminLogin.jsx";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { API_BASE } from "../lib/api";

// =====================================================
// BACKEND HabitaLibre
// =====================================================
const API_BASE_URL = (API_BASE || "").trim();

// =====================================================
// Helpers pequeños
// =====================================================
const safe = (v, fallback = "") => (v == null ? fallback : v);

const formatMoney = (n) => {
  if (n == null || !Number.isFinite(Number(n))) return "-";
  return Number(n).toLocaleString("es-EC", { maximumFractionDigits: 0 });
};

const formatPct = (x) => {
  if (x == null || !Number.isFinite(Number(x))) return "-";
  return `${Math.round(Number(x) * 100)}%`;
};

const formatDate = (d) => {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleString("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
};

const toNumOrNull = (v) => {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const formatBoolSiNo = (v) => {
  if (v === true) return "Sí";
  if (v === false) return "No";
  const s = String(v ?? "").trim().toLowerCase();
  if (s === "true" || s === "1" || s === "si" || s === "sí") return "Sí";
  if (s === "false" || s === "0" || s === "no") return "No";
  return "-";
};

// ✅ Score HL: soporta TODOS los formatos (plano / decision / resultado)
const getScoreHL = (lead) => {
  const s1 = toNumOrNull(lead?.scoreHL);
  if (s1 != null) return s1;

  const s2 = toNumOrNull(lead?.decision?.scoreHL);
  if (s2 != null) return s2;

  const s3 = toNumOrNull(lead?.resultado?.puntajeHabitaLibre?.score);
  if (s3 != null) return s3;

  const s4 = toNumOrNull(lead?.resultado?.puntajeHabitaLibre?.puntaje);
  if (s4 != null) return s4;

  const s5 = toNumOrNull(lead?.resultado?.puntajeHabitaLibre);
  if (s5 != null) return s5;

  return null;
};

export default function AdminLeads() {
  // -----------------------------
  // Filtros
  // -----------------------------
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");

  // Datos
  const [leads, setLeads] = useState([]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Auth admin
  const [token, setToken] = useState(() => localStorage.getItem("hl_admin_token") || "");
  const [adminEmail, setAdminEmail] = useState(() => localStorage.getItem("hl_admin_email") || "");

  // KPIs
  const [stats, setStats] = useState({
    total: 0,
    hoy: 0,
    semanaActual: 0,
    semanaAnterior: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  const pageSize = 10;

  // =====================================================
  // Helpers de UI
  // =====================================================
  const mostrarDesde = totalLeads === 0 ? 0 : (pagina - 1) * pageSize + 1;
  const mostrarHasta = totalLeads === 0 ? 0 : Math.min(pagina * pageSize, totalLeads);

  const chipScore = (score) => {
    if (score == null) return <span className="text-xs text-slate-400">-</span>;
    let color = "bg-slate-100 text-slate-800";
    if (score >= 80) color = "bg-emerald-50 text-emerald-700";
    else if (score >= 60) color = "bg-sky-50 text-sky-700";
    else if (score >= 40) color = "bg-amber-50 text-amber-700";
    else color = "bg-rose-50 text-rose-700";
    return (
      <span className={`inline-flex items-center justify-center min-w-[40px] px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
        {score}
      </span>
    );
  };

  const getCanal = (lead) => {
    const c = String(lead?.canal || "").trim().toLowerCase();
    if (c === "web" || c === "whatsapp" || c === "instagram") return c;

    const mc = String(lead?.metadata?.canal || "").trim().toLowerCase();
    if (mc.includes("whatsapp")) return "whatsapp";
    if (mc.includes("instagram")) return "instagram";
    if (mc.includes("web")) return "web";

    const o = String(lead?.origen || "").toLowerCase();
    if (o.includes("whatsapp")) return "whatsapp";
    if (o.includes("instagram")) return "instagram";

    return "web";
  };

  const getFuente = (lead) => {
    const f = String(lead?.fuente || "").trim().toLowerCase();
    if (f === "form" || f === "manychat") return f;

    const o = String(lead?.origen || "").toLowerCase();
    if (o.includes("manychat")) return "manychat";
    return "form";
  };

  const chipCanal = (lead) => {
    const canal = getCanal(lead);
    if (canal === "whatsapp") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          WhatsApp
        </span>
      );
    }
    if (canal === "instagram") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-fuchsia-50 text-fuchsia-700 text-xs font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
          Instagram
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        Web
      </span>
    );
  };

  const chipFuente = (lead) => {
    const fuente = getFuente(lead);
    if (fuente === "manychat") {
      return <span className="inline-flex items-center px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium">Manychat</span>;
    }
    return <span className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">Form</span>;
  };

  const obtenerCodigoLead = (lead) => {
    if (!lead) return "-";
    if (lead.codigo) return lead.codigo;
    if (lead.codigoHL) return lead.codigoHL;
    if (lead.codigoUnico) return lead.codigoUnico;
    if (lead.codigoLead) return lead.codigoLead;
    if (lead._id) return `HL-${lead._id.slice(-6).toUpperCase()}`;
    return "-";
  };

  const sanitizePhoneForWa = (phone) => String(phone || "").replace(/[^\d]/g, "") || "";

  const getIgUsername = (lead) => {
    let u = String(lead?.igUsername || "").trim();
    if (u) return u.replace(/^@/, "");
    const m = lead?.metadata?.instagram || {};
    u = String(m.username || m.ig_username || m.instagram_username || "").trim();
    if (u) return u.replace(/^@/, "");
    const raw = lead?.metadata?.whatsapp || lead?.metadata?.instagram || {};
    u = String(raw.igUsername || raw.ig_username || raw.username || "").trim();
    if (u) return u.replace(/^@/, "");
    return "";
  };

  const buildWaLink = (lead) => {
    const p = sanitizePhoneForWa(lead?.telefono);
    if (!p) return "";
    const nombre = String(lead?.nombre || "").trim();
    const msg = `Hola ${nombre ? nombre : ""}, soy HabitaLibre. Vimos tu interés y quiero ayudarte a avanzar con tu casa.`;
    return `https://wa.me/${p}?text=${encodeURIComponent(msg)}`;
  };

  const buildIgLink = (lead) => {
    const u = getIgUsername(lead);
    if (!u) return "";
    return `https://www.instagram.com/${u}/`;
  };

  const getDecision = (lead) => lead?.decision || null;

  const getIngresoMensual = (lead) => {
    const r = lead?.resultado || null;
    const perfil = r?.perfil || null;

    const a = toNumOrNull(lead?.ingreso_mensual);
    if (a != null) return a;

    const b = toNumOrNull(perfil?.ingresoTotal);
    if (b != null) return b;

    const c = toNumOrNull(lead?.ingresoTotal);
    if (c != null) return c;

    return null;
  };

  const getDeudaMensual = (lead) => {
    const r = lead?.resultado || null;
    const perfil = r?.perfil || null;

    const a = toNumOrNull(lead?.deuda_mensual_aprox);
    if (a != null) return a;

    const b = toNumOrNull(perfil?.otrasDeudasMensuales);
    if (b != null) return b;

    return null;
  };

  const chipHeat = (heat) => {
    const h = Number(heat ?? -1);
    if (!Number.isFinite(h) || h < 0) return <span className="text-xs text-slate-400">-</span>;
    const label = h === 0 ? "Frío" : h === 1 ? "Tibio" : h === 2 ? "Caliente" : "🔥 Hot";
    const cls = h <= 1 ? "bg-slate-100 text-slate-700" : h === 2 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700";
    return <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${cls}`}>{label}</span>;
  };

  const chipEstado = (estado) => {
    const e = String(estado || "").toLowerCase();
    if (!e) return <span className="text-xs text-slate-400">-</span>;
    if (e === "bancable") return <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">Bancable</span>;
    if (e === "rescatable") return <span className="inline-flex items-center px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">Rescatable</span>;
    if (e === "descartable") return <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">Descartable</span>;
    if (e === "por_calificar") return <span className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">Por calificar</span>;
    return <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">{estado}</span>;
  };

  const chipLlamarHoy = (llamarHoy) => {
    if (llamarHoy === true) {
      return (
        <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold">
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          Llamar hoy
        </span>
      );
    }
    if (llamarHoy === false) return <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">No urgente</span>;
    return <span className="text-xs text-slate-400">-</span>;
  };

  // ✅ FIX: relogin sin redirect (evita loop 401)
  const forceAdminRelogin = useCallback((reason = "expired") => {
    try {
      localStorage.removeItem("hl_admin_token");
      localStorage.removeItem("hl_admin_email");
    } catch {}
    setToken("");
    setAdminEmail("");
    setDrawerOpen(false);
    setSelectedLead(null);
    setLeads([]);
    setTotalLeads(0);
    setTotalPaginas(1);
    setPagina(1);
    setError(reason === "missing_token" ? "Sesión no encontrada. Inicia sesión nuevamente." : "Tu sesión expiró. Inicia sesión nuevamente.");
  }, []);

  // ✅ PDF
  const descargarFichaPDF = useCallback(
    async (codigo) => {
      try {
        const currentToken = localStorage.getItem("hl_admin_token");
        if (!currentToken) {
          forceAdminRelogin("missing_token");
          return;
        }

        const code = String(codigo || "").trim();
        if (!code || code === "-") {
          alert("Este lead no tiene código para generar PDF.");
          return;
        }

        const url = `${API_BASE_URL}/api/reportes/ficha/${encodeURIComponent(code)}`;

        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${currentToken}`,
            Accept: "application/pdf",
          },
          cache: "no-store",
        });

        if (res.status === 401 || res.status === 403) {
          forceAdminRelogin("expired_or_forbidden");
          return;
        }

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          console.error("PDF error body:", txt);
          alert(`No se pudo generar el PDF (status ${res.status}).`);
          return;
        }

        const blob = await res.blob();
        const a = document.createElement("a");
        const blobUrl = window.URL.createObjectURL(blob);
        a.href = blobUrl;
        a.download = `Ficha_Comercial_${code}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      } catch (err) {
        console.error("descargarFichaPDF error:", err);
        alert("Error generando el PDF.");
      }
    },
    [forceAdminRelogin]
  );

  // =====================================================
  // Fetch Leads
  // =====================================================
  const fetchLeads = async (paginaNueva = 1) => {
    try {
      setLoading(true);
      setError("");

      const currentToken = localStorage.getItem("hl_admin_token");
      if (!currentToken) {
        forceAdminRelogin("missing_token");
        return;
      }

      const params = new URLSearchParams();
      if (email.trim()) params.append("email", email.trim());
      if (telefono.trim()) params.append("telefono", telefono.trim());
      if (ciudad.trim()) params.append("ciudad", ciudad.trim());
      params.append("pagina", paginaNueva);
      params.append("limit", pageSize);

      const url = `${API_BASE_URL}/api/leads?${params.toString()}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${currentToken}` } });

      if (res.status === 401 || res.status === 403) {
        forceAdminRelogin("expired");
        return;
      }

      if (!res.ok) throw new Error(`No se pudo cargar los leads (status ${res.status})`);

      const data = await res.json();
      setLeads(data.leads || []);
      setTotalLeads(data.total || 0);
      setTotalPaginas(data.totalPaginas || 1);
      setPagina(data.pagina || paginaNueva);
    } catch (err) {
      console.error("Error fetchLeads:", err);
      setError(err.message || "Error al cargar leads");
      setLeads([]);
      setTotalLeads(0);
      setTotalPaginas(1);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // Fetch Stats
  // =====================================================
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const currentToken = localStorage.getItem("hl_admin_token");
      if (!currentToken) return;

      const res = await fetch(`${API_BASE_URL}/api/leads/stats`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (res.status === 401 || res.status === 403) {
        forceAdminRelogin("expired");
        return;
      }

      if (!res.ok) return;

      const data = await res.json();
      setStats({
        total: data.total ?? totalLeads,
        hoy: data.hoy ?? 0,
        semanaActual: data.semana ?? data.semanaActual ?? 0,
        semanaAnterior: data.semanaAnterior ?? 0,
      });
    } catch (err) {
      console.warn("Error stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  // =====================================================
  // Handlers UI
  // =====================================================
  const handleBuscar = () => {
    fetchLeads(1);
    fetchStats();
  };

  const handleLimpiar = () => {
    setEmail("");
    setTelefono("");
    setCiudad("");
    fetchLeads(1);
    fetchStats();
  };

  const handleAnterior = () => {
    if (pagina > 1) fetchLeads(pagina - 1);
  };

  const handleSiguiente = () => {
    if (pagina < totalPaginas) fetchLeads(pagina + 1);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("hl_admin_token");
      localStorage.removeItem("hl_admin_email");
    } catch {}
    setToken("");
    setAdminEmail("");
    setDrawerOpen(false);
    setSelectedLead(null);
  };

  const openDrawerFor = useCallback((lead) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  // Esc para cerrar
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeDrawer();
    };
    if (drawerOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  // Efectos
  useEffect(() => {
    if (!token) return;
    fetchLeads(1);
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Gate
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

  // UI
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="max-w-6xl mx-auto space-y-5">
        <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard de Leads</h1>
            <p className="text-sm text-slate-500">Vista interna. Leads (Web/WhatsApp/Instagram/Manychat).</p>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span>
                Total leads: <span className="font-semibold text-slate-900">{totalLeads}</span>
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

          <div className="flex items-center gap-3 self-start">
            {adminEmail && (
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-600">
                  Sesión iniciada como <span className="font-medium text-slate-900">{adminEmail}</span>
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

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="Leads hoy" value={stats.hoy} subtitle={loadingStats ? "Calculando…" : "Ingresados desde 00:00"} />
          <KpiCard label="Esta semana" value={stats.semanaActual} subtitle="Total captados desde lunes" />
          <KpiCard label="Semana anterior" value={stats.semanaAnterior} subtitle="Para comparar rendimiento" />
          <KpiCard label="Total en base" value={stats.total || totalLeads} subtitle="Leads históricos registrados" />
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 px-5 py-4 md:px-6 md:py-5">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            <div className="flex flex-col md:col-span-2">
              <label className="text-xs font-medium text-slate-500 mb-1">Email</label>
              <input
                type="text"
                placeholder="Ej: gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">Teléfono</label>
              <input
                type="text"
                placeholder="Contiene…"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-xs font-medium text-slate-500 mb-1">Ciudad</label>
              <input
                type="text"
                placeholder="Quito, Guayaquil…"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>

            <div className="hidden md:block md:col-span-2" />
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

          {error && <div className="mt-3 text-sm text-red-500">{error}</div>}
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto max-h-[65vh]">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Código HL</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Ciudad</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Ingreso</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Deudas</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Producto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Score HL</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">PDF</th>
                </tr>
              </thead>

              <tbody>
                {!loading && leads.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-sm text-slate-400">
                      No hay leads para los filtros seleccionados.
                    </td>
                  </tr>
                )}

                {leads.map((lead) => {
                  const decision = getDecision(lead);
                  const ingreso = getIngresoMensual(lead);
                  const deuda = getDeudaMensual(lead);

                  const rowHover =
                    decision?.llamarHoy === true
                      ? "hover:bg-rose-50/40"
                      : decision?.estado === "bancable"
                      ? "hover:bg-emerald-50/40"
                      : "hover:bg-slate-50/80";

                  return (
                    <tr
                      key={lead._id}
                      onClick={() => openDrawerFor(lead)}
                      className={`border-t border-slate-100 ${rowHover} cursor-pointer`}
                      title="Click para ver detalle"
                    >
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDate(lead.createdAt)}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-700">{obtenerCodigoLead(lead)}</td>
                      <td className="px-4 py-3 text-sm text-slate-900">{lead.nombre || lead.nombreCompleto || "-"}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{lead.ciudad || "-"}</td>

                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                        {ingreso != null ? `$${formatMoney(ingreso)}` : "-"}
                      </td>

                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                        {deuda != null ? `$${formatMoney(deuda)}` : "-"}
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-700">
                        {lead.producto || lead.tipoProducto || decision?.producto || "-"}
                      </td>

                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">{chipScore(getScoreHL(lead))}</td>

                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const codigo = lead?.codigo ? lead.codigo : obtenerCodigoLead(lead);
                            descargarFichaPDF(codigo);
                          }}
                          className="h-8 px-3 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          title="Descargar Ficha Comercial (PDF)"
                        >
                          PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {loading && (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-sm text-slate-400">
                      Cargando leads…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
            <div>
              Mostrando <span className="font-semibold text-slate-900">{mostrarDesde}</span> –{" "}
              <span className="font-semibold text-slate-900">{mostrarHasta}</span> de{" "}
              <span className="font-semibold text-slate-900">{totalLeads}</span> leads
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

      <LeadDrawer
        open={drawerOpen}
        lead={selectedLead}
        onClose={closeDrawer}
        getCanal={getCanal}
        getFuente={getFuente}
        buildWaLink={buildWaLink}
        buildIgLink={buildIgLink}
        getIgUsername={getIgUsername}
        chipCanal={chipCanal}
        chipFuente={chipFuente}
        chipScore={chipScore}
        chipEstado={chipEstado}
        chipHeat={chipHeat}
        chipLlamarHoy={chipLlamarHoy}
        obtenerCodigoLead={obtenerCodigoLead}
        getIngresoMensual={getIngresoMensual}
        getDeudaMensual={getDeudaMensual}
        descargarFichaPDF={descargarFichaPDF}
      />
    </div>
  );
}

// =====================================================
// Drawer
// =====================================================
function LeadDrawer({
  open,
  lead,
  onClose,
  getCanal,
  getFuente,
  buildWaLink,
  buildIgLink,
  getIgUsername,
  chipCanal,
  chipFuente,
  chipScore,
  chipEstado,
  chipHeat,
  chipLlamarHoy,
  obtenerCodigoLead,
  getIngresoMensual,
  getDeudaMensual,
  descargarFichaPDF,
}) {
  if (!open) return null;

  const decision = lead?.decision || null;
  const canal = lead ? getCanal(lead) : "";
  const fuente = lead ? getFuente(lead) : "";
  const igUser = lead ? getIgUsername(lead) : "";
  const waLink = lead ? buildWaLink(lead) : "";
  const igLink = lead ? buildIgLink(lead) : "";

  const resultado = lead?.resultado || null;
  const perfil = resultado?.perfil || null;
  const ruta = decision?.ruta || null;

  const bancosTop3 = Array.isArray(decision?.bancosTop3) ? decision.bancosTop3 : [];
  const faltantes = Array.isArray(decision?.faltantes) ? decision.faltantes : [];
  const porQue = Array.isArray(decision?.porQue) ? decision.porQue : [];
  const nextActions = Array.isArray(decision?.nextActions) ? decision.nextActions : [];

  const ingresoMensual = getIngresoMensual ? getIngresoMensual(lead) : null;
  const deudaMensual = getDeudaMensual ? getDeudaMensual(lead) : null;
  const dtiBase = ingresoMensual && ingresoMensual > 0 && deudaMensual != null ? deudaMensual / ingresoMensual : null;

  const aniosEstabilidad = toNumOrNull(lead?.anios_estabilidad) ?? toNumOrNull(perfil?.aniosEstabilidad) ?? null;
  const afiliadoIess = lead?.afiliado_iess != null ? lead.afiliado_iess : perfil?.afiliadoIess ?? null;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white shadow-2xl border-l border-slate-200 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-900 truncate">{lead?.nombre || lead?.nombreCompleto || "Lead"}</p>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-semibold text-slate-700">{obtenerCodigoLead(lead)}</span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {chipCanal(lead)}
              {chipFuente(lead)}
              {chipLlamarHoy(decision?.llamarHoy)}
              {chipEstado(decision?.estado)}
              {chipHeat(decision?.heat)}
            </div>

            <div className="mt-2 text-xs text-slate-500">
              Creado: <span className="font-medium text-slate-700">{lead?.createdAt ? formatDate(lead.createdAt) : "-"}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center"
            title="Cerrar"
          >
            <XMarkIcon className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-700">Acción rápida</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const codigo = lead?.codigo || obtenerCodigoLead(lead);
                  descargarFichaPDF?.(codigo);
                }}
                className="h-9 px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
              >
                Ficha PDF
              </button>

              {lead?.telefono && waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 px-4 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
                >
                  WhatsApp
                </a>
              )}

              {lead?.telefono && (
                <a href={`tel:${lead.telefono}`} className="h-9 px-4 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700">
                  Llamar
                </a>
              )}

              {lead?.email && (
                <a href={`mailto:${lead.email}`} className="h-9 px-4 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700">
                  Email
                </a>
              )}

              {canal === "instagram" && igUser && igLink && (
                <a href={igLink} target="_blank" rel="noopener noreferrer" className="h-9 px-4 rounded-xl bg-fuchsia-600 text-white text-sm font-semibold hover:bg-fuchsia-700">
                  Instagram
                </a>
              )}
            </div>

            {!decision && (
              <p className="mt-3 text-xs text-slate-500">
                Este lead no trae <span className="font-semibold">decision</span> todavía.
              </p>
            )}
          </div>

          <Card title="Qué le falta para avanzar" subtitle={faltantes.length ? `${faltantes.length} punto(s)` : "—"}>
            {faltantes.length ? (
              <ul className="space-y-2">
                {faltantes.map((f, idx) => (
                  <li key={`${idx}-${f}`} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span className="text-sm text-slate-800">{f}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">—</p>
            )}
          </Card>

          <Card title="Por qué está en este estado">
            {porQue.length ? (
              <ul className="space-y-2">
                {porQue.map((p, idx) => (
                  <li key={`${idx}-${p}`} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <span className="text-sm text-slate-800">{p}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">—</p>
            )}
          </Card>

          <Card title="Qué haría yo ahora" subtitle="Checklist operativo">
            {nextActions.length ? (
              <ol className="space-y-2 list-decimal pl-5">
                {nextActions.map((a, idx) => (
                  <li key={`${idx}-${a}`} className="text-sm text-slate-800">
                    {a}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-slate-500">—</p>
            )}
          </Card>

          <Card title="Bancabilidad (scoring)">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Score HL" value={chipScore(getScoreHL(lead))} />
              <Stat label="Etapa" value={<span className="text-sm font-semibold text-slate-900">{decision?.etapa || "-"}</span>} />
              <Stat label="Producto" value={<span className="text-sm font-semibold text-slate-900">{lead?.producto || decision?.producto || "-"}</span>} />
              <Stat label="Canal / Fuente" value={<span className="text-sm font-semibold text-slate-900">{`${canal || "-"} / ${fuente || "-"}`}</span>} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Stat label="DTI con hipoteca" value={<span className="text-sm font-semibold text-slate-900">{formatPct(resultado?.dtiConHipoteca)}</span>} />
              <Stat label="LTV estimado" value={<span className="text-sm font-semibold text-slate-900">{formatPct(resultado?.ltv)}</span>} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Stat label="Ingreso mensual" value={<span className="text-sm font-semibold text-slate-900">{ingresoMensual != null ? `$${formatMoney(ingresoMensual)}` : "-"}</span>} />
              <Stat label="Deudas mensuales" value={<span className="text-sm font-semibold text-slate-900">{deudaMensual != null ? `$${formatMoney(deudaMensual)}` : "-"}</span>} />
              <Stat label="DTI sin hipoteca" value={<span className="text-sm font-semibold text-slate-900">{dtiBase != null ? `${Math.round(dtiBase * 100)}%` : "-"}</span>} />
              <Stat
                label="Estabilidad / IESS"
                value={
                  <span className="text-sm font-semibold text-slate-900">
                    {aniosEstabilidad != null ? `${aniosEstabilidad} años` : "-"} • {formatBoolSiNo(afiliadoIess)}
                  </span>
                }
              />
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-700">Ruta recomendada</p>
              <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">{safe(ruta?.tipo, safe(resultado?.rutaRecomendada?.tipo, "-"))}</span>
                  <span className="text-xs text-slate-500">
                    Cuota: <span className="font-semibold text-slate-800">${formatMoney(ruta?.cuota ?? resultado?.cuotaEstimada)}</span>
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Tasa anual:{" "}
                  <span className="font-semibold text-slate-700">
                    {resultado?.tasaAnual ? `${(resultado.tasaAnual * 100).toFixed(2)}%` : "-"}
                  </span>{" "}
                  • Plazo:{" "}
                  <span className="font-semibold text-slate-700">
                    {resultado?.plazoMeses ? `${Math.round(resultado.plazoMeses / 12)} años` : "-"}
                  </span>
                </div>
              </div>
            </div>

            {bancosTop3.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-700">Top 3 bancos</p>
                <div className="mt-2 space-y-2">
                  {bancosTop3.map((b, idx) => (
                    <div key={`${idx}-${b.banco || b.nombre || idx}`} className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-slate-900">{b.banco || b.nombre || "-"}</span>
                        <span className="text-xs font-semibold text-slate-700">
                          {b.probLabel || "-"} {b.probScore != null ? `(${b.probScore}/100)` : ""}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Tipo: <span className="font-semibold text-slate-700">{b.tipoProducto || "-"}</span> • DTI banco:{" "}
                        <span className="font-semibold text-slate-700">{b.dtiBanco != null ? `${Math.round(b.dtiBanco * 100)}%` : "-"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card title="Contacto y perfil">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <Row label="Teléfono" value={lead?.telefono || "-"} />
              <Row label="Email" value={lead?.email || "-"} />
              <Row label="Ciudad" value={lead?.ciudad || "-"} />
              {canal === "instagram" && <Row label="IG" value={igUser ? `@${igUser}` : "-"} />}
            </div>

            {perfil && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-semibold text-slate-700">Perfil (del scoring)</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <Row label="Tipo ingreso" value={perfil?.tipoIngreso || "-"} />
                  <Row label="Ingreso total" value={perfil?.ingresoTotal != null ? `$${formatMoney(perfil.ingresoTotal)}` : "-"} />
                  <Row label="Años estabilidad" value={perfil?.aniosEstabilidad != null ? String(perfil.aniosEstabilidad) : "-"} />
                  <Row label="IESS" value={formatBoolSiNo(perfil?.afiliadoIess)} />
                </div>
              </div>
            )}
          </Card>

          <details className="rounded-2xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-900">Ver datos completos (debug)</summary>
            <pre className="mt-3 text-xs whitespace-pre-wrap text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3 overflow-x-auto">
              {JSON.stringify(lead, null, 2)}
            </pre>
          </details>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-white">
          <p className="text-[11px] text-slate-500">
            Tip UX: puedes cerrar con <span className="font-semibold">Esc</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// UI atoms
// =====================================================
function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
      <div className="mt-1">{value}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900 text-right">{value}</span>
    </div>
  );
}

function KpiCard({ label, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{Number(value || 0).toLocaleString("es-EC")}</p>
      {subtitle && <p className="mt-1 text-[11px] text-slate-500">{subtitle}</p>}
    </div>
  );
}
