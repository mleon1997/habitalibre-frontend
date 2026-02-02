// src/lib/customerApi.js
import { API_BASE } from "./api"; // en Vite esto está OK

const LS_TOKEN = "hl_customer_token";

export function getCustomerToken() {
  try {
    return localStorage.getItem(LS_TOKEN) || "";
  } catch {
    return "";
  }
}

export function setCustomerToken(token) {
  try {
    if (!token) localStorage.removeItem(LS_TOKEN);
    else localStorage.setItem(LS_TOKEN, token);
  } catch {}
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

  // ✅ guarda token automáticamente si viene
  if (data?.token) setCustomerToken(data.token);

  return data;
}

export async function registerCustomer(payload) {
  const data = await apiFetch("/api/customer-auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (data?.token) setCustomerToken(data.token);

  return data;
}

/**
 * ✅ Robusto:
 * - si pasas tokenOverride, lo usa (evita race conditions)
 * - si no, lee de localStorage (fallback)
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
