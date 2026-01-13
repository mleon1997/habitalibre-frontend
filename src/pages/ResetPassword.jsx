// src/pages/ResetPassword.jsx
import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as customerApi from "../lib/customerApi.js";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function niceMsg(err) {
  return (
    err?.data?.error ||
    err?.data?.message ||
    err?.message ||
    "Ocurrió un error. Intenta de nuevo."
  );
}

function ResetPassword() {
  const nav = useNavigate();
  const q = useQuery();
  const token = q.get("token") || "";

  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) return setError("Enlace inválido. Solicita uno nuevo.");
    if (!p1 || p1.length < 6) return setError("Mínimo 6 caracteres.");
    if (p1 !== p2) return setError("Las contraseñas no coinciden.");

    try {
      setLoading(true);
      await customerApi.resetPassword({ token, newPassword: p1 });
      setOk(true);
    } catch (e2) {
      setError(niceMsg(e2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-900/40 shadow-[0_24px_80px_rgba(15,23,42,0.9)] p-6 md:p-8">
        <div className="text-[11px] tracking-[0.18em] text-emerald-300/80">
          HABITALIBRE
        </div>

        <h1 className="mt-2 text-3xl font-semibold text-white">
          Crea tu nueva contraseña
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Elige una contraseña segura para retomar tu plan.
        </p>

        {ok ? (
          <>
            <div className="mt-6 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              Listo. Tu contraseña fue actualizada.
            </div>

            <button
              type="button"
              onClick={() => nav("/login")}
              className="w-full mt-5 rounded-2xl py-3.5 font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition"
            >
              Volver a iniciar sesión
            </button>
          </>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-[12px] text-slate-300 mb-2">
                Nueva contraseña
              </label>
              <input
                value={p1}
                onChange={(e) => setP1(e.target.value)}
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-3 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/40"
                autoComplete="new-password"
              />
              <div className="mt-1 text-[11px] text-slate-500">
                Mínimo 6 caracteres.
              </div>
            </div>

            <div>
              <label className="block text-[12px] text-slate-300 mb-2">
                Confirmar contraseña
              </label>
              <input
                value={p2}
                onChange={(e) => setP2(e.target.value)}
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl bg-slate-950/60 border border-slate-800 px-4 py-3 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-emerald-500/40"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={[
                "w-full mt-2 rounded-2xl py-3.5 font-semibold transition",
                loading
                  ? "bg-emerald-500/60 text-slate-950 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950",
              ].join(" ")}
            >
              {loading ? "Guardando…" : "Actualizar contraseña"}
            </button>

            <button
              type="button"
              onClick={() => nav("/login")}
              className="w-full rounded-2xl py-3.5 font-semibold bg-slate-900/40 hover:bg-slate-900/60 border border-slate-800 text-slate-200 transition"
            >
              Volver a login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
