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

  // ✅ permite saltarte reglas
  const force = q.get("force") === "1";

  // ✅ CLAVE: si vienes desde /progreso con "Afinar", esto debe ABRIR el wizard
  const afinando = q.get("afinando") === "1";

  /**
   * ✅ Regla:
   * - journey + authed => normalmente mandamos a /progreso
   * - PERO si afinando=1 => NO redirigir (queremos abrir wizard completo para editar escenario)
   * - force=1 siempre permite ver wizard
   */
  useEffect(() => {
    if (mode === "journey" && isAuthed && !force && !afinando) {
      nav("/progreso", { replace: true });
    }
  }, [mode, isAuthed, force, afinando, nav]);

  const didReset = useRef(false);
  useEffect(() => {
    if (didReset.current) return;
    didReset.current = true;

    // ✅ si el modal está abierto, NO resetees (no lo mates)
    if (isOpen) return;

    /**
     * ✅ IMPORTANTE:
     * - En afinando NO reseteamos lead capture, porque el wizard (journey) debe
     *   auto-hidratar con la info existente (backend/snap) y NO volver al intake.
     * - En el resto de casos, sí reseteamos por modo para evitar mezclar estados.
     */
    if (afinando) return;

    resetLeadCapture(`enter_simulador_${mode}`);
  }, [resetLeadCapture, isOpen, mode, afinando]);

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
        {/* ✅ Pasamos afinando para que WizardHL pueda saltar intake / abrir tab correcto si quieres */}
        <WizardHL mode={mode} onboarding={onboarding} afinando={afinando} />
      </div>
    </div>
  );
}
