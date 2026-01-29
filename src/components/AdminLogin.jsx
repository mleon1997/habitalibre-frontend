// src/components/AdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, adminLogin as apiAdminLogin } from "../lib/api.js";

// Detectamos entorno y fijamos el backend correcto (fallback si API_BASE viniera vacío en dev)
const IS_DEV = import.meta.env.DEV;

const FALLBACK_BASE_URL = IS_DEV
  ? "http://localhost:4000"
  : "https://habitalibre-backend.onrender.com";

export default function AdminLogin({ onSuccess }) {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // (opcional) Banner si vienes de sesión expirada
  const qs = new URLSearchParams(window.location.search || "");
  const reason = qs.get("reason"); // p.ej. "expired"

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ======================================================
      // ✅ 1) Intento por api.js (recomendado)
      // ======================================================
      let resp = await apiAdminLogin(email, password);

      // ======================================================
      // ✅ 2) Fallback manual (por si proxy/env/base te falla)
      // ======================================================
      if (!resp?.ok) {
        const base = (API_BASE || "").trim();
        const origin = base || FALLBACK_BASE_URL;

        const res = await fetch(`${origin}/api/admin/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const ct = res.headers.get("content-type") || "";
        let data = null;

        if (ct.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          throw new Error(
            `Respuesta no válida del servidor (no es JSON): ${text.slice(0, 120)}...`
          );
        }

        if (!res.ok) {
          throw new Error(data?.error || data?.message || "Error iniciando sesión");
        }

        resp = { ok: true, data };
      }

      const data = resp?.data || {};
      const token = data?.token;

      if (!token) {
        throw new Error("Respuesta sin token de autenticación");
      }

      // ======================================================
      // ✅ CLAVE: guardar token en las llaves que tu apiFetch sí lee
      // ======================================================
      localStorage.setItem("hl_admin_token", token); // lo que ya usabas
      localStorage.setItem("adminToken", token);     // ✅ apiFetch lo lee
      localStorage.setItem("HL_TOKEN", token);       // ✅ apiFetch lo lee
      localStorage.setItem("hl_admin_email", email);

      // Si venimos desde un redirect por sesión expirada, respetamos returnTo
      const qs2 = new URLSearchParams(window.location.search || "");
      const returnTo = qs2.get("returnTo") || "/admin/leads";

      // Avisar al padre (si aplica)
      if (onSuccess) onSuccess(token, email);

      // Navegar al destino (dashboard)
      nav(returnTo, { replace: true });
    } catch (err) {
      console.error("Error login admin:", err);
      setError(err?.message || "Error iniciando sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl shadow-[0_24px_80px_rgba(15,23,42,0.9)] p-8">
        <h1 className="text-xl font-semibold text-slate-50 mb-2">
          Login admin · HabitaLibre
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          Acceso exclusivo para el equipo interno. Ingresa tus credenciales.
        </p>

        {reason === "expired" && (
          <p className="text-xs text-amber-200 bg-amber-950/40 border border-amber-800/60 rounded-xl px-3 py-2 mb-4">
            Tu sesión expiró. Vuelve a iniciar sesión para continuar.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/60"
              placeholder="admin@habitalibre.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/60"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-800/60 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loading ? "Ingresando..." : "Entrar al dashboard"}
          </button>
        </form>

        <p className="mt-4 text-[11px] text-slate-500 text-center">
          Los accesos son personales e intransferibles. Contacta a Mateo para
          habilitar un usuario adicional.
        </p>
      </div>
    </div>
  );
}
