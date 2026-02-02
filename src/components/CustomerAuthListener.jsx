// src/components/CustomerAuthListener.jsx
import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";

export default function CustomerAuthListener() {
  const navigate = useNavigate();
  const location = useLocation();
  const { onUnauthorized } = useCustomerAuth();

  // ✅ evita loops / multi-dispatch
  const lastKickRef = useRef(0);

  useEffect(() => {
    const handler = (ev) => {
      const detail = ev?.detail || {};

      /**
       * ✅ FIX CRÍTICO:
       * Solo reaccionar a eventos que sean realmente de CUSTOMER.
       * (evita que un 401 del ADMIN u otros endpoints te bote del Journey)
       */
      const scope = String(detail?.scope || detail?.kind || "").toLowerCase();
      if (scope && scope !== "customer") return;

      // Cooldown anti-loop (700ms)
      const now = Date.now();
      if (now - lastKickRef.current < 700) return;
      lastKickRef.current = now;

      const message =
        detail?.message || "Tu sesión expiró. Inicia sesión nuevamente.";

      // limpia auth + guarda mensaje
      onUnauthorized(message);

      // evita bucle si ya estás en /login
      const isOnLogin = location?.pathname === "/login";
      if (isOnLogin) return;

      // En HashRouter NO metas location.hash aquí (ya lo maneja router)
      const returnTo =
        detail?.returnTo ||
        (location.pathname + (location.search || ""));

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
