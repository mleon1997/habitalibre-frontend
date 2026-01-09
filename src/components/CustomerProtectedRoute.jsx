// src/components/CustomerProtectedRoute.jsx
import React, { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";
import * as api from "../lib/api.js";

export default function CustomerProtectedRoute({ children }) {
  const location = useLocation();
  const { loading, token, customer, setCustomer, logout } = useCustomerAuth();

  const [checking, setChecking] = useState(false);
  const [checkedOnce, setCheckedOnce] = useState(false);

  // Guarda el último token validado para evitar dobles llamadas
  const lastValidatedTokenRef = useRef(null);

  useEffect(() => {
    // Espera a que el contexto cargue localStorage
    if (loading) return;

    // Sin token: ya "validamos" que no hay sesión
    if (!token) {
      setChecking(false);
      setCheckedOnce(true);
      lastValidatedTokenRef.current = null;
      return;
    }

    // Si el token ya fue validado, no repitas
    if (lastValidatedTokenRef.current === token && checkedOnce) return;

    const run = async () => {
      try {
        setChecking(true);

        const data = await api.meCustomer(token);
        const user = data?.user || null;

        if (user?.id) {
          // refresca customer si estaba vacío o cambió
          if (!customer || customer?.id !== user.id) {
            setCustomer?.(user);
          }
          lastValidatedTokenRef.current = token;
        } else {
          // respuesta rara => logout
          logout?.();
        }
      } catch (err) {
        // token inválido/expirado
        logout?.();
      } finally {
        setChecking(false);
        setCheckedOnce(true);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, token]);

  // 1) Mientras CustomerAuthContext carga localStorage
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="text-sm text-slate-200 font-semibold">Cargando sesión…</div>
          <div className="mt-2 text-xs text-slate-400">
            Estamos preparando tu Journey.
          </div>
        </div>
      </div>
    );
  }

  // 2) Si no hay token => a /login
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ returnTo: location.pathname + location.search }}
      />
    );
  }

  // 3) Si hay token pero aún estamos verificando /me
  if (checking || !checkedOnce) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="text-sm text-slate-200 font-semibold">Validando sesión…</div>
          <div className="mt-2 text-xs text-slate-400">
            Un momento. Estamos confirmando tu cuenta.
          </div>
        </div>
      </div>
    );
  }

  // 4) Ya está logueado y validado
  return children;
}
