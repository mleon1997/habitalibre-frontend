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

    // padding base64 si falta
    const pad = "=".repeat((4 - (b64.length % 4)) % 4);
    const b64p = b64 + pad;

    const json = decodeURIComponent(
      atob(b64p)
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
    localStorage.removeItem("hl_admin_email");
  } catch {}
}

function isExpired(payload) {
  // exp viene en segundos (epoch)
  const exp = Number(payload?.exp || 0);
  if (!exp) return false; // MVP: si no hay exp, lo dejamos pasar
  const nowSec = Math.floor(Date.now() / 1000);
  return nowSec >= exp;
}

export default function AdminProtectedRoute({ children }) {
  const loc = useLocation();

  let token = "";
  try {
    token = localStorage.getItem(ADMIN_TOKEN_KEY) || "";
  } catch {}

  // ✅ usamos returnTo para ser compatible con AdminAuthListener + AdminLogin
  const returnTo = encodeURIComponent(
    loc.pathname + (loc.search || "") + (loc.hash || "")
  );

  if (!token) {
    return <Navigate to={`/admin?returnTo=${returnTo}`} replace />;
  }

  const payload = decodeJwtPayload(token);

  // token inválido
  if (!payload) {
    clearAdminToken();
    return <Navigate to={`/admin?returnTo=${returnTo}`} replace />;
  }

  // expirado
  if (isExpired(payload)) {
    clearAdminToken();
    return <Navigate to={`/admin?returnTo=${returnTo}`} replace />;
  }

  return children;
}
