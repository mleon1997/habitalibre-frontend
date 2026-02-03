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
  const { isAuthed } = useCustomerAuth();

  const q = useQuery();

  // ✅ modo explícito por query param (default: quick)
  const mode = (q.get("mode") || "quick").toLowerCase(); // "quick" | "journey"
  const onboarding = q.get("onboarding") === "1";

  // ✅ NUEVO: si ya estás logueado y vienes a journey, NO muestres wizard
  // (a menos que explícitamente quieras permitirlo con ?force=1)
  const force = q.get("force") === "1";

  useEffect(() => {
    if (mode === "journey" && isAuthed && !force) {
      nav("/progreso", { replace: true });
    }
  }, [mode, isAuthed, force, nav]);

  const didReset = useRef(false);
  useEffect(() => {
    if (didReset.current) return;
    didReset.current = true;

    // ✅ si el modal está abierto, NO resetees (no lo mates)
    if (isOpen) return;

    // ✅ resetea por modo para evitar mezcla de estados
    resetLeadCapture(`enter_simulador_${mode}`);
  }, [resetLeadCapture, isOpen, mode]);

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
