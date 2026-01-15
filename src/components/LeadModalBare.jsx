// src/components/LeadModalBare.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useLeadCapture } from "../context/LeadCaptureContext.jsx";
import ModalLead from "./ModalLead.jsx";
import { crearLead } from "../lib/api.js";

export default function LeadModalBare() {
  const navigate = useNavigate();
  const { isOpen, result, closeLead, resetLeadCapture } = useLeadCapture();

  const handleLeadSaved = () => {
    closeLead?.();
    resetLeadCapture?.();
    navigate("/gracias");
  };

  const handleSubmitLead = async (payload) => {
    try {
      const resp = await crearLead(payload);
      return resp;
    } catch (err) {
      return {
        ok: false,
        error: err?.message || "No se pudo enviar el lead",
      };
    }
  };

  return (
    <ModalLead
      open={!!isOpen}
      onClose={() => {
        closeLead?.();
        resetLeadCapture?.();
      }}
      dataResultado={result}
      onLeadSaved={handleLeadSaved}
      onSubmitLead={handleSubmitLead}
    />
  );
}
