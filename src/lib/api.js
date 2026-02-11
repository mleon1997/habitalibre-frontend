// src/lib/api.js

// =====================================================
// Config base
// =====================================================
const env = import.meta?.env || {};
const IS_DEV = !!env.DEV;

const pick = (...vals) => {
  for (const v of vals) {
    if (v == null) continue;
    const s = String(v).trim();
    if (s) return s;
  }
  return "";
};

// Soporta varios nombres por si cambiaste env vars
const API_BASE = pick(
  env.VITE_API_URL,
  env.VITE_API_BASE,
  env.VITE_BACKEND_URL,
  env.VITE_SERVER_URL,
  env.VITE_API,
  "http://localhost:3001"
).replace(/\/+$/, "");

// Debug toggle: DEV o localStorage HL_DEBUG=1
const DEBUG =
  IS_DEV ||
  (typeof window !== "undefined" &&
    (window?.localStorage?.getItem("HL_DEBUG") === "1" ||
      window?.localStorage?.getItem("HL_DEBUG") === "true"));

try {
  console.log("[API] IS_DEV:", IS_DEV);
  console.log("[API] API_BASE usado:", API_BASE);
} catch (_) {}

// =====================================================
// Helpers
// =====================================================
const safeJson = async (res) => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const shortId = () => Math.random().toString(36).slice(2, 7);

function normalizeErrorMessage(payload, fallback = "Error de red") {
  if (!payload) return fallback;
  if (typeof payload === "string") return payload;
  return (
    payload?.error ||
    payload?.message ||
    payload?.mensaje ||
    payload?.msg ||
    fallback
  );
}

function tryParseJson(body) {
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

function buildQuery(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v == null) return;
    const s = String(v).trim();
    if (!s) return;
    qs.set(k, s);
  });
  const out = qs.toString();
  return out ? `?${out}` : "";
}

// =====================================================
// ✅ Tokens (ADMIN vs CUSTOMER)
// =====================================================
function getAdminToken() {
  try {
    return (
      window.localStorage.getItem("hl_admin_token") ||
      window.localStorage.getItem("adminToken") ||
      window.localStorage.getItem("HL_TOKEN") ||
      window.localStorage.getItem("token") ||
      null
    );
  } catch {
    return null;
  }
}

function getCustomerToken() {
  try {
    return (
      window.localStorage.getItem("hl_customer_token") || // ✅ tu CustomerAuthContext usa este
      window.localStorage.getItem("customerToken") ||
      window.localStorage.getItem("HL_CUSTOMER_TOKEN") ||
      null
    );
  } catch {
    return null;
  }
}

/**
 * ✅ Selecciona token según endpoint (SIN CONTAMINAR)
 * - /api/admin/... => admin token
 * - /api/customer-auth/... o /api/customer/... => customer token
 * - resto => NO adjunta token por defecto
 */
function getStoredTokenForPath(path = "") {
  const p = String(path || "");

  const isAdminEndpoint = p.startsWith("/api/admin") || p.includes("/api/admin/");
  if (isAdminEndpoint) return getAdminToken();

  const isCustomerEndpoint =
    p.startsWith("/api/customer-auth") ||
    p.includes("/api/customer-auth/") ||
    p.startsWith("/api/customer") ||
    p.includes("/api/customer/");

  if (isCustomerEndpoint) return getCustomerToken();

  // ✅ por defecto: NO metas tokens donde no corresponde
  return null;
}

// =====================================================
// Normalización LEAD (clave para evitar 400)
// =====================================================
const toNum = (v) => {
  if (v == null) return null;
  const n = Number(String(v).trim());
  return Number.isFinite(n) ? n : null;
};

const toBool = (v) => {
  if (v === true || v === false) return v;
  const s = String(v ?? "").trim().toLowerCase();
  if (["si", "sí", "true", "1"].includes(s)) return true;
  if (["no", "false", "0"].includes(s)) return false;
  return null;
};

