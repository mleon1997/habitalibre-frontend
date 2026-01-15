// src/pages/AdminUsers.jsx
import React, { useEffect, useState } from "react";
import { API_BASE } from "../lib/api";

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        const r = await fetch(`${API_BASE}/api/admin/users/kpis`);
        const j = await r.json();

        if (!alive) return;

        if (!r.ok || !j?.ok) {
          setErr(j?.message || "No se pudo cargar KPIs");
          setTotalUsers(0);
          return;
        }

        setTotalUsers(Number(j.totalUsers || 0));
      } catch (e) {
        if (!alive) return;
        setErr("Error de red al cargar KPIs");
        setTotalUsers(0);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold">Dashboard de Usuarios</h1>
        <p className="text-slate-600 mt-1">
          Vista interna. Solo para uso del equipo HabitaLibre.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-xs font-medium text-slate-500">USUARIOS TOTALES</div>
            <div className="mt-2 text-3xl font-semibold">
              {loading ? "…" : totalUsers.toLocaleString("es-EC")}
            </div>
            <div className="mt-2 text-sm text-slate-600">
              Cuentas creadas (email único)
            </div>
          </div>
        </div>

        {err ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        ) : null}
      </div>
    </main>
  );
}
