// src/pages/AdminUsers.jsx
import React, { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../lib/api";

const LIMIT = 20;

export default function AdminUsers() {
  // KPIs
  const [totalUsers, setTotalUsers] = useState(0);

  // Tabla
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Filtros
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [producto, setProducto] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [horizonte, setHorizonte] = useState("");
  const [soloJourney, setSoloJourney] = useState(true);

  // Paginación
  const [page, setPage] = useState(1);

  // Query string (reutilizable para fetch y CSV)
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

  // Load KPIs
  useEffect(() => {
    fetch(`${API_BASE}/api/admin/users/kpis`)
      .then((r) => r.json())
      .then((j) => {
        if (j?.ok) setTotalUsers(j.totalUsers || 0);
      })
      .catch(() => {});
  }, []);

  // Load users list
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");

    fetch(`${API_BASE}/api/admin/users?${queryString}`)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (!j?.ok) throw new Error(j?.message || "Error cargando usuarios");
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
    if (etapa === "califica")
      return "bg-emerald-100 text-emerald-700";
    if (etapa === "en_camino")
      return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-600";
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Dashboard de Usuarios</h1>
            <p className="text-slate-600 mt-1">
              Vista interna. Solo para uso del equipo HabitaLibre.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                window.open(
                  `${API_BASE}/api/admin/users/export.csv?${queryString}`,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              disabled={loading}
              className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              Exportar CSV
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi title="USUARIOS TOTALES" value={totalUsers} />
          <Kpi title="USUARIOS EN LISTA" value={items.length} />
        </div>

        {/* Filtros */}
        <div className="mt-6 grid gap-3 md:grid-cols-6">
          <Input label="Buscar" value={q} onChange={setQ} placeholder="Email, nombre o teléfono" />
          <Input label="Status" value={status} onChange={setStatus} placeholder="precalificado..." />
          <Input label="Producto" value={producto} onChange={setProducto} placeholder="VIP, VIS, BIESS" />
          <Input label="Ciudad" value={ciudad} onChange={setCiudad} placeholder="Quito, Gye..." />
          <Input label="Horizonte" value={horizonte} onChange={setHorizonte} placeholder="0-6, 6-12..." />
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={soloJourney}
                onChange={(e) => setSoloJourney(e.target.checked)}
              />
              Solo journey
            </label>
          </div>
        </div>

        {/* Tabla */}
        <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-600">
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
                  <td colSpan={7} className="p-6 text-center text-slate-500">
                    Cargando…
                  </td>
                </tr>
              )}

              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">
                    No hay resultados con estos filtros
                  </td>
                </tr>
              )}

              {items.map((u) => (
                <tr key={u.userId} className="border-t">
                  <Td>{u.email}</Td>
                  <Td>{u.nombre} {u.apellido}</Td>
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

        {/* Paginación */}
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-xl border px-3 py-2 text-sm disabled:opacity-40"
          >
            ← Anterior
          </button>

          <span className="text-sm text-slate-600">
            Página <strong>{page}</strong>
          </span>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={items.length < LIMIT}
            className="rounded-xl border px-3 py-2 text-sm disabled:opacity-40"
          >
            Siguiente →
          </button>
        </div>

        {err && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}
      </div>
    </main>
  );
}

/* ---------------- UI helpers ---------------- */

function Kpi({ title, value }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-xs font-medium text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-semibold">
        {value.toLocaleString("es-EC")}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs text-slate-500">{label}</label>
      <input
        className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
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

function Td({ children }) {
  return <td className="px-4 py-3">{children}</td>;
}
