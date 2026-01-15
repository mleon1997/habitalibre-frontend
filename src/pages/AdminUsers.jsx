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

function clearAdminToken() {
  try {
    localStorage.removeItem(LS_ADMIN_TOKEN);
  } catch {}
}

function buildAuthHeaders() {
  const token = getAdminToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

export default function AdminUsers() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);

  const [totalUsers, setTotalUsers] = useState(0);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);

  const [err, setErr] = useState("");

  // filtros UI
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [producto, setProducto] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [horizonte, setHorizonte] = useState("");
  const [soloJourney, setSoloJourney] = useState(false);

  // paginación
  const [page, setPage] = useState(1);
  const limit = 20;

  const queryString = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("page", String(page));
    sp.set("limit", String(limit));
    if (q.trim()) sp.set("q", q.trim());
    if (status.trim()) sp.set("status", status.trim());
    if (producto.trim()) sp.set("producto", producto.trim());
    if (ciudad.trim()) sp.set("ciudad", ciudad.trim());
    if (horizonte.trim()) sp.set("horizonte", horizonte.trim());
    if (soloJourney) sp.set("soloJourney", "true");
    return sp.toString();
  }, [page, limit, q, status, producto, ciudad, horizonte, soloJourney]);

  async function handle401() {
    clearAdminToken();
    // manda al login admin (guardando next)
    const next = encodeURIComponent("/admin/users");
    nav(`/admin?next=${next}`, { replace: true });
  }

  async function loadKPIs() {
    const r = await fetch(`${API_BASE}/api/admin/users/kpis`, {
      headers: buildAuthHeaders(),
    });

    if (r.status === 401) {
      await handle401();
      return null;
    }

    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j?.ok) throw new Error(j?.message || "No se pudo cargar KPIs");
    return j;
  }

  async function loadList() {
    const r = await fetch(`${API_BASE}/api/admin/users?${queryString}`, {
      headers: buildAuthHeaders(),
    });

    if (r.status === 401) {
      await handle401();
      return null;
    }

    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j?.ok) throw new Error(j?.message || "No se pudo cargar lista");
    return j;
  }

  async function reloadAll() {
    setErr("");
    setLoading(true);
    setLoadingTable(true);

    try {
      const k = await loadKPIs();
      if (!k) return; // ya redirigió por 401
      setTotalUsers(Number(k.totalUsers || 0));

      const l = await loadList();
      if (!l) return;
      setItems(Array.isArray(l.items) ? l.items : []);
      setCount(Number(l.count || 0));
    } catch (e) {
      setErr(String(e?.message || "Error cargando datos"));
      setItems([]);
      setCount(0);
      setTotalUsers(0);
    } finally {
      setLoading(false);
      setLoadingTable(false);
    }
  }

  // primera carga
  useEffect(() => {
    reloadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // recarga cuando cambian filtros/página
  useEffect(() => {
    // evita doble fetch raro en primera carga
    // (si quieres, quítalo; no es obligatorio)
    reloadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  const onExportCSV = async () => {
    setErr("");
    try {
      const r = await fetch(`${API_BASE}/api/admin/users/export/csv?${queryString}`, {
        headers: buildAuthHeaders(),
      });

      if (r.status === 401) {
        await handle401();
        return;
      }

      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.message || "No se pudo exportar CSV");
      }

      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hl-users-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErr(String(e?.message || "Error exportando CSV"));
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard de Usuarios</h1>
            <p className="text-slate-300 mt-1">Vista interna. Solo para uso del equipo HabitaLibre.</p>
            <p className="text-xs text-slate-400 mt-1">Endpoint: /api/admin/users</p>
          </div>

          <button
            onClick={onExportCSV}
            className="px-4 py-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15"
          >
            Exportar CSV
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs font-medium text-slate-300">USUARIOS TOTALES</div>
            <div className="mt-2 text-3xl font-semibold">
              {loading ? "…" : totalUsers.toLocaleString("es-EC")}
            </div>
            <div className="mt-2 text-sm text-slate-300/80">Cuentas creadas (email único)</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs font-medium text-slate-300">USUARIOS EN LISTA</div>
            <div className="mt-2 text-3xl font-semibold">
              {loadingTable ? "…" : count.toLocaleString("es-EC")}
            </div>
            <div className="mt-2 text-sm text-slate-300/80">Resultado según filtros actuales</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="grid gap-3 md:grid-cols-6">
            <div className="md:col-span-2">
              <label className="text-xs text-slate-300">Buscar</label>
              <input
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
                placeholder="Email, nombre o teléfono"
                className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300">Status</label>
              <input
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
                placeholder="precalificado..."
                className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300">Producto</label>
              <input
                value={producto}
                onChange={(e) => {
                  setPage(1);
                  setProducto(e.target.value);
                }}
                placeholder="VIP, VIS, BIESS"
                className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300">Ciudad</label>
              <input
                value={ciudad}
                onChange={(e) => {
                  setPage(1);
                  setCiudad(e.target.value);
                }}
                placeholder="Quito, Gye..."
                className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300">Horizonte</label>
              <input
                value={horizonte}
                onChange={(e) => {
                  setPage(1);
                  setHorizonte(e.target.value);
                }}
                placeholder="0–6, 6–12..."
                className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 outline-none"
              />
            </div>

            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm text-slate-200 select-none">
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
        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5 text-slate-200">
              <tr>
                <th className="text-left p-3">Ciudad</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Nombre</th>
                <th className="text-left p-3">Teléfono</th>
                <th className="text-left p-3">Etapa</th>
                <th className="text-left p-3">Producto</th>
                <th className="text-left p-3">Cuota</th>
                <th className="text-left p-3">Última actividad</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.userId} className="border-t border-white/5">
                  <td className="p-3 text-slate-200">{u.ciudad || "-"}</td>
                  <td className="p-3 text-slate-200">{u.email || "-"}</td>
                  <td className="p-3 text-slate-200">
                    {(u.nombre || "-") + (u.apellido ? ` ${u.apellido}` : "")}
                  </td>
                  <td className="p-3 text-slate-200">{u.telefono || "-"}</td>

                  <td className="p-3">
                    <span className="px-2 py-1 rounded-full bg-white/10 text-slate-200">
                      {u.etapa || "-"}
                    </span>
                  </td>

                  <td className="p-3 text-slate-200">{u.producto || "-"}</td>
                  <td className="p-3 text-slate-200">
                    {u.cuotaEstimada ? `$${Number(u.cuotaEstimada).toLocaleString("es-EC")}` : "-"}
                  </td>
                  <td className="p-3 text-slate-200">
                    {u.lastActivity ? new Date(u.lastActivity).toLocaleString("es-EC") : "-"}
                  </td>
                </tr>
              ))}

              {!loadingTable && !items.length ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-300">
                    No hay resultados con estos filtros
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="mt-4 flex items-center justify-between">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 disabled:opacity-40"
          >
            ← Anterior
          </button>

          <div className="text-sm text-slate-300">Página {page}</div>

          <button
            disabled={items.length < limit}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 disabled:opacity-40"
          >
            Siguiente →
          </button>
        </div>

        {err ? (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        ) : null}
      </div>
    </main>
  );
}
