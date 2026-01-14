// src/lib/journeyLocal.js

const LS_JOURNEY_SNAP = "hl_journey_snapshot_v1";
const LS_LAST_RESULT = "hl_last_result";

// 🔐 owner + timestamp para validar fallback por usuario
const LS_JOURNEY_OWNER = "hl_journey_owner_email_v1";
const LS_JOURNEY_TS = "hl_journey_ts_v1";

// Helpers
function nowTs() {
  return Date.now();
}

function safeLower(s) {
  return String(s || "").trim().toLowerCase();
}

function inferUserEmail(s) {
  const candidates = [
    s?.userEmail,
    s?.email,
    s?.user?.email,
    s?.customer?.email,
    s?.customerEmail,
    s?.meta?.userEmail,
    s?.meta?.email,
    s?.metadata?.userEmail,
    s?.metadata?.email,
    s?.entrada?.email,
    s?.input?.email,
  ].filter(Boolean);

  const found = candidates.find((x) => String(x).includes("@"));
  return found ? safeLower(found) : "";
}

/**
 * Contrato único:
 * { entrada, input, resultado, updatedAt, ts, userEmail }
 *
 * ✅ NO rejuvenece si ya existía timestamp/updatedAt
 * ✅ Solo crea ts/updatedAt al GUARDAR si faltan
 */
function normalizeSnap(snap, { isWrite = false } = {}) {
  const s = snap || {};

  const entrada = s.entrada || s.input || null;
  const input = s.input || s.entrada || null;
  const resultado = s.resultado || s.result || null;

  // Timestamp preferido: ts (epoch ms)
  let ts = Number(s.ts);
  if (!Number.isFinite(ts) || ts <= 0) {
    const dt = s.updatedAt || s.meta?.updatedAt || s.metadata?.updatedAt;
    const parsed = dt ? Date.parse(dt) : NaN;
    if (Number.isFinite(parsed)) ts = parsed;
  }

  // Solo al escribir: si no existía, asignar ahora
  if ((!Number.isFinite(ts) || ts <= 0) && isWrite) ts = nowTs();

  // updatedAt ISO: derivado de ts si existe
  let updatedAt = s.updatedAt || s.meta?.updatedAt || s.metadata?.updatedAt || "";
  if (!updatedAt) {
    if (Number.isFinite(ts) && ts > 0) updatedAt = new Date(ts).toISOString();
    else if (isWrite) updatedAt = new Date().toISOString();
  }

  // userEmail
  const userEmail = safeLower(s.userEmail || inferUserEmail(s));

  return { entrada, input, resultado, updatedAt, ts, userEmail };
}

/**
 * ✅ Guardar snap completo
 * Puedes pasar opcionalmente { userEmail } si quieres sellarlo desde el caller
 */
export function saveJourneyLocal(snap, opts = {}) {
  try {
    const normalized = normalizeSnap(
      {
        ...(snap || {}),
        // si te pasan email explícito, lo priorizamos
        userEmail: opts?.userEmail || snap?.userEmail || snap?.email,
      },
      { isWrite: true }
    );

    localStorage.setItem(LS_JOURNEY_SNAP, JSON.stringify(normalized));

    // ✅ compat legacy: guardar último resultado también
    if (normalized?.resultado) {
      localStorage.setItem(LS_LAST_RESULT, JSON.stringify(normalized.resultado));
    }

    // 🔐 owner/timestamp auxiliares
    if (normalized.userEmail) localStorage.setItem(LS_JOURNEY_OWNER, normalized.userEmail);
    if (Number.isFinite(normalized.ts) && normalized.ts > 0) {
      localStorage.setItem(LS_JOURNEY_TS, String(normalized.ts));
    }

    return normalized;
  } catch {
    return null;
  }
}

/**
 * ✅ FIX: evitar ReferenceError en producción
 * Algunas partes del frontend están llamando persistLastResult().
 * Lo definimos aquí y lo mantenemos separado del Journey Snap:
 * - Solo guarda el resultado (legacy / quickwin si alguien lo usa)
 * - NO modifica owner/ts (para no “rejuvenecer” el journey)
 */
export function persistLastResult(resultado) {
  try {
    localStorage.setItem(LS_LAST_RESULT, JSON.stringify(resultado || {}));
    return true;
  } catch {
    return false;
  }
}

export function readLastResult() {
  try {
    const raw = localStorage.getItem(LS_LAST_RESULT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function readJourneyLocal() {
  try {
    const raw = localStorage.getItem(LS_JOURNEY_SNAP);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // ✅ al leer NO regeneramos updatedAt/ts
    const normalized = normalizeSnap(parsed, { isWrite: false });

    // Completar email desde owner LS si no existe en snap (sin inventar timestamps)
    if (!normalized.userEmail) {
      const owner = safeLower(localStorage.getItem(LS_JOURNEY_OWNER) || "");
      if (owner.includes("@")) normalized.userEmail = owner;
    }

    // Completar ts desde LS si no existía
    if (!Number.isFinite(normalized.ts) || normalized.ts <= 0) {
      const t = Number(localStorage.getItem(LS_JOURNEY_TS));
      if (Number.isFinite(t) && t > 0) {
        normalized.ts = t;
        if (!normalized.updatedAt) normalized.updatedAt = new Date(t).toISOString();
      }
    }

    return normalized;
  } catch {
    return null;
  }
}

export function clearJourneyLocal() {
  try {
    localStorage.removeItem(LS_JOURNEY_SNAP);
    localStorage.removeItem(LS_LAST_RESULT);
    localStorage.removeItem(LS_JOURNEY_OWNER);
    localStorage.removeItem(LS_JOURNEY_TS);
  } catch {}
}

export function getJourneySnapKey() {
  return LS_JOURNEY_SNAP;
}
