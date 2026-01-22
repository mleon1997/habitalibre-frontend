// src/components/LeadModalBare.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useLeadCapture } from "../context/LeadCaptureContext.jsx";
import ModalLead from "./ModalLead.jsx";
import { crearLead } from "../lib/api.js";

// -------------------------------
// Helpers
// -------------------------------
const toNum = (v) => {
  if (v == null) return null;
  const n = Number(String(v).trim());
  return Number.isFinite(n) ? n : null;
};

const toBool = (v) => {
  if (v === true || v === false) return v;
  const s = String(v ?? "").trim().toLowerCase();
  if (["si", "sí", "true", "1"].includes(s)) return true;
  if (["no", "false", "0"].includes(s)) return false;
  return null;
};

const lowerOrNull = (v) => {
  const s = String(v ?? "").trim();
  return s ? s.toLowerCase() : null;
};

const mapTipoCompraNumero = (raw) => {
  const t = lowerOrNull(raw);
  if (t === "solo") return 1;
  if (t === "pareja" || t === "en_pareja") return 2;
  return null;
};

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
      // ---------------------------------------------
      // ✅ 1) Intentar leer inputs originales del simulador
      // ---------------------------------------------
      const inputs =
        result?.perfilInput ||
        result?.perfil ||
        result?.input ||
        result?.inputs ||
        result?.payload ||
        result?.rawInput ||
        null;

      // ---------------------------------------------
      // ✅ 2) Normalizar y mergear campos "planos"
      //     (para que tu dashboard no quede con nulls)
      // ---------------------------------------------
      const afiliadoIess = toBool(inputs?.afiliadoIess ?? inputs?.afiliado_iess);
      const aniosEstabilidad = toNum(inputs?.aniosEstabilidad ?? inputs?.anios_estabilidad);

      const ingresoIndividual = toNum(
        inputs?.ingresoNetoMensual ??
          inputs?.ingreso_mensual ??
          inputs?.ingreso ??
          inputs?.ingresoMensual
      );

      const ingresoPareja = toNum(
        inputs?.ingresoPareja ??
          inputs?.ingreso_pareja ??
          inputs?.ingresoParejaMensual
      );

      // si viene separado, sumamos
      const ingresoTotal =
        ingresoIndividual != null || ingresoPareja != null
          ? Number(ingresoIndividual || 0) + Number(ingresoPareja || 0)
          : null;

      const deudas = toNum(
        inputs?.otrasDeudasMensuales ??
          inputs?.deuda_mensual_aprox ??
          inputs?.deudas ??
          inputs?.deudaMensual
      );

      const ciudadCompra =
        String(
          inputs?.ciudadCompra ??
            inputs?.ciudad_compra ??
            inputs?.ciudad ??
            payload?.ciudad ??
            ""
        ).trim() || null;

      const tipoCompra = lowerOrNull(inputs?.tipoCompra ?? inputs?.tipo_compra);
      const tipoCompraNumero =
        inputs?.tipo_compra_numero != null
          ? toNum(inputs?.tipo_compra_numero)
          : mapTipoCompraNumero(tipoCompra);

      const payloadFinal = {
        ...payload,

        // ✅ CAMPOS PLANOS: los que ves como null en tu screenshot
        afiliado_iess: afiliadoIess,
        ingreso_mensual: ingresoTotal,
        anios_estabilidad: aniosEstabilidad,
        deuda_mensual_aprox: deudas,
        ciudad_compra: ciudadCompra,
        tipo_compra: tipoCompra,
        tipo_compra_numero: tipoCompraNumero,

        // ✅ opcional: deja rastro de qué inputs se usaron (debug)
        // metadata: { ...(payload?.metadata || {}), inputsFromResult: !!inputs },
      };

      const resp = await crearLead(payloadFinal);
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
