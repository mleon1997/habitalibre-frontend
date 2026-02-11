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

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const pickFirst = (...vals) => {
  for (const v of vals) {
    if (v === 0) return 0;
    if (v == null) continue;
    const n = toNum(v);
    if (n != null) return n;
    const s = String(v).trim();
    if (s) return v;
  }
  return null;
};

export default function AdminUsers() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [kpiLoading, setKpiLoading] = useState(true);

  const [kpis, setKpis] = useState({
    totalUsers: 0,
    conLogin: 0,
    conSnapshot: 0,
    sinOferta: 0,
  });

  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);

  // filtros (tipo quick win)
  const [q, setQ] = useState("");
  const [soloJourney, setSoloJourney] = useState(false);
  const [scoreMin, setScoreMin] = useState("");
  const [scoreMax, setScoreMax] = useState("");
  const [ingresoMin, setIngresoMin] = useState("");
  const [ingresoMax, setIngresoMax] = useState("");
  const [sinOferta, setSinOferta] = useState(""); // "", "true", "false"

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
    if (soloJourney) p.set("soloJourney", "true");

    if (String(scoreMin).trim()) p.set("scoreMin", String(scoreMin).trim());
    if (String(scoreMax).trim()) p.set("scoreMax", String(scoreMax).trim());

    if (String(ingresoMin).trim()) p.set("ingresoMin", String(ingresoMin).trim());
    if (String(ingresoMax).trim()) p.set("ingresoMax", String(ingresoMax).trim());

    if (sinOferta === "true" || sinOferta === "false") p.set("sinOferta", sinOferta);

    return p.toString();
  }, [page, limit, q, soloJourney, scoreMin, scoreMax, ingresoMin, ingresoMax, sinOferta]);

  // Para KPIs NO necesitas page/limit; pero no rompe.
  async function loadKpis() {
    setKpiLoading(true);
    setErr("");
    try {
      const r = await fetch(`${API_BASE}/api/admin/users/kpis?${queryString}`, { headers });
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
        totalUsers: Number(j.totalUsers || 0),
        conLogin: Number(j.conLogin || 0),
        conSnapshot: Number(j.conSnapshot || 0),
        sinOferta: Number(j.sinOferta || 0),
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
    loadKpis();
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

  // ✅ Normaliza campos “tipo quick win” aunque el backend los mande anidados
  const viewItems = useMemo(() => {
    return (items || []).map((u) => {
      const fin = u?.finanzas || u?.ultimoSnapshotHL?.input || null;
      const out = u?.resultado || u?.ultimoSnapshotHL?.output || null;

      const ingreso = pickFirst(
        u?.ingreso,
        fin?.ingresoNetoMensual,
        fin?.ingreso_mensual,
        fin?.ingresoMensual,
        fin?.ingresoPareja ? Number(fin?.ingresoNetoMensual || 0) + Number(fin?.ingresoPareja || 0) : null
      );

      const deudas = pickFirst(
        u?.deudas,
        fin?.otrasDeudasMensuales,
        fin?.deuda_mensual_aprox,
        fin?.deudaMensual,
        fin?.otrasDeudas
      );

      const scoreHL = pickFirst(
        u?.scoreHL,
        out?.scoreHL,
        out?.output?.scoreHL,
        u?.ultimoSnapshotHL?.output?.scoreHL
      );

      const banco = pickFirst(
        u?.banco,
        out?.bancoSugerido,
        out?.output?.bancoSugerido,
        u?.ultimoSnapshotHL?.output?.bancoSugerido
      );

      const producto = pickFirst(
        u?.producto,
        out?.productoSugerido,
        out?.output?.productoSugerido,
        u?.ultimoSnapshotHL?.output?.productoSugerido
      );

      const cuotaEstimada = pickFirst(
        u?.cuotaEstimada,
        out?.cuotaEstimada,
        out?.output?.cuotaEstimada,
        u?.ultimoSnapshotHL?.output?.cuotaEstimada
      );

      const snapshotAt = u?.snapshotAt || u?.ultimoSnapshotHL?.createdAt || null;

      return {
        ...u,
        _view_ingreso: ingreso,
        _view_deudas: deudas,
        _view_scoreHL: scoreHL,
        _view_banco: typeof banco === "string" ? banco : (banco ?? null),
        _view_producto: typeof producto === "string" ? producto : (producto ?? null),
        _view_cuota: cuotaEstimada,
        _view_snapshotAt: snapshotAt,
      };
    });
  }, [items]);

  return (
    <main className="min-h-screen bg-[#050816] text-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard de Usuarios (Customer Journey)</h1>
            <p className="text-slate-300 mt-1">
              Vista interna. Estilo Quick Win: muestra finanzas desde <span className="text-slate-200">snapshot</span> o desde datos anidados (<span className="text-slate-200">finanzas/resultado</span>).
            </p>
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

        {/* KPIs */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs font-medium text-slate-300">USUARIOS TOTALES</div>
            <div className="mt-2 text-3xl font-semibold">
              {kpiLoading ? "…" : kpis.totalUsers.toLocaleString("es-EC")}
            </div>
            <div className="mt-2 text-sm text-slate-300">Cuentas creadas</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs font-medium text-slate-300">CON LOGIN</div>
            <div className="mt-2 text-3xl font-semibold">
              {kpiLoading ? "…" : kpis.conLogin.toLocaleString("es-EC")}
            </div>
            <div className="mt-2 text-sm text-slate-300">lastLogin registrado</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs font-medium text-slate-300">CON SNAPSHOT</div>
            <div className="mt-2 text-3xl font-semibold">
              {kpiLoading ? "…" : kpis.conSnapshot.toLocaleString("es-EC")}
            </div>
            <div className="mt-2 text-sm text-slate-300">Tiene datos financieros</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs font-medium text-slate-300">SIN OFERTA</div>
            <div className="mt-2 text-3xl font-semibold">
              {kpiLoading ? "…" : kpis.sinOferta.toLocaleString("es-EC")}
            </div>
            <div className="mt-2 text-sm text-slate-300">Marcados sinOferta</div>
          </div>
        </div>

        {/* filtros */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="grid gap-3 md:grid-cols-12">
            <div className="md:col-span-4">
              <div className="text-xs text-slate-300 mb-1">Buscar</div>
              <input
                value={q}
                onChange={(e) => { setPage(1); setQ(e.target.value); }}
                placeholder="Email, nombre o teléfono"
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-slate-300 mb-1">Score min</div>
              <input
                value={scoreMin}
                onChange={(e) => { setPage(1); setScoreMin(e.target.value); }}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-slate-300 mb-1">Score max</div>
              <input
                value={scoreMax}
                onChange={(e) => { setPage(1); setScoreMax(e.target.value); }}
                placeholder="100"
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-slate-300 mb-1">Ingreso min</div>
              <input
                value={ingresoMin}
                onChange={(e) => { setPage(1); setIngresoMin(e.target.value); }}
                placeholder="500"
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-slate-300 mb-1">Ingreso max</div>
              <input
                value={ingresoMax}
                onChange={(e) => { setPage(1); setIngresoMax(e.target.value); }}
                placeholder="3000"
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
              />
            </div>

            <div className="md:col-span-3 flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={soloJourney}
                  onChange={(e) => { setPage(1); setSoloJourney(e.target.checked); }}
                />
                Solo journey
              </label>
            </div>

            <div className="md:col-span-3">
              <div className="text-xs text-slate-300 mb-1">Sin oferta</div>
              <select
                value={sinOferta}
                onChange={(e) => { setPage(1); setSinOferta(e.target.value); }}
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-white/10 outline-none"
              >
                <option value="">Todos</option>
                <option value="true">Solo sin oferta</option>
                <option value="false">Solo con oferta</option>
              </select>
            </div>
          </div>
        </div>

        {/* tabla tipo quick win */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-sm">
              <thead className="bg-white/5 text-slate-200">
                <tr>
                  <th className="text-left p-3">Fecha</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Nombre</th>
                  <th className="text-left p-3">Ciudad</th>
                  <th className="text-right p-3">Ingreso</th>
                  <th className="text-right p-3">Deudas</th>
                  <th className="text-left p-3">Producto</th>
                  <th className="text-left p-3">Banco</th>
                  <th className="text-right p-3">Score HL</th>
                  <th className="text-right p-3">Cuota</th>
                </tr>
              </thead>

              <tbody className="text-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="p-6 text-center text-slate-300">
                      Cargando…
                    </td>
                  </tr>
                ) : viewItems.length ? (
                  viewItems.map((u) => (
                    <tr key={u.userId} className="border-t border-white/5">
                      <td className="p-3">{fmtDate(u._view_snapshotAt || u.snapshotAt || u.lastActivity)}</td>
                      <td className="p-3">{u.email || "-"}</td>
                      <td className="p-3">{`${u.nombre || ""} ${u.apellido || ""}`.trim() || "-"}</td>
                      <td className="p-3">{u.ciudad || "-"}</td>

                      <td className="p-3 text-right">
                        {u._view_ingreso != null ? money(u._view_ingreso) : "-"}
                      </td>

                      <td className="p-3 text-right">
                        {u._view_deudas != null ? money(u._view_deudas) : "-"}
                      </td>

                      <td className="p-3">{u._view_producto || u.producto || "-"}</td>
                      <td className="p-3">{u._view_banco || u.banco || "-"}</td>

                      <td className="p-3 text-right">
                        {u._view_scoreHL != null ? String(Math.round(Number(u._view_scoreHL))) : "-"}
                      </td>

                      <td className="p-3 text-right">
                        {u._view_cuota != null ? money(u._view_cuota) : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="p-6 text-center text-slate-300">
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

            <div className="text-sm text-slate-300">
              Página {page} • {loading ? "…" : count.toLocaleString("es-EC")} resultados
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
