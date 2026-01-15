// src/pages/Admin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
const LS_ADMIN_TOKEN = "hl_admin_token";

function getTokenSafe() {
  try {
    return localStorage.getItem(LS_ADMIN_TOKEN) || "";
  } catch {
    return "";
  }
}

function setTokenSafe(t) {
  try {
    localStorage.setItem(LS_ADMIN_TOKEN, t);
  } catch {}
}

function removeTokenSafe() {
  try {
    localStorage.removeItem(LS_ADMIN_TOKEN);
  } catch {}
}

export default function Admin() {
  const nav = useNavigate();
  const loc = useLocation();

  // ✅ lee ?next= (AdminProtectedRoute te lo manda)
  const nextPath = useMemo(() => {
    const sp = new URLSearchParams(loc.search || "");
    const next = sp.get("next");
    // seguridad mínima: solo permitimos rutas internas
    if (!next) return "/admin/users";
    if (next.startsWith("/")) return next;
    return "/admin/users";
  }, [loc.search]);

  // ✅ token como estado para que re-renderice sin reload
  const [token, setToken] = useState(() => getTokenSafe());
  const loggedIn = !!token;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // Si ya hay token, opcionalmente podrías redirigir al next
  // (yo lo dejo manual para que puedas elegir Users o Leads)
  useEffect(() => {
    // noop
  }, []);

  const onLogout = () => {
    removeTokenSafe();
    setToken("");
    setErr("");
    // vuelve al login admin
    nav("/admin", { replace: true });
  };

  const onLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);

    try {
      // ✅ OJO: endpoint ADMIN
      const r = await fetch(`${API}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(email || "").trim().toLowerCase(),
          password: String(password || ""),
        }),
      });

      const j = await r.json().catch(() => ({}));

      if (!r.ok || !j?.token) {
        setErr(j?.message || "No se pudo iniciar sesión (admin)");
        return;
      }

      setTokenSafe(j.token);
      setToken(j.token);

      // ✅ manda a la ruta que estaba intentando abrir (o users por defecto)
      nav(nextPath, { replace: true });
    } catch (e2) {
      setErr("Error de red iniciando sesión");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold">Admin HabitaLibre</h1>
        <p className="text-slate-300 mt-1">Acceso solo para el equipo HabitaLibre.</p>

        {loggedIn ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm text-slate-300">Sesión activa</div>
                <div className="text-lg font-semibold mt-1">Panel interno</div>
                <div className="text-xs text-slate-400 mt-1 break-all">
                  Token guardado en localStorage (hl_admin_token)
                </div>
              </div>

              <button
                onClick={onLogout}
                className="shrink-0 px-3 py-2 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15"
              >
                Cerrar sesión
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => nav("/admin/users")}
                className="px-4 py-3 rounded-xl bg-emerald-500/90 hover:bg-emerald-500 text-slate-950 font-semibold"
              >
                Ver Usuarios
              </button>

              <button
                onClick={() => nav("/admin/leads")}
                className="px-4 py-3 rounded-xl bg-indigo-500/90 hover:bg-indigo-500 text-white font-semibold"
              >
                Ver Leads
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={onLogin}
            className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <div className="text-sm text-slate-300 mb-4">Inicia sesión</div>

            <label className="block text-sm text-slate-200">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mateo@habitalibre.com"
              autoComplete="username"
              className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 outline-none"
            />

            <label className="block text-sm text-slate-200 mt-4">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 outline-none"
            />

            {err ? (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {err}
              </div>
            ) : null}

            <button
              disabled={busy}
              className="mt-5 w-full px-4 py-3 rounded-xl bg-white text-slate-950 font-semibold hover:opacity-95 disabled:opacity-60"
            >
              {busy ? "Entrando…" : "Entrar"}
            </button>

            <div className="mt-3 text-xs text-slate-400">
              Te redirigirá a: <span className="text-slate-200">{nextPath}</span>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
