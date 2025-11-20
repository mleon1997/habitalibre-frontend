// src/components/ResultCard.jsx
import React from "react";
import { useLeadCapture } from "../context/LeadCaptureContext.jsx";
import { calcularPlanCompra } from "../lib/planCompra.js";

// Helpers de formato
const fmtMoney = (n, d = 0) =>
  `$ ${Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: d,
  })}`;

const fmtPct = (n, d = 1) =>
  `${(Number(n || 0) * 100).toFixed(d).replace(".0", "")} %`;

// Chip “Viable / A revisar” a nivel módulo para usarlo en OptionRow
const fmtViable = (opt) =>
  opt?.viable ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-100">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Viable
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500 border border-slate-200">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      A revisar
    </span>
  );

/**
 * Bloque nuevo: Plan recomendado de ahorro / timing de compra
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
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">
          📈 Plan recomendado
        </h3>
        <p className="text-[11px] text-slate-600">
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
        <p className="text-[11px] text-slate-700">
          Quieres comprar pronto pero tu entrada aún es baja para este rango de
          vivienda.
        </p>
        <ul className="text-[11px] text-slate-600 mt-2 space-y-0.5">
          <li>
            • Entrada objetivo:{" "}
            <b>${fmt.format(entradaObjetivo ?? 0)}</b>
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
          Adicionalmente podrías considerar opciones un poco más económicas,
          sumar un co-deudor o usar cesantía / fondos de reserva para completar
          la entrada.
        </p>
      </>
    ),

    mediano_plazo: (
      <>
        <p className="text-[11px] text-slate-700">
          Estás bien encaminado. Si mantienes un ahorro mensual, podrás mejorar
          tu entrada y acceder a mejores condiciones.
        </p>
        <ul className="text-[11px] text-slate-600 mt-2 space-y-0.5">
          <li>
            • Entrada objetivo:{" "}
            <b>${fmt.format(entradaObjetivo ?? 0)}</b>
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
        <p className="text-[11px] text-slate-700">
          Tu plan es a más largo plazo. Este es un buen momento para ordenar
          tus finanzas, reducir deudas caras y fortalecer tu perfil crediticio.
        </p>
        <ul className="text-[11px] text-slate-600 mt-2 space-y-0.5">
          <li>
            • Meta de entrada:{" "}
            <b>${fmt.format(entradaObjetivo ?? 0)}</b>
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
        <p className="text-[11px] text-slate-700">
          Estás explorando opciones. Con tu perfil actual, este es un rango
          saludable de compra.
        </p>
        <p className="text-[11px] text-slate-600 mt-2">
          Si ahorras{" "}
          <b>${fmt.format(ahorroMensual ?? 0)}</b> al mes, podrías llegar a una
          entrada aproximada de{" "}
          <b>${fmt.format(entradaObjetivo ?? 0)}</b> en {meses} meses.
        </p>
      </>
    ),

    listo: (
      <>
        <p className="text-[11px] text-slate-700">
          ¡Excelente! Tu entrada ya está en un nivel competitivo para este
          rango de vivienda.
        </p>
        <p className="text-[11px] text-slate-600 mt-2">
          Estás listo para avanzar con una precalificación bancaria inmediata y
          comparar ofertas entre varias entidades.
        </p>
      </>
    ),
  };

  const contenido = bloques[escenario] ?? bloques.mediano_plazo;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <h3 className="text-sm font-semibold text-slate-900 mb-1">
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
          <p className="font-medium text-slate-600 mb-1">
            Tu simulación aparecerá aquí 👇
          </p>
          <p className="text-sm text-slate-500">
            Completa el simulador para ver resultados personalizados.
          </p>
        </div>
      </div>
    );
  }

  if (!leadSaved) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          🔒 Resultado bloqueado
        </h3>
        <p className="text-slate-600 mb-4">
          Déjanos tus datos para ver el detalle completo y recibir tu reporte en
          PDF.
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

  // Datos con fallback
  const producto = data.productoElegido || "Crédito hipotecario";
  const cuota = data.cuotaEstimada;
  const cuotaStress = data.stressTest?.cuotaStress ?? data.cuotaStress;
  const tasaBase = data.tasaAnual;
  const tasaStress =
    data.stressTest?.tasaStress ?? (tasaBase ? tasaBase + 0.02 : null);

  const dti = data.dtiConHipoteca;
  const ltv = data.ltv;
  const montoMaximo = data.montoMaximo;
  const precioMaxVivienda = data.precioMaxVivienda;
  const capacidadPago = data.capacidadPago;

  const opciones = data.opciones || {};
  const accionesClave = Array.isArray(data.accionesClave)
    ? data.accionesClave
    : [];

  const score = data.puntajeHabitaLibre?.score;
  const scoreLabel = data.puntajeHabitaLibre?.label || "Perfil a revisar";

  // Chip de riesgo
  let riesgoText = "Perfil a revisar";
  let riesgoClass = "bg-amber-100 text-amber-700";
  if (data.riesgoHabitaLibre === "bajo") {
    riesgoText = "Perfil sólido";
    riesgoClass = "bg-emerald-100 text-emerald-700";
  } else if (data.riesgoHabitaLibre === "medio") {
    riesgoText = "Perfil exigido";
    riesgoClass = "bg-amber-100 text-amber-700";
  } else if (data.riesgoHabitaLibre === "alto") {
    riesgoText = "Riesgo alto";
    riesgoClass = "bg-red-100 text-red-700";
  }

  return (
    <div className="space-y-4">
      {/* Headline principal */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50 shadow-sm">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Resultado HabitaLibre
            </p>
            <h3 className="text-base font-semibold text-slate-900 mt-1">
              Camino más probable:{" "}
              <span className="text-indigo-600">{producto}</span>
            </h3>
          </div>

          <div className="flex flex-col items-end gap-1">
            {typeof score === "number" && (
              <div className="text-right">
                <p className="text-[10px] uppercase text-slate-400 leading-tight">
                  Score HL
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {score}/100
                </p>
                <p className="text-[10px] text-slate-400">{scoreLabel}</p>
              </div>
            )}
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-medium ${riesgoClass}`}
            >
              {riesgoText}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500">
          Con la información que ingresaste, estimamos cuánto es prudente que te
          endeudes y qué tipo de crédito tiene más probabilidad de aprobarse.
        </p>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 gap-3 mb-1">
        <Kpi
          label="Cuota referencial"
          value={fmtMoney(cuota, 0)}
          helper={
            capacidadPago
              ? `Capacidad sugerida: ${fmtMoney(capacidadPago, 0)} aprox.`
              : null
          }
        />
        <Kpi
          label="DTI con hipoteca"
          value={fmtPct(dti ?? 0)}
          helper="Idealmente ≤ 42% para un perfil cómodo."
        />
        <Kpi
          label="Monto máximo recomendado"
          value={fmtMoney(montoMaximo, 0)}
          helper="Préstamo máximo estimado según tu capacidad."
        />
        <Kpi
          label="Precio máximo de vivienda"
          value={fmtMoney(precioMaxVivienda, 0)}
          helper="Valor máximo de vivienda recomendado con tu entrada."
        />
      </div>

      {/* Banda secundaria: LTV + Stress Test */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-600">
              Relación préstamo/valor (LTV)
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
              Objetivo ≤ 80–85%
            </span>
          </div>
          <p className="text-lg font-semibold text-slate-900">
            {fmtPct(ltv ?? 0)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Entre más bajo el LTV, mejor tasa y mayor probabilidad de
            aprobación.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-900 text-slate-50 p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-100">
              Stress test de tasa
            </span>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
              +2 pts. de tasa
            </span>
          </div>
          <p className="text-sm">
            Si la tasa sube a{" "}
            <span className="font-semibold">
              {tasaStress ? fmtPct(tasaStress, 1) : "—"}
            </span>
            , tu cuota subiría a:
          </p>
          <p className="mt-1 text-lg font-semibold">
            {fmtMoney(cuotaStress ?? 0, 0)}
          </p>
          <p className="mt-1 text-[11px] text-slate-300">
            Deja un colchón de al menos 10% de tu ingreso para imprevistos.
          </p>
        </div>
      </div>

      {/* NUEVO: Plan recomendado */}
      <PlanRecomendado data={data} />

      {/* Opciones por tipo de crédito */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3">
        <p className="text-[11px] font-semibold text-slate-600 mb-2 uppercase tracking-wide">
          Tipo de crédito según tu perfil
        </p>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <OptionRow
            label="Crédito VIS"
            opt={opciones.VIS}
            note="Tope regulado y subsidios si cumples requisitos."
            destacado={producto === "VIS"}
          />
          <OptionRow
            label="Crédito VIP"
            opt={opciones.VIP}
            note="Mejor tasa para vivienda entre VIS y segmento medio."
            destacado={producto === "VIP"}
          />
          <OptionRow
            label="Crédito BIESS"
            opt={opciones.BIESS}
            note="Requiere aportes IESS suficientes."
            destacado={producto?.toUpperCase().includes("BIESS")}
          />
          <OptionRow
            label="Crédito privado"
            opt={opciones.Privada}
            note="Bancos/financieras privadas, más flexibles pero tasa mayor."
            destacado={producto === "Comercial"}
          />
        </div>
      </div>

      {/* Plan de acción (acciones clave) */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-3">
        <p className="text-[11px] font-semibold text-indigo-900 mb-1 uppercase tracking-wide">
          Cómo aumentar tus probabilidades de aprobación
        </p>
        <ul className="mt-1 space-y-1.5 text-[11px] text-indigo-950">
          {accionesClave.length > 0 ? (
            accionesClave.map((txt, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                <span>{txt}</span>
              </li>
            ))
          ) : (
            <li className="flex gap-1.5">
              <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
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
    <div className="bg-white rounded-xl p-3 border border-slate-200">
      <div className="text-[11px] uppercase tracking-wide text-slate-500 mb-0.5">
        {label}
      </div>
      <div className="text-lg font-semibold text-slate-900">{value}</div>
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
          ? "border-indigo-300 bg-indigo-50/70"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-800">
          {label}
        </span>
        {opt ? (
          fmtViable(opt)
        ) : (
          <span className="text-[10px] text-slate-400">Sin datos</span>
        )}
      </div>

      {opt && (
        <div className="flex items-center justify-between text-[10px] text-slate-600 mt-0.5">
          <span>
            Tasa ref.:{" "}
            <span className="font-medium">
              {fmtPct(opt.tasa ?? 0, 1)}
            </span>
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
        <p className="mt-0.5 text-[10px] text-slate-500 leading-snug">{note}</p>
      )}
    </div>
  );
}

export default ResultCard;
