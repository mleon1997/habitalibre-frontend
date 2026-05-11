// src/components/HabitaShell.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  House,
  Calculator,
  Building2,
  Map,
  User,
  Lock,
  LogOut,
  LogIn,
} from "lucide-react";
import { getCustomerToken } from "../lib/customerSession.js";
import HIcon from "../assets/HICON.png";

const NAV_ITEMS = [
  {
    key: "home",
    path: "/progreso",
    label: "Home",
    subtitle: "Tu resumen",
    icon: House,
  },
  {
    key: "capacidad",
    path: "/capacidad",
    label: "Capacidad",
    subtitle: "Tu poder de compra",
    icon: Calculator,
  },
  {
    key: "match",
    path: "/match",
    label: "Match",
    subtitle: "Propiedades e hipotecas",
    icon: Building2,
  },
  {
    key: "ruta",
    path: "/ruta",
    label: "Ruta",
    subtitle: "Próximos pasos",
    icon: Map,
  },
  {
    key: "perfil",
    path: "/perfil",
    label: "Perfil",
    subtitle: "Tu cuenta",
    icon: User,
    protected: true,
  },
];

function isActivePath(currentPath, itemPath) {
  if (itemPath === "/progreso") {
    return (
      currentPath === "/" ||
      currentPath === "/progreso" ||
      currentPath.startsWith("/progreso/")
    );
  }

  return currentPath === itemPath || currentPath.startsWith(itemPath + "/");
}

function getActiveItem(pathname) {
  return (
    NAV_ITEMS.find((item) => isActivePath(pathname, item.path)) ||
    NAV_ITEMS[0]
  );
}

function getReturnTo(location) {
  const pathname = location?.pathname || "/progreso";
  const search = location?.search || "";

  if (!pathname || pathname === "/login") return "/progreso";

  return `${pathname}${search}`;
}

function clearCustomerSession() {
  try {
    localStorage.removeItem("hl_customer_token");
    localStorage.removeItem("hl_customer_data");
    localStorage.removeItem("hl_customer");

    // Legacy / fallback keys that may exist in older flows
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customer");
    localStorage.removeItem("habitalibre_customer_token");
    localStorage.removeItem("habitalibre_customer");
    localStorage.removeItem("hl_customer_session");
    localStorage.removeItem("hl_mobile_customer_v1");
  } catch {}
}

function BrandBlock({ compact = false }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: compact ? 10 : 12,
      }}
    >
  <div
  style={{
    width: compact ? 42 : 52,
    height: compact ? 42 : 52,
    borderRadius: compact ? 16 : 20,
    border: "1px solid rgba(37,211,166,0.42)",
    background: "rgba(2,6,23,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 34px rgba(37,211,166,0.16)",
    flexShrink: 0,
    overflow: "hidden",
  }}
>
  <img
    src={HIcon}
    alt="HabitaLibre"
    style={{
      width: compact ? 27 : 34,
      height: compact ? 27 : 34,
      objectFit: "contain",
      display: "block",
    }}
  />
