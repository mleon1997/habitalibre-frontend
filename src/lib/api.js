// src/lib/api.js
// ======================================================================
// API client HabitaLibre
// - DEV: usa proxy de Vite => API_BASE = "" y llamas a /api/...
// - PROD: usa VITE_API_URL o fallback Render
// ======================================================================

const IS_DEV = import.meta.env.DEV;

const VITE_URL_RAW = import.meta.env.VITE_API_URL || "";
const VITE_URL = String(VITE_URL_RAW).replace(/\/$/, "");

export const API_BASE = IS_DEV
  ? ""
  : (VITE_URL || "https://habitalibre-backend.onrender.com");

console.log("[API] IS_DEV:", IS_DEV);
console.log("[API] VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("[API] API_BASE usado:", API_BASE || "(proxy /api)");

// ----------------------------------------------------------------------
// Helpers token
// ----------------------------------------------------------------------
function getCustomerToken(explicitToken) {
  return explicitToken || localStorage.getItem("hl_customer_token") || null;
}

function getAdminToken(explicitToken) {
  return explicitToken || localStorage.getItem("hl_admin_token") || null;
}

// ----------------------------------------------------------------------
// Events de unauthorized
// ----------------------------------------------------------------------
function emitCustomerUnauthorized({ status, path, message }) {
  try {
    window.dispatchEvent(
      new CustomEvent("hl:customer-unauthorized", {
        detail: {
          status,
          path,
          message: message || "Tu sesión expiró. Inicia sesión nuevamente.",
          returnTo:
            window.location?.pathname +
            (window.location?.search || "") +
            (window.location?.hash || ""),
        },
      })
    );
  } catch {
    // ignore
  }
}

function emitAdminUnauthorized({ status, path, message }) {
  try {
    window.dispatchEvent(
      new CustomEvent("hl:admin-unauthorized", {
        detail: {
          status,
          path,
          message: message || "Tu sesión de admin expiró. Inicia sesión nuevamente.",
          returnTo:
            window.location?.pathname +
            (window.location?.search || "") +
            (window.location?.hash || ""),
        },
      })
    );
  } catch {
    // ignore
  }
}

// ----------------------------------------------------------------------
// Helper request (JSON) con timeout + auto token + 401/403 handler
// ----------------------------------------------------------------------
async function request(
  path,
  {
    method = "GET",
    body,
    headers,
    auth = "none", // "none" | "customer" | "admin"
    token, // opcional: token explícito
  } = {},
  timeoutMs = 45000
) {
  const url = `${API_BASE}${path}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);

  // token injection
  let authHeader = {};
  if (auth === "customer") {
    const tkn = getCustomerToken(token);
    if (tkn) authHeader = { Authorization: `Bearer ${tkn}` };
  } else if (auth === "admin") {
    const tkn = getAdminToken(token);
    if (tkn) authHeader = { Authorization: `Bearer ${tkn}` };
  }

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(headers || {}),
        ...(authHeader || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });

    const ct = res.headers.get("content-type") || "";
    const isJson = ct.includes("application/json");
    const data = isJson ? await res.json().catch(() => ({})) : null;

    // ✅ Manejo elegante de auth inválida para CUSTOMER
    if ((res.status === 401 || res.status === 403) && auth === "customer") {
      const msg =
        data?.error ||
        data?.message ||
        "Tu sesión expiró. Inicia sesión nuevamente.";
      try {
        localStorage.removeItem("hl_customer_token");
      } catch {}
      emitCustomerUnauthorized({ status: res.status, path, message: msg });
      throw new Error(msg);
    }

    // ✅ Manejo elegante de auth inválida para ADMIN
    if ((res.status === 401 || res.status === 403) && auth === "admin") {
      const msg =
        data?.error ||
        data?.message ||
        "Tu sesión de admin expiró. Inicia sesión nuevamente.";
      try {
        localStorage.removeItem("hl_admin_token");
      } catch {}
      emitAdminUnauthorized({ status: res.status, path, message: msg });
      throw new Error(msg);
    }

    if (!res.ok) {
      throw new Error(
        data?.error || data?.message || `HTTP ${res.status} en ${path}`
      );
    }

    return data;
  } catch (err) {
    console.error(`[API] ERROR ${method} ${url}:`, err);
    throw err;
  } finally {
    clearTimeout(t);
  }
}

// ----------------------------------------------------------------------
// Wake backend (Render / cold start)
// ✅ usa /api/health para que en DEV pase por proxy también
// ----------------------------------------------------------------------
async function wake() {
  try {
    await fetch(`${API_BASE}/api/health`, { method: "GET" });
  } catch {
    // ignore
  }
}

// ----------------------------------------------------------------------
// ✅ Helpers de normalización para payload de Lead (evita nulls)
// ----------------------------------------------------------------------
const toNumOrUndef = (v) => {
  if (v === null || v === undefined) return undefined;
  const x = Number(String(v).trim());
  return Number.isFinite(x) ? x : undefined;
};

const toBoolOrUndef = (v) => {
  if (v === null || v === undefined) return undefined;
  if (v === true || v === false) return v;
  const s = String(v).trim().toLowerCase();
  if (["true", "1", "si", "sí"].includes(s)) return true;
  if (["false", "0", "no"].includes(s)) return false;
  return undefined;
};

const toStrOrUndef = (v) => {
  const s = String(v ?? "").trim();
  return s ? s : undefined;
};

/**
 * ✅ Construye el payload correcto para /api/leads
 * - contacto: { nombre, email, telefono, ciudad, aceptaTerminos, aceptaCompartir, tiempoCompra, sustentoIndependiente, tipoCompra, tipoCompraNumero }
 * - precalif: el payload que mandaste a /api/precalificar (ingresos, deudas, valor, entrada, estabilidad, iess...)
 * - resultado: respuesta del motor /api/precalificar
 * - extras: override manual
 */
function buildLeadPayloadFromSimulator({
  contacto = {},
  precalif = {},
  resultado,
  extras = {},
}) {
  const p = precalif || {};

  // mapeo flexible por si tus keys varían un poquito en UI
  const ingresoNetoMensual =
    toNumOrUndef(p.ingresoNetoMensual) ??
    toNumOrUndef(p.ingreso_mensual) ??
    toNumOrUndef(p.ingreso) ??
    undefined;

  const ingresoPareja =
    toNumOrUndef(p.ingresoPareja) ??
    toNumOrUndef(p.ingreso_pareja) ??
    toNumOrUndef(p.ingresoParejaMensual) ??
    undefined;

  const otrasDeudasMensuales =
    toNumOrUndef(p.otrasDeudasMensuales) ??
    toNumOrUndef(p.deudaMensualAprox) ??
    toNumOrUndef(p.deuda_mensual_aprox) ??
    toNumOrUndef(p.deudas) ??
    undefined;

  const aniosEstabilidad =
    toNumOrUndef(p.aniosEstabilidad) ??
    toNumOrUndef(p.anios_estabilidad) ??
    toNumOrUndef(p.estabilidad) ??
    undefined;

  const afiliadoIess =
    toBoolOrUndef(p.afiliadoIess) ??
    toBoolOrUndef(p.afiliado_iess) ??
    undefined;

  const valorVivienda =
    toNumOrUndef(p.valorVivienda) ??
    toNumOrUndef(p.valor_vivienda) ??
    toNumOrUndef(p.valor) ??
    undefined;

  const entradaDisponible =
    toNumOrUndef(p.entradaDisponible) ??
    toNumOrUndef(p.entrada_disponible) ??
    toNumOrUndef(p.entrada) ??
    undefined;

  const ciudadCompra =
    toStrOrUndef(p.ciudadCompra) ??
    toStrOrUndef(p.ciudad_compra) ??
    toStrOrUndef(contacto.ciudad) ??
    undefined;

  const edad =
    toNumOrUndef(p.edad) ??
    toNumOrUndef(extras?.edad) ??
    undefined;

  const tipoIngreso =
    toStrOrUndef(p.tipoIngreso) ??
    toStrOrUndef(p.tipo_ingreso) ??
    toStrOrUndef(extras?.tipoIngreso) ??
    undefined;

  // ✅ sinOferta consistente (viene del motor)
  const sinOferta =
    typeof extras?.sinOferta === "boolean"
      ? extras.sinOferta
      : (resultado?.sinOferta ??
          resultado?.flags?.sinOferta ??
          false);

  // payload final: mandamos camelCase + snake_case para compat total
  return {
    // contacto
    nombre: toStrOrUndef(contacto.nombre),
    email: toStrOrUndef(contacto.email),
    telefono: toStrOrUndef(contacto.telefono),
    ciudad: toStrOrUndef(contacto.ciudad),

    aceptaTerminos: !!contacto.aceptaTerminos,
    aceptaCompartir: !!contacto.aceptaCompartir,

    tiempoCompra: toStrOrUndef(contacto.tiempoCompra),
    sustentoIndependiente: toStrOrUndef(contacto.sustentoIndependiente),

    tipoCompra: toStrOrUndef(contacto.tipoCompra),
    tipoCompraNumero: toNumOrUndef(contacto.tipoCompraNumero),

    // ============================
    // ✅ CANÓNICOS (camelCase)
    // ============================
    afiliadoIess,
    aniosEstabilidad,
    ingresoNetoMensual,
    ingresoPareja,
    otrasDeudasMensuales,
    ciudadCompra,
    valorVivienda,
    entradaDisponible,
    edad,
    tipoIngreso,

    // ============================
    // ✅ BACKEND/BD (snake_case)
    // (esto evita nulls en tu dashboard/PDF)
    // ============================
    afiliado_iess: afiliadoIess,
    anios_estabilidad: aniosEstabilidad,
    ingreso_mensual: ingresoNetoMensual, // si quieres TOTAL con pareja, lo cambiamos aquí
    deuda_mensual_aprox: otrasDeudasMensuales,
    ciudad_compra: ciudadCompra,
    valor_vivienda: valorVivienda,
    entrada_disponible: entradaDisponible,
    tipo_ingreso: tipoIngreso,

    // flags
    sinOferta,

    // motor
    resultado,

    // overrides
    ...(extras || {}),
  };
}

// ======================================================================
// PUBLIC
// ======================================================================
export async function precalificar(payload) {
  await wake();
  return request(
    "/api/precalificar",
    { method: "POST", body: payload, auth: "none" },
    45000
  );
}

/**
 * Backwards-compatible: manda lo que le pases.
 * ⚠️ Si aquí NO mandas ingreso/deudas/estabilidad/IESS, el dashboard seguirá null.
 */
export async function crearLead(payload) {
  await wake();
  return request(
    "/api/leads",
    { method: "POST", body: payload, auth: "none" },
    45000
  );
}

/**
 * ✅ RECOMENDADO: úsalo desde el simulador
 * - Esto asegura que se manden ingreso/deudas/estabilidad/IESS/valor/entrada al backend
 * - Resultado: tu dashboard deja de mostrar null en esos campos
 */
export async function crearLeadDesdeSimulador(payload) {
  console.log("🚀 API crearLeadDesdeSimulador payload:", payload);

  const url = `${API_BASE}/api/leads/desde-simulador`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let data = null;
  try {
    data = await resp.json();
  } catch (e) {
    console.error("❌ No se pudo parsear JSON", e);
  }

  console.log("📡 API response:", data);

  if (!resp.ok) {
    return {
      ok: false,
      error: data?.error || "Error al enviar lead",
    };
  }

  return {
    ok: true,
    data,
  };
}


// ======================================================================
// CUSTOMER AUTH (Journey)
// ======================================================================
export async function loginCustomer(payload) {
  await wake();
  return request(
    "/api/customer-auth/login",
    { method: "POST", body: payload, auth: "none" },
    30000
  );
}

export async function registerCustomer(payload) {
  await wake();
  return request(
    "/api/customer-auth/register",
    { method: "POST", body: payload, auth: "none" },
    30000
  );
}

export async function meCustomer(token) {
  await wake();
  return request(
    "/api/customer-auth/me",
    { method: "GET", auth: "customer", token },
    30000
  );
}

// ======================================================================
// ADMIN
// ======================================================================
export async function listarLeads({ pagina = 1, limit = 10 } = {}) {
  await wake();
  return request(
    `/api/leads?pagina=${encodeURIComponent(pagina)}&limit=${encodeURIComponent(
      limit
    )}`,
    { method: "GET", auth: "admin" },
    30000
  );
}

export async function statsLeads() {
  await wake();
  return request("/api/leads/stats", { method: "GET", auth: "admin" }, 30000);
}

export async function updateLead(id, payload) {
  await wake();
  return request(
    `/api/leads/${id}`,
    { method: "PUT", auth: "admin", body: payload || {} },
    30000
  );
}

// ======================================================================
// ✅ exports compat: named `api` + default
// ======================================================================
export const api = {
  precalificar,
  crearLead,
  crearLeadDesdeSimulador, // ✅ NUEVO
  loginCustomer,
  registerCustomer,
  meCustomer,
  listarLeads,
  statsLeads,
  updateLead,
};

export default api;
