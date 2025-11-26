// src/components/ResultCard.jsx
import React from "react";
import { useLeadCapture } from "../context/LeadCaptureContext.jsx";
import { calcularPlanCompra } from "../lib/planCompra.js";

// Helpers de formato
const fmtMoney = (n, d = 0) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  return `$ ${v.toLocaleString("es-EC", {
    minimumFractionDigits: 0,
    maximumFractionDigits: d,
  })}`;
};

const fmtPct = (n, d = 1) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  return `${(v * 100).toFixed(d).replace(".0", "")} %`;
};

// Chip “Viable / A revisar” a nivel módulo para usarlo en OptionRow
const fmtViable = (opt) =>
  opt?.viable ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300 border border-emerald-400/20">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
      Viable
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-700/40 px-2 py-0.5 text-[10px] font-medium text-slate-300 border border-slate-600/60">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      A revisar
    </span>
  );

/**
 * Bloque: Plan recomendado de ahorro / timing de compra
 */
function PlanRecomendado({ data }) {
  // Intentamos derivar los datos base desde la respuesta del backend
  const valorVivienda =
    data?.valorVivienda ?? data?.precioMaxVivienda ?? null;

  // Si el backend ya devuelve la entrada usada, la usamos; si no, la calculamos como valor - préstamo
  const entradaDisponible =
    data?.entradaDisponible ??
    (valorVivienda && data?.montoMaximo
      ? valorVivienda - data.montoMaximo
      : null);

  // Horizonte de compra: viene del wizard / payload inicial
  const horizonteCompra =
    data?.tiempoCompra ??
    data?.horizonteCompra ??
    data?.entrada?.tiempoCompra ??
    null;

  // Si no tenemos insumos mínimos, mostramos un fallback suave
  if (!valorVivienda || !entradaDisponible || !horizonteCompra) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-50 mb-1">
          📈 Plan recomendado
        </h3>
        <p className="text-[11px] text-slate-400">
          Con tu valor de vivienda, tu entrada y tu horizonte de compra
          diseñamos un plan de ahorro mensual para que llegues más fuerte a la
          solicitud de crédito.
        </p>
        <p className="mt-2 text-[11px] text-slate-500">
          En tu siguiente simulación, asegúrate de indicar el rango de tiempo
          en el que quisieras comprar: así podremos personalizar aún más tu
          plan.
        </p>
      </div>
    );
  }

  const plan = calcularPlanCompra({
    valorVivienda,
    entradaDisponible,
    horizonteCompra,
  });

  const { brecha, ahorroMensual, meses, escenario, entradaObjetivo } = plan;
  const fmt = new Intl.NumberFormat("es-EC");

  const bloques = {
    urgente_baja_entrada: (
      <>
        <p className="text-[11px] text-slate-200">
          Quieres comprar pronto pero tu entrada aún es baja para este rango de
          vivienda.
        </p>
        <ul className="text-[11px] text-slate-300 mt-2 space-y-0.5">
          <li>
            • Entrada objetivo: <b>${fmt.format(entradaObjetivo ?? 0)}</b>
          </li>
          <li>
            • Brecha actual: <b>${fmt.format(brecha ?? 0)}</b>
          </li>
          <li>
            • Ahorro recomendado:{" "}
            <b>${fmt.format(ahorroMensual ?? 0)}</b> / mes durante {meses} meses
          </li>
        </ul>
        <p className="mt-2 text-[10px] text-slate-500">
          También podrías considerar opciones un poco más económicas, sumar un
          co-deudor o usar cesantía / fondos de reserva para completar la
          entrada.
        </p>
      </>
    ),

    mediano_plazo: (
      <>
        <p className="text-[11px] text-slate-200">
          Estás bien encaminado. Si mantienes un ahorro mensual, podrás mejorar
          tu entrada y acceder a mejores condiciones.
        </p>
        <ul className="text-[11px] text-slate-300 mt-2 space-y-0.5">
          <li>
            • Entrada objetivo: <b>${fmt.format(entradaObjetivo ?? 0)}</b>
          </li>
          <li>
            • Ahorro recomendado:{" "}
            <b>${fmt.format(ahorroMensual ?? 0)}</b> / mes durante {meses} meses
          </li>
        </ul>
      </>
    ),

    largo_plazo: (
      <>
        <p className="text-[11px] text-slate-200">
          Tu plan es a más largo plazo. Este es un buen momento para ordenar
          tus finanzas, reducir deudas caras y fortalecer tu perfil crediticio.
        </p>
        <ul className="text-[11px] text-slate-300 mt-2 space-y-0.5">
          <li>
            • Meta de entrada: <b>${fmt.format(entradaObjetivo ?? 0)}</b>
          </li>
          <li>
            • Con un ahorro de{" "}
            <b>${fmt.format(ahorroMensual ?? 0)}</b> / mes estarías listo en{" "}
            {meses} meses.
          </li>
        </ul>
      </>
    ),

    explorando: (
      <>
        <p className="text-[11px] text-slate-200">
          Estás explorando opciones. Con tu perfil actual, este es un rango
          saludable de compra.
        </p>
        <p className="text-[11px] text-slate-300 mt-2">
          Si ahorras <b>${fmt.format(ahorroMensual ?? 0)}</b> al mes, podrías
          llegar a una entrada aproximada de{" "}
          <b>${fmt.format(entradaObjetivo ?? 0)}</b> en {meses} meses.
        </p>
      </>
    ),

    listo: (
      <>
        <p className="text-[11px] text-slate-200">
          ¡Excelente! Tu entrada ya está en un nivel competitivo para este
          rango de vivienda.
        </p>
        <p className="text-[11px] text-slate-300 mt-2">
          Estás listo para avanzar con una precalificación bancaria inmediata y
          comparar ofertas entre varias entidades.
        </p>
      </>
    ),
  };

  const contenido = bloques[escenario] ?? bloques.mediano_plazo;

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 px-4 py-3">
      <h3 className="text-sm font-semibold text-slate-50 mb-1">
        📈 Plan recomendado
      </h3>
      {contenido}
    </div>
  );
}

