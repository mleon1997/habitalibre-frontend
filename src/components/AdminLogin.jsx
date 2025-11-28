// src/components/AdminLogin.jsx
import { useState } from "react";

export default function AdminLogin({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const baseURL = import.meta.env.VITE_API_BASE_URL || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${baseURL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Error iniciando sesión");
      }

      const token = data.token;
      if (!token) throw new Error("Respuesta sin token");

      // Guardar token en localStorage
      localStorage.setItem("hl_admin_token", token);

      // Avisar al padre (AdminLeads) que ya estamos logueados
      if (onSuccess) onSuccess(token);
    } catch (err) {
      console.error("Error login admin:", err);
      setError(err.message || "Error iniciando sesión");
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