function flattenLeadPayload(raw = {}) {
  const looksFlat =
    raw &&
    (raw.nombre || raw.email || raw.telefono) &&
    (raw.afiliado_iess != null ||
      raw.anios_estabilidad != null ||
      raw.ingreso_mensual != null ||
      raw.valor_vivienda != null ||
      raw.entrada_disponible != null);

  if (looksFlat) return raw;

  const contacto = raw?.contacto || raw || {};
  const precalif = raw?.precalif || {};
  const resultado = raw?.resultado ?? raw?.result ?? null;

  const afiliadoIess = toBool(precalif.afiliadoIess ?? precalif.afiliado_iess);
  const aniosEstabilidad = toNum(
    precalif.aniosEstabilidad ?? precalif.anios_estabilidad
  );
  const ingresoMensual = toNum(
    precalif.ingresoNetoMensual ?? precalif.ingreso_mensual
  );
  const ingresoPareja = toNum(precalif.ingresoPareja ?? precalif.ingreso_pareja);
  const deudaMensual = toNum(
    precalif.otrasDeudasMensuales ?? precalif.deuda_mensual_aprox
  );
  const ciudadCompra =
    (precalif.ciudadCompra ?? precalif.ciudad_compra ?? null) || null;

  const tipoCompra =
    (precalif.tipoCompra ?? precalif.tipo_compra ?? null) || null;
  const tipoCompraNumero = toNum(
    precalif.tipoCompraNumero ?? precalif.tipo_compra_numero
  );

  const valorVivienda = toNum(
    precalif.valorVivienda ?? precalif.valor_vivienda ?? precalif.valor
  );
  const entradaDisponible = toNum(
    precalif.entradaDisponible ??
      precalif.entrada_disponible ??
      precalif.entrada
  );

  const edad = toNum(precalif.edad);
  const tipoIngreso =
    (precalif.tipoIngreso ?? precalif.tipo_ingreso ?? null) || null;

  const nombre = String(contacto.nombre ?? "").trim() || null;
  const email = String(contacto.email ?? "").trim() || null;
  const telefono = String(contacto.telefono ?? "").trim() || null;
  const ciudad = String(contacto.ciudad ?? "").trim() || null;

  const out = {
    nombre,
    email,
    telefono,
    ciudad,

    aceptaTerminos: !!contacto.aceptaTerminos,
    aceptaCompartir: !!contacto.aceptaCompartir,
    aceptaMarketing: !!contacto.aceptaMarketing,

    tiempoCompra: contacto.tiempoCompra ?? null,
    origen: contacto.origen ?? "Simulador Hipoteca Exprés",
    canal: contacto.canal ?? "web",
    fuente: contacto.fuente ?? "form",

    afiliado_iess: afiliadoIess,
    anios_estabilidad: aniosEstabilidad,
    ingreso_mensual: ingresoMensual,
    ingreso_pareja: ingresoPareja,
    deuda_mensual_aprox: deudaMensual,
    ciudad_compra: ciudadCompra,
    tipo_compra: tipoCompra,
    tipo_compra_numero: tipoCompraNumero,
    valor_vivienda: valorVivienda,
    entrada_disponible: entradaDisponible,
    edad,
    tipo_ingreso: tipoIngreso,

    resultado: resultado,
  };

  Object.keys(out).forEach((k) => {
    if (out[k] === undefined) delete out[k];
  });

  return out;
}

// =====================================================
// Unauthorized event dispatcher (scoped)
// =====================================================
function getScopeForPath(path = "") {
  const p = String(path || "");
  if (p.startsWith("/api/admin") || p.includes("/api/admin/")) return "admin";
  if (
    p.startsWith("/api/customer-auth") ||
    p.includes("/api/customer-auth/") ||
    p.startsWith("/api/customer") ||
    p.includes("/api/customer/")
  )
    return "customer";
  return "";
}

function getReturnToHashRouter() {
  try {
    const h = String(window.location.hash || "");
    if (h.startsWith("#")) return h.slice(1) || "/";
    return "/";
  } catch {
    return "/";
  }
}

function dispatchUnauthorized(scope, message, path) {
  try {
    if (!scope) return;

    const eventName =
      scope === "admin" ? "hl:admin-unauthorized" : "hl:customer-unauthorized";

    window.dispatchEvent(
      new CustomEvent(eventName, {
        detail: {
          scope,
          message,
          path: String(path || ""),
          returnTo: getReturnToHashRouter(),
        },
      })
    );
  } catch (_) {}
}