function ResultCard({ data }) {
  const { leadSaved, openLead } = useLeadCapture();

  if (!data?.ok) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 text-center">
        <div>
          <p className="font-medium text-slate-200 mb-1">
            Tu simulación aparecerá aquí 👇
          </p>
          <p className="text-sm text-slate-400">
            Completa el simulador para ver resultados personalizados.
          </p>
        </div>
      </div>
    );
  }

  if (!leadSaved) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-50 mb-2">
          🔒 Resultado bloqueado
        </h3>
        <p className="text-slate-400 mb-4">
          Déjanos tus datos para ver el detalle completo y recibir tu reporte en
          PDF por correo.
        </p>
        <button className="btn-primary" onClick={() => openLead(data)}>
          Ver mi resultado
        </button>
        <p className="mt-3 text-xs text-slate-500">
          Sin costo • Sin compromiso • Datos protegidos
        </p>
      </div>
    );
  }

  // =========================
  // Segmento / tipo de crédito
  // =========================
  const rawSegmento =
    data.segmentoHabitaLibre ||
    data.segmentoCredito ||
    data.productoElegido ||
    "";

  const segmentoUpper = rawSegmento.toString().toUpperCase();

  const isVIS = segmentoUpper.includes("VIS");
  const isVIP = segmentoUpper.includes("VIP");
  const isBIESS = segmentoUpper.includes("BIESS");
  const isPriv =
    segmentoUpper.includes("COMERCIAL") || segmentoUpper.includes("PRIV");

  let producto = "crédito hipotecario";
  if (isVIS) producto = "crédito VIS";
  else if (isBIESS) producto = "crédito BIESS";
  else if (isVIP) producto = "crédito VIP";
  else if (isPriv) producto = "crédito privado";

  // ========= Flag “sin oferta viable” (escenarios A4/A5) =========
  const montoMaximoNum = Number(
    data.montoMaximo ?? data.montoMaximoEstimado ?? NaN
  );
  const precioMaxNum = Number(
    data.precioMaxVivienda ?? data.valorViviendaMax ?? NaN
  );
  const flagSinOferta = data?.flags?.sinOferta;

  const sinOferta =
    typeof flagSinOferta === "boolean"
      ? flagSinOferta
      : !Number.isFinite(montoMaximoNum) ||
        montoMaximoNum <= 0 ||
        !Number.isFinite(precioMaxNum) ||
        precioMaxNum <= 0;

  // Datos con fallback
  const cuota = data.cuotaEstimada;
  const cuotaStress = data.stressTest?.cuotaStress ?? data.cuotaStress;
  const tasaBase = data.tasaAnual;
  const tasaStress =
    data.stressTest?.tasaStress ?? (tasaBase ? tasaBase + 0.02 : null);

  const dti = data.dtiConHipoteca;
  const ltv = data.ltv;
  const montoMaximo = data.montoMaximo;
  const precioMaxVivienda = data.precioMaxVivienda;
  const capacidadPago = data.capacidadPago; // solo para backend/PDF

  const opciones = data.opciones || {};
  const accionesClave = Array.isArray(data.accionesClave)
    ? data.accionesClave
    : [];

  const score = data.puntajeHabitaLibre?.score;
  const scoreLabel = data.puntajeHabitaLibre?.label || "Perfil a revisar";

  // Chip de riesgo
  let riesgoText = "Perfil a revisar";
  let riesgoClass = "bg-amber-400/10 text-amber-300 border border-amber-400/30";
  if (data.riesgoHabitaLibre === "bajo") {
    riesgoText = "Perfil sólido";
    riesgoClass =
      "bg-emerald-400/10 text-emerald-300 border border-emerald-400/30";
  } else if (data.riesgoHabitaLibre === "medio") {
    riesgoText = "Perfil exigido";
    riesgoClass =
      "bg-amber-400/10 text-amber-300 border border-amber-400/30";
  } else if (data.riesgoHabitaLibre === "alto") {
    riesgoText = "Riesgo alto";
    riesgoClass = "bg-red-400/10 text-red-300 border border-red-400/30";
  }

  // Override para el caso sin oferta: que se note que es un “todavía no”
  if (sinOferta) {
    riesgoText = "Perfil en construcción";
    riesgoClass =
      "bg-slate-700/60 text-slate-200 border border-slate-600/80";
  }

  return (
    <div className="space-y-4">
      {/* Headline principal */}
      <div className="p-4 rounded-2xl border border-slate-700/40 bg-slate-900/70 backdrop-blur-sm shadow-[0_0_40px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Resumen de precalificación
            </p>

            {sinOferta ? (
              <h3 className="text-base font-semibold text-slate-50 mt-1">
                Hoy un crédito hipotecario no sería sostenible con tu perfil
                actual
              </h3>
            ) : (
              <h3 className="text-base font-semibold text-slate-50 mt-1">
                🎉 ¡Estás pre-calificado para un{" "}
                <span className="text-indigo-300">{producto}</span>!
              </h3>
            )}

            {sinOferta ? (
              <p className="text-[11px] text-slate-400 mt-1">
                Con tus ingresos y deudas actuales, un crédito hipotecario no
                sería sostenible ni para ti ni para los bancos. No es un “no”
                definitivo, es un “todavía no”. En los bloques de abajo verás
                por dónde empezar para fortalecer tu perfil.
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">
                Con la información que ingresaste estimamos el rango de vivienda
                y de crédito que podrían aprobarte. Te acabamos de enviar a tu
                correo un reporte en PDF con el detalle, stress test de tasa,
                tabla de amortización y un plan de acción para mejorar aún más
                tus probabilidades.
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-1">
            {typeof score === "number" && (
              <div className="text-right">
                <p className="text-[10px] uppercase text-slate-500 leading-tight">
                  Score HL
                </p>
                <p className="text-sm font-semibold text-slate-50">
                  {score}/100
                </p>
                <p className="text-[10px] text-slate-500">{scoreLabel}</p>
              </div>
            )}
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium ${riesgoClass}`}
            >
              {riesgoText}
            </span>
          </div>
        </div>

        {/* Hero de montos principales */}
        {!sinOferta && (
          <>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="bg-slate-900/70 rounded-xl border border-slate-700/50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-0.5">
                  Vivienda máx. estimada
                </p>
                <p className="text-lg font-semibold text-emerald-300">
                  {fmtMoney(precioMaxVivienda, 0)}
                </p>
              </div>
              <div className="bg-slate-900/70 rounded-xl border border-slate-700/50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-0.5">
                  Monto de préstamo aprox.
                </p>
                <p className="text-lg font-semibold text-emerald-300">
                  {fmtMoney(montoMaximo, 0)}
                </p>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-slate-400 max-w-md">
              Con este rango podrías aspirar a un departamento de 1–2
              dormitorios en proyectos VIS/VIP o segmento medio, según la zona
              y el proyecto.
            </p>
          </>
        )}
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 gap-3 mb-1">
        <Kpi
          label="Cuota estimada"
          value={sinOferta ? "—" : fmtMoney(cuota, 0)}
          helper={
            sinOferta
              ? "Cuando tu perfil mejore, aquí verás una cuota hipotecaria sostenible."
              : "Cuota mensual aproximada del crédito con las condiciones actuales."
          }
        />
        <Kpi
          label="DTI con hipoteca"
          value={fmtPct(dti)}
          helper={
            sinOferta
              ? "Hoy tus pagos y deudas representan una parte alta de tus ingresos."
              : "Idealmente ≤ 42% para un perfil cómodo; algunos bancos aceptan algo más en VIS/VIP."
          }
        />
        <Kpi
          label="Stress de cuota (+2% tasa)"
          value={
            sinOferta || !Number.isFinite(Number(cuotaStress))
              ? "—"
              : fmtMoney(cuotaStress, 0)
          }
          helper={
            sinOferta
              ? "En cuanto tengas una oferta viable, te mostraremos cómo cambia tu cuota si sube la tasa."
              : `Escenario conservador si la tasa sube a ${fmtPct(
                  tasaStress
                )} aprox.`
          }
        />
        <Kpi
          label="LTV estimado"
          value={sinOferta ? "—" : fmtPct(ltv)}
          helper="Entre más bajo el LTV, mejor tasa y mayor probabilidad de aprobación."
        />
      </div>

      {/* Plan recomendado */}
      <PlanRecomendado data={data} />

      {/* Opciones por tipo de crédito */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/70 p-3">
        <p className="text-[11px] font-semibold text-slate-300 mb-2 uppercase tracking-wide">
          {sinOferta
            ? "Rutas de crédito a futuro (cuando tu perfil esté listo)"
            : "Tipo de crédito según tu perfil"}
        </p>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <OptionRow
            label="Crédito VIS"
            opt={opciones.VIS}
            note="Tope regulado y subsidios si cumples requisitos."
            destacado={isVIS}
          />
          <OptionRow
            label="Crédito VIP"
            opt={opciones.VIP}
            note="Mejor tasa para vivienda entre VIS y segmento medio."
            destacado={isVIP}
          />
          <OptionRow
            label="Crédito BIESS"
            opt={opciones.BIESS}
            note="Requiere aportes IESS suficientes."
            destacado={isBIESS}
          />
          <OptionRow
            label="Crédito privado"
            opt={opciones.Privada}
            note="Bancos/financieras privadas, más flexibles pero tasa mayor."
            destacado={isPriv}
          />
        </div>
      </div>

      {/* Plan de acción (acciones clave) */}
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-900/25 p-3">
        <p className="text-[11px] font-semibold text-indigo-200 mb-1 uppercase tracking-wide">
          Cómo aumentar tus probabilidades de aprobación
        </p>
        <ul className="mt-1 space-y-1.5 text-[11px] text-indigo-100">
          {accionesClave.length > 0 ? (
            accionesClave.map((txt, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                <span>{txt}</span>
              </li>
            ))
          ) : sinOferta ? (
            <>
              <li className="flex gap-1.5">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                <span>
                  Apunta a que tu ingreso familiar neto suba y se mantenga
                  estable (roles de pago claros o RUC / declaraciones).
                </span>
              </li>
              <li className="flex gap-1.5">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                <span>
                  Evita nuevas deudas de consumo y prioriza pagar las que ya
                  tienes para liberar capacidad de pago.
                </span>
              </li>
              <li className="flex gap-1.5">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                <span>
                  Empieza un plan de ahorro para la entrada, aunque sea con
                  montos pequeños pero constantes.
                </span>
              </li>
            </>
          ) : (
            <li className="flex gap-1.5">
              <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
              <span>
                Tu perfil es competitivo. Te recomendamos solicitar
                precalificación en 2–3 entidades y comparar TCEA, no solo la
                tasa.
              </span>
            </li>
          )}
        </ul>
      </div>

      {/* Disclaimer */}
      <p className="mt-1 text-[10px] text-slate-500 leading-snug">
        Este resultado es referencial y no constituye oferta de crédito. La
        aprobación final depende de la validación de cada entidad financiera
        (políticas internas, documentación y análisis de riesgo).
      </p>
    </div>
  );
}

function Kpi({ label, value, helper }) {
  return (
    <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/50">
      <div className="text-[11px] uppercase tracking-wide text-slate-400 mb-0.5">
        {label}
      </div>
      <div className="text-lg font-semibold text-slate-50">{value}</div>
      {helper && (
        <p className="mt-0.5 text-[10px] text-slate-500 leading-snug">
          {helper}
        </p>
      )}
    </div>
  );
}

function OptionRow({ label, opt, note, destacado }) {
  return (
    <div
      className={`flex flex-col gap-0.5 rounded-xl border px-2.5 py-2 ${
        destacado
          ? "border-indigo-400/40 bg-indigo-900/40"
          : "border-slate-700/60 bg-slate-900/60"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-100">
          {label}
        </span>
        {opt ? (
          fmtViable(opt)
        ) : (
          <span className="text-[10px] text-slate-500">Sin datos</span>
        )}
      </div>

      {opt && (
        <div className="flex items-center justify-between text-[10px] text-slate-300 mt-0.5">
          <span>
            Tasa ref.:{" "}
            <span className="font-medium">{fmtPct(opt.tasa)}</span>
          </span>
          <span>
            Plazo:{" "}
            <span className="font-medium">
              {opt.plazo ? `${opt.plazo} meses` : "—"}
            </span>
          </span>
        </div>
      )}

      {note && (
        <p className="mt-0.5 text-[10px] text-slate-400 leading-snug">{note}</p>
      )}
    </div>
  );
}

export default ResultCard;
