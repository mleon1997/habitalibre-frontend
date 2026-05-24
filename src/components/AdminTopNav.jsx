// src/components/AdminTopNav.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ADMIN_LINKS = [
  {
    label: "Panel interno",
    path: "/admin/home",
  },
  {
    label: "Leads",
    path: "/admin/leads",
  },
  {
    label: "Usuarios",
    path: "/admin/users",
  },
  {
    label: "Propiedades",
    path: "/admin/propiedades",
  },
];

function clearAdminSession() {
  try {
    localStorage.removeItem("hl_admin_token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("HL_TOKEN");
    localStorage.removeItem("hl_admin_email");
  } catch {}
}

export default function AdminTopNav({
  title = "HabitaLibre Admin",
  subtitle = "",
  showLogout = true,
  rightContent = null,
}) {
  const nav = useNavigate();
  const location = useLocation();

  function isActive(path) {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  }

  function handleLogout() {
    clearAdminSession();

    const returnTo = encodeURIComponent(location.pathname || "/admin/home");
    nav(`/admin?returnTo=${returnTo}`, { replace: true });
  }

  return (
    <div
      style={{
        width: "100%",
        display: "grid",
        gap: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 18,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: "rgba(148,163,184,0.95)",
              fontWeight: 950,
              fontSize: 16,
            }}
          >
            HabitaLibre Admin
          </div>

          <h1
            style={{
              margin: "8px 0 0",
              fontSize: 36,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: "white",
            }}
          >
            {title}
          </h1>

          {subtitle ? (
            <p
              style={{
                margin: "10px 0 0",
                color: "rgba(203,213,225,0.88)",
                fontSize: 15,
                lineHeight: 1.45,
                maxWidth: 880,
              }}
            >
              {subtitle}
            </p>
          ) : null}
        </div>

        {rightContent ? <div>{rightContent}</div> : null}
      </div>

      <div
        style={{
          padding: 14,
          borderRadius: 22,
          background: "rgba(255,255,255,0.055)",
          border: "1px solid rgba(255,255,255,0.10)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        {ADMIN_LINKS.map((link) => {
          const active = isActive(link.path);

          return (
            <button
              key={link.path}
              onClick={() => nav(link.path)}
              style={{
                border: active
                  ? "1px solid rgba(37,211,166,0.45)"
                  : "1px solid rgba(255,255,255,0.14)",
                background: active
                  ? "rgba(37,211,166,0.14)"
                  : "rgba(255,255,255,0.075)",
                color: active ? "#7fffd4" : "white",
                padding: "11px 14px",
                borderRadius: 14,
                fontWeight: 900,
                cursor: "pointer",
                boxShadow: active
                  ? "0 0 0 3px rgba(37,211,166,0.06)"
                  : "none",
              }}
            >
              {link.label}
            </button>
          );
        })}

        <div style={{ flex: 1 }} />

        {showLogout ? (
          <button
            onClick={handleLogout}
            style={{
              border: "1px solid rgba(248,113,113,0.28)",
              background: "rgba(248,113,113,0.10)",
              color: "#fecaca",
              padding: "11px 14px",
              borderRadius: 14,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Cerrar sesión
          </button>
        ) : null}
      </div>
    </div>
  );
}