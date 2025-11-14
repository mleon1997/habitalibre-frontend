// src/context/LeadCaptureContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import ReactDOM from "react-dom";
import LeadModalBare from "../components/LeadModalBare.jsx";

const LeadCaptureContext = createContext(null);

export function LeadCaptureProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [resultado, setResultado] = useState(null);

  const openLead = useCallback((dataResultado) => {
    setResultado(dataResultado || null);
    setOpen(true);
  }, []);

  const closeLead = useCallback(() => {
    setOpen(false);
  }, []);

  const modal = open
    ? ReactDOM.createPortal(
        <div className="hl-modal-overlay">
          <div className="hl-modal-panel">
            <LeadModalBare
              open={open}
              onClose={closeLead}
              dataResultado={resultado}
            />
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <LeadCaptureContext.Provider value={{ openLead, closeLead }}>
      {children}
      {modal}
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
