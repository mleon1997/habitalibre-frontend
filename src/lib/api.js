// src/lib/api.js

// =====================================================
// Config base
// =====================================================
const env = (import.meta?.env || {});
const IS_DEV = !!env.DEV;

const pick = (...vals) => {
  for (const v of vals) {
    if (v == null) continue;
    const s = String(v).trim();
    if (s) return s;
  }
  return "";
};

// Soporta varios nombres por si cambiaste env vars
const API_BASE = pick(
  env.VITE_API_URL,
  env.VITE_API_BASE,
  env.VITE_BACKEND_URL,
  env.VITE_SERVER_URL,
  env.VITE_API,
  "http://localhost:3001"
).replace(/\/+$/, "");

// Debug toggle: DEV o localStorage HL_DEBUG=1
const DEBUG =
  IS_DEV ||
  (typeof window !== "undefined" &&
    (window?.localStorage?.getItem("HL_DEBUG") === "1" ||
      window?.localStorage?.getItem("HL_DEBUG") === "true"));

try {
  console.log("[API] IS_DEV:", IS_DEV);
  console.log("[API] API_BASE usado:", API_BASE);
} catch (_) {}

// =====================================================
// Helpers
// =====================================================
const safeJson = async (res) => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const shortId = () => Math.random().toString(36).slice(2, 7);

function normalizeErrorMessage(payload, fallback = "Error de red") {
  if (!payload) return fallback;
  if (typeof payload === "string") return payload;
  return (
    payload?.error ||
    payload?.message ||
    payload?.mensaje ||
    payload?.msg ||
    fallback
  );
}

function tryParseJson(body) {
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

function buildQuery(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v == null) return;
    const s = String(v).trim();
    if (!s) return;
    qs.set(k, s);
  });
  const out = qs.toString();
  return out ? `?${out}` : "";
}

function getStoredToken() {
  try {
    return (
      window.localStorage.getItem("HL_TOKEN") ||
      window.localStorage.getItem("token") ||
      window.localStorage.getItem("adminToken") ||
      null
    );
  } catch {
    return null;
  }
}

// =====================================================
// Core fetch wrapper
// =====================================================
export async function apiFetch(path, opts = {}) {
  const rid = shortId();
  const url = path.startsWith("http")
    ? path
    : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const method = (opts.method || "GET").toUpperCase();

  // headers
  const headers = {
    ...(opts.headers || {}),
  };

  // Si body es FormData NO pongas Content-Type
  const isFormData =
    typeof FormData !== "undefined" && opts.body instanceof FormData;

  if (!isFormData && !headers["Content-Type"] && !headers["content-type"]) {
    headers["Content-Type"] = "application/json";
  }

  // auth token optional
  const token = getStoredToken();
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const finalOpts = {
    ...opts,
    method,
    headers,
    credentials: opts.credentials || "omit",
  };

  if (DEBUG) {
    console.log(`[${rid}] [API] -> ${method} ${url}`, {
      headers,
      body:
        finalOpts.body && !isFormData
          ? tryParseJson(finalOpts.body)
          : isFormData
            ? "[FormData]"
            : undefined,
    });
  }

  let res;
  try {
    res = await fetch(url, finalOpts);
  } catch (e) {
    if (DEBUG) console.error(`[${rid}] [API] fetch failed`, e);
    return { ok: false, error: e?.message || "No se pudo conectar" };
  }

  const payload = await safeJson(res);

  if (DEBUG) {
    console.log(`[${rid}] [API] <- ${method} ${url} [${res.status}]`, payload);
  }

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: normalizeErrorMessage(payload, `HTTP ${res.status}`),
      payload,
    };
  }

  return { ok: true, status: res.status, data: payload };
}

// =====================================================
// Endpoints HabitaLibre
// =====================================================

// 1) Precalificar
export async function precalificar(payload) {
  const resp = await apiFetch("/api/precalificar", {
    method: "POST",
    body: JSON.stringify(payload || {}),
  });

  // tu frontend suele esperar "resultado" plano
  if (!resp.ok) return resp;
  return { ok: true, ...resp.data };
}

// 2) Crear lead desde simulador (contacto + precalif + resultado)
export async function crearLeadDesdeSimulador(payload) {
  const body = payload || {};

  // intento 1
  const attempt1 = await apiFetch("/api/leads/crear-desde-simulador", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (attempt1.ok) return attempt1;

  // fallback si la ruta no existe
  if (attempt1.status === 404) {
    const attempt2 = await apiFetch("/api/leads", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (attempt2.ok) return attempt2;

    const attempt3 = await apiFetch("/api/leads/crear", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return attempt3;
  }

  return attempt1;
}

// 3) ✅ LISTAR LEADS (para src/pages/Leads.jsx)
// - soporta filtros comunes: q, page, limit, canal, producto, estado, desde, hasta, etc.
// - si tu backend responde { ok:true, leads:[...], total } o { data:{...} } lo devuelves tal cual
export async function listarLeads(params = {}) {
  const qs = buildQuery(params);

  // tu backend puede tener una de estas rutas:
  // /api/leads
  // /api/admin/leads
  // /api/leads/listar
  const attempt1 = await apiFetch(`/api/leads${qs}`, { method: "GET" });
  if (attempt1.ok) return attempt1;

  if (attempt1.status === 404) {
    const attempt2 = await apiFetch(`/api/admin/leads${qs}`, { method: "GET" });
    if (attempt2.ok) return attempt2;

    const attempt3 = await apiFetch(`/api/leads/listar${qs}`, { method: "GET" });
    return attempt3;
  }

  return attempt1;
}

// 4) (Opcional) Login admin, si tu AdminLogin lo usa
export async function adminLogin(email, password) {
  const attempt1 = await apiFetch("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (attempt1.ok) return attempt1;

  if (attempt1.status === 404) {
    // fallback típico
    const attempt2 = await apiFetch("/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return attempt2;
  }

  return attempt1;
}

// Exporta también constantes por si las usas en otros lados
export { API_BASE, IS_DEV };
