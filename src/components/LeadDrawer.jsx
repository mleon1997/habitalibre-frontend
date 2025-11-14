// src/components/LeadDrawer.jsx
import React from "react";
import LeadModalBare from "./LeadModalBare.jsx";

/**
 * Wrapper para mantener compatibilidad con el contexto antiguo.
 * Cualquier prop que reciba LeadDrawer (open, onClose, dataResultado, onSubmitLead, onLeadSaved, etc.)
 * se pasa tal cual a LeadModalBare.
 */
export default function LeadDrawer(props) {
  return <LeadModalBare {...props} />;
}

