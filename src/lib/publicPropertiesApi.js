// src/lib/publicPropertiesApi.js

const API_BASE =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:4000";

function normalizeApiBase(base) {
  return String(base || "").replace(/\/$/, "");
}

const BASE = normalizeApiBase(API_BASE);

async function fetchJson(url) {
  const response = await fetch(url);
  const data = await response.json().catch(() => null);

  if (!response.ok || data?.ok === false) {
    throw new Error(data?.message || "No se pudo cargar la información.");
  }

  return data;
}

export async function getPublicProperties({
  destacadas = false,
  limit = 3,
  filters = {},
} = {}) {
  const params = new URLSearchParams();

  if (destacadas) params.set("destacadas", "true");
  if (limit) params.set("limit", String(limit));

  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      params.set(key, String(value));
    }
  });

  const url = `${BASE}/api/properties/public?${params.toString()}`;
  const data = await fetchJson(url);

  return data.properties || [];
}

export async function getFeaturedPublicProperties(limit = 3) {
  const featured = await getPublicProperties({
    destacadas: true,
    limit,
  });

  // Fallback: si no hay destacadas, trae propiedades públicas normales.
  if (featured.length > 0) return featured;

  return getPublicProperties({
    destacadas: false,
    limit,
  });
}

export async function getPublicPropertyBySlug(slug) {
  if (!slug) throw new Error("Slug requerido.");

  const url = `${BASE}/api/properties/public/${encodeURIComponent(slug)}`;
  const data = await fetchJson(url);

  return data.property || null;
}