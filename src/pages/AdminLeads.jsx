// src/pages/AdminLeads.jsx
import React, { useEffect, useMemo, useState } from "react";
import AdminLogin from "../components/AdminLogin.jsx";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { API_BASE } from "../lib/api"; // ✅ PATCH: usa el mismo API_BASE del app

// =====================================================
// BACKEND HabitaLibre
// ✅ PATCH: usa API_BASE ("" en DEV con proxy /api, o https://... en PROD)
// =====================================================
const API_BASE_URL = (API_BASE || "").trim();

const AdminLeads = () => {
  // -----------------------------
  // Filtros existentes
  // -----------------------------
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [tiempoCompra, setTiempoCompra] = useState(""); // horizonte
  const [sustentoFiltro, setSustentoFiltro] = useState(""); // sustento ingresos

  // -----------------------------
  // ✅ Nuevos filtros: Canal + Fuente
  // -----------------------------
  const [canalFiltro, setCanalFiltro] = useState(""); // web | whatsapp | instagram
  const [fuenteFiltro, setFuenteFiltro] = useState(""); // form | manychat

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

  // KPIs + breakdown
  const [stats, setStats] = useState({
    total: 0,
    hoy: 0,
    semanaActual: 0,
    semanaAnterior: 0,
    byCanal: [],
    byFuente: [],
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

  // ✅ Canal canónico (fallback a metadata.canal)
  const getCanal = (lead) => {
    const c = String(lead?.canal || "").trim().toLowerCase();
    if (c === "web" || c === "whatsapp" || c === "instagram") return c;

    const mc = String(lead?.metadata?.canal || "").trim().toLowerCase();
    if (mc.includes("whatsapp")) return "whatsapp";
    if (mc.includes("instagram")) return "instagram";
    if (mc.includes("web")) return "web";

    // fallback: si origen dice WhatsApp/Instagram
    const o = String(lead?.origen || "").toLowerCase();
    if (o.includes("whatsapp")) return "whatsapp";
    if (o.includes("instagram")) return "instagram";

    return "web";
  };

  // ✅ Fuente canónica (fallback: si origen Manychat)
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
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium">
          Manychat
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
        Form
      </span>
    );
  };

  // Código único “bonito” para el lead
  const obtenerCodigoLead = (lead) => {
    if (!lead) return "-";
    if (lead.codigoHL) return lead.codigoHL;
    if (lead.codigoUnico) return lead.codigoUnico;
    if (lead.codigoLead) return lead.codigoLead;
    if (lead._id) return `HL-${lead._id.slice(-6).toUpperCase()}`;
    return "-";
  };

  const sanitizePhoneForWa = (phone) => {
    const p = String(phone || "").replace(/[^\d]/g, "");
    return p || "";
  };

  const getIgUsername = (lead) => {
    // canónico
    let u = String(lead?.igUsername || "").trim();
    if (u) return u.replace(/^@/, "");

    // fallback: metadata.instagram.username o metadata.instagram.ig_username
    const m = lead?.metadata?.instagram || {};
    u = String(m.username || m.ig_username || m.instagram_username || "").trim();
    if (u) return u.replace(/^@/, "");

    // fallback: raw guardado
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

  // ✅ PATCH: helper para forzar relogin admin con retorno a la ruta actual
  const forceAdminRelogin = (reason = "expired") => {
    try {
      localStorage.removeItem("hl_admin_token");
      localStorage.removeItem("hl_admin_email");
    } catch {}
    setToken("");
    setAdminEmail("");

    const returnTo =
      window.location?.pathname +
      (window.location?.search || "") +
      (window.location?.hash || "");

    // HashRouter => usamos "#/admin"
    window.location.href = `#/admin?returnTo=${encodeURIComponent(returnTo)}&reason=${encodeURIComponent(
      reason
    )}`;
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
      if (tiempoCompra.trim()) params.append("tiempoCompra", tiempoCompra.trim());
      if (sustentoFiltro.trim())
        params.append("sustentoIndependiente", sustentoFiltro.trim());

      // ✅ nuevos filtros
      if (canalFiltro.trim()) params.append("canal", canalFiltro.trim());
      if (fuenteFiltro.trim()) params.append("fuente", fuenteFiltro.trim());

      params.append("pagina", paginaNueva);
      params.append("limit", pageSize);

      const url = `${API_BASE_URL}/api/leads?${params.toString()}`;
      console.log("🌐 Fetch leads a:", url);

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      // ✅ PATCH: en 401/403 redirige al login admin con returnTo
      if (res.status === 401 || res.status === 403) {
        forceAdminRelogin("expired");
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
  // Fetch Stats (KPIs + breakdown)
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

      // ✅ PATCH: si expiró el token, redirige al login admin con returnTo
      if (res.status === 401 || res.status === 403) {
        forceAdminRelogin("expired");
        return;
      }

      if (!res.ok) {
        console.warn("No se pudieron cargar stats de leads");
        return;
      }

      const data = await res.json();

      setStats({
        total: data.total ?? totalLeads,
        hoy: data.hoy ?? 0,

        // ✅ backend nuevo: semana / semanaAnterior
        semanaActual: data.semana ?? data.semanaActual ?? 0,
        semanaAnterior: data.semanaAnterior ?? 0,

        byCanal: Array.isArray(data.byCanal) ? data.byCanal : [],
        byFuente: Array.isArray(data.byFuente) ? data.byFuente : [],
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
    fetchStats();
  };

  const handleLimpiar = () => {
    setEmail("");
    setTelefono("");
    setCiudad("");
    setTiempoCompra("");
    setSustentoFiltro("");
    setCanalFiltro("");
    setFuenteFiltro("");
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

  const breakdownCanal = useMemo(() => {
    const map = new Map();
    for (const r of stats.byCanal || []) {
      map.set(String(r._id || "null"), Number(r.total || 0));
    }
    return {
      web: map.get("web") || 0,
      whatsapp: map.get("whatsapp") || 0,
      instagram: map.get("instagram") || 0,
      desconocido: map.get("null") || map.get("") || 0,
    };
  }, [stats.byCanal]);

  const breakdownFuente = useMemo(() => {
    const map = new Map();
    for (const r of stats.byFuente || []) {
      map.set(String(r._id || "null"), Number(r.total || 0));
    }
    return {
      form: map.get("form") || 0,
      manychat: map.get("manychat") || 0,
      desconocido: map.get("null") || map.get("") || 0,
    };
  }, [stats.byFuente]);

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
              Vista interna. Leads de Web + WhatsApp + Instagram (Manychat).
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
            subtitle={loadingStats ? "Calculando…" : "Ingresados desde 00:00"}
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

        {/* ✅ BREAKDOWN mini (Canal + Fuente) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Mix por canal
              </p>
              <span className="text-[11px] text-slate-400">(histórico)</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <MiniPill label="Web" value={breakdownCanal.web} />
              <MiniPill label="WhatsApp" value={breakdownCanal.whatsapp} />
              <MiniPill label="Instagram" value={breakdownCanal.instagram} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Mix por fuente
              </p>
              <span className="text-[11px] text-slate-400">(histórico)</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <MiniPill label="Form" value={breakdownFuente.form} />
              <MiniPill label="Manychat" value={breakdownFuente.manychat} />
            </div>
          </div>
        </section>

        {/* FILTROS */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 px-5 py-4 md:px-6 md:py-5">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            <div className="flex flex-col md:col-span-2">
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
                placeholder="Quito, Guayaquil…"
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

            {/* ✅ Canal */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">
                Canal
              </label>
              <select
                value={canalFiltro}
                onChange={(e) => setCanalFiltro(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                <option value="">Todos</option>
                <option value="web">Web</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>

            {/* ✅ Fuente */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">
                Fuente
              </label>
              <select
                value={fuenteFiltro}
                onChange={(e) => setFuenteFiltro(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                <option value="">Todos</option>
                <option value="form">Form</option>
                <option value="manychat">Manychat</option>
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

          {error && <div className="mt-3 text-sm text-red-500">{error}</div>}
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
                    Canal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                    Código HL
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
                    Fuente
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
                      colSpan={13}
                      className="px-4 py-6 text-center text-sm text-slate-400"
                    >
                      No hay leads para los filtros seleccionados.
                    </td>
                  </tr>
                )}

                {leads.map((lead) => {
                  const canal = getCanal(lead);
                  const waLink = buildWaLink(lead);
                  const igLink = buildIgLink(lead);
                  const igUser = getIgUsername(lead);

                  return (
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

                      <td className="px-4 py-3 text-sm">{chipCanal(lead)}</td>

                      <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                        {obtenerCodigoLead(lead)}
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
                        {lead.scoreHL != null ? chipScore(lead.scoreHL) : "-"}
                      </td>

                      <td className="px-4 py-3 text-sm">{chipFuente(lead)}</td>

                      {/* ⭐ ACCIONES */}
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {/* WhatsApp: prioriza canal whatsapp; fallback: si hay telefono igual lo dejamos */}
                          {lead.telefono &&
                            (canal === "whatsapp" || canal === "web") && (
                              <a
                                href={waLink}
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
                                  <path d="M380.9 97.1C339-3.6 280.4-15.4 224.2-15.4c-59.2 0-114.5 22.9-156.5 64.9C25.7 95.4 2.8 150.7 2.8 209.9c0 45.3 13.4 89.5 38.8 127.6L0 480l145-40.7c36.1 19.7 76.6 30 118.3 30h.1c59 0 114.3-22.9 156.4-64.9 42-42 65-97.3 65-156.5-.1-59.2-23-114.5-65-156.5zM224.2 438.6c-36.6 0-72.4-9.8-103.6-28.3l-7.4-4.4-85.9 24.1L52 344.3l-4.8-7.8c-23.6-38.2-36.1-82.3-36.1-127.1 0-130.1 106-236.1 236.1-236.1 63.1 0 122.3 24.6 166.7 69.1 44.4 44.4 68.8 103.6 68.8 166.7 0 130.1-106 236.1-236 236.1zm130.2-176.4c-7.1-3.5-42.3-20.9-48.8-23.2-6.5-2.4-11.2-3.5-15.9 3.5-4.7 7.1-18.2 23.2-22.3 27.9-4.1 4.7-8.2 5.3-15.3 1.8-7.1-3.5-30.1-11.1-57.3-35.4-21.2-18.9-35.5-42.3-39.6-49.4-4.1-7.1-.4-10.9 3.1-14.3 3.2-3.2 7.1-8.2 10.6-12.4 3.5-4.1 4.7-7.1 7.1-11.8 2.4-4.7 1.2-8.8-.6-12.4-1.8-3.5-15.9-38.3-21.8-52.5-5.7-13.8-11.5-11.9-15.9-12.1-4.1-.2-8.8-.2-13.5-.2s-12.4 1.8-18.9 8.8c-6.5 7.1-24.7 24.1-24.7 58.8 0 34.7 25.3 68.2 28.8 72.9 3.5 4.7 49.8 76.1 120.7 106.7 16.9 7.3 30.1 11.7 40.3 15 16.9 5.4 32.3 4.6 44.5 2.8 13.6-2 42.3-17.3 48.2-34.1 5.9-16.8 5.9-31.2 4.1-34.1-1.8-2.9-6.5-4.7-13.6-8.2z" />
                                </svg>
                              </a>
                            )}

                          {/* Instagram: solo si canal instagram y hay username */}
                          {canal === "instagram" && igUser && (
                            <a
                              href={igLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-fuchsia-100 hover:bg-fuchsia-200 transition"
                              title={`Abrir Instagram @${igUser}`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-4 h-4 text-fuchsia-700"
                              >
                                <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5Zm9.35 2.25a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
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
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="w-4 h-4 text-sky-600"
                                stroke="currentColor"
                                strokeWidth="1.7"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M2.25 4.5l4.5-2.25L9 6 6.75 7.5a11.25 11.25 0 005.25 5.25L13.5 10.5 18 11.25l-2.25 4.5c-.15.3-.42.54-.75.63-1.26.36-4.98-.66-7.5-3.18C4.98 10.68 3.96 6.96 4.32 5.7c.09-.33.33-.6.63-.75z"
                                />
                              </svg>
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
                  );
                })}

                {loading && (
                  <tr>
                    <td
                      colSpan={13}
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

function MiniPill({ label, value }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">
        {Number(value || 0).toLocaleString("es-EC")}
      </span>
    </span>
  );
}

export default AdminLeads;
