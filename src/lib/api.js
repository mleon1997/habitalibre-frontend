// src/lib/api.js
// ======================================================================
// API client HabitaLibre
// - DEV: usa proxy de Vite => API_BASE = "" y llamas a /api/...
// - PROD: usa VITE_API_URL o fallback Render
// ======================================================================

const IS_DEV = import.meta.env.DEV;

const VITE_URL_RAW = import.meta.env.VITE_API_URL || "";
const VITE_URL = String(VITE_URL_RAW).replace(/\/$/, "");

export const API_BASE = IS_DEV ? "" : (VITE_URL || "https://habitalibre-backend.onrender.com");

console.log("[API] IS_DEV:", IS_DEV);
console.log("[API] VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("[API] API_BASE usado:", API_BASE || "(proxy /api)");

// ----------------------------------------------------------------------
// Helpers token (Customer)
// ----------------------------------------------------------------------
function getCustomerToken(explicitToken) {
  return (
    explicitToken ||
    localStorage.getItem("hl_customer_token") ||
    null
  );
}

// Dispara evento global cuando token falla (401/403)
// Un listener en App se encarga de navegar a /login + limpiar sesión.
function emitCustomerUnauthorized({ status, path, message }) {
  try {
    window.dispatchEvent(
      new CustomEvent("hl:customer-unauthorized", {
        detail: {
          status,
          path,
          message: message || "Tu sesión expiró. Inicia sesión nuevamente.",
          // útil para volver a donde estaba
          returnTo:
            window.location?.pathname +
            (window.location?.search || "") +
            (window.location?.hash || ""),
        },
      })
    );
  } catch {
    // ignore
  }
}

// ----------------------------------------------------------------------
// Helper request (JSON) con timeout + auto token + 401 handler
// ----------------------------------------------------------------------
async function request(
  path,
  {
    method = "GET",
    body,
    headers,
    auth = "none", // "none" | "customer" | "admin"
    token,         // opcional: token explícito
  } = {},
  timeoutMs = 45000
) {
  const url = `${API_BASE}${path}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  // token injection
  let authHeader = {};
  if (auth === "customer") {
    const tkn = getCustomerToken(token);
    if (tkn) authHeader = { Authorization: `Bearer ${tkn}` };
  } else if (auth === "admin") {
    const tkn = token || localStorage.getItem("hl_admin_token");
    if (tkn) authHeader = { Authorization: `Bearer ${tkn}` };
  }

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(headers || {}),
        ...(authHeader || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });

    const ct = res.headers.get("content-type") || "";
    const isJson = ct.includes("application/json");
    const data = isJson ? await res.json().catch(() => ({})) : null;

    // ✅ Manejo elegante de auth inválida para customer
    if ((res.status === 401 || res.status === 403) && auth === "customer") {
      const msg = data?.error || data?.message || "Tu sesión expiró. Inicia sesión nuevamente.";
      emitCustomerUnauthorized({ status: res.status, path, message: msg });

      // Importante: igual lanzamos error para que el caller pueda parar loaders
      throw new Error(msg);
    }

    if (!res.ok) {
      throw new Error(data?.error || data?.message || `HTTP ${res.status} en ${path}`);
    }

    return data;
  } catch (err) {
    console.error(`[API] ERROR ${method} ${url}:`, err);
    throw err;
  } finally {
    clearTimeout(t);
  }
}

// ----------------------------------------------------------------------
// Wake backend (Render / cold start)
// ✅ IMPORTANTE: usa /api/health para que en DEV pase por proxy también
// ----------------------------------------------------------------------
async function wake() {
  try {
    await fetch(`${API_BASE}/api/health`, { method: "GET" });
  } catch {
    // ignore
  }
}

// ======================================================================
// PUBLIC
// ======================================================================
export async function precalificar(payload) {
  await wake();
  return request("/api/precalificar", { method: "POST", body: payload, auth: "none" }, 45000);
}

export async function crearLead(payload) {
  await wake();
  return request("/api/leads", { method: "POST", body: payload, auth: "none" }, 45000);
}

// ======================================================================
// CUSTOMER AUTH (Journey)
// ======================================================================
export async function loginCustomer(payload) {
  await wake();
  return request("/api/customer-auth/login", { method: "POST", body: payload, auth: "none" }, 30000);
}

export async function registerCustomer(payload) {
  await wake();
  return request("/api/customer-auth/register", { method: "POST", body: payload, auth: "none" }, 30000);
}

export async function meCustomer(token) {
  await wake();
  // ahora request inyecta auth header si hay token
  return request(
    "/api/customer-auth/me",
    { method: "GET", auth: "customer", token },
    30000
  );
}

// ======================================================================
// ADMIN
// ======================================================================
export async function listarLeads() {
  await wake();
  // request inyecta admin token
  return request(
    "/api/leads",
    { method: "GET", auth: "admin" },
    30000
  );
}

export async function updateLead(id, payload) {
  await wake();
  return request(
    `/api/leads/${id}`,
    { method: "PUT", auth: "admin", body: payload || {} },
    30000
  );
}

// ======================================================================
// ✅ exports compat: named `api` + default
// ======================================================================
export const api = {
  precalificar,
  crearLead,
  loginCustomer,
  registerCustomer,
  meCustomer,
  listarLeads,
  updateLead,
};

export default api;
