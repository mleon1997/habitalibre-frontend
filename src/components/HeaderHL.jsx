// src/components/HeaderHL.jsx

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import HIcon from "../assets/HICON.png";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";

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

  const goComoFunciona = () => {
    // Si estás en landing, scrollea. Si no, manda a landing con hash.
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
        {/* Logo */}
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
              HabitaLibre Test
            </div>
            <div className="text-[11px] md:text-xs text-emerald-300/90">
              Hipoteca exprés · VIS · VIP · BIESS
            </div>
          </div>
        </button>

        {/* DESKTOP */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <button onClick={goComoFunciona} className="text-slate-300 hover:text-slate-50">
            Cómo funciona
          </button>

          {/* ✅ SOLO SI ESTÁ LOGUEADO: mostrar acceso al Journey */}
          {isAuthed && (
            <>
              <button onClick={goProgreso} className="text-slate-200 hover:text-white transition">
                Mi progreso
              </button>

              {typeof logout === "function" && (
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="text-slate-400 hover:text-slate-200 transition"
                >
                  Salir
                </button>
              )}
            </>
          )}

          {/* CTA único público: simular */}
          <button
            onClick={goSimular}
            className="px-5 py-2.5 rounded-full bg-blue-500 hover:bg-blue-400
                       text-slate-950 font-semibold text-sm shadow-lg transition"
          >
            Iniciar simulación
          </button>
        </nav>

        {/* MOBILE */}
        <div className="md:hidden flex items-center gap-2">
          {/* ✅ SOLO SI ESTÁ LOGUEADO */}
          {isAuthed && (
            <button
              onClick={goProgreso}
              className="px-3 py-2 rounded-full border border-slate-700 text-slate-200 text-xs font-semibold"
            >
              Mi progreso
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

            <button
              onClick={() => {
                setOpen(false);
                goSimular();
              }}
              className="text-left py-2 text-slate-200"
            >
              Iniciar simulación
            </button>

            {/* ✅ SOLO SI ESTÁ LOGUEADO */}
            {isAuthed && (
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

                {typeof logout === "function" && (
                  <button
                    onClick={() => {
                      setOpen(false);
                      logout();
                      navigate("/");
                    }}
                    className="text-left py-2 text-slate-400"
                  >
                    Salir
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
