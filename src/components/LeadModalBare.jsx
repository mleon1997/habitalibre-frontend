// src/components/LeadModalBare.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useLeadCapture } from "../context/LeadCaptureContext.jsx";
import ModalLead from "./ModalLead.jsx";
import { crearLeadDesdeSimulador } from "../lib/api.js";

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

  const handleSubmitLead = async (payloadContacto) => {
    try {
      // ---------------------------------------------
      // ✅ 1) Inputs originales del simulador (deben venir por openLead(data, precalifPayload))
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
      // ✅ 2) Normalizar inputs (incluyendo LOS QUE TE FALTAN)
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
            payloadContacto?.ciudad ??
            ""
        ).trim() || null;

      const tipoCompra = lowerOrNull(inputs?.tipoCompra ?? inputs?.tipo_compra);
      const tipoCompraNumero =
        inputs?.tipo_compra_numero != null
          ? toNum(inputs?.tipo_compra_numero)
          : mapTipoCompraNumero(tipoCompra);

      // ✅ LOS QUE TE ESTÁN SALIENDO NULL EN BD
      const valorVivienda = toNum(inputs?.valorVivienda ?? inputs?.valor_vivienda ?? inputs?.valor);
      const entradaDisponible = toNum(inputs?.entradaDisponible ?? inputs?.entrada_disponible ?? inputs?.entrada);

      const edad = toNum(inputs?.edad);
      const tipoIngreso =
        String(inputs?.tipoIngreso ?? inputs?.tipo_ingreso ?? "").trim() || null;

      // ---------------------------------------------
      // ✅ 3) Enviar usando el helper correcto (inputs + resultado)
      // ---------------------------------------------
      const resp = await crearLeadDesdeSimulador({
        contacto: {
          ...payloadContacto,
          // si en tu UI lo capturas, puedes meter tipoCompra aquí también, pero preferimos leerlo de inputs
        },
        precalif: {
          // aquí mandamos el payload del simulador (inputs)
          ...(inputs || {}),
          // y aseguramos claves "canónicas"
          afiliadoIess,
          aniosEstabilidad,
          ingresoNetoMensual: ingresoIndividual,
          ingresoPareja: ingresoPareja,
          otrasDeudasMensuales: deudas,
          ciudadCompra,
          tipoCompra,
          tipoCompraNumero,
          valorVivienda,
          entradaDisponible,
          edad,
          tipoIngreso,
        },
        resultado: result, // lo que vino de /api/precalificar
      });

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
