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

function getAdminEmail() {
  try {
    return localStorage.getItem("hl_admin_email") || "";
  } catch {
    return "";
  }
}

function getCurrentModule(pathname) {
  const match = ADMIN_LINKS.find(
    (link) => pathname === link.path || pathname.startsWith(`${link.path}/`)
  );

  return match?.label || "Admin";
}

function BrandMark() {
  return (
    <div
      style={{
        width: 46,
        height: 46,
        borderRadius: 16,
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(circle at 30% 20%, rgba(127,255,212,0.45), rgba(37,211,166,0.16) 38%, rgba(15,23,42,0.88) 72%)",
        border: "1px solid rgba(127,255,212,0.34)",
        boxShadow:
          "0 0 0 6px rgba(37,211,166,0.045), 0 18px 50px rgba(37,211,166,0.14)",
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 10,
          display: "grid",
          placeItems: "center",
          border: "1px solid rgba(127,255,212,0.45)",
          color: "#7fffd4",
          fontSize: 12,
          fontWeight: 1000,
          letterSpacing: "-0.06em",
        }}
      >
        HL
      </div>
    </div>
  );
}

export default function AdminTopNav({
  title = "HabitaLibre Admin",
  subtitle = "",
  showLogout = true,
  rightContent = null,
}) {
  const nav = useNavigate();
  const location = useLocation();

  const adminEmail = getAdminEmail();
  const currentModule = getCurrentModule(location.pathname);

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
        gap: 18,
      }}
    >
      {/* Brand / Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 20,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
            minWidth: 0,
          }}
        >
          <BrandMark />

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  color: "rgba(148,163,184,0.95)",
                  fontWeight: 950,
                  fontSize: 14,
                  letterSpacing: "0.02em",
                }}
              >
                HABITALIBRE
              </span>

              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 999,
                  background: "rgba(127,255,212,0.7)",
                }}
              />

              <span
                style={{
                  color: "#7fffd4",
                  fontWeight: 900,
                  fontSize: 13,
                }}
              >
                Control Tower
              </span>

              <span
                style={{
                  padding: "5px 9px",
                  borderRadius: 999,
                  background: "rgba(37,211,166,0.10)",
                  border: "1px solid rgba(37,211,166,0.22)",
                  color: "rgba(209,250,229,0.94)",
                  fontSize: 11,
                  fontWeight: 900,
                }}
              >
                {currentModule}
              </span>
            </div>

            <h1
              style={{
                margin: "8px 0 0",
                fontSize: 38,
                lineHeight: 1,
                letterSpacing: "-0.055em",
                color: "white",
              }}
            >
              {title}
            </h1>

            {subtitle ? (
              <p
                style={{
                  margin: "11px 0 0",
                  color: "rgba(203,213,225,0.88)",
                  fontSize: 15,
                  lineHeight: 1.5,
                  maxWidth: 900,
                }}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {adminEmail ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "10px 13px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.055)",
                color: "rgba(226,232,240,0.92)",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: "#25d3a6",
                  boxShadow: "0 0 18px rgba(37,211,166,0.8)",
                }}
              />
              {adminEmail}
            </div>
          ) : null}

          {rightContent ? <div>{rightContent}</div> : null}
        </div>
      </div>

      {/* Navigation */}
      <div
        style={{
          padding: 14,
          borderRadius: 26,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.040))",
          border: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
          boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
          backdropFilter: "blur(18px)",
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
                  ? "1px solid rgba(37,211,166,0.50)"
                  : "1px solid rgba(255,255,255,0.15)",
                background: active
                  ? "linear-gradient(180deg, rgba(37,211,166,0.22), rgba(37,211,166,0.10))"
                  : "rgba(255,255,255,0.075)",
                color: active ? "#7fffd4" : "rgba(248,250,252,0.94)",
                padding: "12px 16px",
                borderRadius: 16,
                fontWeight: 950,
                cursor: "pointer",
                boxShadow: active
                  ? "0 0 0 4px rgba(37,211,166,0.06), 0 14px 34px rgba(37,211,166,0.10)"
                  : "none",
                transition: "all 160ms ease",
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
              border: "1px solid rgba(248,113,113,0.34)",
              background:
                "linear-gradient(180deg, rgba(248,113,113,0.14), rgba(248,113,113,0.08))",
              color: "#fecaca",
              padding: "12px 16px",
              borderRadius: 16,
              fontWeight: 950,
              cursor: "pointer",
              boxShadow: "0 14px 34px rgba(248,113,113,0.08)",
            }}
          >
            Cerrar sesión
          </button>
        ) : null}
      </div>
    </div>
  );
}