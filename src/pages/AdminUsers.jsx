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

export default function AdminUsers() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [kpiLoading, setKpiLoading] = useState(true);

  const [totalUsers, setTotalUsers] = useState(0);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);

  // filtros
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("precalificado");
  const [producto, setProducto] = useState("VIP, VIS, BIESS");
  const [ciudad, setCiudad] = useState("Quito, Gye...");
  const [horizonte, setHorizonte] = useState("0–6, 6–12...");
  const [soloJourney, setSoloJourney] = useState(false);

  // paginación
  const [page, setPage] = useState(1);
  const limit = 20;

  const [err, setErr] = useState("");

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
    if (q.trim()) p.set("q", q.trim());
    if (status.trim()) p.set("status", status.trim());
    if (producto.trim() && producto !== "VIP, VIS, BIESS") p.set("producto", producto.trim());
    if (ciudad.trim() && ciudad !== "Quito, Gye...") p.set("ciudad", ciudad.trim());
    if (horizonte.trim() && horizonte !== "0–6, 6–12...") p.set("horizonte", horizonte.trim());
    if (soloJourney) p.set("soloJourney", "true");
    return p.toString();
  }, [page, limit, q, status, producto, ciudad, horizonte, soloJourney]);

  async function loadKpis() {
    setKpiLoading(true);
    setErr("");
    try {
      const r = await fetch(`${API_BASE}/api/admin/users/kpis`, { headers });
      if (r.status === 401) {
        setErr("Token admin inválido o expirado");
        return;
      }
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j?.ok) {
        setErr(j?.message || "No se pudo cargar KPIs");
        return;
      }
      setTotalUsers(Number(j.totalUsers || 0));
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
      const r = await fetch(`${API_BASE}/api/admin/users?${queryString}`, { headers });
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
      setItems(j.items || []);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  const onExportCSV = async () => {
    setErr("");
    try {
      const r = await fetch(`${API_BASE}/api/admin/users/export/csv?${queryString}`, {
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      });

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

  return (
    <main className="min-h-screen bg-[#050816] text-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard de Usuarios</h1>
            <p className="text-slate-300 mt-1">Vista interna. Solo para uso del equipo HabitaLibre.</p>
            <div className="text-xs text-slate-400 mt-1">Endpoint: /api/admin/users</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onExportCSV}
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"
            >
              Exportar CSV
            </button>
            <button
              onClick={() => logoutHard(nav)}
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs font-medium text-slate-300">USUARIOS TOTALES</div>
            <div className="mt-2 text-3xl font-semibold">
              {kpiLoading ? "…" : totalUsers.toLocaleString("es-EC")}
            </div>
            <div className="mt-2 text-sm text-slate-300">Cuentas creadas (email único)</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs font-medium text-slate-300">USUARIOS EN LISTA</div>
            <div className="mt-2 text-3xl font-semibold">
              {loading ? "…" : count.toLocaleString("es-EC")}
            </div>
            <div className="mt-2 text-sm text-slate-300">Resultado según filtros actuales</div>
          </div>
        </div>

        {/* filtros */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="grid gap-3 md:grid-cols-6">
            <div className="md:col-span-2">
              <div className="text-xs text-slate-300 mb-1">Buscar</div>
              <input
                value={q}
                onChange={(e) => { setPage(1); setQ(e.target.value); }}
                placeholder="Email, nombre o teléfono"
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
              />
            </div>

            <div>
              <div className="text-xs text-slate-300 mb-1">Status</div>
              <input
                value={status}
                onChange={(e) => { setPage(1); setStatus(e.target.value); }}
                placeholder="precalificado..."
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
              />
            </div>

            <div>
              <div className="text-xs text-slate-300 mb-1">Producto</div>
              <input
                value={producto}
                onChange={(e) => { setPage(1); setProducto(e.target.value); }}
                placeholder="VIP, VIS, BIESS"
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
              />
            </div>

            <div>
              <div className="text-xs text-slate-300 mb-1">Ciudad</div>
              <input
                value={ciudad}
                onChange={(e) => { setPage(1); setCiudad(e.target.value); }}
                placeholder="Quito, Gye..."
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
              />
            </div>

            <div>
              <div className="text-xs text-slate-300 mb-1">Horizonte</div>
              <input
                value={horizonte}
                onChange={(e) => { setPage(1); setHorizonte(e.target.value); }}
                placeholder="0–6, 6–12..."
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
              />
            </div>

            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={soloJourney}
                  onChange={(e) => { setPage(1); setSoloJourney(e.target.checked); }}
                />
                Solo journey
              </label>
            </div>
          </div>
        </div>

        {/* tabla */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5 text-slate-200">
                <tr>
                  <th className="text-left p-3">Ciudad</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Nombre</th>
                  <th className="text-left p-3">Teléfono</th>
                  <th className="text-left p-3">Etapa</th>
                  <th className="text-left p-3">Producto</th>
                  <th className="text-right p-3">Cuota</th>
                  <th className="text-left p-3">Última actividad</th>
                </tr>
              </thead>

              <tbody className="text-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-300">
                      Cargando…
                    </td>
                  </tr>
                ) : items.length ? (
                  items.map((u) => (
                    <tr key={u.userId} className="border-t border-white/5">
                      <td className="p-3">{u.ciudad || "-"}</td>
                      <td className="p-3">{u.email || "-"}</td>
                      <td className="p-3">{`${u.nombre || ""} ${u.apellido || ""}`.trim() || "-"}</td>
                      <td className="p-3">{u.telefono || "-"}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/15 text-emerald-200 border border-emerald-500/20">
                          {u.etapa || "-"}
                        </span>
                      </td>
                      <td className="p-3">{u.producto || "-"}</td>
                      <td className="p-3 text-right">
                        {u.cuotaEstimada ? `$${Number(u.cuotaEstimada).toLocaleString("es-EC")}` : "-"}
                      </td>
                      <td className="p-3">{fmtDate(u.lastActivity)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-slate-300">
                      No hay resultados con estos filtros
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* paginación */}
          <div className="flex items-center justify-between p-4 border-t border-white/10">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40"
            >
              ← Anterior
            </button>

            <div className="text-sm text-slate-300">Página {page}</div>

            <button
              disabled={items.length < limit}
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