</div>

      {!compact ? (
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              color: "rgba(226,232,240,0.98)",
              fontWeight: 950,
              fontSize: 20,
              lineHeight: 1,
              letterSpacing: -0.5,
            }}
          >
            HabitaLibre
          </div>

          <div
            style={{
              marginTop: 6,
              color: "rgba(45,212,191,0.92)",
              fontWeight: 800,
              fontSize: 12,
              lineHeight: 1.2,
            }}
          >
            Tu camino a tu primera vivienda
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DesktopNavigation({
  onNavigate,
  onLogout,
  onLogin,
  docsBadge = 0,
}) {
  const location = useLocation();
  const token = getCustomerToken();
  const isLoggedIn = !!token;

  return (
    <aside className="hl-desktop-nav">
      <div>
        <BrandBlock />

        <div
          style={{
            marginTop: 28,
            display: "grid",
            gap: 8,
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(location.pathname, item.path);
            const locked = item.protected && !isLoggedIn;
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item)}
                style={{
                  width: "100%",
                  border: active
                    ? "1px solid rgba(37,211,166,0.24)"
                    : "1px solid transparent",
                  background: active
                    ? "linear-gradient(180deg, rgba(37,211,166,0.13), rgba(37,211,166,0.06))"
                    : "transparent",
                  color: "white",
                  borderRadius: 22,
                  padding: "12px 12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  textAlign: "left",
                  opacity: locked ? 0.72 : 1,
                  boxShadow: active
                    ? "0 12px 28px rgba(37,211,166,0.10)"
                    : "none",
                  transition:
                    "background 160ms ease, border 160ms ease, transform 160ms ease",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 16,
                    background: active
                      ? "rgba(37,211,166,0.12)"
                      : "rgba(255,255,255,0.05)",
                    border: active
                      ? "1px solid rgba(37,211,166,0.24)"
                      : "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: active ? "#25d3a6" : "rgba(226,232,240,0.78)",
                    position: "relative",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={21} strokeWidth={active ? 2.5 : 2.1} />

                  {locked ? (
                    <span
                      style={{
                        position: "absolute",
                        right: -4,
                        bottom: -4,
                        width: 16,
                        height: 16,
                        borderRadius: 999,
                        background: "rgba(15,23,42,0.95)",
                        border: "1px solid rgba(255,255,255,0.16)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Lock size={9} strokeWidth={2.8} color="#ffffff" />
                    </span>
                  ) : null}

                  {item.key === "perfil" && docsBadge > 0 ? (
                    <span
                      style={{
                        position: "absolute",
                        top: -7,
                        right: -8,
                        minWidth: 18,
                        height: 18,
                        padding: "0 5px",
                        borderRadius: 999,
                        background: "#25d3a6",
                        color: "#052019",
                        fontSize: 9,
                        fontWeight: 950,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid rgba(0,0,0,0.18)",
                      }}
                    >
                      {docsBadge > 9 ? "9+" : docsBadge}
                    </span>
                  ) : null}
                </div>

                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: active ? 950 : 850,
                      color: active ? "#ccfbf1" : "rgba(226,232,240,0.92)",
                      lineHeight: 1.15,
                    }}
                  >
                    {item.label}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 11,
                      color: active
                        ? "rgba(153,246,228,0.70)"
                        : "rgba(148,163,184,0.68)",
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {locked ? "Inicia sesión" : item.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {isLoggedIn ? (
        <button
          type="button"
          onClick={onLogout}
          style={{
            marginTop: 22,
            width: "100%",
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(226,232,240,0.82)",
            borderRadius: 20,
            padding: "13px 14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontWeight: 850,
            fontSize: 13,
          }}
        >
          <LogOut size={16} strokeWidth={2.2} />
          Cerrar sesión
        </button>
      ) : (
        <button
          type="button"
          onClick={onLogin}
          style={{
            marginTop: 22,
            width: "100%",
            border: "1px solid rgba(37,211,166,0.22)",
            background:
              "linear-gradient(180deg, rgba(37,211,166,0.18), rgba(37,211,166,0.09))",
            color: "#ccfbf1",
            borderRadius: 20,
            padding: "13px 14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontWeight: 900,
            fontSize: 13,
          }}
        >
          <LogIn size={16} strokeWidth={2.2} />
          Iniciar sesión
        </button>
      )}
    </aside>
  );
}

function MobileNavigation({ onNavigate, docsBadge = 0 }) {
  const location = useLocation();
  const token = getCustomerToken();
  const isLoggedIn = !!token;

  return (
    <div className="hl-mobile-nav-wrap">
      <div className="hl-mobile-nav">
        {NAV_ITEMS.map((item) => {
          const active = isActivePath(location.pathname, item.path);
          const locked = item.protected && !isLoggedIn;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item)}
              aria-label={locked ? "Iniciar sesión" : item.label}
              style={{
                appearance: "none",
                WebkitAppearance: "none",
                border: "none",
                outline: "none",
                background: "transparent",
                padding: 0,
                margin: 0,
                width: "100%",
                height: "100%",
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px 2px 6px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: 66,
                    minWidth: 0,
                    height: 56,
                    borderRadius: 18,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    position: "relative",
                    background: active
                      ? "linear-gradient(180deg, rgba(37,211,166,0.16) 0%, rgba(37,211,166,0.08) 100%)"
                      : "transparent",
                    border: active
                      ? "1px solid rgba(37,211,166,0.22)"
                      : "1px solid transparent",
                    boxShadow: active
                      ? "0 8px 18px rgba(37,211,166,0.12)"
                      : "none",
                    opacity: locked ? 0.78 : 1,
                    transition:
                      "background 160ms ease, border 160ms ease, box-shadow 160ms ease, opacity 160ms ease",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: 24,
                      height: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: active ? "#25d3a6" : "rgba(255,255,255,0.76)",
                      flexShrink: 0,
                    }}
                  >
                    <Icon
                      size={21}
                      strokeWidth={active ? 2.4 : 2.1}
                      style={{
                        display: "block",
                        filter: active
                          ? "drop-shadow(0 0 8px rgba(37,211,166,0.16))"
                          : "none",
                      }}
                    />

                    {locked ? (
                      <span
                        style={{
                          position: "absolute",
                          right: -7,
                          bottom: -5,
                          width: 13,
                          height: 13,
                          borderRadius: 999,
                          background: "rgba(255,255,255,0.12)",
                          border: "1px solid rgba(255,255,255,0.10)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Lock size={7} strokeWidth={2.6} color="#ffffff" />
                      </span>
                    ) : null}

                    {item.key === "perfil" && docsBadge > 0 ? (
                      <span
                        style={{
                          position: "absolute",
                          top: -7,
                          right: -11,
                          minWidth: 17,
                          height: 17,
                          padding: "0 5px",
                          borderRadius: 999,
                          background: "#25d3a6",
                          color: "#052019",
                          fontSize: 9,
                          fontWeight: 950,
                          lineHeight: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px solid rgba(0,0,0,0.18)",
                          boxShadow: "0 5px 14px rgba(37,211,166,0.25)",
                        }}
                      >
                        {docsBadge > 9 ? "9+" : docsBadge}
                      </span>
                    ) : null}
                  </div>

                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: active ? 900 : 700,
                      color: active ? "#25d3a6" : "rgba(255,255,255,0.58)",
                      textAlign: "center",
                      lineHeight: 1,
                      letterSpacing: -0.15,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </div>

                  {active ? (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 2,
                        width: 22,
                        height: 4,
                        borderRadius: 999,
                        background: "#25d3a6",
                        boxShadow: "0 0 12px rgba(37,211,166,0.28)",
                      }}
                    />
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function HabitaShell({
  children,
  docsBadge = 0,
  maxWidth = 820,
  contentStyle,
  contentClassName = "",
  showTopBar = true,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeItem = getActiveItem(location.pathname);

  const returnTo = getReturnTo(location);

  function goLogin() {
    navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`, {
      state: {
        returnTo,
        from: "habita_shell",
      },
    });
  }

  function handleNavigate(item) {
    const token = getCustomerToken();
    const isLoggedIn = !!token;

    if (item.protected && !isLoggedIn) {
      goLogin();
      return;
    }

    navigate(item.path);
  }

function handleLogout() {
  try {
    localStorage.removeItem("hl_customer_token");
    localStorage.removeItem("hl_customer_data");
    localStorage.removeItem("hl_customer");
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customer");
    localStorage.removeItem("habitalibre_customer_token");
    localStorage.removeItem("habitalibre_customer");
    localStorage.removeItem("hl_customer_session");
    localStorage.removeItem("hl_mobile_customer_v1");

    sessionStorage.clear();
  } catch {}

  // Fuerza salida real de la app hacia el home web público
  window.location.assign("/");
}

  return (
    <div className="hl-shell-root">
      <style>
        {`
          .hl-shell-root {
            min-height: 100dvh;
            width: 100%;
            background:
              radial-gradient(1200px 800px at 18% 8%, rgba(45,212,191,0.10), transparent 54%),
              radial-gradient(1000px 700px at 82% 12%, rgba(59,130,246,0.10), transparent 58%),
              linear-gradient(180deg, rgba(2,6,23,1) 0%, rgba(15,23,42,1) 100%);
            color: white;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            overflow-x: hidden;
          }

          .hl-shell-layout {
            min-height: 100dvh;
            width: 100%;
            box-sizing: border-box;
            padding: 22px 16px 112px;
          }

          .hl-desktop-nav {
            display: none;
          }

          .hl-mobile-nav-wrap {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1000;
            padding: 0 10px calc(env(safe-area-inset-bottom) + 12px);
            pointer-events: none;
          }

          .hl-mobile-nav {
            pointer-events: auto;
            max-width: 760px;
            margin: 0 auto;
            height: 72px;
            border-radius: 24px;
            background: rgba(8, 15, 32, 0.90);
            border: 1px solid rgba(255,255,255,0.10);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            box-shadow: 0 18px 40px rgba(0,0,0,0.36);
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            align-items: stretch;
            overflow: hidden;
          }

          .hl-mobile-topbar {
            display: flex;
          }

          .hl-shell-content {
            width: 100%;
            max-width: ${Number(maxWidth) || 820}px;
            margin: 0 auto;
            box-sizing: border-box;
          }

          @media (min-width: 900px) {
            .hl-shell-layout {
              display: grid;
              grid-template-columns: 246px minmax(0, 1fr);
              gap: 28px;
              padding: 28px 32px 42px;
            }

            .hl-desktop-nav {
              position: sticky;
              top: 28px;
              height: calc(100dvh - 56px);
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              border-radius: 30px;
              border: 1px solid rgba(255,255,255,0.10);
              background: rgba(8,15,32,0.68);
              backdrop-filter: blur(18px);
              -webkit-backdrop-filter: blur(18px);
              box-shadow: 0 24px 80px rgba(0,0,0,0.32);
              padding: 18px;
              box-sizing: border-box;
              overflow: hidden;
            }

            .hl-mobile-nav-wrap {
              display: none;
            }

            .hl-mobile-topbar {
              display: none;
            }

            .hl-shell-content {
              padding-top: 4px;
            }
          }

          @media (min-width: 1200px) {
            .hl-shell-layout {
              grid-template-columns: 270px minmax(0, 1fr);
              gap: 36px;
              padding-left: 44px;
              padding-right: 44px;
            }
          }
        `}
      </style>

      <div className="hl-shell-layout">
        <DesktopNavigation
          docsBadge={docsBadge}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onLogin={goLogin}
        />

        <div>
          {showTopBar ? (
            <div
              className="hl-mobile-topbar"
              style={{
                alignItems: "center",
                justifyContent: "space-between",
                gap: 14,
                marginBottom: 22,
              }}
            >
              <BrandBlock />

              <div
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.05)",
                  color: "rgba(226,232,240,0.84)",
                  borderRadius: 999,
                  padding: "8px 12px",
                  fontWeight: 850,
                  fontSize: 12,
                  whiteSpace: "nowrap",
                }}
              >
                {activeItem.label}
              </div>
            </div>
          ) : null}

          <main
            className={`hl-shell-content ${contentClassName || ""}`}
            style={contentStyle}
          >
            {children}
          </main>
        </div>
      </div>

      <MobileNavigation docsBadge={docsBadge} onNavigate={handleNavigate} />
    </div>
  );
}