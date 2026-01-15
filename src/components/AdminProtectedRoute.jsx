// src/components/AdminProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ADMIN_TOKEN_KEY = "hl_admin_token";

export default function AdminProtectedRoute({ children }) {
  const loc = useLocation();

  let token = "";
  try {
    token = localStorage.getItem(ADMIN_TOKEN_KEY) || "";
  } catch {}

  if (!token) {
    // manda al login admin y guarda a dónde quería ir
    const next = encodeURIComponent(loc.pathname + (loc.search || ""));
    return <Navigate to={`/admin?next=${next}`} replace />;
  }

  return children;
}
