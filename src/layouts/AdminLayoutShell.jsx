// src/layouts/AdminLayoutShell.jsx
import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

const ADMIN_TOKEN_KEY = "hl_admin_token";
const ADMIN_EMAIL_KEY = "hl_admin_email";

export default function AdminLayoutShell({ title = "Admin", children }) {
  const nav = useNavigate();

  const email = useMemo(() => {
    try {
      return localStorage.getItem(ADMIN_EMAIL_KEY) || "";
    } catch {
      return "";
    }
  }, []);

  function logout() {
    try {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_EMAIL_KEY);
    } catch {}
    nav("/admin", { replace: true });
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/leads" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/30 grid place-items-center">
                <span className="text-emerald-300 font-bold">HL</span>
              </div>
              <div>
                <div className="text-sm font-semibold leading-4">HabitaLibre</div>
                <div className="text-xs text-slate-400">Admin</div>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-2 text-sm">
              <Link
                className="rounded-xl px-3 py-2 hover:bg-white/5"
                to="/admin/leads"
              >
                Leads
              </Link>
              <Link
                className="rounded-xl px-3 py-2 hover:bg-white/5"
                to="/admin/users"
              >
                Usuarios
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {email ? (
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-slate-200 ring-1 ring-white/10">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Sesión: {email}
              </div>
            ) : null}

            <button
              onClick={logout}
              className="rounded-xl bg-white/5 px-3 py-2 text-sm ring-1 ring-white/10 hover:bg-white/10"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="mb-5">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-slate-400">
            Vista interna. Solo para uso del equipo HabitaLibre.
          </p>
        </div>

        {children}
      </div>
    </main>
  );
}
