// src/lib/api.js

// Detectamos si estamos en dev (Vite expone import.meta.env.DEV)
const IS_DEV = import.meta.env.DEV;

// En dev: forzamos backend local.
// En build/prod: usamos VITE_API_URL (y si faltara, caemos a Render).
const VITE_URL_RAW = import.meta.env.VITE_API_URL || "";
const VITE_URL = VITE_URL_RAW.replace(/\/$/, "");

export const API_BASE = IS_DEV
  ? "http://localhost:4000"
  : (VITE_URL || "https://habitalibre-backend.onrender.com");

console.log("[API] IS_DEV:", IS_DEV);
console.log("[API] VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("[API] API_BASE usado:", API_BASE);

// Pequeño helper de fetch con timeout y logs
async function request(path, { method = "GET", body, headers } = {}, timeoutMs = 45000) {
  const url = `${API_BASE}${path}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  console.log(`[API] ${method} ${url}`, body ? { body } : "(sin body)");

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", ...(headers || {}) },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });

    const ct = res.headers.get("content-type") || "";
    const isJson = ct.includes("application/json");
    const data = isJson ? await res.json() : null;

    if (!res.ok) {
      console.error(`[API] HTTP ${res.status} en ${path}`, data);
      throw new Error(data?.error || `HTTP ${res.status} en ${path}`);
    }

    console.log(`[API] OK ${method} ${url}`, data);
    return data;
  } catch (err) {
    console.error(`[API] ERROR ${method} ${url}:`, err);
    throw err;
  } finally {
    clearTimeout(t);
  }
}

// “Despertar” backend antes de la petición pesada (útil en Render)
async function wake() {
  try {
    await fetch(`${API_BASE}/health`, { method: "GET" });
  } catch {
    // ignorar
  }
}

export async function precalificar(payload) {
  await wake();
  return request("/api/precalificar", { method: "POST", body: payload }, 45000);
}

export async function crearLead(payload) {
  await wake();
  return request("/api/leads", { method: "POST", body: payload }, 45000);
}

// ======================================================================
// 🧾 LEADS (admin)
// ======================================================================

export async function listarLeads() {
  await wake();

  const token = localStorage.getItem("hl_admin_token");
  if (!token) {
    throw new Error("No autorizado: falta token admin");
  }

  return request(
    "/api/leads",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    30000
  );
}

export async function updateLead(id, payload) {
  await wake();

  const token = localStorage.getItem("hl_admin_token");
  if (!token) {
    throw new Error("No autorizado: falta token admin");
  }

  return request(
    `/api/leads/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: payload || {},
    },
    30000
  );
}
