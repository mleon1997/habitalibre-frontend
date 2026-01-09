import React, { createContext, useContext, useMemo, useState } from "react";

const LeadCaptureContext = createContext(null);

export function LeadCaptureProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState(null);

  // ✅ cada apertura incrementa nonce para remontear el modal y evitar estados “pegados”
  const [nonce, setNonce] = useState(0);

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
      openLead,
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
