// src/components/AdminProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ADMIN_TOKEN_KEY = "hl_admin_token";

// decodifica payload JWT (sin verificar firma, solo para leer exp)
function decodeJwtPayload(token) {
  try {
    const parts = String(token || "").split(".");
    if (parts.length !== 3) return null;

    // base64url -> base64
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(b64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function clearAdminToken() {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {}
}

function isExpired(payload) {
  // exp viene en segundos (epoch)
  const exp = Number(payload?.exp || 0);
  if (!exp) return false; // si no hay exp, lo dejamos pasar (MVP)
  const nowSec = Math.floor(Date.now() / 1000);
  return nowSec >= exp;
}

export default function AdminProtectedRoute({ children }) {
  const loc = useLocation();

  let token = "";
  try {
    token = localStorage.getItem(ADMIN_TOKEN_KEY) || "";
  } catch {}

  const next = encodeURIComponent(loc.pathname + (loc.search || ""));

  if (!token) {
    return <Navigate to={`/admin?next=${next}`} replace />;
  }

  const payload = decodeJwtPayload(token);

  // si no se puede decodificar → token inválido
  if (!payload) {
    clearAdminToken();
    return <Navigate to={`/admin?next=${next}`} replace />;
  }

  // si expiró → logout y al login
  if (isExpired(payload)) {
    clearAdminToken();
    return <Navigate to={`/admin?next=${next}`} replace />;
  }

  return children;
}
