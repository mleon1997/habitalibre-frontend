// src/components/AdminAuthListener.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminAuthListener() {
  const nav = useNavigate();

  useEffect(() => {
    function onUnauthorized(ev) {
      const detail = ev?.detail || {};
      const returnTo = detail.returnTo || "/admin/leads";

      try {
        localStorage.removeItem("hl_admin_token");
      } catch {}

      nav(`/admin?returnTo=${encodeURIComponent(returnTo)}`, { replace: true });
    }

    window.addEventListener("hl:admin-unauthorized", onUnauthorized);
    return () => window.removeEventListener("hl:admin-unauthorized", onUnauthorized);
  }, [nav]);

  return null;
}
