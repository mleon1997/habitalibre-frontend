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
).replace(/\/+$/, ""); // sin trailing slash

// Debug toggle: DEV o localStorage HL_DEBUG=1
const DEBUG =
  IS_DEV ||
  (typeof window !== "undefined" &&
    (window?.localStorage?.getItem("HL_DEBUG") === "1" ||
      window?.localStorage?.getItem("HL_DEBUG") === "true"));

// Log inicial (como el que ya te sale)
try {
  // eslint-disable-next-line no-console
  console.log("[API] IS_DEV:", IS_DEV);
  // eslint-disable-next-line no-console
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

// =====================================================
// Core fetch wrapper
// =====================================================
export async function apiFetch(path, opts = {}) {
  const rid = shortId();
  const url = path.startsWith("http") ? path : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const method = (opts.method || "GET").toUpperCase();

  // headers
  const headers = {
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };

  // auth token optional (si lo usas)
  // Si tú no usas token, no pasa nada.
  try {
    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("HL_TOKEN") ||
          window.localStorage.getItem("token") ||
          null
        : null;
    if (token && !headers.Authorization) {
      headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {}

  const finalOpts = {
    ...opts,
    method,
    headers,
    credentials: opts.credentials || "omit",
  };

  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log(`[${rid}] [API] -> ${method} ${url}`, {
      headers,
      body: finalOpts.body ? tryParseJson(finalOpts.body) : undefined,
    });
  }

  let res;
  try {
    res = await fetch(url, finalOpts);
  } catch (e) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.error(`[${rid}] [API] fetch failed`, e);
    }
    return { ok: false, error: e?.message || "No se pudo conectar" };
  }

  const payload = await safeJson(res);

  if (DEBUG) {
    // eslint-disable-next-line no-console
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

function tryParseJson(body) {
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

// =====================================================
// Endpoints HabitaLibre
// =====================================================

// 1) Precalificar
export async function precalificar(payload) {
  // payload: { ingresoNetoMensual, ingresoPareja, otrasDeudasMensuales, valorVivienda, entradaDisponible, ... }
  const resp = await apiFetch("/api/precalificar", {
    method: "POST",
    body: JSON.stringify(payload || {}),
  });

  // Tu app suele esperar el objeto resultado directo
  if (!resp.ok) return resp;
  return { ok: true, ...resp.data };
}

// 2) Crear lead desde simulador (contacto + precalif + resultado)
// Soporta 2 formatos:
// A) { contacto: {...}, precalif: {...}, resultado: {...} }  (como tu LeadModalBare)
// B) payload plano (por compatibilidad)
export async function crearLeadDesdeSimulador(payload) {
  const body = payload || {};

  // Intento 1 (más probable por tu naming)
  const attempt1 = await apiFetch("/api/leads/crear-desde-simulador", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (attempt1.ok) return attempt1;

  // Si tu backend no tiene esa ruta, probamos fallback comunes
  // (evita que te quedes trabado por un mismatch de path)
  const status = attempt1.status;

  // Solo intentamos fallback si parece "ruta no existe" o "not found"
  if (status === 404) {
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

// Exporta también constantes por si las usas en otros lados
export { API_BASE, IS_DEV };
