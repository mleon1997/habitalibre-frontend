// src/context/LeadCaptureContext.jsx
import React, { createContext, useContext, useMemo, useState } from "react";

const LeadCaptureContext = createContext(null);

export function LeadCaptureProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState(null);

  // ✅ cada apertura incrementa nonce para remontear el modal y evitar estados “pegados”
  const [nonce, setNonce] = useState(0);

  // ✅ legacy: abre el modal + setea resultado (como hoy)
  const openLead = (dataResultado) => {
    // reset “duro” primero (evita parpadeos en StrictMode)
    setIsOpen(false);
    setResult(null);

    // abre en el siguiente tick
    queueMicrotask(() => {
      setNonce((n) => n + 1);
      setResult(dataResultado || null);
      setIsOpen(true);
    });
  };

  // ✅ NUEVO: abre el modal inmediatamente con data inicial (puede ser {__loading:true})
  // No rompe nada porque es adicional y no altera openLead.
  const openLeadNow = (initialData = null) => {
    setIsOpen(false);
    setResult(null);

    queueMicrotask(() => {
      setNonce((n) => n + 1);
      setResult(initialData || null);
      setIsOpen(true);
    });
  };

  // ✅ NUEVO: permite actualizar el resultado sin cerrar/remontear el modal
  const setLeadResult = (dataResultado) => {
    setResult(dataResultado || null);
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
      openLead, // legacy
      openLeadNow, // new
      setLeadResult, // new
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
