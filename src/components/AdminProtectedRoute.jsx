// src/components/AdminProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function hasAdminToken() {
  try {
    return !!localStorage.getItem("hl_admin_token");
  } catch {
    return false;
  }
}

export default function AdminProtectedRoute({ children }) {
  const loc = useLocation();
  if (!hasAdminToken()) {
    return <Navigate to="/admin" replace state={{ from: loc.pathname }} />;
  }
  return children;
}
