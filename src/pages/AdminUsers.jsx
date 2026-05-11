// src/pages/AdminUsers.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../lib/api";

const LS_ADMIN_TOKEN = "hl_admin_token";

function getAdminToken() {
  try {
    return localStorage.getItem(LS_ADMIN_TOKEN) || "";
  } catch {
    return "";
  }
}

function logoutHard(nav) {
  try {
    localStorage.removeItem(LS_ADMIN_TOKEN);
  } catch {}

  nav("/admin", { replace: true });
  window.location.reload();
}

function fmtDate(iso) {
  if (!iso) return "-";

  try {
    return new Date(iso).toLocaleString("es-EC");
  } catch {
    return "-";
  }
}

function money(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "-";
  return `$${Math.round(x).toLocaleString("es-EC")}`;
}

function numSafe(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : null;
}

function intSafe(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "-";
  return String(Math.round(x));
}

function pct(part, total) {
  const a = Number(part);
  const b = Number(total);

  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= 0) return "0%";

  return `${Math.round((a / b) * 100)}%`;
}

function cleanPhone(v) {
  return String(v || "").replace(/[^\d]/g, "");
}

function whatsappHref(phone) {
  const digits = cleanPhone(phone);

  if (!digits) return "";

  if (digits.startsWith("593")) return `https://wa.me/${digits}`;
  if (digits.startsWith("09")) return `https://wa.me/593${digits.slice(1)}`;
  if (digits.startsWith("9") && digits.length === 9) return `https://wa.me/593${digits}`;

  return `https://wa.me/${digits}`;
}

function safeText(v, fallback = "-") {
  const s = String(v ?? "").trim();
  if (!s || s === "—" || s.toLowerCase() === "nan") return fallback;
  return s;
}

function scoreText(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "-";
  return String(Math.round(n));
}

function kpiNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function getToneClass(tone) {
  if (tone === "green") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-100";
  }

  if (tone === "blue") {
    return "border-blue-400/20 bg-blue-400/10 text-blue-100";
  }

  if (tone === "amber") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-100";
  }

  if (tone === "red") {
    return "border-rose-400/20 bg-rose-400/10 text-rose-100";
  }

  return "border-white/10 bg-white/5 text-slate-100";
}

