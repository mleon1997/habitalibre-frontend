// src/components/ModalLead.jsx
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

export default function ModalLead({
  open,
  onClose,
  dataResultado,
  onLeadSaved,
  onSubmitLead,
}) {
  if (!open) return null;

  return createPortal(
    <Backdrop onClose={onClose}>
      <Panel
        open={open}
        dataResultado={dataResultado}
        onClose={onClose}
        onLeadSaved={onLeadSaved}
        onSubmitLead={onSubmitLead}
      />
    </Backdrop>,
    document.body
  );
}

function Backdrop({ children, onClose }) {
  return (
    <div className="hl-modal-overlay" aria-modal="true" role="dialog">
      <div
        className="absolute inset-0"
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
      />
      <div
        className="relative w-full max-w-2xl px-3"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function formatMoney(value) {
  if (value == null || value === "") return "—";

  const n = Number(value);

  if (!Number.isFinite(n)) return "—";

  return `$${n.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

function pickSelectedProperty(dataResultado) {
  const candidates = [
    dataResultado?.selectedProperty,
    dataResultado?.propertyContext,
    dataResultado?.__propertyContext,

    // ✅ Backend sostenible: /api/precalificar responde { output: respuesta }
    dataResultado?.output?.selectedProperty,
    dataResultado?.output?.propertyContext,
    dataResultado?.output?.propertyFit?.selectedProperty,
    dataResultado?.output?.resultadoPropiedad?.selectedProperty,

    dataResultado?.resultado?.selectedProperty,
    dataResultado?.resultado?.propertyContext,
    dataResultado?.resultado?.propertyFit?.selectedProperty,

    dataResultado?.__entrada?.selectedProperty,
    dataResultado?.perfilInput?.selectedProperty,
  ];

  for (const item of candidates) {
    if (
      item &&
      typeof item === "object" &&
      (item.id || item.slug || item.titulo)
    ) {
      return item;
    }
  }

  return null;
}

function pickPropertyFit(dataResultado) {
  const fit =
    dataResultado?.propertyFit ||
    dataResultado?.resultadoPropiedad ||
    dataResultado?.resultadoParaPropiedad ||
    // ✅ Backend sostenible: /api/precalificar responde { output: respuesta }
    dataResultado?.output?.propertyFit ||
    dataResultado?.output?.resultadoPropiedad ||
    dataResultado?.output?.resultadoParaPropiedad ||
    dataResultado?.resultado?.propertyFit ||
    dataResultado?.resultado?.resultadoPropiedad ||
    null;

  return fit && typeof fit === "object" ? fit : null;
}

function getFitTone(status) {
  if (
    status === "dentro_de_rango" ||
    status === "alcanzable_con_plan_entrada" ||
    status === "entrada_y_credito_viables"
  ) {
    return {
      badge:
        status === "entrada_y_credito_viables"
          ? "Entrada y crédito dentro de rango"
          : status === "alcanzable_con_plan_entrada"
            ? "Alcanzable con plan de entrada"
            : "Dentro de rango estimado",
      border: "border-emerald-200",
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      dot: "bg-emerald-500",
    };
  }

  if (
    status === "cerca" ||
    status === "cerca_con_plan_entrada" ||
    status === "cumple_entrada_pero_requiere_mejorar_capacidad" ||
    status === "cumple_entrada_pero_credito_corto"
  ) {
    return {
      badge:
        status === "cumple_entrada_pero_credito_corto"
          ? "Entrada viable, crédito ajustado"
          : status === "cumple_entrada_pero_requiere_mejorar_capacidad"
            ? "Entrada viable, falta validar crédito"
            : "Estás cerca",
      border: "border-amber-200",
      bg: "bg-amber-50",
      text: "text-amber-800",
      dot: "bg-amber-500",
    };
  }

  if (status === "fuera_de_rango") {
    return {
      badge: "Por encima de tu rango actual",
      border: "border-sky-200",
      bg: "bg-sky-50",
      text: "text-sky-800",
      dot: "bg-sky-500",
    };
  }

  return {
    badge: "Resultado referencial",
    border: "border-slate-200",
    bg: "bg-slate-50",
    text: "text-slate-700",
    dot: "bg-slate-400",
  };
}

function PropertyResultCard({ selectedProperty, propertyFit }) {
  if (!selectedProperty) return null;

  const tone = getFitTone(propertyFit?.status);

  const propertyPrice =
    propertyFit?.propertyPrice ||
    propertyFit?.precioPropiedad ||
    selectedProperty?.precio ||
    selectedProperty?.price ||
    0;

  const estimatedCapacity =
    propertyFit?.estimatedCapacity ||
    propertyFit?.capacidadEstimada ||
    propertyFit?.capacidadCompra ||
    null;

  const gapAbs =
    propertyFit?.gapAbs ||
    (propertyFit?.gap != null ? Math.abs(Number(propertyFit.gap)) : null);

  const planEntrada = propertyFit?.planEntrada || null;
  const showPlanEntrada = planEntrada?.aplica === true;

  const creditoEntrega = planEntrada?.creditoEntrega || null;
  const showCreditoEntrega = creditoEntrega?.aplica === true;

  const entradaDelta = showPlanEntrada
    ? Number(planEntrada.entradaProyectada || 0) -
      Number(planEntrada.entradaReferencial || 0)
    : 0;

  const projectedGapAbs =
    propertyFit?.projectedGapAbs || planEntrada?.projectedGapAbs || null;

  const title =
    selectedProperty?.titulo || selectedProperty?.name || "esta propiedad";

  const planEntradaLabel = (() => {
    if (!showPlanEntrada) return "";

    if (propertyFit?.status === "entrada_y_credito_viables") {
      return "Podrías completar la entrada y el crédito estaría dentro de rango estimado";
    }

    if (propertyFit?.status === "cumple_entrada_pero_credito_corto") {
      return "Podrías completar la entrada, pero el crédito estimado todavía estaría corto";
    }

    if (propertyFit?.status === "alcanzable_con_plan_entrada") {
      return "Con este plan podrías acercarte al proyecto";
    }

    if (propertyFit?.status === "cumple_entrada_pero_requiere_mejorar_capacidad") {
      return "Podrías completar la entrada, pero falta validar capacidad de crédito";
    }

    if (planEntrada?.cumpleEntradaReferencial) {
      return "Podrías completar la entrada referencial antes de la entrega";
    }

    return "Tu plan de entrada ayuda, pero todavía queda una brecha";
  })();

  return (
    <div className={`mt-5 rounded-2xl border ${tone.border} ${tone.bg} p-4`}>
      <div className="flex items-start gap-3">
        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${tone.dot}`} />

        <div className="flex-1">
          <p
            className={`text-[11px] uppercase tracking-[0.16em] font-semibold ${tone.text}`}
          >
            {tone.badge}
          </p>

          <h4 className="mt-1 text-base font-semibold text-slate-900">
            {propertyFit?.label || `Resultado para ${title}`}
          </h4>

          <p className="mt-2 text-sm text-slate-700 leading-6">
            {propertyFit?.message ||
              "Ya recibimos tu simulación. Te enviaremos el resultado completo y el siguiente paso recomendado."}
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[12px]">
            <div className="rounded-xl bg-white/80 border border-white px-3 py-2">
              <p className="text-slate-500">Propiedad</p>
              <p className="font-semibold text-slate-900">
                {formatMoney(propertyPrice)}
              </p>
            </div>

            <div className="rounded-xl bg-white/80 border border-white px-3 py-2">
              <p className="text-slate-500">Tu capacidad estimada hoy</p>
              <p className="font-semibold text-slate-900">
                {estimatedCapacity ? formatMoney(estimatedCapacity) : "En análisis"}
              </p>
            </div>

            <div className="rounded-xl bg-white/80 border border-white px-3 py-2">
              <p className="text-slate-500">Brecha actual</p>
              <p className="font-semibold text-slate-900">
                {gapAbs != null ? formatMoney(gapAbs) : "—"}
              </p>
            </div>
          </div>

          {showPlanEntrada && (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-white/80 p-3">
              <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-emerald-700">
                Escenario con entrada durante la obra
              </p>

              <h5 className="mt-1 text-sm font-semibold text-slate-900">
                {planEntradaLabel}
              </h5>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px]">
                <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                  <p className="text-slate-500">Entrada actual</p>
                  <p className="font-semibold text-slate-900">
                    {formatMoney(planEntrada.entradaActual)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                  <p className="text-slate-500">Abono mensual</p>
                  <p className="font-semibold text-slate-900">
                    {formatMoney(planEntrada.abonoMensual)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                  <p className="text-slate-500">Entrada proyectada</p>
                  <p className="font-semibold text-slate-900">
                    {formatMoney(planEntrada.entradaProyectada)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                  <p className="text-slate-500">Entrada ref.</p>
                  <p
                    className={[
                      "font-semibold",
                      planEntrada.cumpleEntradaReferencial
                        ? "text-emerald-700"
                        : "text-amber-700",
                    ].join(" ")}
                  >
                    {formatMoney(planEntrada.entradaReferencial)}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
                <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                  <p className="text-slate-500">
                    {entradaDelta >= 0 ? "Excedente de entrada" : "Brecha de entrada"}
                  </p>
                  <p
                    className={[
                      "font-semibold",
                      entradaDelta >= 0 ? "text-emerald-700" : "text-amber-700",
                    ].join(" ")}
                  >
                    {formatMoney(Math.abs(entradaDelta))}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2">
                  <p className="text-slate-500">Brecha proyectada total</p>
                  <p className="font-semibold text-slate-900">
                    {projectedGapAbs != null ? formatMoney(projectedGapAbs) : "—"}
                  </p>
                </div>
              </div>

              {showCreditoEntrega && (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-slate-600">
                    Crédito estimado al momento de entrega
                  </p>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[12px]">
                    <div className="rounded-xl bg-white border border-slate-100 px-3 py-2">
                      <p className="text-slate-500">Crédito requerido</p>
                      <p className="font-semibold text-slate-900">
                        {formatMoney(creditoEntrega.montoAFinanciarProyectado)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white border border-slate-100 px-3 py-2">
                      <p className="text-slate-500">Crédito estimado</p>
                      <p className="font-semibold text-slate-900">
                        {formatMoney(creditoEntrega.montoMaximoCreditoEstimado)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white border border-slate-100 px-3 py-2">
                      <p className="text-slate-500">
                        {creditoEntrega.cumpleCreditoEstimado
                          ? "Margen estimado"
                          : "Brecha de crédito"}
                      </p>
                      <p
                        className={[
                          "font-semibold",
                          creditoEntrega.cumpleCreditoEstimado
                            ? "text-emerald-700"
                            : "text-amber-700",
                        ].join(" ")}
                      >
                        {formatMoney(creditoEntrega.brechaCreditoEntregaAbs)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-[12px] text-slate-600 leading-relaxed">
                    {creditoEntrega.cumpleCreditoEstimado
                      ? "Con tu entrada proyectada, el crédito requerido podría estar dentro de tu rango estimado actual. La aprobación final dependerá de la entidad financiera."
                      : "Con tu entrada proyectada, todavía podría faltar mejorar tu capacidad de crédito, reducir deudas o aumentar entrada para llegar al monto requerido."}
                  </p>
                </div>
              )}

              <p className="mt-3 text-[12px] text-slate-600 leading-relaxed">
                {planEntrada.cumpleEntradaReferencial
                  ? `Con ${planEntrada.mesesHastaEntrega} meses hasta la entrega, tu entrada proyectada podría superar la entrada referencial. Aun así, la aprobación final dependerá de tu capacidad de crédito y de la entidad financiera.`
                  : `Con ${planEntrada.mesesHastaEntrega} meses hasta la entrega, todavía tendrías una brecha aproximada de ${formatMoney(
                      planEntrada.brechaEntradaAbs
                    )} para llegar a la entrada referencial.`}
              </p>
            </div>
          )}

          <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
            Resultado referencial. No constituye aprobación de crédito ni oferta formal de una entidad financiera.
          </p>
        </div>
      </div>
    </div>
  );
}

function Panel({ open, dataResultado, onClose, onLeadSaved, onSubmitLead }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [horizonteCompra, setHorizonteCompra] = useState("");

  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaCompartir, setAceptaCompartir] = useState(false);

  const [loading, setLoading] = useState(false);
  const [sentOK, setSentOK] = useState(false);
  const [err, setErr] = useState("");

  const resultadoLoading = !!dataResultado?.__loading;

  const selectedProperty = useMemo(
    () => pickSelectedProperty(dataResultado),
    [dataResultado]
  );

  const propertyFit = useMemo(
    () => pickPropertyFit(dataResultado),
    [dataResultado]
  );

  const hasPropertyFlow = !!selectedProperty;

  useEffect(() => {
    if (!open) return;
    setNombre("");
    setEmail("");
    setTelefono("");
    setCiudad("");
    setHorizonteCompra("");
    setAceptaTerminos(false);
    setAceptaCompartir(false);
    setLoading(false);
    setSentOK(false);
    setErr("");
  }, [open]);

  const emailOk = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim()),
    [email]
  );

  const telOk = useMemo(() => {
    const digits = (telefono || "").replace(/\D/g, "");
    return digits.length === 0 || (digits.length >= 9 && digits.length <= 15);
  }, [telefono]);

  const nombreOk = (nombre || "").trim().length >= 2;

  const canSubmit =
    nombreOk &&
    emailOk &&
    telOk &&
    aceptaTerminos &&
    aceptaCompartir &&
    !loading;

  async function handleSubmit(e) {
    e?.preventDefault?.();
    setErr("");

    if (!canSubmit) {
      setErr("Para continuar, completa tus datos y acepta ambas casillas.");
      return;
    }

    try {
      setLoading(true);

      const payloadContacto = {
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        ciudad: ciudad.trim(),
        tiempoCompra: horizonteCompra || null,
        aceptaTerminos,
        aceptaCompartir,
      };

      console.log("🔥 ModalLead submit -> payloadContacto", payloadContacto);

      const resp = await onSubmitLead?.(payloadContacto);

      if (!resp?.ok) {
        throw new Error(resp?.error || "No se pudo guardar tu solicitud.");
      }

      setSentOK(true);

      // Mantiene el flujo actual para el quick win normal.
      // Solo se detiene cuando viene desde una propiedad, para mostrar el resultado contextual.
      if (!hasPropertyFlow) {
        setTimeout(() => {
          onLeadSaved?.();
        }, 900);
      }
    } catch (e2) {
      console.error(e2);
      setErr(e2?.message || "No se pudo enviar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="hl-modal-panel max-h-[90dvh] overflow-y-auto overscroll-contain">
      <button
        onClick={onClose}
        className="absolute right-5 top-5 text-slate-500 hover:text-slate-700"
        aria-label="Cerrar"
        type="button"
      >
        ✕
      </button>

      {sentOK ? (
        <div className="pt-2">
          <p className="text-[11px] tracking-[0.22em] uppercase text-emerald-600 mb-3 font-medium">
            SOLICITUD RECIBIDA
          </p>

          <h3 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2 text-slate-900">
            {hasPropertyFlow ? "Ya tenemos tu resultado inicial" : "¡Listo! 🎉"}
          </h3>

          <p className="text-slate-700 text-sm leading-6">
            Ya recibimos tu información correctamente.
          </p>

          {hasPropertyFlow ? (
            <p className="text-slate-600 text-sm leading-6 mt-2">
              Esta es una estimación inicial para la propiedad seleccionada.
              También te enviaremos el resumen a{" "}
              <span className="font-medium text-slate-800">{email}</span>.
            </p>
          ) : (
            <p className="text-slate-600 text-sm leading-6 mt-2">
              Estamos preparando tu resultado personalizado y te lo enviaremos a{" "}
              <span className="font-medium text-slate-800">{email}</span>.
            </p>
          )}

          <PropertyResultCard
            selectedProperty={selectedProperty}
            propertyFit={propertyFit}
          />

          <p className="text-slate-500 text-xs mt-3">
            Revisa también promociones, notificaciones o spam por si llega ahí.
          </p>

          <div className="mt-6 flex gap-3">
            <button onClick={onLeadSaved} className="btn-primary" type="button">
              Continuar
            </button>
            <button onClick={onClose} className="btn-secondary" type="button">
              Cerrar
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-[11px] tracking-[0.22em] uppercase text-slate-400 mb-3">
            ESTÁS A 1 PASO DE VER TU RESULTADO
          </p>

          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 mb-2">
            {hasPropertyFlow
              ? "Déjanos tus datos y te mostramos si esta propiedad está a tu alcance"
              : "Déjanos tus datos y te mostramos tu mejor opción de crédito"}
          </h2>

          <p className="text-sm text-slate-600 mb-5">
            {hasPropertyFlow
              ? "No afecta tu buró. Usaremos tus datos para mostrarte una estimación referencial de esta propiedad y enviarte el resumen."
              : "No afecta tu buró, no pedimos claves bancarias y puedes pedir que eliminemos tus datos cuando quieras."}
          </p>

          {resultadoLoading && (
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-700 flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Estamos analizando tu caso… llena tus datos mientras tanto.
            </div>
          )}

          {loading && (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-[13px] text-emerald-800 flex items-start gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse mt-1" />
              <div>
                <div className="font-medium">Estamos guardando tu solicitud…</div>
                <div className="text-emerald-700/90 mt-1">
                  Esto toma solo unos segundos.
                </div>
              </div>
            </div>
          )}

          {err && (
            <div className="text-sm bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 mb-4">
              {err}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Nombre completo</label>
                <input
                  className="input"
                  placeholder="Ej. Juan Pérez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="email@dominio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="label">Teléfono</label>
                <input
                  className="input"
                  placeholder="+593..."
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="label">Ciudad</label>
                <input
                  className="input"
                  placeholder="Quito, Guayaquil, etc."
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label">¿Cuándo quisieras adquirir tu vivienda?</label>
                <select
                  className="input"
                  value={horizonteCompra}
                  onChange={(e) => setHorizonteCompra(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="0-6 meses">En los próximos 0–6 meses</option>
                  <option value="6-12 meses">En 6–12 meses</option>
                  <option value="1-2 años">En 1–2 años</option>
                  <option value="Más de 2 años">En más de 2 años</option>
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="mt-1"
                  disabled={loading}
                />
                <span>
                  Acepto los{" "}
                  <Link to="/terminos" className="underline" onClick={onClose}>
                    Términos de Uso
                  </Link>{" "}
                  y la{" "}
                  <Link to="/privacidad" className="underline" onClick={onClose}>
                    Política de Privacidad
                  </Link>{" "}
                  de HabitaLibre para contactarme y continuar el proceso.
                </span>
              </label>

              <label className="flex items-start gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={aceptaCompartir}
                  onChange={(e) => setAceptaCompartir(e.target.checked)}
                  className="mt-1"
                  disabled={loading}
                />
                <span>
                  Autorizo que HabitaLibre comparta mis datos y el resultado de mi simulación con{" "}
                  <b>bancos, cooperativas y desarrolladores inmobiliarios</b> aliados.
                </span>
              </label>

              <p className="text-[12px] text-slate-500">
                Para continuar y ver tu resultado completo debes aceptar ambas casillas.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                onClick={onClose}
                type="button"
                className="btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={!canSubmit}
                className={[
                  "btn-primary",
                  !canSubmit ? "opacity-50 cursor-not-allowed hover:scale-100" : "",
                ].join(" ")}
              >
                {loading
                  ? "Guardando..."
                  : resultadoLoading
                    ? "Guardar y continuar"
                    : hasPropertyFlow
                      ? "Ver resultado de esta propiedad"
                      : "Ver mi resultado"}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}