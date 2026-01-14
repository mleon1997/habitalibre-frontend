// src/lib/journeyLocal.js

/* ============================================================
   ✅ REGLA: Journey y Quick deben estar totalmente separados
   - Journey snapshot: hl_journey_snapshot_v1
   - Journey last result: hl_journey_last_result_v1
   - Quick last result: hl_quick_last_result_v1
   - Legacy key (si existe en tu app): hl_last_result (solo compat)
============================================================ */

const LS_JOURNEY_SNAP = "hl_journey_snapshot_v1";

// ✅ Separación total
const LS_JOURNEY_LAST_RESULT = "hl_journey_last_result_v1";
const LS_QUICK_LAST_RESULT = "hl_quick_last_result_v1";

// ⚠️ Legacy (por compat con código viejo). Evita usarlo en nuevo código.
const LS_LAST_RESULT = "hl_last_result";

// 🔐 owner + timestamp para validar fallback por usuario (Journey)
const LS_JOURNEY_OWNER = "hl_journey_owner_email_v1";
const LS_JOURNEY_TS = "hl_journey_ts_v1";

// Helper: lee el entry mode para decidir quick vs journey
const LS_ENTRY_MODE = "hl_entry_mode"; // "quick" | "journey"

/* =========================
   Helpers
========================= */
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

function getMode(optsMode) {
  // prioridad: opts.mode > localStorage hl_entry_mode > "journey"
  try {
    if (optsMode) return String(optsMode);
    const m = localStorage.getItem(LS_ENTRY_MODE);
    return m ? String(m) : "journey";
  } catch {
    return optsMode ? String(optsMode) : "journey";
  }
}

function lastResultKeyForMode(mode) {
  const m = String(mode || "journey").toLowerCase();
  return m === "quick" ? LS_QUICK_LAST_RESULT : LS_JOURNEY_LAST_RESULT;
}

/**
 * Contrato único (Journey snapshot):
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

  // updatedAt ISO: derivado de ts si existe (o solo en write)
  let updatedAt = s.updatedAt || s.meta?.updatedAt || s.metadata?.updatedAt || "";
  if (!updatedAt) {
    if (Number.isFinite(ts) && ts > 0) updatedAt = new Date(ts).toISOString();
    else if (isWrite) updatedAt = new Date().toISOString();
  }

  // userEmail
  const userEmail = safeLower(s.userEmail || inferUserEmail(s));

  return { entrada, input, resultado, updatedAt, ts, userEmail };
}

/* ============================================================
   ✅ API pública (Journey)
============================================================ */

/**
 * ✅ Guardar snapshot Journey completo
 * Puedes pasar opcionalmente { userEmail } para sellarlo desde el caller.
 */
export function saveJourneyLocal(snap, opts = {}) {
  try {
    const normalized = normalizeSnap(
      {
        ...(snap || {}),
        userEmail: opts?.userEmail || snap?.userEmail || snap?.email,
      },
      { isWrite: true }
    );

    localStorage.setItem(LS_JOURNEY_SNAP, JSON.stringify(normalized));

    // 🔐 owner/timestamp auxiliares (Journey)
    if (normalized.userEmail) localStorage.setItem(LS_JOURNEY_OWNER, normalized.userEmail);
    if (Number.isFinite(normalized.ts) && normalized.ts > 0) {
      localStorage.setItem(LS_JOURNEY_TS, String(normalized.ts));
    }

    // ✅ Guardar también lastResult del Journey (separado)
    if (normalized?.resultado) {
      try {
        localStorage.setItem(LS_JOURNEY_LAST_RESULT, JSON.stringify(normalized.resultado));
        // compat legacy (si alguna parte vieja lo usa)
        localStorage.setItem(LS_LAST_RESULT, JSON.stringify(normalized.resultado));
      } catch {}
    }

    return normalized;
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

/**
 * ✅ Limpia SOLO Journey (no toca Quick)
 */
export function clearJourneyLocal() {
  try {
    localStorage.removeItem(LS_JOURNEY_SNAP);
    localStorage.removeItem(LS_JOURNEY_LAST_RESULT);

    // 🔐 auxiliares Journey
    localStorage.removeItem(LS_JOURNEY_OWNER);
    localStorage.removeItem(LS_JOURNEY_TS);

    // legacy (si antes mezclabas, lo limpiamos para evitar contaminación del Journey)
    localStorage.removeItem(LS_LAST_RESULT);
  } catch {}
}

export function getJourneySnapKey() {
  return LS_JOURNEY_SNAP;
}

/* ============================================================
   ✅ FIX: funciones legacy que tu app ya está llamando
   (y que causaban: persistLastResult is not defined)
   - Se auto-separa por hl_entry_mode (quick vs journey)
============================================================ */

/**
 * Guarda el "último resultado" SIN mezclar caminos:
 * - si mode=quick -> hl_quick_last_result_v1
 * - si mode=journey -> hl_journey_last_result_v1
 * - si no pasas mode, usa localStorage.hl_entry_mode
 */
export function persistLastResult(result, opts = {}) {
  try {
    const mode = getMode(opts?.mode);
    const key = lastResultKeyForMode(mode);
    localStorage.setItem(key, JSON.stringify(result || {}));

    // compat legacy: solo si es journey, para no contaminar quick
    if (String(mode).toLowerCase() !== "quick") {
      try {
        localStorage.setItem(LS_LAST_RESULT, JSON.stringify(result || {}));
      } catch {}
    }

    return true;
  } catch {
    return false;
  }
}

export function readLastResult(opts = {}) {
  try {
    const mode = getMode(opts?.mode);
    const key = lastResultKeyForMode(mode);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearLastResult(opts = {}) {
  try {
    const mode = getMode(opts?.mode);
    const key = lastResultKeyForMode(mode);
    localStorage.removeItem(key);

    // compat legacy: si limpias journey, limpia legacy también
    if (String(mode).toLowerCase() !== "quick") {
      try {
        localStorage.removeItem(LS_LAST_RESULT);
      } catch {}
    }

    return true;
  } catch {
    return false;
  }
}


