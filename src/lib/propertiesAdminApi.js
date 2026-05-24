// src/lib/propertiesAdminApi.js
import { API_BASE } from "./api";

const ADMIN_API_BASE = String(API_BASE || "").endsWith("/api")
  ? String(API_BASE || "")
  : `${String(API_BASE || "").replace(/\/$/, "")}/api`;

const ADMIN_TOKEN_KEY = "hl_admin_token";

function getAdminToken() {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

function getAdminHeaders() {
  const token = getAdminToken();

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

function getAdminAuthHeaders() {
  const token = getAdminToken();

  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
}

async function parseResponse(res) {
  const data = await res.json().catch(() => null);

  if (!res.ok || data?.ok === false) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Error ${res.status}: no se pudo completar la acción.`
    );
  }

  return data;
}

async function parseBlobError(res) {
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = await res.json().catch(() => null);
    return (
      data?.message ||
      data?.error ||
      `Error ${res.status}: no se pudo descargar el archivo.`
    );
  }

  const text = await res.text().catch(() => "");
  return text || `Error ${res.status}: no se pudo descargar el archivo.`;
}

function getFilenameFromDisposition(disposition) {
  if (!disposition) return "";

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1].replace(/["]/g, ""));
  }

  const normalMatch = disposition.match(/filename="?([^"]+)"?/i);
  if (normalMatch?.[1]) {
    return normalMatch[1].replace(/["]/g, "");
  }

  return "";
}

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename || `archivo-${Date.now()}.xlsx`;

  document.body.appendChild(a);
  a.click();
  a.remove();

  window.URL.revokeObjectURL(url);
}

/**
 * Admin: listar inventario completo.
 */
export async function listAdminProperties() {
  const res = await fetch(`${ADMIN_API_BASE}/properties/admin/all`, {
    method: "GET",
    headers: getAdminHeaders(),
  });

  return parseResponse(res);
}

/**
 * Admin: crear propiedad manual.
 */
export async function createAdminProperty(payload) {
  const res = await fetch(`${ADMIN_API_BASE}/properties`, {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(res);
}

/**
 * Admin: actualizar propiedad manual.
 */
export async function updateAdminProperty(id, payload) {
  const res = await fetch(
    `${ADMIN_API_BASE}/properties/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: getAdminHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return parseResponse(res);
}

/**
 * Admin: cambiar estado comercial/publicación.
 */
export async function updateAdminPropertyStatus(id, payload) {
  const res = await fetch(
    `${ADMIN_API_BASE}/properties/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      headers: getAdminHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return parseResponse(res);
}

/**
 * Admin: eliminar propiedad.
 */
export async function deleteAdminProperty(id) {
  const res = await fetch(
    `${ADMIN_API_BASE}/properties/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: getAdminHeaders(),
    }
  );

  return parseResponse(res);
}

/**
 * Admin: descargar plantilla Excel de propiedades.
 */
export async function downloadPropertiesTemplate() {
  const res = await fetch(`${ADMIN_API_BASE}/properties/admin/bulk/template`, {
    method: "GET",
    headers: getAdminAuthHeaders(),
  });

  if (!res.ok) {
    const message = await parseBlobError(res);
    throw new Error(message);
  }

  const blob = await res.blob();

  const filename =
    getFilenameFromDisposition(res.headers.get("content-disposition")) ||
    "plantilla-propiedades-habitalibre.xlsx";

  downloadBlob(blob, filename);

  return {
    ok: true,
    filename,
  };
}

/**
 * Admin: previsualizar carga masiva Excel.
 * No guarda nada todavía.
 */
export async function previewPropertiesExcel(file) {
  if (!file) {
    throw new Error("Selecciona un archivo Excel primero.");
  }

  const formData = new FormData();
  formData.append("archivo", file);

  const res = await fetch(`${ADMIN_API_BASE}/properties/admin/bulk/preview`, {
    method: "POST",
    headers: getAdminAuthHeaders(),
    body: formData,
  });

  return parseResponse(res);
}

/**
 * Admin: confirmar carga masiva.
 * Recibe las filas válidas devueltas por preview.validRows.
 */
export async function confirmPropertiesBulk(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("No hay filas válidas para confirmar.");
  }

  const res = await fetch(`${ADMIN_API_BASE}/properties/admin/bulk/confirm`, {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify({ rows }),
  });

  return parseResponse(res);
}