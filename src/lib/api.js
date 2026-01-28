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
 * IMPORTANTE: tu BD (LeadSchema) usa snake_case:
 *  - tipo_ingreso, valor_vivienda, entrada_disponible, afiliado_iess, etc.
 * Este helper manda snake_case para que NO queden null.
 */
function buildLeadPayloadFromSimulator({ contacto = {}, precalif = {}, resultado, extras = {} }) {
  const p = precalif || {};

  // ----------------------------
  // 1) Canonizar inputs (camel)
  // ----------------------------
  const ingresoNetoMensual =
    toNumOrUndef(p.ingresoNetoMensual) ??
    toNumOrUndef(p.ingreso_mensual) ??
    toNumOrUndef(p.ingreso) ??
    undefined;

  const ingresoPareja =
    toNumOrUndef(p.ingresoPareja) ??
    toNumOrUndef(p.ingreso_pareja) ??
    undefined;

  const ingresoTotal =
    (ingresoNetoMensual != null || ingresoPareja != null)
      ? Number(ingresoNetoMensual || 0) + Number(ingresoPareja || 0)
      : undefined;

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

  const edad =
    toNumOrUndef(p.edad) ??
    undefined;

  const tipoIngreso =
    toStrOrUndef(p.tipoIngreso) ??
    toStrOrUndef(p.tipo_ingreso) ??
    undefined;

  const ciudadCompra =
    toStrOrUndef(p.ciudadCompra) ??
    toStrOrUndef(p.ciudad_compra) ??
    toStrOrUndef(contacto.ciudad) ??
    undefined;

  const tipoCompra =
    toStrOrUndef(p.tipoCompra) ??
    toStrOrUndef(p.tipo_compra) ??
    undefined;

  const tipoCompraNumero =
    toNumOrUndef(p.tipoCompraNumero) ??
    toNumOrUndef(p.tipo_compra_numero) ??
    undefined;

  // ----------------------------
  // 2) Payload FINAL (snake_case)
  // ----------------------------
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

    // ✅ CAMPOS PLANOS QUE TU BD ESPERA (snake_case)
    edad,
    tipo_ingreso: tipoIngreso,
    valor_vivienda: valorVivienda,
    entrada_disponible: entradaDisponible,

    afiliado_iess: afiliadoIess,
    anios_estabilidad: aniosEstabilidad,
    ingreso_mensual: ingresoTotal ?? ingresoNetoMensual, // fallback
    deuda_mensual_aprox: otrasDeudasMensuales,
    ciudad_compra: ciudadCompra,

    tipo_compra: tipoCompra,
    tipo_compra_numero: tipoCompraNumero,

    // motor
    resultado,

    // ✅ opcional: también mandamos camelCase por compat/debug (no estorba)
    afiliadoIess,
    aniosEstabilidad,
    ingresoNetoMensual,
    ingresoPareja,
    otrasDeudasMensuales,
    ciudadCompra,
    valorVivienda,
    entradaDisponible,
    tipoIngreso,

    // overrides si quieres forzar algo
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

export async function crearLead(payload) {
  await wake();
  return request(
    "/api/leads",
    { method: "POST", body: payload, auth: "none" },
    45000
  );
}

export async function crearLeadDesdeSimulador({ contacto, precalif, resultado, extras } = {}) {
  const body = buildLeadPayloadFromSimulator({ contacto, precalif, resultado, extras });
  return crearLead(body);
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
    `/api/leads?pagina=${encodeURIComponent(pagina)}&limit=${encodeURIComponent(limit)}`,
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
  crearLeadDesdeSimulador,
  loginCustomer,
  registerCustomer,
  meCustomer,
  listarLeads,
  statsLeads,
  updateLead,
};

export default api;
