// src/context/CustomerAuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { API_BASE } from "../lib/api"; // ✅ usa tu API_BASE real (VITE_API_URL etc.)

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

// helper chico: evita reventar por JSON corrupto
function safeParseJson(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

/**
 * Llama /api/customer-auth/me y devuelve:
 * - { ok: true, user: { leadId, email } }  (según tu backend)
 * Si 401/403 => retorna { ok:false, status }
 */
async function fetchMeCustomer(token) {
  const t = normalizeToken(token);
  if (!t) return { ok: false, status: 0, error: "NO_TOKEN" };

  const res = await fetch(`${API_BASE}/api/customer-auth/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${t}` },
  }).catch((e) => {
    return { ok: false, status: 0, _netErr: e };
  });

  // si falló el fetch por red
  if (!res || res.ok === false && res.status == null) {
    return { ok: false, status: 0, error: "NETWORK" };
  }

  const status = res.status;

  if (status === 401 || status === 403) {
    return { ok: false, status, error: "UNAUTHORIZED" };
  }

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    return { ok: false, status, error: json?.error || json?.message || `HTTP ${status}` };
  }

  // backend devuelve { ok:true, user:{...} }
  const user =
    json?.user ||
    json?.customer ||
    json?.data?.user ||
    json?.data?.customer ||
    json;

  return { ok: true, status, user };
}

export function CustomerAuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [token, setToken] = useState(null);

  // Mensaje opcional para UI (“sesión expirada”, etc.)
  const [lastAuthError, setLastAuthError] = useState("");

  // evita doble “init validate” en React StrictMode (dev)
  const didInitRef = useRef(false);

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
   * ✅ Refresca el customer desde /me
   * - Si token inválido => limpia auth y deja lastAuthError
   * - Si ok => actualiza customer (y lo persiste)
   *
   * Puedes llamarlo después de login, o cuando quieras revalidar sesión.
   */
  const refreshMe = async (tokenOverride) => {
    const t = normalizeToken(tokenOverride ?? token);
    if (!t) return { ok: false, status: 0, error: "NO_TOKEN" };

    const r = await fetchMeCustomer(t);

    if (!r.ok) {
      // si es 401/403, limpiamos
      if (r.status === 401 || r.status === 403) {
        clearAuth("Tu sesión expiró. Inicia sesión nuevamente.");
      }
      return r;
    }

    // ✅ Normaliza shape a lo que tú usas en UI
    // tu /me devuelve { leadId, email }
    const u = r.user && typeof r.user === "object" ? r.user : null;

    // si no trae nada útil, no pises customer existente
    if (u && (u.email || u.leadId)) {
      persistCustomer(u);
    }

    return r;
  };

  /**
   * ✅ Login robusto: soporta múltiples shapes de respuesta
   * - login({ token, user })
   * - login({ token, customer })
   * - login({ ok, token, customer })
   */
  const login = async (payload = {}) => {
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

    // si backend devolvió user/customer lo guardamos
    if (u) persistCustomer(u);

    // ✅ y SIEMPRE intentamos hidratar /me para asegurar email/leadId
    // (esto evita que user quede null y luego tu UI no tenga email)
    const nt = normalizeToken(t);
    if (nt) {
      await refreshMe(nt);
    }
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

  /**
   * ✅ Bootstrap (1 vez):
   * - Lee localStorage
   * - Si hay token: intenta /me
   *   - si 401 => limpia
   *   - si ok => customer queda hidratado (con email/leadId)
   */
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    (async () => {
      try {
        const raw = localStorage.getItem(LS_CUSTOMER);
        const tkn = localStorage.getItem(LS_TOKEN);
        const err = localStorage.getItem(LS_AUTH_ERROR);

        const parsed = raw ? safeParseJson(raw) : null;
        if (parsed) setCustomer(parsed);

        const nt = normalizeToken(tkn);
        setToken(nt);

        if (err) setLastAuthError(String(err));

        // ✅ si hay token, valida/hidrata
        if (nt) {
          const r = await fetchMeCustomer(nt);
          if (r.ok) {
            const u = r.user && typeof r.user === "object" ? r.user : null;
            if (u && (u.email || u.leadId)) {
              // persistimos para que user.email exista tras refresh
              try {
                localStorage.setItem(LS_CUSTOMER, JSON.stringify(u));
              } catch {}
              setCustomer(u);
            }
          } else if (r.status === 401 || r.status === 403) {
            // token muerto: limpiamos y dejamos mensaje
            clearAuth("Tu sesión expiró. Inicia sesión nuevamente.");
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      // ✅ nuevo
      refreshMe,

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
