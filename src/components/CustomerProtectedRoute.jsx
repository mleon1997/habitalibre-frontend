// src/components/CustomerProtectedRoute.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";
import { meCustomer } from "../lib/api"; // ✅ usa api.js (token routing + auto-dispatch unauthorized)

/**
 * Protege rutas del Journey (Customer).
 * - Si no hay token => /login
 * - Si hay token => valida con /api/customer-auth/me (vía meCustomer)
 * - Si 401/403 => NO hace dispatch aquí (apiFetch ya dispara "hl:customer-unauthorized")
 *                y CustomerAuthListener se encarga de limpiar + redirigir.
 */
export default function CustomerProtectedRoute({ children }) {
  const location = useLocation();
  const { token, isAuthed } = useCustomerAuth();

  const [checking, setChecking] = useState(true);
  const [ok, setOk] = useState(false);

  const returnTo = useMemo(() => {
    return (
      location.pathname +
      (location.search || "") +
      (location.hash || "")
    );
  }, [location]);

  useEffect(() => {
    let alive = true;

    async function run() {
      // 1) si no hay token, no hay nada que validar
      if (!token) {
        if (!alive) return;
        setOk(false);
        setChecking(false);
        return;
      }

      setChecking(true);

      // 2) validar token contra backend
      const r = await meCustomer(token);

      if (!alive) return;

      if (r?.ok) {
        setOk(true);
        setChecking(false);
        return;
      }

      const status = r?.status;

      /**
       * ✅ 401/403:
       * NO hagas dispatch ni limpies auth aquí.
       * apiFetch() ya dispara el evento "hl:customer-unauthorized"
       * y CustomerAuthListener limpia + redirige.
       */
      if (status === 401 || status === 403) {
        setOk(false);
        setChecking(false);
        return;
      }

      // 3) otros errores: bloquea la ruta por seguridad
      setOk(false);
      setChecking(false);
    }

    run();
    return () => {
      alive = false;
    };
  }, [token]);

  // Loading UI mínimo
  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 px-5 py-4">
          <div className="text-sm font-semibold">Verificando sesión…</div>
          <div className="mt-1 text-xs text-slate-400">Un momento</div>
        </div>
      </div>
    );
  }

  // Si no hay token o no ok => login
  if (!token || !ok || !isAuthed) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ returnTo, reason: "protected" }}
      />
    );
  }

  return children;
}