// =====================================================
// Core fetch wrapper
// =====================================================
export async function apiFetch(path, opts = {}) {
  const rid = shortId();

  const url = path.startsWith("http")
    ? path
    : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const method = (opts.method || "GET").toUpperCase();

  const headers = {
    ...(opts.headers || {}),
  };

  const isFormData =
    typeof FormData !== "undefined" && opts.body instanceof FormData;

  if (!isFormData && !headers["Content-Type"] && !headers["content-type"]) {
    headers["Content-Type"] = "application/json";
  }

  // ✅ auth token optional (elige customer vs admin según path)
  // ✅ y respeta Authorization si ya lo pasaste
  const storedToken = getStoredTokenForPath(path);
  if (storedToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${storedToken}`;
  }

  const finalOpts = {
    ...opts,
    method,
    headers,
    credentials: opts.credentials || "omit",
  };

  if (DEBUG) {
    console.log(`[${rid}] [API] -> ${method} ${url}`, {
      headers,
      body:
        finalOpts.body && !isFormData
          ? tryParseJson(finalOpts.body)
          : isFormData
          ? "[FormData]"
          : undefined,
    });
  }

  let res;
  try {
    res = await fetch(url, finalOpts);
  } catch (e) {
    if (DEBUG) console.error(`[${rid}] [API] fetch failed`, e);
    return { ok: false, error: e?.message || "No se pudo conectar" };
  }

  const payload = await safeJson(res);

  if (DEBUG) {
    console.log(`[${rid}] [API] <- ${method} ${url} [${res.status}]`, payload);
  }

  // ✅ Auto-dispatch unauthorized con scope correcto
  if (res.status === 401 || res.status === 403) {
    const scope = getScopeForPath(path);
    const msg = normalizeErrorMessage(payload, "No autorizado");
    dispatchUnauthorized(scope, msg, path);
  }

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: normalizeErrorMessage(payload, `HTTP ${res.status}`),
      payload,
    };
  }

  return { ok: true, status: res.status, data: payload };
}

// =====================================================
// Endpoints HabitaLibre
// =====================================================

// 0) ✅ ME Customer (para CustomerProtectedRoute)
export async function meCustomer(token) {
  const t = String(token || "").trim();
  const headers = t ? { Authorization: `Bearer ${t}` } : undefined;

  return apiFetch("/api/customer-auth/me", {
    method: "GET",
    headers,
  });
}

// 1) ✅ Precalificar (IMPORTANTÍSIMO: adjunta token customer si existe)
export async function precalificar(payload) {
  const t = getCustomerToken(); // ✅ ahora sí le llega userId al backend

  const resp = await apiFetch("/api/precalificar", {
    method: "POST",
    headers: t ? { Authorization: `Bearer ${t}` } : undefined,
    body: JSON.stringify(payload || {}),
  });

  if (!resp.ok) return resp;
  return { ok: true, ...resp.data };
}

// 2) Crear lead desde simulador
export async function crearLeadDesdeSimulador(payload) {
  const bodyPlano = flattenLeadPayload(payload || {});

  const attempt1 = await apiFetch("/api/leads", {
    method: "POST",
    body: JSON.stringify(bodyPlano),
  });
  if (attempt1.ok) return attempt1.data;

  if (attempt1.status === 404) {
    const attempt2 = await apiFetch("/api/leads/crear", {
      method: "POST",
      body: JSON.stringify(bodyPlano),
    });
    if (attempt2.ok) return attempt2.data;

    const attempt3 = await apiFetch("/api/leads/crear-desde-simulador", {
      method: "POST",
      body: JSON.stringify(bodyPlano),
    });
    if (attempt3.ok) return attempt3.data;

    return attempt3;
  }

  return attempt1;
}

// 3) LISTAR LEADS
export async function listarLeads(params = {}) {
  const qs = buildQuery(params);

  const r1 = await apiFetch(`/api/leads${qs}`, { method: "GET" });
  if (r1.ok) return r1.data;

  if (r1.status === 404) {
    const r2 = await apiFetch(`/api/admin/leads${qs}`, { method: "GET" });
    if (r2.ok) return r2.data;

    const r3 = await apiFetch(`/api/leads/listar${qs}`, { method: "GET" });
    if (r3.ok) return r3.data;

    return r3;
  }

  return r1;
}

// 4) Login admin
export async function adminLogin(email, password) {
  const r1 = await apiFetch("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (r1.ok) return r1;

  if (r1.status === 404) {
    const r2 = await apiFetch("/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return r2;
  }

  return r1;
}

export { API_BASE, IS_DEV };
