// src/journey/journey.store.js
import { JOURNEY_STORAGE_KEY, createEmptyJourney, nowISO } from "./journey.types";

/**
 * Lee snapshot desde localStorage
 */
export function readJourney() {
  try {
    const raw = localStorage.getItem(JOURNEY_STORAGE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== "object") return null;
    return obj;
  } catch {
    return null;
  }
}

/**
 * Devuelve snapshot garantizado (si no existe, crea uno)
 */
export function getJourney() {
  const snap = readJourney();
  if (snap) return snap;
  const fresh = createEmptyJourney();
  try {
    localStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify(fresh));
  } catch {}
  return fresh;
}

/**
 * Guarda snapshot completo
 */
export function setJourney(nextSnap) {
  try {
    localStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify(nextSnap));
  } catch {}
  return nextSnap;
}

/**
 * Patch (merge) seguro de journey
 * - input: merge profundo nivel 1
 * - resultado: reemplaza si viene
 */
export function patchJourney(patch = {}) {
  const current = getJourney();

  const next = {
    ...current,
    ...patch,
    input: {
      ...(current.input || {}),
      ...((patch.input && typeof patch.input === "object") ? patch.input : {}),
    },
    updatedAt: nowISO(),
  };

  // resultado: si viene explícito (aunque sea null) lo respetamos
  if (Object.prototype.hasOwnProperty.call(patch, "resultado")) {
    next.resultado = patch.resultado;
  }

  return setJourney(next);
}

/**
 * Helpers rápidos
 */
export function setJourneyStep(step) {
  const safe = Number(step);
  return patchJourney({ step: Number.isFinite(safe) ? safe : 1 });
}

export function setJourneyEtapa(etapa) {
  const safe = etapa ? String(etapa).slice(0, 120) : "sync";
  return patchJourney({ etapa: safe });
}

export function setJourneyInput(inputObj) {
  return patchJourney({ input: inputObj });
}

export function setJourneyResultado(resultadoObj) {
  return patchJourney({ resultado: resultadoObj });
}

export function clearJourney() {
  try {
    localStorage.removeItem(JOURNEY_STORAGE_KEY);
  } catch {}
}

/**
 * Utilidad: detecta si hay resultado ya guardado
 */
export function hasJourneyResult() {
  const snap = readJourney();
  return Boolean(snap?.resultado && typeof snap.resultado === "object" && Object.keys(snap.resultado).length > 0);
}
