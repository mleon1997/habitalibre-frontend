// src/lib/journeyLocal.js

const LS_JOURNEY_SNAP = "hl_journey_snapshot_v1";
const LS_LAST_RESULT = "hl_last_result";

// Normaliza a un contrato único para Journey:
// { entrada, input, resultado, updatedAt }
// - entrada: el nombre "canónico" (para Progreso / cálculos)
// - input: compatibilidad con tu código actual
function normalizeSnap(snap) {
  const s = snap || {};

  const entrada = s.entrada || s.input || null;
  const input = s.input || s.entrada || null; // compat

  const resultado = s.resultado || s.result || null;

  const updatedAt =
    s.updatedAt ||
    s.ts ||
    s.meta?.updatedAt ||
    new Date().toISOString();

  return { entrada, input, resultado, updatedAt };
}

// Guarda snap completo
export function saveJourneyLocal(snap) {
  try {
    const normalized = normalizeSnap(snap);
    localStorage.setItem(LS_JOURNEY_SNAP, JSON.stringify(normalized));
    return normalized;
  } catch {
    return null;
  }
}

// Lee snap completo
export function readJourneyLocal() {
  try {
    const raw = localStorage.getItem(LS_JOURNEY_SNAP);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return normalizeSnap(parsed);
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

// (Opcional) útil para debug
export function getJourneySnapKey() {
  return LS_JOURNEY_SNAP;
}
