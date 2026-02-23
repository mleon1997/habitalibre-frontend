// src/components/LeadModalBare.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLeadCapture } from "../context/LeadCaptureContext.jsx";
import ModalLead from "./ModalLead.jsx";
import { crearLeadDesdeSimulador } from "../lib/api.js";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";

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
  const location = useLocation();

  const { isOpen, result, closeLead, resetLeadCapture } = useLeadCapture();
  const { token } = useCustomerAuth();

  const isInApp = location.pathname.startsWith("/app");
  const progresoHref = isInApp ? "/app/progreso" : "/progreso";

  // ✅ Si ya hay sesión, NO pedir datos otra vez
  useEffect(() => {
    if (!isOpen) return;
    if (!token) return;

    closeLead?.();
    resetLeadCapture?.();

    navigate(progresoHref, { replace: true });
  }, [isOpen, token, closeLead, resetLeadCapture, navigate, progresoHref]);

  const handleLeadSaved = () => {
    closeLead?.();
    resetLeadCapture?.();
    navigate("/gracias");
  };

  const handleSubmitLead = async (payloadContacto) => {
    try {
      const inputs =
        result?.perfilInput ||
        result?.perfil ||
        result?.input ||
        result?.inputs ||
        result?.payload ||
        result?.rawInput ||
        null;

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
        inputs?.tipo_compra_numero != null ? toNum(inputs?.tipo_compra_numero) : mapTipoCompraNumero(tipoCompra);

      const valorVivienda = toNum(inputs?.valorVivienda ?? inputs?.valor_vivienda ?? inputs?.valor);
      const entradaDisponible = toNum(inputs?.entradaDisponible ?? inputs?.entrada_disponible ?? inputs?.entrada);

      const edad = toNum(inputs?.edad);
      const tipoIngreso = String(inputs?.tipoIngreso ?? inputs?.tipo_ingreso ?? "").trim() || null;

      const resp = await crearLeadDesdeSimulador({
        contacto: { ...payloadContacto },
        precalif: {
          ...(inputs || {}),
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
        resultado: result,
      });

      return resp;
    } catch (err) {
      return { ok: false, error: err?.message || "No se pudo enviar el lead" };
    }
  };

  // ✅ Doble seguro: si ya hay token, nunca muestres el modal
  if (token) return null;

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