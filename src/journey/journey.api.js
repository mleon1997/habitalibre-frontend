// src/journey/journey.api.js
import { patchJourney } from "./journey.store";
import { nowISO } from "./journey.types";

const LS_CUSTOMER_TOKEN = "hl_customer_token";

// Ajusta esto si tienes baseURL en env o proxy.
// Si tu Vite tiene proxy, esto está bien.
const API_BASE = "";

/**
 * Obtiene token del customer (login)
 */
function getToken() {
  try {
    return localStorage.getItem(LS_CUSTOMER_TOKEN);
  } catch {
    return null;
  }
}

/**
 * Helper fetch con auth
 */
async function fetchAuth(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let data = null;

  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    const msg = data?.message || `Request failed: ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

/**
 * GET lead del customer
 * - intenta /mine, si falla intenta /latest
 */
export async function fetchCustomerLeadMine() {
  try {
    return await fetchAuth("/api/customer/leads/mine", { method: "GET" });
  } catch (e) {
    // fallback
    return await fetchAuth("/api/customer/leads/latest", { method: "GET" });
  }
}

/**
 * Trae del backend y lo mete al store local como baseline.
 * Útil al entrar a /progreso o cuando abres el journey.
 */
export async function hydrateJourneyFromBackend() {
  const data = await fetchCustomerLeadMine();
  const lead = data?.lead;

  // Si no hay lead, no tocamos el local
  if (!lead) return { ok: false, reason: "no_lead" };

  const meta = (lead.metadata && typeof lead.metadata === "object") ? lead.metadata : {};
  const input = (meta.input && typeof meta.input === "object") ? meta.input : {};
  const journey = (meta.journey && typeof meta.journey === "object") ? meta.journey : {};

  const resultado =
    lead.resultadoNormalizado ||
    lead.resultadoSimulacion ||
    lead.resultado ||
    null;

  patchJourney({
    step: Number(journey.step || 1) || 1,
    etapa: journey.etapa || "sync_backend",
    input,
    resultado: resultado || undefined, // si viene null, no sobreescribe si prefieres. Aquí lo dejamos opcional.
    syncedAt: nowISO(),
  });

  return { ok: true, leadId: lead._id || lead.id || null };
}

/**
 * POST sync a backend: guarda step/etapa/input/resultado en el lead del customer
 */
export async function syncJourneyToBackend({ step, etapa, input, resultado } = {}) {
  // No bloqueamos si no hay token (usuario no logueado)
  const token = getToken();
  if (!token) return { ok: false, reason: "no_token" };

  const data = await fetchAuth("/api/customer/leads/sync-journey", {
    method: "POST",
    body: JSON.stringify({
      step,
      etapa,
      input,
      resultado,
    }),
  });

  // marcamos local como “synced”
  patchJourney({ syncedAt: nowISO() });

  return data;
}
