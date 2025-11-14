// src/lib/api.js
const VITE_URL = (import.meta?.env?.VITE_API_URL || "").replace(/\/$/, "");
export const API_BASE = VITE_URL || "https://habitalibre-backend.onrender.com";

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
      // mode: "cors", // generalmente no hace falta ponerlo; descomenta si ves error CORS
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

// (Opcional) “despertar” Render free antes de la petición pesada
async function wake() {
  try {
    await fetch(`${API_BASE}/health`, { method: "GET" }); // ajusta si tu backend tiene /health
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

/**
 * Lista todos los leads guardados en el backend.
 * Usado en: src/pages/Leads.jsx y AdminDashboard.jsx
 */
export async function listarLeads() {
  const res = await fetch(`${API_BASE}/api/leads`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("No se pudieron cargar los leads");
  }

  return await res.json();
}

/**
 * Actualiza un lead (por ejemplo, marcar como contactado, cambiar estado, etc.).
 * Usado en: src/pages/AdminDashboard.jsx
 */
export async function updateLead(id, payload) {
  const res = await fetch(`${API_BASE}/api/leads/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload || {}),
  });

  if (!res.ok) {
    throw new Error("No se pudo actualizar el lead");
  }

  return await res.json();
}
