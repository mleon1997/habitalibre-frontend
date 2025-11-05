// src/components/ResultCard.jsx
import React, { useState, useEffect } from "react";
import { generarPDFResumen } from "../lib/report";
import { motion, AnimatePresence } from "framer-motion";
import ModalLead from "./ModalLead.jsx";

/* =========================================================================
   RESULT CARD PRINCIPAL
   ========================================================================= */
export default function ResultCard({ data }) {
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadSaved, setLeadSaved] = useState(!!localStorage.getItem("leadModalShown"));
  const [loading, setLoading] = useState(false);

  // Mostrar modal automáticamente al primer resultado
  useEffect(() => {
    if (data?.ok && !localStorage.getItem("leadModalShown")) {
      const t = setTimeout(() => setShowLeadModal(true), 1500);
      return () => clearTimeout(t);
    }
  }, [data]);

  // Envío del lead con los campos "resultado" que necesita el email al cliente
  const handleLeadSubmit = async (form) => {
    try {
      setLoading(true);

      const payload = {
        // Datos del modal
        nombre: form?.nombre?.trim(),
        email: form?.email?.trim(),
        telefono: form?.telefono?.trim(),
        ciudad: form?.ciudad?.trim(),
        canal: form?.canal || "WhatsApp",
        aceptaTerminos: !!form?.aceptaTerminos,
        aceptaCompartir: !!form?.aceptaCompartir,
        aceptaMarketing: !!form?.aceptaMarketing,
        origen: "simulador",

        // Afinidad / producto elegido
        afinidad: data?.productoElegido ?? data?.tipoCreditoElegido ?? "",

        // Resultado para el correo del cliente
        resultado: {
          capacidadPago: Number(data?.capacidadPago ?? 0),
          montoMaximo: Number(data?.montoMaximo ?? 0),
        },

        // (opcional) guardar también en plano
        capacidadPago: Number(data?.capacidadPago ?? 0),
        montoMaximo: Number(data?.montoMaximo ?? 0),

        // Contexto útil (no obligatorio)
        ltv: Number(data?.ltv ?? 0),
        dtiConHipoteca: Number(data?.dtiConHipoteca ?? 0),
        productoElegido: data?.productoElegido ?? data?.tipoCreditoElegido ?? "",
        puntajeHL: data?.puntajeHabitaLibre?.score ?? null,
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "No se pudo registrar el lead");
      }

      // Éxito
      localStorage.setItem("leadModalShown", "1");
      setLeadSaved(true);
      setShowLeadModal(false);
    } catch (e) {
      console.error("❌ Error enviando lead:", e);
      alert("No se pudo enviar tu información. Inténtalo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  if (!data?.ok) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 text-center px-4">
        <div>
          <p className="font-medium text-slate-600 mb-1">Tu simulación aparecerá aquí 👇</p>
          <p className="text-sm text-slate-500">
            Completa los pasos del simulador a la izquierda para conocer tus opciones de crédito.
          </p>
        </div>
      </div>
    );
  }

  // Si aún no ha enviado el lead, bloquear vista del resultado
  if (!leadSaved) {
    return (
      <>
        <div className="h-full flex flex-col items-center justify-center text-center px-6 py-10 bg-white rounded-xl border shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">🔒 Resultado bloqueado</h2>
          <p className="text-slate-600 mb-4">
            Déjanos tus datos para ver tu resultado personalizado y recibir tu informe PDF.
          </p>
          <button
            onClick={() => setShowLeadModal(true)}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white hover:opacity-90 transition"
          >
            Ver mi resultado
          </button>
          <p className="mt-3 text-xs text-slate-500">
            Sin costo • Sin compromiso • Datos protegidos 🔒
          </p>
        </div>

        <AnimatePresence>
          {showLeadModal && (
            <ModalLead
              open={showLeadModal}
              onClose={() => setShowLeadModal(false)}
              onSubmit={handleLeadSubmit}
              loading={loading}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  // === CAMPOS DESDE BACKEND ===
  const capacidadPago = Number(data.capacidadPago ?? 0);
  const cuota = Number(data.cuotaEstimada ?? 0);
  const tasa = data.tasaAnual ? (data.tasaAnual * 100).toFixed(2) : "—";
  const plazo = Math.round((data.plazoMeses || 0) / 12);

  const keyFromProducto = (p) => {
    const k = String(p || "").toLowerCase();
    if (k.includes("vis")) return "vis";
    if (k.includes("vip")) return "vip";
    if (k.includes("biess") && (k.includes("pref") || k.includes("prefer"))) return "biess_pref";
    if (k.includes("biess")) return "biess";
    return "comercial";
  };

  const productKey =
    keyFromProducto(data?.productoElegido ?? data?.tipoCreditoElegido ?? "comercial");
  const escenarioElegido = data?.escenarios?.[productKey] ?? null;
  const cuotaMaxProducto = Number(
    escenarioElegido?.bounds?.cuotaMaxProducto ?? data?.capacidadPago ?? 0
  );
  const esViable =
    typeof escenarioElegido?.viable === "boolean"
      ? escenarioElegido.viable
      : Number(data?.cuotaEstimada ?? 0) <= cuotaMaxProducto + 1e-6;

  const nombreCredito =
    productKey === "vis"
      ? "Crédito VIS"
      : productKey === "vip"
      ? "Crédito VIP"
      : productKey === "biess_pref"
      ? "Crédito BIESS preferencial"
      : productKey === "biess"
      ? "Crédito BIESS"
      : "Banca privada";

  const badge = (tone, text) => {
    const tones = {
      green: "bg-emerald-100 text-emerald-700",
      amber: "bg-amber-100 text-amber-700",
      red: "bg-red-100 text-red-700",
      gray: "bg-slate-100 text-slate-600",
      indigo: "bg-indigo-100 text-indigo-700",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs ${tones[tone] || tones.gray}`}>
        {text}
      </span>
    );
  };

  const fmt = (n, d = 0) => Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: d });
  const pct = (n, d = 1) => `${fmt((Number(n) || 0) * 100, d)} %`;

  let estadoPrincipal = `${nombreCredito} (ajusta datos)`;
  let tonoPrincipal = "amber";
  if (esViable) {
    estadoPrincipal = `${nombreCredito} viable`;
    tonoPrincipal = "green";
  }

  const textoPrincipal = esViable
    ? `Tu perfil cumple con las condiciones para ${nombreCredito}.`
    : "Con estos datos, la cuota referencial supera tu capacidad de pago. Puedes sumar ingresos familiares, aumentar la entrada o ampliar el plazo.";

  const onPDF = () => {
    try {
      if (typeof generarPDFResumen !== "function") {
        alert("No se encontró la función generarPDFResumen. Revisa el import en src/lib/report.js");
        return;
      }
      generarPDFResumen(data, { nombre: data?.perfil?.nombre });
    } catch (e) {
      console.error(e);
      alert("No se pudo generar el PDF. Revisa la consola.");
    }
  };

  /* -----------------------------------------------------------------------
     UI
  ----------------------------------------------------------------------- */
  return (
    <div>
      {/* BLOQUE DE ESTADO PRINCIPAL */}
      <div className="mb-4 p-4 rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <div className="font-medium text-slate-800">Precalificación tentativa</div>
          {badge(tonoPrincipal, estadoPrincipal)}
        </div>
        <p className="text-sm text-slate-600">{textoPrincipal}</p>
      </div>

      {/* KPIs PRINCIPALES */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Kpi label="Capacidad de pago" value={`$ ${fmt(capacidadPago)}`} />
        <Kpi label="Cuota referencial" value={`$ ${fmt(cuota)}`} sub={`${plazo} años · ${tasa}%`} />
        <Kpi label="LTV estimado" value={pct(data.ltv)} />
      </div>

      {/* Puntaje HabitaLibre */}
      {data.puntajeHabitaLibre?.score != null && (
        <PuntajeHabitaLibre phl={data.puntajeHabitaLibre} />
      )}

      {/* KPIs DETALLADOS */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <Kpi label="Monto préstamo máx." value={`$ ${fmt(data.montoMaximo, 0)}`} />
        <Kpi label="Precio máx. vivienda" value={`$ ${fmt(data.precioMaxVivienda, 0)}`} />
        <Kpi label="DTI con hipoteca" value={pct(data.dtiConHipoteca, 1)} />
        <Kpi label="Stress (+2% tasa)" value={`$ ${fmt(data.cuotaStress, 0)}`} />
      </div>

      <Recomendaciones data={data} />

      <div className="mt-5 flex justify-end">
        <button
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:opacity-90"
          onClick={onPDF}
        >
          Descargar informe (PDF)
        </button>
      </div>

      <p className="mt-3 text-[11px] text-slate-500">
        Este resultado es referencial y no constituye una oferta de crédito. Sujeto a validación
        documental y políticas de cada entidad.
      </p>
    </div>
  );
}

/* ===================== COMPONENTES AUXILIARES ===================== */
function Kpi({ label, value, sub }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-lg font-semibold text-slate-800">{value}</div>
      {sub && <div className="text-[11px] text-slate-500">{sub}</div>}
    </div>
  );
}

function Recomendaciones({ data }) {
  const tips = [];
  if (data.ltv > 0.9) tips.push("Aumenta tu entrada para bajar el LTV por debajo de 90%.");
  if (data.dtiConHipoteca > 0.42) tips.push("Reduce deudas mensuales para mejorar el DTI.");
  if (!tips.length)
    tips.push("Perfil sólido. Podrías buscar tasas preferenciales y negociación de gastos.");

  return (
    <div className="mt-5 p-4 rounded-xl bg-slate-50 text-sm text-slate-700 border">
      <div className="font-medium mb-1">Recomendaciones</div>
      <ul className="list-disc ml-5 space-y-1">
        {tips.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

/* ===================== PUNTAJE HABITALIBRE ===================== */
function PuntajeHabitaLibre({ phl }) {
  const tone = phl?.categoria === "alto" ? "green" : phl?.categoria === "medio" ? "amber" : "red";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-6 p-5 rounded-2xl border bg-gradient-to-br from-indigo-50 to-white shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-semibold text-slate-800">Tu Puntaje HabitaLibre</h4>
        <span
          className={`px-2 py-0.5 rounded-full text-xs ${
            tone === "green"
              ? "bg-emerald-100 text-emerald-700"
              : tone === "amber"
              ? "bg-amber-100 text-amber-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {phl?.label || "—"}
        </span>
      </div>
      <div className="flex items-center gap-6 mt-2">
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 36 36" className="transform -rotate-90 w-full h-full">
            <path
              d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="2.5"
            />
            <motion.path
              d="M18 2 a 16 16 0 0 1 0 32 a 16 16 0 0 1 0 -32"
              fill="none"
              stroke={tone === "green" ? "#10b981" : tone === "amber" ? "#f59e0b" : "#ef4444"}
              strokeWidth="2.5"
              strokeDasharray="100, 100"
              animate={{
                strokeDasharray: [`${Math.max(0, Math.min(100, phl.score || 0))}, 100`],
              }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold text-slate-800">
              {Math.round(phl.score || 0)}
            </span>
            <span className="text-[11px] text-slate-500">/100</span>
          </div>
        </div>
        <div className="text-sm text-slate-700 flex-1">
          {phl.categoria === "alto" && (
            <p>🌟 Excelente perfil. Ya podrías acceder a tasas preferenciales.</p>
          )}
          {phl.categoria === "medio" && (
            <p>💡 Muy cerca. Con pequeños ajustes, alcanzarías un puntaje óptimo.</p>
          )}
          {phl.categoria === "bajo" && (
            <p>🚀 Tienes potencial. Mejora tu entrada o reduce tus deudas para subir tu score.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

