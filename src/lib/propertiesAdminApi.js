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
  const res = await fetch(`${ADMIN_API_BASE}/properties/admin/all`, {
    method: "GET",
    headers: getAdminHeaders(),
  });

  return parseResponse(res);
}

export async function createAdminProperty(payload) {
  const res = await fetch(`${ADMIN_API_BASE}/properties`, {
    method: "POST",
    headers: getAdminHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(res);
}

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