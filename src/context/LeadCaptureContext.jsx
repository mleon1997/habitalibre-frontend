// src/context/LeadCaptureContext.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

const LeadCaptureContext = createContext(null);

export function LeadCaptureProvider({ children }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const openLead = useCallback((result) => {
    setLastResult(result || null);
    setModalOpen(true);
  }, []);

  const closeLead = useCallback(() => {
    setModalOpen(false);
  }, []);

  const value = {
    modalOpen,
    lastResult,
    openLead,
    closeLead,
  };

  return (
    <LeadCaptureContext.Provider value={value}>
      {children}
    </LeadCaptureContext.Provider>
  );
}

export function useLeadCapture() {
  const ctx = useContext(LeadCaptureContext);
  if (!ctx) {
    throw new Error(
      "useLeadCapture debe usarse dentro de un <LeadCaptureProvider>"
    );
  }
  return ctx;
}
