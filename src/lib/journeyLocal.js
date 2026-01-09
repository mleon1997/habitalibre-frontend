// src/lib/journeyLocal.js
const LS_JOURNEY_SNAP = "hl_journey_snapshot_v1";
const LS_LAST_RESULT = "hl_last_result";

// Guarda snap completo: { input, resultado, updatedAt }
export function saveJourneyLocal(snap) {
  try {
    localStorage.setItem(LS_JOURNEY_SNAP, JSON.stringify(snap || null));
  } catch {}
}

// Lee snap completo
export function readJourneyLocal() {
  try {
    const raw = localStorage.getItem(LS_JOURNEY_SNAP);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Mantengo compatibilidad con tu código existente
export function clearJourneyLocal() {
  try {
    localStorage.removeItem(LS_JOURNEY_SNAP);
    localStorage.removeItem(LS_LAST_RESULT);
  } catch {}
}
