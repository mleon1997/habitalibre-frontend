// src/components/CustomerAuthListener.jsx
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";

export default function CustomerAuthListener() {
  const navigate = useNavigate();
  const location = useLocation();
  const { onUnauthorized } = useCustomerAuth();

  useEffect(() => {
    const handler = (ev) => {
      const detail = ev?.detail || {};
      const message =
        detail?.message || "Tu sesión expiró. Inicia sesión nuevamente.";

      // limpia auth + guarda mensaje
      onUnauthorized(message);

      // evita bucle si ya estás en /login
      const isOnLogin = location?.pathname === "/login";
      if (isOnLogin) return;

      // vuelve exactamente a donde estaba el usuario
      const returnTo =
        detail?.returnTo ||
        (location.pathname + (location.search || "") + (location.hash || ""));

      navigate("/login", {
        replace: true,
        state: { returnTo, reason: "unauthorized" },
      });
    };

    window.addEventListener("hl:customer-unauthorized", handler);
    return () => window.removeEventListener("hl:customer-unauthorized", handler);
  }, [navigate, location, onUnauthorized]);

  return null;
}