function StatusPill({ children, tone = "neutral" }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold whitespace-nowrap",
        getToneClass(tone),
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function KpiCard({ label, value, hint, tone = "neutral", footer }) {
  return (
    <div
      className={[
        "rounded-2xl border p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)]",
        getToneClass(tone),
      ].join(" ")}
    >
      <div className="text-xs font-semibold uppercase tracking-[0.12em] opacity-80">
        {label}
      </div>

      <div className="mt-2 text-3xl font-black tracking-[-0.04em]">
        {value}
      </div>

      {hint ? (
        <div className="mt-2 text-sm opacity-80 leading-5">{hint}</div>
      ) : null}

      {footer ? <div className="mt-3 text-xs opacity-75">{footer}</div> : null}
    </div>
  );
}

function MiniBreakdown({ title, items }) {
  const visibleItems = (items || []).filter((x) => x && x.label);

  if (!visibleItems.length) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
        {title}
      </div>

      <div className="mt-3 grid gap-2">
        {visibleItems.slice(0, 8).map((item, idx) => (
          <div
            key={`${item.label}-${idx}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/10 px-3 py-2"
          >
            <div className="min-w-0 truncate text-sm text-slate-200">
              {item.label}
            </div>
            <div className="text-sm font-black text-slate-50">
              {Number(item.count || 0).toLocaleString("es-EC")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function normalizeBreakdown(arr) {
  if (!Array.isArray(arr)) return [];

  return arr
    .map((x) => ({
      label: safeText(x?._id, "Sin dato"),
      count: Number(x?.count || 0),
    }))
    .filter((x) => x.count > 0);
}

const DEFAULT_KPIS = {
  totalUsers: 0,
  conLogin: 0,
  conSnapshot: 0,
  conLead: 0,

  conEmailValido: 0,
  conTelefonoValido: 0,
  contactables: 0,
  accionables: 0,

  conIngreso: 0,
  conCiudad: 0,
  sinIngreso: 0,
  sinCiudad: 0,

  precalificados: 0,
  sinOferta: 0,

  scoreAlto: 0,
  scoreMedio: 0,
  scoreBajo: 0,

  llamarHoy: 0,
  decisionBancable: 0,
  decisionRescatable: 0,
  decisionDescartable: 0,

  byProduct: [],
  byCity: [],
  byDecision: [],
};

export default function AdminUsers() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpis, setKpis] = useState(DEFAULT_KPIS);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [soloJourney, setSoloJourney] = useState(false);

  const [scoreMin, setScoreMin] = useState("");
  const [scoreMax, setScoreMax] = useState("");
  const [ingresoMin, setIngresoMin] = useState("");
  const [ingresoMax, setIngresoMax] = useState("");

  const [sinOferta, setSinOferta] = useState("");
  const [hasPhone, setHasPhone] = useState("");
  const [hasEmail, setHasEmail] = useState("");
  const [hasSnapshot, setHasSnapshot] = useState("");
  const [contactable, setContactable] = useState("");
  const [accionable, setAccionable] = useState("");
  const [llamarHoy, setLlamarHoy] = useState("");

  const [decisionEstado, setDecisionEstado] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [producto, setProducto] = useState("");
  const [banco, setBanco] = useState("");
  const [sort, setSort] = useState("activity_desc");

  const [page, setPage] = useState(1);
  const limit = 20;

  const token = useMemo(() => getAdminToken(), []);

  const headers = useMemo(() => {
    const t = getAdminToken();

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${t}`,
    };
  }, []);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();

    p.set("page", String(page));
    p.set("limit", String(limit));
    p.set("sort", sort);

    if (q.trim()) p.set("q", q.trim());
    if (soloJourney) p.set("soloJourney", "true");

    if (String(scoreMin).trim()) p.set("scoreMin", String(scoreMin).trim());
    if (String(scoreMax).trim()) p.set("scoreMax", String(scoreMax).trim());

    if (String(ingresoMin).trim()) {
      p.set("ingresoMin", String(ingresoMin).trim());
    }

    if (String(ingresoMax).trim()) {
      p.set("ingresoMax", String(ingresoMax).trim());
    }

    if (sinOferta === "true" || sinOferta === "false") {
      p.set("sinOferta", sinOferta);
    }

    if (hasPhone === "true" || hasPhone === "false") {
      p.set("hasPhone", hasPhone);
    }

    if (hasEmail === "true" || hasEmail === "false") {
      p.set("hasEmail", hasEmail);
    }

    if (hasSnapshot === "true" || hasSnapshot === "false") {
      p.set("hasSnapshot", hasSnapshot);
    }

    if (contactable === "true") p.set("contactable", "true");
    if (accionable === "true") p.set("accionable", "true");
    if (llamarHoy === "true") p.set("llamarHoy", "true");

    if (decisionEstado.trim()) p.set("decisionEstado", decisionEstado.trim());
    if (ciudad.trim()) p.set("ciudad", ciudad.trim());
    if (producto.trim()) p.set("producto", producto.trim());
    if (banco.trim()) p.set("banco", banco.trim());

    return p.toString();
  }, [
    page,
    limit,
    sort,
    q,
    soloJourney,
    scoreMin,
    scoreMax,
    ingresoMin,
    ingresoMax,
    sinOferta,
    hasPhone,
    hasEmail,
    hasSnapshot,
    contactable,
    accionable,
    llamarHoy,
    decisionEstado,
    ciudad,
    producto,
    banco,
  ]);

  function resetFilters() {
    setPage(1);
    setQ("");
    setSoloJourney(false);
    setScoreMin("");
    setScoreMax("");
    setIngresoMin("");
    setIngresoMax("");
    setSinOferta("");
    setHasPhone("");
    setHasEmail("");
    setHasSnapshot("");
    setContactable("");
    setAccionable("");
    setLlamarHoy("");
    setDecisionEstado("");
    setCiudad("");
    setProducto("");
    setBanco("");
    setSort("activity_desc");
  }

  async function loadKpis() {
    setKpiLoading(true);
    setErr("");

    try {
      const r = await fetch(`${API_BASE}/api/admin/users/kpis?${queryString}`, {
        headers,
      });

      if (r.status === 401) {
        setErr("Token admin inválido o expirado");
        return;
      }

      const j = await r.json().catch(() => ({}));

      if (!r.ok || !j?.ok) {
        setErr(j?.message || "No se pudo cargar KPIs");
        return;
      }

      setKpis({
        ...DEFAULT_KPIS,
        ...j,
        totalUsers: Number(j.totalUsers || 0),
        conLogin: Number(j.conLogin || 0),
        conSnapshot: Number(j.conSnapshot || 0),
        conLead: Number(j.conLead || 0),

        conEmailValido: Number(j.conEmailValido || 0),
        conTelefonoValido: Number(j.conTelefonoValido || 0),
        contactables: Number(j.contactables || 0),
        accionables: Number(j.accionables || 0),

        conIngreso: Number(j.conIngreso || 0),
        conCiudad: Number(j.conCiudad || 0),
        sinIngreso: Number(j.sinIngreso || 0),
        sinCiudad: Number(j.sinCiudad || 0),

        precalificados: Number(j.precalificados || 0),
        sinOferta: Number(j.sinOferta || 0),

        scoreAlto: Number(j.scoreAlto || 0),
        scoreMedio: Number(j.scoreMedio || 0),
        scoreBajo: Number(j.scoreBajo || 0),

        llamarHoy: Number(j.llamarHoy || 0),
        decisionBancable: Number(j.decisionBancable || 0),
        decisionRescatable: Number(j.decisionRescatable || 0),
        decisionDescartable: Number(j.decisionDescartable || 0),

        byProduct: Array.isArray(j.byProduct) ? j.byProduct : [],
        byCity: Array.isArray(j.byCity) ? j.byCity : [],
        byDecision: Array.isArray(j.byDecision) ? j.byDecision : [],
      });
    } catch {
      setErr("Error de red al cargar KPIs");
    } finally {
      setKpiLoading(false);
    }
  }

  async function loadList() {
    setLoading(true);
    setErr("");

    try {
      const r = await fetch(`${API_BASE}/api/admin/users?${queryString}`, {
        headers,
      });

      if (r.status === 401) {
        setErr("Token admin inválido o expirado");
        setItems([]);
        setCount(0);
        return;
      }

      const j = await r.json().catch(() => ({}));

      if (!r.ok || !j?.ok) {
        setErr(j?.message || "No se pudo cargar usuarios");
        setItems([]);
        setCount(0);
        return;
      }

      setItems(Array.isArray(j.items) ? j.items : []);
      setCount(Number(j.count || 0));
    } catch {
      setErr("Error de red al cargar usuarios");
      setItems([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      nav("/admin?next=%2Fadmin%2Fusers", { replace: true });
      return;
    }

    loadKpis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!token) return;

    loadList();
    loadKpis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  const onExportCSV = async () => {
    setErr("");

    try {
      const r = await fetch(
        `${API_BASE}/api/admin/users/export/csv?${queryString}`,
        {
          headers: { Authorization: `Bearer ${getAdminToken()}` },
        }
      );

      if (r.status === 401) {
        setErr("Token admin inválido o expirado");
        return;
      }

      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setErr(j?.message || "No se pudo exportar CSV");
        return;
      }

      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `hl-users-${Date.now()}.csv`;
      a.click();

      URL.revokeObjectURL(url);
    } catch {
      setErr("Error de red exportando CSV");
    }
  };

  const tokenInvalid = err.toLowerCase().includes("token admin");

  const totals = {
    totalUsers: kpiNumber(kpis.totalUsers),
    conLogin: kpiNumber(kpis.conLogin),
    conSnapshot: kpiNumber(kpis.conSnapshot),
    conLead: kpiNumber(kpis.conLead),
    conEmailValido: kpiNumber(kpis.conEmailValido),
    conTelefonoValido: kpiNumber(kpis.conTelefonoValido),
    contactables: kpiNumber(kpis.contactables),
    accionables: kpiNumber(kpis.accionables),
    precalificados: kpiNumber(kpis.precalificados),
    sinOferta: kpiNumber(kpis.sinOferta),
    scoreAlto: kpiNumber(kpis.scoreAlto),
    llamarHoy: kpiNumber(kpis.llamarHoy),
  };

  const byProduct = useMemo(() => normalizeBreakdown(kpis.byProduct), [kpis]);
  const byCity = useMemo(() => normalizeBreakdown(kpis.byCity), [kpis]);
  const byDecision = useMemo(() => normalizeBreakdown(kpis.byDecision), [kpis]);

  const viewItems = useMemo(() => {
    return (items || []).map((u) => {
      const score = numSafe(u.scoreHL);
      const ingreso = numSafe(u.ingreso);
      const deudas = numSafe(u.deudas);
      const cuota = numSafe(u.cuotaEstimada);
      const entrada = numSafe(u.entrada);
      const valorVivienda = numSafe(u.valorVivienda);

      return {
        ...u,
        _score: score,
        _ingreso: ingreso,
        _deudas: deudas,
        _cuota: cuota,
        _entrada: entrada,
        _valorVivienda: valorVivienda,
        _email: safeText(u.email),
        _telefono: safeText(u.telefono),
        _nombre: safeText(`${u.nombre || ""} ${u.apellido || ""}`.trim()),
        _ciudad: safeText(u.ciudad),
        _producto: safeText(u.producto),
        _banco: safeText(u.banco),
        _etapa: safeText(u.etapa),
        _decisionEstado: safeText(u.decisionEstado),
        _lastActivity: u.lastActivity || u.snapshotAt || u.lastLogin || null,
      };
    });
  }, [items]);

  return (
    <main className="min-h-screen bg-[#050816] text-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-100">
              Control Tower · HabitaLibre
            </div>

            <h1 className="mt-3 text-3xl font-black tracking-[-0.04em]">
              Dashboard de Usuarios
            </h1>

            <p className="text-slate-300 mt-2 max-w-3xl leading-6">
              Vista interna para medir base, contactabilidad, calidad de datos y
              oportunidades reales de conversión hipotecaria.
            </p>

            <div className="text-xs text-slate-500 mt-2">
              Endpoints: /api/admin/users · /api/admin/users/kpis ·
              /api/admin/users/export/csv
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={onExportCSV}
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 font-semibold"
            >
              Exportar CSV
            </button>

            <button
              onClick={() => {
                loadList();
                loadKpis();
              }}
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 font-semibold"
            >
              Refrescar
            </button>

            <button
              onClick={() => logoutHard(nav)}
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 font-semibold"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Usuarios totales"
            value={kpiLoading ? "…" : totals.totalUsers.toLocaleString("es-EC")}
            hint="Cuentas creadas en la plataforma."
            footer={`${pct(totals.conLogin, totals.totalUsers)} con login registrado`}
            tone="neutral"
          />

          <KpiCard
            label="Contactables"
            value={kpiLoading ? "…" : totals.contactables.toLocaleString("es-EC")}
            hint="Tienen email válido o teléfono válido."
            footer={`${pct(totals.contactables, totals.totalUsers)} de la base total`}
            tone="blue"
          />

          <KpiCard
            label="Accionables"
            value={kpiLoading ? "…" : totals.accionables.toLocaleString("es-EC")}
            hint="Teléfono + ingreso + resultado/precalificación."
            footer="Base prioritaria para gestión comercial"
            tone="green"
          />

          <KpiCard
            label="Llamar hoy"
            value={kpiLoading ? "…" : totals.llamarHoy.toLocaleString("es-EC")}
            hint="Marcados por decisión comercial."
            footer="Prioridad operativa diaria"
            tone="amber"
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Email válido"
            value={
              kpiLoading
                ? "…"
                : totals.conEmailValido.toLocaleString("es-EC")
            }
            hint="Usuarios con email usable."
            footer={`${pct(totals.conEmailValido, totals.totalUsers)} del total`}
          />

          <KpiCard
            label="Teléfono válido"
            value={
              kpiLoading
                ? "…"
                : totals.conTelefonoValido.toLocaleString("es-EC")
            }
            hint="Usuarios con teléfono tipo Ecuador."
            footer={`${pct(totals.conTelefonoValido, totals.totalUsers)} del total`}
          />

          <KpiCard
            label="Con evaluación"
            value={
              kpiLoading
                ? "…"
                : totals.conSnapshot.toLocaleString("es-EC")
            }
            hint="Tienen snapshot financiero guardado."
            footer={`${totals.conLead.toLocaleString("es-EC")} con lead asociado`}
          />

          <KpiCard
            label="Sin oferta"
            value={kpiLoading ? "…" : totals.sinOferta.toLocaleString("es-EC")}
            hint="Usuarios que el motor marcó sin oferta."
            footer="Requieren nurturing o recalibración"
            tone="red"
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Precalificados"
            value={
              kpiLoading
                ? "…"
                : totals.precalificados.toLocaleString("es-EC")
            }
            hint="Tienen resultado/precalificación."
            footer={`${pct(totals.precalificados, totals.totalUsers)} del total`}
            tone="green"
          />

          <KpiCard
            label="Score alto"
            value={kpiLoading ? "…" : totals.scoreAlto.toLocaleString("es-EC")}
            hint="Score HL mayor o igual a 75."
            footer="Prospectos de mayor prioridad"
            tone="green"
          />

          <KpiCard
            label="Bancables"
            value={
              kpiLoading
                ? "…"
                : kpiNumber(kpis.decisionBancable).toLocaleString("es-EC")
            }
            hint="Decision estado: bancable."
            footer="Potencial banco/promotor"
            tone="blue"
          />

          <KpiCard
            label="Rescatables"
            value={
              kpiLoading
                ? "…"
                : kpiNumber(kpis.decisionRescatable).toLocaleString("es-EC")
            }
            hint="Decision estado: rescatable."
            footer="Necesitan guía o mejora"
            tone="amber"
          />
        </div>

        {/* Breakdowns */}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <MiniBreakdown title="Por producto" items={byProduct} />
          <MiniBreakdown title="Por ciudad" items={byCity} />
          <MiniBreakdown title="Por decisión" items={byDecision} />
        </div>

        {/* filtros */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-sm font-black text-slate-100">Filtros</div>
              <div className="text-xs text-slate-400 mt-1">
                Úsalos para encontrar usuarios contactables, accionables o con
                mayor potencial.
              </div>
            </div>

            <button
              onClick={resetFilters}
              className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-semibold"
            >
              Limpiar filtros
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-12">
            <div className="md:col-span-4">
              <div className="text-xs text-slate-300 mb-1">Buscar</div>
              <input
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
                placeholder="Email, nombre, teléfono, ciudad, producto..."
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-slate-300 mb-1">Score min</div>
              <input
                value={scoreMin}
                onChange={(e) => {
                  setPage(1);
                  setScoreMin(e.target.value);
                }}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-slate-300 mb-1">Score max</div>
              <input
                value={scoreMax}
                onChange={(e) => {
                  setPage(1);
                  setScoreMax(e.target.value);
                }}
                placeholder="100"
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-slate-300 mb-1">Ingreso min</div>
              <input
                value={ingresoMin}
                onChange={(e) => {
                  setPage(1);
                  setIngresoMin(e.target.value);
                }}
                placeholder="500"
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-slate-300 mb-1">Ingreso max</div>
              <input
                value={ingresoMax}
                onChange={(e) => {
                  setPage(1);
                  setIngresoMax(e.target.value);
                }}
                placeholder="3000"
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-slate-300 mb-1">Teléfono</div>
              <select
                value={hasPhone}
                onChange={(e) => {
                  setPage(1);
                  setHasPhone(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
              >
                <option value="">Todos</option>
                <option value="true">Con teléfono válido</option>
                <option value="false">Sin teléfono válido</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-slate-300 mb-1">Email</div>
              <select
                value={hasEmail}
                onChange={(e) => {
                  setPage(1);
                  setHasEmail(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
              >
                <option value="">Todos</option>
                <option value="true">Con email válido</option>
                <option value="false">Sin email válido</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-slate-300 mb-1">Snapshot</div>
              <select
                value={hasSnapshot}
                onChange={(e) => {
                  setPage(1);
                  setHasSnapshot(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
              >
                <option value="">Todos</option>
                <option value="true">Con snapshot</option>
                <option value="false">Sin snapshot</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-slate-300 mb-1">Sin oferta</div>
              <select
                value={sinOferta}
                onChange={(e) => {
                  setPage(1);
                  setSinOferta(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
              >
                <option value="">Todos</option>
                <option value="true">Solo sin oferta</option>
                <option value="false">Solo con oferta</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-slate-300 mb-1">Decisión</div>
              <select
                value={decisionEstado}
                onChange={(e) => {
                  setPage(1);
                  setDecisionEstado(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
              >
                <option value="">Todas</option>
                <option value="bancable">Bancable</option>
                <option value="rescatable">Rescatable</option>
                <option value="descartable">Descartable</option>
                <option value="por_calificar">Por calificar</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-slate-300 mb-1">Ciudad</div>
              <input
                value={ciudad}
                onChange={(e) => {
                  setPage(1);
                  setCiudad(e.target.value);
                }}
                placeholder="Quito..."
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-slate-300 mb-1">Producto</div>
              <input
                value={producto}
                onChange={(e) => {
                  setPage(1);
                  setProducto(e.target.value);
                }}
                placeholder="VIS, VIP, BIESS..."
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-slate-300 mb-1">Banco</div>
              <input
                value={banco}
                onChange={(e) => {
                  setPage(1);
                  setBanco(e.target.value);
                }}
                placeholder="BIESS, Pacífico..."
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-slate-300 mb-1">Ordenar</div>
              <select
                value={sort}
                onChange={(e) => {
                  setPage(1);
                  setSort(e.target.value);
                }}
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
              >
                <option value="activity_desc">Actividad reciente</option>
                <option value="createdAt_desc">Más nuevos</option>
                <option value="createdAt_asc">Más antiguos</option>
                <option value="score_desc">Score alto</option>
                <option value="score_asc">Score bajo</option>
                <option value="ingreso_desc">Ingreso alto</option>
                <option value="ingreso_asc">Ingreso bajo</option>
                <option value="heat_desc">Heat alto</option>
              </select>
            </div>

            <div className="md:col-span-12 flex flex-wrap items-center gap-4 pt-2">
              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={soloJourney}
                  onChange={(e) => {
                    setPage(1);
                    setSoloJourney(e.target.checked);
                  }}
                />
                Solo journey
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={contactable === "true"}
                  onChange={(e) => {
                    setPage(1);
                    setContactable(e.target.checked ? "true" : "");
                  }}
                />
                Solo contactables
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={accionable === "true"}
                  onChange={(e) => {
                    setPage(1);
                    setAccionable(e.target.checked ? "true" : "");
                  }}
                />
                Solo accionables
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={llamarHoy === "true"}
                  onChange={(e) => {
                    setPage(1);
                    setLlamarHoy(e.target.checked ? "true" : "");
                  }}
                />
                Llamar hoy
              </label>
            </div>
          </div>
        </div>

        {/* tabla */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
          <div className="flex items-center justify-between gap-3 flex-wrap border-b border-white/10 px-4 py-3">
            <div>
              <div className="font-black text-slate-100">
                Usuarios encontrados
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {loading ? "Cargando…" : `${count.toLocaleString("es-EC")} resultados`}
              </div>
            </div>

            <div className="text-xs text-slate-400">
              Página {page} · {limit} por página
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1800px] w-full text-sm">
              <thead className="bg-white/5 text-slate-200">
                <tr>
                  <th className="text-left p-3">Última actividad</th>
                  <th className="text-left p-3">Contacto</th>
                  <th className="text-left p-3">Nombre</th>
                  <th className="text-left p-3">Ciudad</th>
                  <th className="text-left p-3">Estado</th>
                  <th className="text-right p-3">Ingreso</th>
                  <th className="text-right p-3">Deudas</th>
                  <th className="text-right p-3">Entrada</th>
                  <th className="text-right p-3">Vivienda</th>
                  <th className="text-left p-3">Producto</th>
                  <th className="text-left p-3">Banco</th>
                  <th className="text-right p-3">Score HL</th>
                  <th className="text-right p-3">Cuota</th>
                  <th className="text-left p-3">Decisión</th>
                  <th className="text-left p-3">Acciones</th>
                </tr>
              </thead>

              <tbody className="text-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={15} className="p-6 text-center text-slate-300">
                      Cargando usuarios…
                    </td>
                  </tr>
                ) : viewItems.length ? (
                  viewItems.map((u) => {
                    const wa = whatsappHref(u.telefonoWhatsapp || u.telefono);
                    const emailOk = u.emailValido && u._email !== "-";
                    const phoneOk = u.telefonoValido && u._telefono !== "-";

                    return (
                      <tr key={u.userId} className="border-t border-white/5 hover:bg-white/[0.03]">
                        <td className="p-3 text-slate-300">
                          {fmtDate(u._lastActivity)}
                        </td>

                        <td className="p-3">
                          <div className="grid gap-1">
                            {emailOk ? (
                              <a
                                className="underline underline-offset-2 hover:opacity-80 text-slate-100"
                                href={`mailto:${u._email}`}
                              >
                                {u._email}
                              </a>
                            ) : (
                              <span className="text-slate-500">{u._email}</span>
                            )}

                            {phoneOk ? (
                              <a
                                className="underline underline-offset-2 hover:opacity-80 text-emerald-200"
                                href={`tel:${u._telefono}`}
                              >
                                {u._telefono}
                              </a>
                            ) : (
                              <span className="text-slate-500">{u._telefono}</span>
                            )}
                          </div>
                        </td>

                        <td className="p-3">{u._nombre}</td>
                        <td className="p-3">{u._ciudad}</td>

                        <td className="p-3">
                          <div className="flex flex-wrap gap-1.5">
                            {u.contactable ? (
                              <StatusPill tone="blue">Contactable</StatusPill>
                            ) : (
                              <StatusPill>Sin contacto</StatusPill>
                            )}

                            {u.accionable ? (
                              <StatusPill tone="green">Accionable</StatusPill>
                            ) : null}

                            {u.sinOferta === true ? (
                              <StatusPill tone="red">Sin oferta</StatusPill>
                            ) : null}

                            {u.llamarHoy ? (
                              <StatusPill tone="amber">Llamar hoy</StatusPill>
                            ) : null}

                            {u.hasSnapshot ? (
                              <StatusPill>Snapshot</StatusPill>
                            ) : null}
                          </div>
                        </td>

                        <td className="p-3 text-right">
                          {u._ingreso != null ? money(u._ingreso) : "-"}
                        </td>

                        <td className="p-3 text-right">
                          {u._deudas != null ? money(u._deudas) : "-"}
                        </td>

                        <td className="p-3 text-right">
                          {u._entrada != null ? money(u._entrada) : "-"}
                        </td>

                        <td className="p-3 text-right">
                          {u._valorVivienda != null ? money(u._valorVivienda) : "-"}
                        </td>

                        <td className="p-3">{u._producto}</td>
                        <td className="p-3">{u._banco}</td>

                        <td className="p-3 text-right">
                          {scoreText(u._score)}
                        </td>

                        <td className="p-3 text-right">
                          {u._cuota != null ? money(u._cuota) : "-"}
                        </td>

                        <td className="p-3">
                          <div className="grid gap-1">
                            <span>{u._decisionEstado}</span>
                            {u.decisionHeat != null ? (
                              <span className="text-xs text-slate-400">
                                Heat: {intSafe(u.decisionHeat)}
                              </span>
                            ) : null}
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            {wa ? (
                              <a
                                href={wa}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-100 hover:bg-emerald-400/15"
                              >
                                WhatsApp
                              </a>
                            ) : null}

                            {emailOk ? (
                              <a
                                href={`mailto:${u._email}`}
                                className="rounded-xl border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-bold text-blue-100 hover:bg-blue-400/15"
                              >
                                Email
                              </a>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={15} className="p-6 text-center text-slate-300">
                      No hay resultados con estos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between p-4 border-t border-white/10">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40"
            >
              ← Anterior
            </button>

            <div className="text-sm text-slate-300">
              Página {page} •{" "}
              {loading ? "…" : count.toLocaleString("es-EC")} resultados
            </div>

            <button
              disabled={viewItems.length < limit}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40"
            >
              Siguiente →
            </button>
          </div>
        </div>

        {err ? (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {err}

            {tokenInvalid ? (
              <div className="mt-2">
                <button
                  onClick={() => logoutHard(nav)}
                  className="px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/15"
                >
                  Volver a login admin
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </main>
  );
}