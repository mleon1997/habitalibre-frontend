// src/pages/AdminUsers.jsx
import React, { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../lib/api";
import AdminLayoutShell from "../layouts/AdminLayoutShell.jsx";

const LIMIT = 20;

export default function AdminUsers() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [producto, setProducto] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [horizonte, setHorizonte] = useState("");
  const [soloJourney, setSoloJourney] = useState(true);

  const [page, setPage] = useState(1);

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

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/users/kpis`)
      .then((r) => r.json())
      .then((j) => {
        if (j?.ok) setTotalUsers(j.totalUsers || 0);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");

    fetch(`${API_BASE}/api/admin/users?${queryString}`)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (!j?.ok) throw new Error("fail");
        setItems(j.items || []);
      })
      .catch(() => {
        if (!alive) return;
        setItems([]);
        setErr("No se pudo cargar la lista de usuarios");
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [queryString]);

  function etapaBadge(etapa) {
    if (etapa === "califica") return "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/20";
    if (etapa === "en_camino") return "bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/20";
    return "bg-white/5 text-slate-200 ring-1 ring-white/10";
  }

  return (
    <AdminLayoutShell title="Dashboard de Usuarios">
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() =>
            window.open(`${API_BASE}/api/admin/users/export.csv?${queryString}`, "_blank", "noopener,noreferrer")
          }
          disabled={loading}
          className="rounded-xl bg-white/5 px-4 py-2 text-sm ring-1 ring-white/10 hover:bg-white/10 disabled:opacity-50"
        >
          Exportar CSV
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi title="USUARIOS TOTALES" value={totalUsers} />
        <Kpi title="USUARIOS EN LISTA" value={items.length} />
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-6">
        <Input label="Buscar" value={q} onChange={setQ} placeholder="Email, nombre o teléfono" />
        <Input label="Status" value={status} onChange={setStatus} placeholder="precalificado..." />
        <Input label="Producto" value={producto} onChange={setProducto} placeholder="VIP, VIS, BIESS" />
        <Input label="Ciudad" value={ciudad} onChange={setCiudad} placeholder="Quito, Gye..." />
        <Input label="Horizonte" value={horizonte} onChange={setHorizonte} placeholder="0-6, 6-12..." />
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={soloJourney}
              onChange={(e) => setSoloJourney(e.target.checked)}
            />
            Solo journey
          </label>
        </div>
      </div>

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
                <Td>{u.email}</Td>
                <Td>{`${u.nombre || ""} ${u.apellido || ""}`.trim() || "-"}</Td>
                <Td>{u.telefono || "-"}</Td>
                <Td>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${etapaBadge(u.etapa)}`}>
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

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="rounded-xl bg-white/5 px-3 py-2 text-sm ring-1 ring-white/10 hover:bg-white/10 disabled:opacity-40"
        >
          ← Anterior
        </button>

        <span className="text-sm text-slate-300">
          Página <strong className="text-white">{page}</strong>
        </span>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={items.length < LIMIT}
          className="rounded-xl bg-white/5 px-3 py-2 text-sm ring-1 ring-white/10 hover:bg-white/10 disabled:opacity-40"
        >
          Siguiente →
        </button>
      </div>

      {err ? (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {err}
        </div>
      ) : null}
    </AdminLayoutShell>
  );
}

/* UI */
function Kpi({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="text-xs font-medium text-slate-300">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-white">
        {Number(value || 0).toLocaleString("es-EC")}
      </div>
      <div className="mt-2 text-sm text-slate-300">Resultado según filtros actuales</div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs text-slate-300">{label}</label>
      <input
        className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-emerald-400/30"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
function Th({ children }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}
function Td({ children }) {
  return <td className="px-4 py-3 text-slate-100">{children}</td>;
}
