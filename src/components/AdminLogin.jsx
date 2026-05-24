// src/components/AdminLogin.jsx
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE, adminLogin as apiAdminLogin } from "../lib/api.js";

// Detectamos entorno y fijamos el backend correcto (fallback si API_BASE viniera vacío en dev)
const IS_DEV = import.meta.env.DEV;

const FALLBACK_BASE_URL = IS_DEV
  ? "http://localhost:4000"
  : "https://habitalibre-backend.onrender.com";

export default function AdminLogin({ onSuccess }) {
  const nav = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem("hl_admin_email") || "";
    } catch {
      return "";
    }
  });

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const params = useMemo(
    () => new URLSearchParams(location.search || ""),
    [location.search]
  );

  const reason = params.get("reason");
  const returnTo = params.get("returnTo") || "/admin/leads";

  const isPropertiesLogin = returnTo.includes("/admin/propiedades");

  const title = isPropertiesLogin
    ? "Login admin · Propiedades"
    : "Login admin · HabitaLibre";

  const subtitle = isPropertiesLogin
    ? "Accede al panel interno para crear, editar, pausar o vender propiedades."
    : "Acceso exclusivo para el equipo interno. Ingresa tus credenciales.";

  const buttonText = isPropertiesLogin
    ? "Entrar al panel de propiedades"
    : "Entrar al panel interno";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ======================================================
      // 1) Intento por api.js
      // ======================================================
      let resp = await apiAdminLogin(email, password);

      // ======================================================
      // 2) Fallback manual
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
            `Respuesta no válida del servidor (no es JSON): ${text.slice(
              0,
              120
            )}...`
          );
        }

        if (!res.ok) {
          throw new Error(
            data?.error || data?.message || "Error iniciando sesión"
          );
        }

        resp = { ok: true, data };
      }

      const data = resp?.data || {};
      const token = data?.token;

      if (!token) {
        throw new Error("Respuesta sin token de autenticación");
      }

      // Guardar token en todas las llaves que ya usa tu frontend
      localStorage.setItem("hl_admin_token", token);
      localStorage.setItem("adminToken", token);
      localStorage.setItem("HL_TOKEN", token);
      localStorage.setItem("hl_admin_email", email);

      // Importante:
      // Si Admin.jsx pasó onSuccess, dejamos que Admin.jsx maneje la navegación.
      // Así evitamos que este componente sobreescriba returnTo y mande a /admin/leads.
      if (onSuccess) {
        onSuccess(token, email);
        return;
      }

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
        <h1 className="text-xl font-semibold text-slate-50 mb-2">{title}</h1>

        <p className="text-sm text-slate-400 mb-6">{subtitle}</p>

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
            {loading ? "Ingresando..." : buttonText}
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