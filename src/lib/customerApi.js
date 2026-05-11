// src/lib/customerApi.js
import { API_BASE } from "./api";
import {
  getCustomerToken,
  setCustomerSession,
  clearCustomerSession,
} from "./customerSession";

/**
 * Compatibilidad:
 * Si algún archivo viejo importa getCustomerToken desde customerApi.js,
 * no se rompe.
 */
export { getCustomerToken };

/**
 * Compatibilidad:
 * Si algún archivo viejo usa setCustomerToken(token), seguirá funcionando.
 * Pero internamente ya usa la misma sesión que mobile.
 */
export function setCustomerToken(token) {
  if (!token) {
    clearCustomerSession();
    return;
  }

  setCustomerSession({
    token,
  });
}

async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data?.error || data?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

/* =========================
   AUTH (Customer)
========================= */

export async function loginCustomer(payload) {
  const data = await apiFetch("/api/customer-auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const token = data?.token || data?.accessToken || data?.jwt || "";

  const customer =
    data?.customer ||
    data?.user ||
    data?.data?.customer ||
    data?.data?.user ||
    null;

  const email = payload?.email;

  if (token) {
    setCustomerSession({
      token,
      customer,
      email,
    });
  }

  return data;
}

export async function registerCustomer(payload) {
  const data = await apiFetch("/api/customer-auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const token = data?.token || data?.accessToken || data?.jwt || "";

  const customer =
    data?.customer ||
    data?.user ||
    data?.data?.customer ||
    data?.data?.user ||
    null;

  const email = payload?.email;

  if (token) {
    setCustomerSession({
      token,
      customer,
      email,
    });
  }

  return data;
}

/**
 * Robusto:
 * - si pasas tokenOverride, lo usa
 * - si no, lee de localStorage con la misma key que mobile
 */
export async function meCustomer(tokenOverride) {
  const token = String(tokenOverride || getCustomerToken() || "").trim();
  if (!token) return null;

  return apiFetch("/api/customer-auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/* =========================
   JOURNEY SAVE
========================= */

export async function saveJourney(payload, tokenOverride) {
  const token = String(tokenOverride || getCustomerToken() || "").trim();
  if (!token) throw new Error("NO_TOKEN");

  return apiFetch("/api/customer/leads/save-journey", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}

/* =========================
   FORGOT / RESET PASSWORD
========================= */

export async function forgotPassword(payload) {
  return apiFetch("/api/customer-auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(payload) {
  return apiFetch("/api/customer-auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}