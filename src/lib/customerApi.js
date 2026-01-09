// src/lib/customerApi.js
const LS_TOKEN = "hl_customer_token";

export function getCustomerToken() {
  try {
    return localStorage.getItem(LS_TOKEN) || "";
  } catch {
    return "";
  }
}

async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data?.error || data?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export async function loginCustomer(payload) {
  return apiFetch("/api/customer-auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function registerCustomer(payload) {
  return apiFetch("/api/customer-auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function meCustomer() {
  const token = getCustomerToken();
  if (!token) return null;

  return apiFetch("/api/customer-auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ✅ acepta override
export async function saveJourney(payload, tokenOverride) {
  const token = tokenOverride || getCustomerToken();
  if (!token) throw new Error("NO_TOKEN");

  return apiFetch("/api/customer/leads/save-journey", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
}
