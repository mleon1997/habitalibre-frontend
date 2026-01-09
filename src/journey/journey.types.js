// src/journey/journey.types.js

export const JOURNEY_STORAGE_KEY = "hl_journey_v1";

export const JourneyEtapas = {
  PASO_1_DRAFT: "paso_1_draft",
  PASO_2_DRAFT: "paso_2_draft",
  PASO_3_DRAFT: "paso_3_draft",
  PASO_4_DRAFT: "paso_4_draft",
  RESULTADO_OK: "resultado_ok",
};

export function nowISO() {
  return new Date().toISOString();
}

/**
 * Snapshot estándar del journey en localStorage
 */
export function createEmptyJourney() {
  return {
    version: "v1",
    step: 1,
    etapa: JourneyEtapas.PASO_1_DRAFT,
    input: {},       // inputs del simulador
    resultado: null, // resultado de precalificar
    updatedAt: nowISO(),
    syncedAt: null,
  };
}
