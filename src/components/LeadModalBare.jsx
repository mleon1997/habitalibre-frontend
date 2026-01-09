// src/components/LeadModalBare.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useLeadCapture } from "../context/LeadCaptureContext.jsx";
import ModalLead from "./ModalLead.jsx";

async function postLead(payload) {
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return { ok: false, error: data?.error || data?.message || `HTTP ${res.status}` };
  }

  return data?.ok ? data : { ok: true, ...data };
}

export default function LeadModalBare() {
  const navigate = useNavigate();
  const { isOpen, result, closeLead, resetLeadCapture } = useLeadCapture();

  const handleLeadSaved = () => {
    closeLead?.();
    resetLeadCapture?.();
    navigate("/gracias"); // ✅ ahora sí va a Gracias.jsx
  };

  const handleSubmitLead = async (payload) => {
    const resp = await postLead(payload);
    return resp;
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
