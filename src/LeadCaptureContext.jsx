import React, { createContext, useContext, useMemo, useRef, useState, useEffect } from "react";
import ModalLead from "../components/ModalLead.jsx";
import { crearLead } from "../lib/api";

const LeadCaptureContext = createContext(null);

export function LeadCaptureProvider({ children }) {
  // Guard de singleton (previene doble provider accidental)
  if (typeof window !== "undefined") {
    if (window.__HL_PROVIDER_MOUNTED__) {
      console.warn("⚠️ LeadCaptureProvider ya estaba montado. Evita montar 2 veces.");
    }
    window.__HL_PROVIDER_MOUNTED__ = true;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [resultado, setResultado] = useState(null);
  const sentRef = useRef(false);

  const [leadSaved, setLeadSaved] = useState(
    () => !!(typeof localStorage !== "undefined" && localStorage.getItem("leadModalShown"))
  );

  // API del contexto
  const openLead = (dataResultado) => {
    if (leadSaved) return; // si ya guardó, no abrimos
    setResultado(dataResultado || null);
    setIsOpen(true);
  };
  const closeLead = () => setIsOpen(false);

  async function submitLead(payload) {
    if (sentRef.current) return { ok: true };
    const resp = await crearLead(payload);
    sentRef.current = true;
    try { localStorage.setItem("leadModalShown", "1"); } catch {}
    setLeadSaved(true);
    return resp;
  }

  const value = useMemo(
    () => ({ leadSaved, openLead, closeLead }),
    [leadSaved]
  );

  return (
    <LeadCaptureContext.Provider value={value}>
      {children}
      {/* ÚNICO modal global */}
      <ModalLead
        open={isOpen}
        onClose={closeLead}
        dataResultado={resultado}
        onLeadSaved={() => { setLeadSaved(true); closeLead(); }}
        onSubmitLead={submitLead}
      />
    </LeadCaptureContext.Provider>
  );
}

export function useLeadCapture() {
  const ctx = useContext(LeadCaptureContext);
  if (!ctx) throw new Error("useLeadCapture debe usarse dentro de <LeadCaptureProvider>");
  return ctx;
}
