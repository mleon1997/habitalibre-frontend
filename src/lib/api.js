// src/lib/api.js
// Punto base de la API (usa .env en prod; localhost en dev)
const BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/+$/, "");

/* Utilidad para requests JSON con buen manejo de errores */
async function jsonFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  // Intentar parsear JSON si corresponde
  const contentType = res.headers.get("content-type") || "";
  const isJSON = contentType.includes("application/json");
  const text = await res.text();
  const data = isJSON && text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg =
      data?.error ||
      data?.message ||
      (text?.startsWith("<") ? "Endpoint no encontrado o método incorrecto" : text) ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return isJSON ? data : text;
}

/* ===================== PRECALIFICAR ===================== */
export async function precalificar(payload) {
  return jsonFetch(`${BASE}/api/precalificar`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ===================== LEADS ===================== */
// Crear lead (desde ModalLead / ResultCard)
export async function crearLead(payload) {
  return jsonFetch(`${BASE}/api/leads`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Listar leads (AdminDashboard)
export async function listarLeads() {
  return jsonFetch(`${BASE}/api/leads`);
}

/* ===================== HEALTH / DIAG ===================== */
export async function health() {
  return jsonFetch(`${BASE}/api/health`);
}

export async function pingDiag() {
  return jsonFetch(`${BASE}/api/diag`);
}

/* ===================== UTILIDADES OPCIONALES ===================== */
/**
 * Helper para anexar query params a una URL (por si lo necesitas luego)
 */
export function withQuery(url, params = {}) {
  const u = new URL(url, BASE);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, v);
  });
  return u.toString();
}

export async function updateLead(id, payload) {
  return jsonFetch(`${BASE}/api/leads/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
