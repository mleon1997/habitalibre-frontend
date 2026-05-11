// src/components/HeaderHL.jsx

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import HIcon from "../assets/HICON.png";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";

function clearCustomerSessionFallback() {
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
  } catch {}
}

export default function HeaderHL({ hideOnPaths = [] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, logout } = useCustomerAuth?.() || {};
  const [open, setOpen] = useState(false);

  const pathname = location.pathname || "/";
  const shouldHide = hideOnPaths.some((p) => pathname.startsWith(p));
  if (shouldHide) return null;

  const isAuthed = !!token;

  const goSimular = () => navigate("/simular");
  const goHome = () => navigate("/");
  const goProgreso = () => navigate("/progreso");

  const goLogin = () => {
    navigate("/login", {
      state: {
        returnTo: "/progreso",
        from: "public_header",
      },
    });
  };

  const handleLogout = () => {
    try {
      if (typeof logout === "function") logout();
      clearCustomerSessionFallback();
    } catch {
      clearCustomerSessionFallback();
    }

    navigate("/login", {
      replace: true,
      state: {
        returnTo: "/progreso",
        from: "logout",
      },
    });
  };

  const goComoFunciona = () => {
    if (pathname === "/") {
      const el = document.getElementById("como-funciona");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/#como-funciona");
    }
  };

  return (
    <header className="border-b border-slate-800/70 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <button onClick={goHome} className="flex items-center gap-3 text-left">
          <div
            className="
              h-12 w-12 md:h-14 md:w-14
              rounded-2xl bg-slate-900/90
              border border-emerald-400/60
              shadow-[0_0_25px_rgba(16,185,129,0.4)]
              flex items-center justify-center overflow-hidden
            "
          >
            <img
              src={HIcon}
              alt="HabitaLibre"
              className="h-7 w-7 md:h-8 md:w-8 object-contain"
            />
          </div>

          <div className="leading-tight">
            <div className="font-bold text-lg md:text-xl text-white tracking-tight">
              HabitaLibre
            </div>
            <div className="text-[11px] md:text-xs text-emerald-300/90">
              Hipoteca exprés · VIS · VIP · BIESS
            </div>
          </div>
        </button>

        {/* DESKTOP */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <button
            onClick={goComoFunciona}
            className="text-slate-300 hover:text-slate-50"
          >
            Cómo funciona
          </button>

          <button className="text-slate-300 hover:text-slate-50">
            Beneficios
          </button>

          <button className="text-slate-300 hover:text-slate-50">
            Nosotros
          </button>

          <button className="text-slate-300 hover:text-slate-50">
            Testimonios
          </button>

          {isAuthed ? (
            <>
              <button
                onClick={goProgreso}
                className="text-slate-200 hover:text-white transition"
              >
                Mi progreso
              </button>

              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-slate-200 transition"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <button
              onClick={goLogin}
              className="text-slate-200 hover:text-white transition"
            >
              Iniciar sesión
            </button>
          )}

          <button
            onClick={goSimular}
            className="px-5 py-2.5 rounded-full bg-blue-500 hover:bg-blue-400
                       text-slate-950 font-semibold text-sm shadow-lg transition"
          >
            Iniciar precalificación
          </button>
        </nav>

        {/* MOBILE */}
        <div className="md:hidden flex items-center gap-2">
          {isAuthed ? (
            <button
              onClick={goProgreso}
              className="px-3 py-2 rounded-full border border-slate-700 text-slate-200 text-xs font-semibold"
            >
              Mi progreso
            </button>
          ) : (
            <button
              onClick={goLogin}
              className="px-3 py-2 rounded-full border border-slate-700 text-slate-200 text-xs font-semibold"
            >
              Entrar
            </button>
          )}

          <button
            onClick={goSimular}
            className="px-4 py-2 rounded-full bg-emerald-400 text-slate-950 text-xs font-semibold
                       shadow-[0_12px_30px_rgba(16,185,129,0.55)] active:scale-[.97] transition"
          >
            Simular
          </button>

          <button
            onClick={() => setOpen((v) => !v)}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/60"
            aria-label="Menu"
          >
            {open ? (
              <XMarkIcon className="h-5 w-5 text-slate-200" />
            ) : (
              <Bars3Icon className="h-5 w-5 text-slate-200" />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {open && (
        <div className="md:hidden border-t border-slate-800/70 bg-slate-950/95">
          <div className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-2 text-sm">
            <button
              onClick={() => {
                setOpen(false);
                goHome();
              }}
              className="text-left py-2 text-slate-200"
            >
              Inicio
            </button>

            <button
              onClick={() => {
                setOpen(false);
                goComoFunciona();
              }}
              className="text-left py-2 text-slate-200"
            >
              Cómo funciona
            </button>

            {!isAuthed ? (
              <button
                onClick={() => {
                  setOpen(false);
                  goLogin();
                }}
                className="text-left py-2 text-slate-200"
              >
                Iniciar sesión
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setOpen(false);
                    goProgreso();
                  }}
                  className="text-left py-2 text-slate-200"
                >
                  Mi progreso
                </button>

                <button
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="text-left py-2 text-slate-400"
                >
                  Cerrar sesión
                </button>
              </>
            )}

            <button
              onClick={() => {
                setOpen(false);
                goSimular();
              }}
              className="text-left py-2 text-slate-200"
            >
              Iniciar simulación
            </button>
          </div>
        </div>
      )}
    </header>
  );
}