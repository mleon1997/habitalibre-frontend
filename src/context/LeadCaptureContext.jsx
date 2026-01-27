// src/context/LeadCaptureContext.jsx
import React, { createContext, useContext, useMemo, useState } from "react";

const LeadCaptureContext = createContext(null);

export function LeadCaptureProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState(null);

  // ✅ cada apertura incrementa nonce para remontear el modal y evitar estados “pegados”
  const [nonce, setNonce] = useState(0);

  // --------------------------------------------
  // Helper: merge seguro de resultado + inputs
  // --------------------------------------------
  const buildResult = (dataResultado, perfilInput) => {
    const base = dataResultado && typeof dataResultado === "object" ? dataResultado : null;
    const input = perfilInput && typeof perfilInput === "object" ? perfilInput : null;

    if (!base) return input ? { perfilInput: input } : null;

    // ✅ si ya venía perfilInput adentro, no lo pisamos
    if (base.perfilInput || !input) return base;

    return { ...base, perfilInput: input };
  };

  // ✅ legacy: abre el modal + setea resultado (como hoy)
  // ✅ NUEVO: permite 2do parámetro opcional "perfilInput"
  const openLead = (dataResultado, perfilInput = null) => {
    // reset “duro” primero (evita parpadeos en StrictMode)
    setIsOpen(false);
    setResult(null);

    // abre en el siguiente tick
    queueMicrotask(() => {
      setNonce((n) => n + 1);
      setResult(buildResult(dataResultado, perfilInput));
      setIsOpen(true);
    });
  };

  // ✅ NUEVO: abre el modal inmediatamente con data inicial (puede ser {__loading:true})
  // ✅ opcional: perfilInput
  const openLeadNow = (initialData = null, perfilInput = null) => {
    setIsOpen(false);
    setResult(null);

    queueMicrotask(() => {
      setNonce((n) => n + 1);
      setResult(buildResult(initialData, perfilInput));
      setIsOpen(true);
    });
  };

  // ✅ NUEVO: permite actualizar el resultado sin cerrar/remontear el modal
  // ✅ opcional: perfilInput
  const setLeadResult = (dataResultado, perfilInput = null) => {
    setResult(buildResult(dataResultado, perfilInput));
  };

  const closeLead = () => setIsOpen(false);

  const resetLeadCapture = () => {
    setIsOpen(false);
    setResult(null);
  };

  const value = useMemo(
    () => ({
      isOpen,
      result,
      nonce,
      openLead, // legacy + perfilInput opcional
      openLeadNow, // new + perfilInput opcional
      setLeadResult, // new + perfilInput opcional
      closeLead,
      resetLeadCapture,
    }),
    [isOpen, result, nonce]
  );

  return (
    <LeadCaptureContext.Provider value={value}>
      {children}
    </LeadCaptureContext.Provider>
  );
}

export function useLeadCapture() {
  const ctx = useContext(LeadCaptureContext);
  if (!ctx) throw new Error("useLeadCapture debe usarse dentro de LeadCaptureProvider");
  return ctx;
}
