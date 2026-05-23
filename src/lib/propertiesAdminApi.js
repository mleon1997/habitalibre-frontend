// src/lib/propertiesAdminApi.js

const RAW_API_BASE =
  import.meta.env.VITE_API_BASE || "https://habitalibre-backend.onrender.com";

export const API_BASE = RAW_API_BASE.endsWith("/api")
  ? RAW_API_BASE
  : `${RAW_API_BASE}/api`;

const ADMIN_KEY_STORAGE = "hl_property_admin_key_v1";

export function getPropertyAdminKey() {
  try {
    return localStorage.getItem(ADMIN_KEY_STORAGE) || "";
  } catch {
    return "";
  }
}

export function savePropertyAdminKey(key) {
  try {
    localStorage.setItem(ADMIN_KEY_STORAGE, String(key || "").trim());
  } catch {}
}

export function clearPropertyAdminKey() {
  try {
    localStorage.removeItem(ADMIN_KEY_STORAGE);
  } catch {}
}

function getAdminHeaders() {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-admin-key": getPropertyAdminKey(),
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

export async function listAdminProperties() {
  const res = await fetch(`${API_BASE}/properties?publicado=all`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  return parseResponse(res);
}

export async function createAdminProperty(payload) {
  const res = await fetch(`${API_BASE}/properties`, {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(res);
}

export async function updateAdminProperty(id, payload) {
  const res = await fetch(`${API_BASE}/properties/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: getAdminHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(res);
}

export async function updateAdminPropertyStatus(id, payload) {
  const res = await fetch(
    `${API_BASE}/properties/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      headers: getAdminHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return parseResponse(res);
}

export async function deleteAdminProperty(id) {
  const res = await fetch(`${API_BASE}/properties/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: getAdminHeaders(),
  });

  return parseResponse(res);
}