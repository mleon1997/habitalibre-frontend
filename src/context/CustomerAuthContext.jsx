// src/context/CustomerAuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const CustomerAuthContext = createContext(null);

const LS_CUSTOMER = "hl_customer";
const LS_TOKEN = "hl_customer_token";
const LS_AUTH_ERROR = "hl_customer_last_auth_error";

function normalizeToken(v) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  if (s === "null" || s === "undefined" || s === "false") return null;
  return s;
}

export function CustomerAuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(null);

  // Mensaje opcional para UI (“sesión expirada”, etc.)
  const [lastAuthError, setLastAuthError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_CUSTOMER);
      const tkn = localStorage.getItem(LS_TOKEN);
      const err = localStorage.getItem(LS_AUTH_ERROR);

      if (raw) setCustomer(JSON.parse(raw));

      const nt = normalizeToken(tkn);
      setToken(nt);

      if (err) setLastAuthError(String(err));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  const persistCustomer = (c) => {
    setCustomer(c || null);
    try {
      if (c) localStorage.setItem(LS_CUSTOMER, JSON.stringify(c));
      else localStorage.removeItem(LS_CUSTOMER);
    } catch {}
  };

  const persistToken = (t) => {
    const v = normalizeToken(t);
    setToken(v);
    try {
      if (v) localStorage.setItem(LS_TOKEN, v);
      else localStorage.removeItem(LS_TOKEN);
    } catch {}
  };

  const persistAuthError = (msg) => {
    const v = msg ? String(msg) : "";
    setLastAuthError(v);
    try {
      if (v) localStorage.setItem(LS_AUTH_ERROR, v);
      else localStorage.removeItem(LS_AUTH_ERROR);
    } catch {}
  };

  const clearAuth = (reason = "") => {
    persistCustomer(null);
    persistToken(null);
    persistAuthError(reason);
  };

  /**
   * ✅ Login robusto: soporta múltiples shapes de respuesta
   * - login({ token, user })
   * - login({ token, customer })
   * - login({ ok, token, customer })
   */
  const login = (payload = {}) => {
    persistAuthError("");

    const t =
      payload?.token ??
      payload?.data?.token ??
      payload?.accessToken ??
      payload?.data?.accessToken ??
      null;

    const u =
      payload?.user ??
      payload?.customer ??
      payload?.data?.user ??
      payload?.data?.customer ??
      null;

    persistToken(t);
    persistCustomer(u);
  };

  const logout = () => {
    clearAuth("");
  };

  // Helper para requests (fetch/axios)
  const authHeader = () => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  };

  // Llamar esto cuando el backend responda 401/403
  const onUnauthorized = (message = "Tu sesión expiró. Inicia sesión nuevamente.") => {
    clearAuth(message);
  };

  const value = useMemo(
    () => ({
      loading,
      customer,
      token,

      // aliases
      user: customer,
      isAuthed: !!normalizeToken(token),

      // setters compat
      setCustomer: persistCustomer,
      setToken: persistToken,

      // acciones
      login,
      logout,
      clearAuth,
      onUnauthorized,

      // helpers
      authHeader,

      // UI message
      lastAuthError,
      setLastAuthError: persistAuthError,
    }),
    [loading, customer, token, lastAuthError]
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth debe usarse dentro de <CustomerAuthProvider>");
  return ctx;
}

export default CustomerAuthContext;
