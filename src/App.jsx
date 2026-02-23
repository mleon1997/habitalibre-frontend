// src/components/LeadModalBare.jsx
import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLeadCapture } from "../context/LeadCaptureContext.jsx";
import ModalLead from "./ModalLead.jsx";
import { crearLeadDesdeSimulador } from "../lib/api.js";

// ✅ NUEVO: para detectar si el usuario ya está logueado
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

// ✅ Gate extra: si estás en /app, nunca abras modal ni navegues
function isInsideAppShell() {
  try {
    const { hash, pathname } = window.location || {};
    return String(hash || "").includes("#/app") || String(pathname || "").startsWith("/app");
  } catch {
    return false;
  }
}

export default function LeadModalBare() {
  const navigate = useNavigate();
  const { isOpen, result, closeLead, resetLeadCapture } = useLeadCapture();

  // ✅ token = ya hay sesión
  const { token } = useCustomerAuth();

  const inApp = useMemo(() => isInsideAppShell(), []);

  // ✅ FIX: si ya hay sesión, NO debemos pedir datos otra vez.
  // ✅ y si estás en /app, tampoco navegues (evita interferencias)
  useEffect(() => {
    if (!isOpen) return;
    if (!token) return;
    if (inApp) {
      closeLead?.();
      resetLeadCapture?.();
      return;
    }

    closeLead?.();
    resetLeadCapture?.();

    // ✅ comportamiento recomendado: llevar al progreso/journey
    navigate("/progreso", { replace: true });
  }, [isOpen, token, inApp, closeLead, resetLeadCapture, navigate]);

  const handleLeadSaved = () => {
    closeLead?.();
    resetLeadCapture?.();
    if (!inApp) navigate("/gracias");
  };

  const handleSubmitLead = async (payloadContacto) => {
    try {
      // ---------------------------------------------
      // ✅ 1) Inputs originales del simulador
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
      // ✅ 2) Normalizar inputs
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

      // (No lo mandas hoy como campo canónico, pero lo dejamos calculado por si lo necesitas)
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
        inputs?.tipo_compra_numero != null ? toNum(inputs?.tipo_compra_numero) : mapTipoCompraNumero(tipoCompra);

      // ✅ LOS QUE TE ESTÁN SALIENDO NULL EN BD
      const valorVivienda = toNum(inputs?.valorVivienda ?? inputs?.valor_vivienda ?? inputs?.valor);
      const entradaDisponible = toNum(inputs?.entradaDisponible ?? inputs?.entrada_disponible ?? inputs?.entrada);

      const edad = toNum(inputs?.edad);
      const tipoIngreso = String(inputs?.tipoIngreso ?? inputs?.tipo_ingreso ?? "").trim() || null;

      // ---------------------------------------------
      // ✅ 3) Enviar a API (inputs + resultado)
      // ---------------------------------------------
      const resp = await crearLeadDesdeSimulador({
        contacto: {
          ...payloadContacto,
        },
        precalif: {
          ...(inputs || {}),
          // claves canónicas
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
          // (opcional) si luego quieres mandar ingresoTotal también:
          // ingresoTotal,
        },
        resultado: result,
      });

      return resp;
    } catch (err) {
      return {
        ok: false,
        error: err?.message || "No se pudo enviar el lead",
      };
    }
  };

  // ✅ Doble seguro: si ya hay token, nunca muestres el modal
  if (token) return null;

  // ✅ y si estás dentro de /app, tampoco
  if (inApp) return null;

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