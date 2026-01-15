// src/pages/AdminUsers.jsx
import React, { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../lib/api";

const LIMIT = 20;

function getAdminToken() {
  try {
    return localStorage.getItem("hl_admin_token") || "";
  } catch {
    return "";
  }
}

export default function AdminUsers() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [err, setErr] = useState("");

  // filtros
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [producto, setProducto] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [horizonte, setHorizonte] = useState("");
  const [soloJourney, setSoloJourney] = useState(false);

  // paginación
  const [page, setPage] = useState(1);

  const token = useMemo(() => getAdminToken(), []);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("limit", String(LIMIT));
    if (q) p.set("q", q);
    if (status) p.set("status", status);
    if (producto) p.set("producto", producto);
    if (ciudad) p.set("ciudad", ciudad);
    if (horizonte) p.set("horizonte", horizonte);
    if (soloJourney) p.set("soloJourney", "1");
    return p.toString();
  }, [page, q, status, producto, ciudad, horizonte, soloJourney]);

  // helper fetch con auth
  async function authedJson(url) {
    const r = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const j = await r.json().catch(() => ({}));
    return { r, j };
  }

  // KPIs
  useEffect(() => {
    (async () => {
      try {
        const { r, j } = await authedJson(`${API_BASE}/api/admin/users/kpis`);
        if (r.ok && j?.ok) setTotalUsers(Number(j.totalUsers || 0));
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lista
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const { r, j } = await authedJson(`${API_BASE}/api/admin/users?${queryString}`);
        if (!alive) return;
        if (!r.ok || !j?.ok) {
          setItems([]);
          setErr(j?.message || "No se pudo cargar la lista de usuarios");
          return;
        }
        setItems(j.items || []);
      } catch {
        if (!alive) return;
        setItems([]);
        setErr("Error de red al cargar usuarios");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  function etapaBadge(etapa) {
    if (etapa === "califica") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/20";
    if (etapa === "en_camino") return "bg-amber-500/15 text-amber-300 border-amber-500/20";
    return "bg-slate-500/15 text-slate-300 border-slate-500/20";
  }

  async function exportCSV() {
    try {
      setExporting(true);
      setErr("");

      const r = await fetch(`${API_BASE}/api/admin/users/export.csv?${queryString}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || "No se pudo exportar CSV");
      }

      const blob = await r.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `habitalibre-users-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (e) {
      setErr("Error exportando CSV (¿sesión admin válida?)");
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* fondo HL */}
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute top-24 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard de Usuarios</h1>
            <p className="text-slate-300 mt-1">
              Vista interna. Solo para uso del equipo HabitaLibre.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Endpoint: <span className="font-mono text-slate-300">/api/admin/users</span>
            </p>
          </div>

          <button
            onClick={exportCSV}
            disabled={loading || exporting}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10 disabled:opacity-50"
            title="Descargar CSV con filtros actuales"
          >
            {exporting ? "Exportando…" : "Exportar CSV"}
          </button>
        </div>

        {/* KPIs */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiDark title="USUARIOS TOTALES" value={totalUsers} subtitle="Cuentas creadas (email único)" />
          <KpiDark title="USUARIOS EN LISTA" value={items.length} subtitle="Resultado según filtros actuales" />
        </div>

        {/* Filtros */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="grid gap-3 md:grid-cols-6">
            <InputDark label="Buscar" value={q} onChange={setQ} placeholder="Email, nombre o teléfono" />
            <InputDark label="Status" value={status} onChange={setStatus} placeholder="precalificado…" />
            <InputDark label="Producto" value={producto} onChange={setProducto} placeholder="VIP, VIS, BIESS" />
            <InputDark label="Ciudad" value={ciudad} onChange={setCiudad} placeholder="Quito, Gye…" />
            <InputDark label="Horizonte" value={horizonte} onChange={setHorizonte} placeholder="0-6, 6-12…" />

            <div className="flex items-end">
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
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5">
              <tr className="text-left text-slate-300">
                <Th>Ciudad</Th>
                <Th>Email</Th>
                <Th>Nombre</Th>
                <Th>Teléfono</Th>
                <Th>Etapa</Th>
                <Th>Producto</Th>
                <Th>Cuota</Th>
                <Th>Última actividad</Th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-300">
                    Cargando…
                  </td>
                </tr>
              )}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-300">
                    No hay resultados con estos filtros
                  </td>
                </tr>
              )}

              {items.map((u) => (
                <tr key={u.userId} className="border-t border-white/10">
                  <Td>{u.ciudad || "-"}</Td>
                  <Td className="text-slate-100">{u.email}</Td>
                  <Td>{`${u.nombre || ""} ${u.apellido || ""}`.trim() || "-"}</Td>
                  <Td>{u.telefono || "-"}</Td>
                  <Td>
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${etapaBadge(u.etapa)}`}
                    >
                      {u.etapa}
                    </span>
                  </Td>
                  <Td>{u.producto || "-"}</Td>
                  <Td>{u.cuotaEstimada ? `$${u.cuotaEstimada}` : "-"}</Td>
                  <Td>{u.lastActivity ? new Date(u.lastActivity).toLocaleString() : "-"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
          >
            ← Anterior
          </button>

          <span className="text-sm text-slate-300">
            Página <strong className="text-slate-100">{page}</strong>
          </span>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={loading || items.length < LIMIT}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
            title={items.length < LIMIT ? "No hay más resultados en esta página" : "Siguiente"}
          >
            Siguiente →
          </button>
        </div>

        {err && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        )}
      </div>
    </main>
  );
}

/* UI helpers */
function KpiDark({ title, value, subtitle }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm">
      <div className="text-xs font-medium text-slate-400">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-100">
        {Number(value || 0).toLocaleString("es-EC")}
      </div>
      {subtitle ? <div className="mt-2 text-sm text-slate-300">{subtitle}</div> : null}
    </div>
  );
}

function InputDark({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs text-slate-400">{label}</label>
      <input
        className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-emerald-400/40"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        placeholder={placeholder}
      />
    </div>
  );
}

function Th({ children }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}
function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 text-slate-200 ${className}`}>{children}</td>;
}
