// src/components/AdminAuthListener.jsx
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminAuthListener() {
  const nav = useNavigate();

  // ✅ evita loops / multi-dispatch
  const lastKickRef = useRef(0);

  useEffect(() => {
    function getReturnToHashRouterFallback() {
      try {
        const h = String(window.location.hash || "");
        if (h.startsWith("#")) return h.slice(1) || "/admin/leads";
        return "/admin/leads";
      } catch {
        return "/admin/leads";
      }
    }

    function onUnauthorized(ev) {
      const now = Date.now();
      if (now - lastKickRef.current < 700) return;
      lastKickRef.current = now;

      const detail = ev?.detail || {};

      // ✅ Solo reaccionar si el scope realmente es admin
      const scope = String(detail?.scope || detail?.kind || "").toLowerCase();
      if (scope && scope !== "admin") return;

      const returnTo =
        detail?.returnTo ||
        getReturnToHashRouterFallback() ||
        "/admin/leads";

      // ✅ Limpieza completa tokens admin legacy
      try {
        localStorage.removeItem("hl_admin_token");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("HL_TOKEN");
        localStorage.removeItem("token");
      } catch {}

      nav(`/admin?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
    }

    window.addEventListener("hl:admin-unauthorized", onUnauthorized);
    return () =>
      window.removeEventListener("hl:admin-unauthorized", onUnauthorized);
  }, [nav]);

  return null;
}
