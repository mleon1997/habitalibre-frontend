// src/pages/Admin.jsx
import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminLogin from "../components/AdminLogin.jsx";

const LS_ADMIN_TOKEN = "hl_admin_token";

// --- helpers JWT (igual que AdminProtectedRoute) ---
function decodeJwtPayload(token) {
  try {
    const parts = String(token || "").split(".");
    if (parts.length !== 3) return null;

    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = "=".repeat((4 - (b64.length % 4)) % 4);
    const json = decodeURIComponent(
      atob(b64 + pad)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isExpired(payload) {
  const exp = Number(payload?.exp || 0);
  if (!exp) return false;
  const nowSec = Math.floor(Date.now() / 1000);
  return nowSec >= exp;
}

function clearAdminSession() {
  try {
    localStorage.removeItem(LS_ADMIN_TOKEN);
    localStorage.removeItem("hl_admin_email");
  } catch {}
}

export default function Admin() {
  const nav = useNavigate();
  const loc = useLocation();

  const params = new URLSearchParams(loc.search || "");
  const returnTo = params.get("returnTo") || "/admin/leads";

  const token = useMemo(() => {
    try {
      return localStorage.getItem(LS_ADMIN_TOKEN) || "";
    } catch {
      return "";
    }
  }, []);

  // Si ya hay token válido, no muestres login: redirige al destino
  const canAutoEnter = useMemo(() => {
    if (!token) return false;
    const payload = decodeJwtPayload(token);
    if (!payload) return false;
    if (isExpired(payload)) return false;
    return true;
  }, [token]);

  React.useEffect(() => {
    if (canAutoEnter) {
      nav(returnTo, { replace: true });
    } else if (token) {
      // había token pero es inválido/expirado
      clearAdminSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAutoEnter, returnTo]);

  return (
    <AdminLogin
      onSuccess={() => {
        // AdminLogin ya guarda token + navega al returnTo (lo dejamos también aquí por seguridad)
        nav(returnTo, { replace: true });
      }}
    />
  );
}
