// src/pages/SimuladorPage.jsx
import React, { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import WizardHL from "../components/WizardHL.jsx";
import { useLeadCapture } from "../context/LeadCaptureContext.jsx";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function SimuladorPage() {
  const nav = useNavigate();
  const { resetLeadCapture, isOpen } = useLeadCapture();
  const { token, isAuthed } = useCustomerAuth();

  const q = useQuery();

  // ✅ modo explícito por query param (default: quick)
  const mode = (q.get("mode") || "quick").toLowerCase(); // "quick" | "journey"
  const onboarding = q.get("onboarding") === "1";

  // =========================================================
  // ✅ REGLA CLAVE:
  // - quick => siempre wizard
  // - journey + sesión => NO re-pedir datos => manda a /progreso
  // =========================================================
  useEffect(() => {
    if (mode !== "journey") return;

    // Si está logueado (token real), el Journey vive en /progreso
    if (isAuthed && token) {
      nav("/progreso", { replace: true });
    }
  }, [mode, isAuthed, token, nav]);

  const didReset = useRef(false);
  useEffect(() => {
    if (didReset.current) return;
    didReset.current = true;

    // ✅ si el modal está abierto, NO resetees (no lo mates)
    if (isOpen) return;

    // ✅ resetea por modo para evitar mezcla de estados
    resetLeadCapture(`enter_simulador_${mode}`);
  }, [resetLeadCapture, isOpen, mode]);

  // Mientras redirige, evita render del wizard (flicker)
  if (mode === "journey" && isAuthed && token) {
    return (
      <div className="min-h-[100dvh] bg-slate-950 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl rounded-3xl border border-slate-800/80 bg-slate-900/60 px-6 py-6 text-slate-100 shadow-[0_24px_80px_rgba(15,23,42,0.9)]">
          <div className="text-sm text-slate-400">HabitaLibre</div>
          <div className="mt-1 text-lg font-semibold">Cargando tu progreso…</div>
          <div className="mt-2 text-[12px] text-slate-400">
            Te estamos llevando a tu tablero.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        "min-h-[100dvh] bg-slate-950",
        "flex items-start justify-center",
        "md:items-center",
        "px-4 py-8 md:py-10",
        "pb-[calc(env(safe-area-inset-bottom,0px)+32px)]",
      ].join(" ")}
    >
      <div
        className={[
          "w-full max-w-3xl",
          "bg-slate-900/60 rounded-3xl",
          "shadow-[0_24px_80px_rgba(15,23,42,0.9)]",
          "border border-slate-800/80",
          "px-5 py-6 md:px-8 md:py-8",
          "overflow-hidden",
        ].join(" ")}
      >
        <WizardHL mode={mode} onboarding={onboarding} />
      </div>
    </div>
  );
}
