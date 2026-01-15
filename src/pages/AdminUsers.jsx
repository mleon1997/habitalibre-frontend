// src/pages/AdminUsers.jsx
import React, { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../lib/api";

function fmtDate(v) {
  if (!v) return "—";
  try {
    const d = new Date(v);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("es-EC", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function cleanPhone(v) {
  return String(v || "").replace(/[^\d]/g, "");
}

function badgeEtapa(etapa) {
  const e = String(etapa || "");
  if (e === "califica") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (e === "en_camino") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

function labelEtapa(etapa) {
  const e = String(etapa || "");
  if (e === "califica") return "✅ Califica";
  if (e === "en_camino") return "🟡 En camino";
  return "—";
}

export default function AdminUsers() {
  // KPI
  const [kpiLoading, setKpiLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);

  // Listado
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Filtros
  const [q, setQ] = useState("");
  const [soloJourney, setSoloJourney] = useState(true);
  const [status, setStatus] = useState("");
  const [producto, setProducto] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [horizonte, setHorizonte] = useState("");

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("limit", String(limit));
    if (q.trim()) p.set("q", q.trim());
    if (soloJourney) p.set("soloJourney", "1");
    if (status.trim()) p.set("status", status.trim());
    if (producto.trim()) p.set("producto", producto.trim());
    if (ciudad.trim()) p.set("ciudad", ciudad.trim());
    if (horizonte.trim()) p.set("horizonte", horizonte.trim());
    return p.toString();
  }, [page, limit, q, soloJourney, status, producto, ciudad, horizonte]);

  // Cargar KPI
  useEffect(() => {
    let alive = true;
    async function loadKpis() {
      try {
        setKpiLoading(true);
        const r = await fetch(`${API_BASE}/api/admin/users/kpis`);
        const j = await r.json();
        if (!alive) return;

        if (!r.ok || !j?.ok) {
          setTotalUsers(0);
          return;
        }
        setTotalUsers(Number(j.totalUsers || 0));
      } catch {
        if (!alive) return;
        setTotalUsers(0);
      } finally {
        if (!alive) return;
        setKpiLoading(false);
      }
    }

    loadKpis();
    return () => {
      alive = false;
    };
  }, []);

  // Cargar listado
  useEffect(() => {
    let alive = true;

    async function loadList() {
      try {
        setLoading(true);
        setErr("");

        const r = await fetch(`${API_BASE}/api/admin/users?${queryString}`);
        const j = await r.json();

        if (!alive) return;

        if (!r.ok || !j?.ok) {
          setErr(j?.message || "No se pudo cargar usuarios");
          setItems([]);
          return;
        }

        setItems(Array.isArray(j.items) ? j.items : []);
      } catch {
        if (!alive) return;
        setErr("Error de red al cargar usuarios");
        setItems([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    loadList();
    return () => {
      alive = false;
    };
  }, [queryString]);

  function applyFilters() {
    setPage(1);
  }

  function clearFilters() {
    setQ("");
    setSoloJourney(true);
    setStatus("");
    setProducto("");
    setCiudad("");
    setHorizonte("");
    setPage(1);
  }

  function exportCSV() {
    const url = `${API_BASE}/api/admin/users/export.csv?${queryString}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard de Usuarios</h1>
            <p className="text-slate-600 mt-1">
              Vista interna. Solo para uso del equipo HabitaLibre.
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Endpoint: <span className="font-mono">/api/admin/users</span>
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-xs font-medium text-slate-500">USUARIOS TOTALES</div>
            <div className="mt-2 text-3xl font-semibold">
              {kpiLoading ? "…" : totalUsers.toLocaleString("es-EC")}
            </div>
            <div className="mt-2 text-sm text-slate-600">Cuentas creadas (email único)</div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-xs font-medium text-slate-500">USUARIOS EN LISTA</div>
            <div className="mt-2 text-3xl font-semibold">
              {loading ? "…" : items.length.toLocaleString("es-EC")}
            </div>
            <div className="mt-2 text-sm text-slate-600">
              Resultado según filtros actuales
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <label className="text-xs font-medium text-slate-600">Buscar</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Email, nombre o teléfono…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyFilters();
                }}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="text-xs font-medium text-slate-600">Status</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="precalificado…"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyFilters();
                }}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="text-xs font-medium text-slate-600">Producto</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="VIP, VIS, BIESS…"
                value={producto}
                onChange={(e) => setProducto(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyFilters();
                }}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="text-xs font-medium text-slate-600">Ciudad</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Quito, Gye…"
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyFilters();
                }}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="text-xs font-medium text-slate-600">Horizonte</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="0-6, 3-12…"
                value={horizonte}
                onChange={(e) => setHorizonte(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyFilters();
                }}
              />
            </div>

            <div className="lg:col-span-1 flex items-end">
              <label className="flex items-center gap-2 text-sm text-slate-700 select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={soloJourney}
                  onChange={(e) => {
                    setSoloJourney(e.target.checked);
                    setPage(1);
                  }}
                />
                <span className="text-xs">Solo journey</span>
              </label>
            </div>

            <div className="lg:col-span-12 flex flex-wrap items-center gap-2 justify-end">
              <button
                onClick={clearFilters}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-slate-50"
              >
                Limpiar
              </button>
              <button
                onClick={applyFilters}
                className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {err ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        ) : null}

        {/* Tabla */}
        <div className="mt-6 rounded-2xl border bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div>
              <div className="text-sm font-semibold">Usuarios</div>
              <div className="text-xs text-slate-500">
                {loading ? "Cargando…" : `${items.length} resultados`}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
                onClick={exportCSV}
                disabled={loading}
                title="Descargar CSV con los filtros actuales"
              >
                Exportar CSV
              </button>

              <button
                className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1 || loading}
              >
                ←
              </button>
              <div className="text-sm text-slate-700">
                Página <span className="font-semibold">{page}</span>
              </div>
              <button
                className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
                onClick={() => setPage((p) => p + 1)}
                disabled={loading || items.length < limit}
                title={items.length < limit ? "No hay más resultados" : "Siguiente"}
              >
                →
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1250px] w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr className="text-left">
                  <th className="px-5 py-3 font-medium">Usuario</th>
                  <th className="px-5 py-3 font-medium">Contacto</th>
                  <th className="px-5 py-3 font-medium">Ciudad</th>
                  <th className="px-5 py-3 font-medium">Etapa</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Producto</th>
                  <th className="px-5 py-3 font-medium">Score</th>
                  <th className="px-5 py-3 font-medium">Horizonte</th>
                  <th className="px-5 py-3 font-medium">Última actividad</th>
                  <th className="px-5 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td className="px-5 py-6 text-slate-500" colSpan={10}>
                      Cargando usuarios…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td className="px-5 py-6 text-slate-500" colSpan={10}>
                      No hay usuarios con estos filtros.
                    </td>
                  </tr>
                ) : (
                  items.map((u) => {
                    const phone = cleanPhone(u.telefono);
                    const wa =
                      phone && phone.length >= 9
                        ? `https://wa.me/${
                            phone.startsWith("593")
                              ? phone
                              : `593${phone.replace(/^0+/, "")}`
                          }`
                        : null;

                    const mail = u.email ? `mailto:${u.email}` : null;

                    return (
                      <tr key={u.userId} className="hover:bg-slate-50/60">
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-900">
                            {(u.nombre || u.apellido)
                              ? `${u.nombre || ""} ${u.apellido || ""}`.trim()
                              : "—"}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">{u.userId}</div>
                          <div className="text-xs text-slate-600">{u.email || "—"}</div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-slate-900">{u.telefono || "—"}</div>
                          <div className="text-xs text-slate-500">
                            {u.hasJourney ? "Journey: sí" : "Journey: no"}
                          </div>
                        </td>

                        <td className="px-5 py-4">{u.ciudad || "—"}</td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${badgeEtapa(
                              u.etapa
                            )}`}
                          >
                            {labelEtapa(u.etapa)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700">
                            {u.status || "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {u.producto ? (
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-800">
                              {u.producto}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {u.scoreHL === null || u.scoreHL === undefined ? "—" : u.scoreHL}
                        </td>

                        <td className="px-5 py-4">{u.horizonte || "—"}</td>

                        <td className="px-5 py-4">{fmtDate(u.lastActivity)}</td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {wa ? (
                              <a
                                href={wa}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-xl border px-3 py-2 text-xs hover:bg-slate-50"
                                title="WhatsApp"
                              >
                                WhatsApp
                              </a>
                            ) : (
                              <button
                                className="rounded-xl border px-3 py-2 text-xs opacity-40 cursor-not-allowed"
                                title="Sin teléfono válido"
                                disabled
                              >
                                WhatsApp
                              </button>
                            )}

                            {mail ? (
                              <a
                                href={mail}
                                className="rounded-xl border px-3 py-2 text-xs hover:bg-slate-50"
                                title="Email"
                              >
                                Email
                              </a>
                            ) : (
                              <button
                                className="rounded-xl border px-3 py-2 text-xs opacity-40 cursor-not-allowed"
                                title="Sin email"
                                disabled
                              >
                                Email
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-4 border-t text-xs text-slate-500">
            Exporta CSV con los filtros actuales. Siguiente upgrade recomendado: perfil detalle{" "}
            <span className="font-mono">/api/admin/users/:id</span>.
          </div>
        </div>
      </div>
    </main>
  );
}
