// src/components/CustomerProtectedRoute.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";
import { meCustomer } from "../lib/api"; // usa api.js si ahí tienes token routing + unauthorized dispatch

/**
 * Protege rutas del Journey / Customer.
 *
 * Reglas:
 * - Mientras CustomerAuthContext carga localStorage => espera.
 * - Si no hay token => /login.
 * - Si hay token => valida con /api/customer-auth/me.
 * - Si el token es válido => renderiza children.
 * - Si el token es inválido o falla validación => /login.
 */
export default function CustomerProtectedRoute({ children }) {
  const location = useLocation();

  const {
    token,
    isAuthed,
    loading: authLoading,
  } = useCustomerAuth();

  const [checking, setChecking] = useState(true);
  const [ok, setOk] = useState(false);

  const returnTo = useMemo(() => {
    return location.pathname + (location.search || "");
  }, [location.pathname, location.search]);

  useEffect(() => {
    let alive = true;

    async function run() {
      // 1) Esperar a que CustomerAuthContext termine de leer localStorage
      if (authLoading) {
        return;
      }

      // 2) Si no hay token, no hay nada que validar
      if (!token) {
        if (!alive) return;
        setOk(false);
        setChecking(false);
        return;
      }

      setChecking(true);

      try {
        // 3) Validar token contra backend
        const r = await meCustomer(token);

        if (!alive) return;

        // Soporta respuestas tipo:
        // { ok: true, user: ... }
        // { user: ... }
        // { customer: ... }
        // o cualquier respuesta válida del backend
        const valid =
          r?.ok === true ||
          Boolean(r?.user) ||
          Boolean(r?.customer) ||
          Boolean(r?.data?.user) ||
          Boolean(r?.data?.customer);

        if (valid) {
          setOk(true);
          setChecking(false);
          return;
        }

        setOk(false);
        setChecking(false);
      } catch (err) {
        if (!alive) return;

        // Si api.js ya dispara hl:customer-unauthorized, el listener limpiará sesión.
        // Aquí solo bloqueamos la ruta.
        setOk(false);
        setChecking(false);
      }
    }

    run();

    return () => {
      alive = false;
    };
  }, [authLoading, token]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 px-5 py-4 shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
          <div className="text-sm font-semibold">Verificando sesión…</div>
          <div className="mt-1 text-xs text-slate-400">Un momento</div>
        </div>
      </div>
    );
  }

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