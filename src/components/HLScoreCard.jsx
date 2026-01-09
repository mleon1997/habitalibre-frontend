// src/components/HLScoreCard.jsx
import React, { useMemo } from "react";
import { scoreHabitaLibre } from "../lib/scoreHabitaLibre";
import Tooltip from "./Tooltip";

/* =========================
   Utils
========================= */
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

// 🔒 Si viene { total, bandas } u otro objeto “score”, toma lo renderizable
function unwrap(v) {
  if (v == null) return v;
  if (typeof v === "number" || typeof v === "string" || typeof v === "boolean") return v;
  if (typeof v === "object") {
    if (typeof v.total === "number" || typeof v.total === "string") return v.total;
    if (typeof v.value === "number" || typeof v.value === "string") return v.value;
    if (typeof v.score === "number" || typeof v.score === "string") return v.score;
    // último recurso: no dejes que se renderice el objeto
    return "";
  }
  return "";
}

function toNum(v) {
  // admite número, string, o {total: n}
  const x = unwrap(v);
  const n = Number((x ?? "").toString().replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

// ✅ Nuevo: devuelve null si no hay número real (para no pisar fallbacks)
function toNumNullable(v) {
  const x = unwrap(v);
  if (x == null) return null;
  const s = String(x).trim();
  if (!s) return null;
  const n = Number(s.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function fmtMoney(n) {
  return `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function chipClass(type) {
  if (type === "ok") return "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/25";
  if (type === "warn") return "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/25";
  if (type === "bad") return "bg-red-500/15 text-red-200 ring-1 ring-red-500/25";
  return "bg-slate-500/10 text-slate-300 ring-1 ring-slate-600/30";
}

function safeStr(v, fallback = "—") {
  const x = unwrap(v);
  if (x == null) return fallback;
  if (typeof x === "string") return x.trim() ? x : fallback;
  if (typeof x === "number") return Number.isFinite(x) ? String(x) : fallback;
  if (typeof x === "boolean") return x ? "Sí" : "No";
  return fallback;
}

function firstText(arrOrAny, fallback) {
  if (Array.isArray(arrOrAny)) {
    const a0 = arrOrAny[0];
    if (typeof a0 === "string") return a0;
    if (a0 && typeof a0 === "object") {
      // si viene {texto} / {title} / {desc}
      return safeStr(a0.texto || a0.title || a0.desc || a0.label, fallback);
    }
    return fallback;
  }
  // si por error vino un objeto en vez de array
  if (arrOrAny && typeof arrOrAny === "object") {
    return safeStr(arrOrAny.texto || arrOrAny.title || arrOrAny.desc || arrOrAny.label, fallback);
  }
  if (typeof arrOrAny === "string") return arrOrAny;
  return fallback;
}

// ✅ Normaliza ratio vs pct
function normalizeRatioMaybePct(x, { maxRatio = 2 } = {}) {
  if (x == null) return null;
  const n = Number(x);
  if (!Number.isFinite(n)) return null;
  // si viene como 58.7 => 0.587
  if (n > maxRatio) return n / 100;
  return n;
}

/* =========================================================
   Adapter: soporta data normalizado (buildDataFromSnap) y/o snap
========================================================= */
function getTipoCredito(fullData) {
  // fullData puede ser normalizado o snap
  const root = fullData || {};
  const d = fullData?.input ? fullData.input : fullData;
  const r = fullData?.resultado ? fullData.resultado : fullData?.resultado || {};

  const rr = d?.rutaRecomendada?.tipo || r?.rutaRecomendada?.tipo || r?.ruta?.tipo;
  if (rr) {
    const t = String(rr).toLowerCase();
    if (t.includes("priv")) return "privada";
    if (t.includes("biess")) return "biess_vip";
    if (t.includes("vip")) return "vip";
    if (t.includes("vis")) return "vis";
  }

  const prod = String(
    root?.productoSugerido ||
      root?.suggestedCredit ||
      d?.productoElegido ||
      d?.productoSugerido ||
      d?.suggestedCredit ||
      r?.productoSugerido ||
      r?.producto ||
      r?.programa ||
      ""
  ).toLowerCase();

  if (prod.includes("priv")) return "privada";
  if (prod.includes("biess")) return "biess_vip";
  if (prod.includes("vip")) return "vip";
  if (prod.includes("vis")) return "vis";

  return "vis";
}

function mapDataToScoreInput(fullData) {
  const root = fullData || {};
  const d = fullData?.input ? fullData.input : fullData;
  const r = fullData?.resultado ? fullData.resultado : fullData?.resultado || {};

  // ✅ primero root (normalizado), luego input
  const ingresoTotal = toNum(root?.ingresoTotal ?? d?.perfil?.ingresoTotal ?? d?.ingresoTotal ?? d?.ingreso ?? d?.ingresoNetoMensual);
  const deudas = toNum(root?.deudas ?? d?.otrasDeudasMensuales ?? d?.deudas);

  const valor = toNum(root?.valor ?? d?.valorVivienda ?? d?.valor);
  const entrada = toNum(root?.entrada ?? d?.entradaDisponible ?? d?.entrada);

  // --- LTV ---
  const ltvFromRoot = normalizeRatioMaybePct(toNumNullable(root?.ltv));
  const ltvFromInput = normalizeRatioMaybePct(toNumNullable(d?.ltv));
  const ltvFromPct = normalizeRatioMaybePct(toNumNullable(root?.ltvPct), { maxRatio: 200 }); // ltvPct viene 83 -> 0.83

  const ltv =
    ltvFromRoot != null
      ? clamp(ltvFromRoot, 0, 1)
      : ltvFromPct != null
      ? clamp(ltvFromPct, 0, 1)
      : ltvFromInput != null
      ? clamp(ltvFromInput, 0, 1)
      : valor > 0
      ? clamp((valor - entrada) / valor, 0, 1)
      : 0.95;

  // cuota puede venir de normalizado (root.cuotaEstimada) o resultado backend (r.cuotaEstimada)
  const cuotaEstimada = toNum(root?.cuotaEstimada ?? d?.cuotaEstimada ?? r?.cuotaEstimada);
  const dtiAprox = ingresoTotal > 0 ? clamp((deudas + cuotaEstimada) / ingresoTotal, 0, 2) : 0.6;

  // --- DTI (ratio 0–1) ---
  const dtiRaw =
    toNumNullable(root?.dtiConHipoteca) ??
    toNumNullable(root?.dtiPct) ??
    toNumNullable(d?.dtiConHipoteca) ??
    toNumNullable(r?.dtiConHipoteca) ??
    toNumNullable(r?.dti);

  // si dtiRaw vino como porcentaje (58.7), normaliza
  const dtiNorm =
    dtiRaw != null
      ? normalizeRatioMaybePct(dtiRaw, { maxRatio: 2 })
      : null;

  const dtiConHipoteca = dtiNorm != null ? clamp(dtiNorm, 0, 2) : dtiAprox;

  const edad = toNumNullable(root?.edad) ?? toNumNullable(d?.perfil?.edad) ?? toNumNullable(d?.edad) ?? 32;
  const tipoIngreso = root?.tipoIngreso ?? d?.perfil?.tipoIngreso ?? d?.tipoIngreso ?? "Dependiente";
  const declaracionBuro = root?.declaracionBuro ?? d?.perfil?.declaracionBuro ?? d?.declaracionBuro ?? "ninguno";

  const nacionalidad = root?.nacionalidad ?? d?.perfil?.nacionalidad ?? d?.nacionalidad ?? "";
  const esExtranjero = String(nacionalidad).toLowerCase().trim() === "extranjero";

  const aportesIESS = toNum(root?.aportesTotales ?? d?.perfil?.iessAportesTotales ?? d?.iessAportesTotales);
  const ultimas13Continuas = toNum(root?.aportesConsecutivos ?? d?.perfil?.iessAportesConsecutivos ?? d?.iessAportesConsecutivos) >= 13;

  return {
    dtiConHipoteca,
    ltv,
    aniosEstabilidad: toNumNullable(root?.aniosEstabilidad) ?? toNumNullable(d?.perfil?.aniosEstabilidad) ?? toNumNullable(d?.aniosEstabilidad) ?? 1,
    edad,
    tipoIngreso,
    declaracionBuro,
    tipoCredito: getTipoCredito(fullData),
    esExtranjero,
    aportesIESS,
    ultimas13Continuas,
  };
}

/* =========================================================
   UX layer
========================================================= */
function uxLabelFromScore(scoreObj) {
  const s = Number(scoreObj?.score || 0);

  if (s >= 80) return { pill: { type: "ok", label: "Opciones fuertes" }, hint: "Perfil sólido para ir a banco." };
  if (s >= 60) return { pill: { type: "warn", label: "Ruta muy posible" }, hint: "Con 1–2 ajustes mejoras condiciones." };
  if (s >= 45) return { pill: { type: "warn", label: "Ruta activa" }, hint: "Hay ruta. Aún puedes optimizar." };

  return { pill: { type: "bad", label: "Perfil en construcción" }, hint: "Primero armamos base." };
}

function humanTipoCredito(tipo) {
  const t = String(tipo || "").toLowerCase();
  if (t === "biess_vip") return "BIESS";
  if (t === "vip") return "VIP";
  if (t === "vis") return "VIS";
  if (t === "privada") return "Banca privada";
  return tipo || "—";
}

function inferTasaRango(tipo) {
  const t = String(tipo || "").toLowerCase();
  if (t.includes("biess")) return { min: 4.8, max: 6.5 };
  if (t.includes("vip")) return { min: 4.8, max: 7.0 };
  if (t.includes("vis")) return { min: 5.0, max: 7.8 };
  return { min: 8.5, max: 10.8 };
}

function LabelWithInfo({ label, info }) {
  return (
    <div className="flex items-center gap-2">
      <p className="text-xs text-slate-400">{label}</p>
      {info ? <Tooltip label={`Info: ${label}`} content={info} side="top" /> : null}
    </div>
  );
}

export default function HLScoreCard({ data, onGoSimular, onOpenAmortizacion, onOpenAsesor }) {
  const scoreView = useMemo(() => {
    const input = mapDataToScoreInput(data);
    const res = scoreHabitaLibre(input);
    const ux = uxLabelFromScore(res);

    // fuente: si es snap usa input; pero para montos prefiere root normalizado
    const root = data || {};
    const d = data?.input ? data.input : data;
    const r = data?.resultado ? data.resultado : data?.resultado || {};

    const valor = toNum(root?.valor ?? d?.valorVivienda ?? d?.valor);
    const entrada = toNum(root?.entrada ?? d?.entradaDisponible ?? d?.entrada);

    const entradaPct = valor > 0 ? Math.round((entrada / valor) * 100) : 0;

    const dti = Math.round((input.dtiConHipoteca || 0) * 100);
    const ltv = Math.round((input.ltv || 0) * 100);

    // 🔒 topRec seguro (si viene array de strings u objetos)
    const topRec = firstText(root?.accionesClave || d?.accionesClave || res?.recomendaciones, "Compara escenarios y arma tu carpeta.");

    const montoFinanciar = Math.max(0, valor - entrada);
    const tipoHuman = humanTipoCredito(input.tipoCredito);

    const tasaMin = toNumNullable(root?.tasaMin ?? d?.rutaRecomendada?.tasaMin ?? r?.rutaRecomendada?.tasaMin);
    const tasaMax = toNumNullable(root?.tasaMax ?? d?.rutaRecomendada?.tasaMax ?? r?.rutaRecomendada?.tasaMax);
    const tasaRango = tasaMin > 0 && tasaMax > 0 ? { min: tasaMin, max: tasaMax } : inferTasaRango(input.tipoCredito);

    const plazoAnios = toNumNullable(root?.plazoAnios ?? d?.plazoAnios ?? r?.plazoAnios ?? r?.plazo) ?? 25;

    return {
      ux,
      entradaPct,
      dti,
      ltv,
      topRec,
      input,
      valor,
      entrada,
      montoFinanciar,
      tipoHuman,
      tasaRango,
      plazoAnios,
    };
  }, [data]);

  const { ux, entradaPct, dti, ltv, topRec, input, valor, entrada, montoFinanciar, tipoHuman, tasaRango, plazoAnios } = scoreView;

  const hasMoney = valor > 0;

  // Tooltips ultra-cortos
  const infoRuta = "Tipo de crédito que hoy está más abierto para ti, según tu perfil.";
  const infoEntrada = "Tu aporte inicial. Más entrada = más probabilidad y mejor cuota.";
  const infoDTI = "Porcentaje de tu ingreso mensual que se va en deudas (incluye hipoteca).";
  const infoLTV = "Porcentaje del valor de la vivienda que financia el banco.";
  const infoTasa = "Rango típico. La tasa real depende del banco, seguro y validación de ingresos.";
  const infoMonto = "Valor aproximado que se financiaría: valor de vivienda – entrada.";
  const infoAmort = "Cómo se divide tu cuota entre interés y capital mes a mes.";

  return (
    <div className="rounded-3xl border border-slate-800/70 bg-slate-900/50 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.8)]">
      <div className="flex justify-between items-center gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-50">Tu ruta más probable hoy</h2>
          <p className="mt-2 text-sm text-slate-400">{safeStr(ux?.hint, "")}</p>
        </div>
        <span className={`shrink-0 px-3 py-1 rounded-full text-xs ${chipClass(ux?.pill?.type)}`}>
          {safeStr(ux?.pill?.label, "—")}
        </span>
      </div>

      {/* KPIs compactos */}
      <div className="mt-4 grid sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-slate-800/70 bg-slate-950/20">
          <LabelWithInfo label="Ruta" info={infoRuta} />
          <p className="mt-1 font-semibold text-slate-100">{safeStr(tipoHuman)}</p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800/70 bg-slate-950/20">
          <LabelWithInfo label="Entrada" info={infoEntrada} />
          <p className="mt-1 font-semibold text-slate-100">{Number.isFinite(entradaPct) ? `${entradaPct}%` : "—"}</p>
          {hasMoney ? (
            <p className="mt-1 text-[11px] text-slate-500">
              {fmtMoney(entrada)} de {fmtMoney(valor)}
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-slate-500">—</p>
          )}
        </div>

        <div className="p-4 rounded-2xl border border-slate-800/70 bg-slate-950/20">
          <LabelWithInfo label="DTI aprox" info={infoDTI} />
          <p className="mt-1 font-semibold text-slate-100">{Number.isFinite(dti) ? `${dti}%` : "—"}</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-[11px] text-slate-500">LTV: {Number.isFinite(ltv) ? `${ltv}%` : "—"}</p>
            <Tooltip label="Info: LTV" content={infoLTV} side="top" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800/70 bg-slate-950/20">
          <LabelWithInfo label="Tasa estimada" info={infoTasa} />
          <p className="mt-1 font-semibold text-slate-100">
            {tasaRango.min.toFixed(1)}% – {tasaRango.max.toFixed(1)}%
          </p>
          <p className="mt-1 text-[11px] text-slate-500">Plazo ref: {plazoAnios} años</p>
        </div>
      </div>

      {/* Bloque “claridad” */}
      <div className="mt-4 grid md:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/20 p-4 md:col-span-2">
          <p className="text-xs uppercase tracking-wide text-slate-400">Tu estructura de crédito (resumen)</p>

          <div className="mt-3 grid sm:grid-cols-3 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[11px] text-slate-400">Monto a financiar</p>
                <Tooltip label="Info: Monto a financiar" content={infoMonto} side="top" />
              </div>
              <p className="mt-1 font-semibold text-slate-100">{montoFinanciar > 0 ? fmtMoney(montoFinanciar) : "—"}</p>
            </div>

            <div>
              <p className="text-[11px] text-slate-400">Tipo de ingreso</p>
              <p className="mt-1 font-semibold text-slate-100">{safeStr(input?.tipoIngreso)}</p>
            </div>

            <div>
              <p className="text-[11px] text-slate-400">Buró / sustento</p>
              <p className="mt-1 font-semibold text-slate-100">{safeStr(input?.declaracionBuro)}</p>
            </div>
          </div>

          {/* ✅ FIX: evitar <button> dentro de <button> */}
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <div className="inline-flex items-center gap-2">
              <button
                type="button"
                onClick={typeof onOpenAmortizacion === "function" ? onOpenAmortizacion : undefined}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-semibold text-sm transition"
              >
                Ver tabla de amortización →
              </button>

              {/* Tooltip fuera del botón (para no anidar buttons) */}
              <span onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} className="inline-flex">
                <Tooltip
                  label="Info: Amortización"
                  content={infoAmort}
                  side="top"
                  buttonClassName="inline-flex h-6 w-6 items-center justify-center rounded-full border border-blue-200/40 bg-blue-500/10 text-blue-100 hover:text-white hover:border-blue-200/60 transition"
                />
              </span>
            </div>

            <button
              type="button"
              onClick={typeof onGoSimular === "function" ? onGoSimular : undefined}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-2xl border border-slate-700 text-slate-100 font-semibold text-sm hover:border-slate-500 transition"
            >
              Comparar escenarios →
            </button>
          </div>

          <p className="mt-3 text-[11px] text-slate-500">La tasa exacta depende del banco, seguro y validación de ingresos.</p>
        </div>

        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/20 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-400">Próximo paso recomendado</p>
          <p className="mt-2 text-slate-100 font-semibold">{safeStr(topRec, "Compara escenarios y arma tu carpeta.")}</p>
          <p className="mt-2 text-[12px] text-slate-400">Si lo prefieres, te guiamos para escoger el mejor banco/programa y armar carpeta.</p>

          <button
            type="button"
            onClick={typeof onOpenAsesor === "function" ? onOpenAsesor : undefined}
            className="mt-3 w-full inline-flex items-center justify-center px-4 py-2.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-sm transition"
          >
            Hablar con un asesor →
          </button>
        </div>
      </div>
    </div>
  );
}
