// src/pages/Capacidad.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calculator,
  Home,
  Banknote,
  Percent,
  Clock,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Building2,
} from "lucide-react";

import HabitaShell from "../components/HabitaShell.jsx";
import {
  Card,
  InnerCard,
  Chip,
  PrimaryButton,
  SecondaryButton,
  ProgressBar,
} from "../ui/kit.jsx";
import { moneyUSD } from "../lib/money.js";
import { getCustomer } from "../lib/customerSession.js";

const LS_SNAPSHOT = "hl_mobile_last_snapshot_v1";
const LS_JOURNEY = "hl_mobile_journey_v1";
const LS_SELECTED_PROPERTY = "hl_selected_property_v1";
const LS_SELECTED_MORTGAGE_ROUTE = "hl_selected_mortgage_route_v1";

function safeParseLS(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getStorageOwnerEmail() {
  try {
    const email = String(getCustomer()?.email || "").trim().toLowerCase();
    return email || null;
  } catch {
    return null;
  }
}

function loadOwnedData(key) {
  const ownerEmail = getStorageOwnerEmail();
  const envelope = safeParseLS(key);

  if (!envelope) return null;

  if (envelope?.ownerEmail && "data" in envelope) {
    if (
      ownerEmail &&
      String(envelope.ownerEmail).trim().toLowerCase() === ownerEmail
    ) {
      return envelope.data ?? null;
    }

    if (!ownerEmail) return envelope.data ?? null;

    return null;
  }

  return envelope;
}

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function moneySafe(v) {
  const n = toNum(v);
  return n == null ? "—" : moneyUSD(n);
}

function pctSafe(v, decimals = 0) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  const pct = n <= 1 ? n * 100 : n;
  return `${pct.toFixed(decimals)}%`;
}

function clamp(n, min, max) {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, x));
}

function pick(snapshot, paths, fallback = null) {
  for (const path of paths) {
    const parts = String(path).split(".");
    let cur = snapshot;
    let ok = true;

    for (const part of parts) {
      if (cur && Object.prototype.hasOwnProperty.call(cur, part)) {
        cur = cur[part];
      } else {
        ok = false;
        break;
      }
    }

    if (ok && cur !== undefined && cur !== null && cur !== "") {
      return cur;
    }
  }

  return fallback;
}

function getInput(snapshot, journey) {
  return (
    snapshot?.input ||
    snapshot?.perfilInput ||
    snapshot?.__entrada ||
    snapshot?.inputNormalizado ||
    snapshot?.output?.input ||
    snapshot?.output?.perfilInput ||
    journey?.form ||
    {}
  );
}

function hasEvaluation(snapshot) {
  if (!snapshot) return false;

  const input =
    snapshot?.input ||
    snapshot?.perfilInput ||
    snapshot?.__entrada ||
    snapshot?.inputNormalizado ||
    snapshot?.output?.input ||
    snapshot?.output?.perfilInput ||
    {};

  const income =
    toNum(input?.ingresoNetoMensual) ??
    toNum(input?.ingreso) ??
    toNum(snapshot?.ingresoNetoMensual) ??
    toNum(snapshot?.output?.ingresoNetoMensual);

  const hasResult =
    snapshot?.bestMortgage ||
    snapshot?.output?.bestMortgage ||
    snapshot?.financialCapacity ||
    snapshot?.output?.financialCapacity ||
    snapshot?.precioMaxVivienda ||
    snapshot?.output?.precioMaxVivienda ||
    snapshot?.matchedProperties?.length ||
    snapshot?.output?.matchedProperties?.length;

  return Boolean(income && income > 0 && hasResult);
}

function getBestMortgage(snapshot) {
  return (
    snapshot?.bestMortgage ||
    snapshot?.output?.bestMortgage ||
    snapshot?.rawMatcherResult?.bestMortgage ||
    null
  );
}

function getRankedMortgages(snapshot) {
  const ranked =
    snapshot?.rankedMortgages ||
    snapshot?.output?.rankedMortgages ||
    snapshot?.rawMatcherResult?.rankedMortgages ||
    [];

  return Array.isArray(ranked) ? ranked : [];
}

function getProbability(snapshot) {
  const raw =
    snapshot?.probabilidad ??
    snapshot?.output?.probabilidad ??
    snapshot?.bestMortgage?.probabilidad ??
    snapshot?.output?.bestMortgage?.probabilidad ??
    snapshot?.score ??
    snapshot?.output?.score ??
    null;

  if (raw == null) return null;

  if (typeof raw === "string") {
    const s = raw.toLowerCase().trim();
    if (s === "alta") return 85;
    if (s === "media") return 60;
    if (s === "baja") return 35;

    const match = s.match(/(\d+(\.\d+)?)/);
    if (match) {
      const n = Number(match[1]);
      if (Number.isFinite(n)) return clamp(n <= 1 ? n * 100 : n, 0, 100);
    }

    return null;
  }

  const n = Number(raw);
  if (!Number.isFinite(n)) return null;

  return clamp(n <= 1 ? n * 100 : n, 0, 100);
}

function getProbabilityMeta(pct) {
  if (pct == null) {
    return {
      label: "Por revisar",
      tone: "neutral",
      title: "Aún falta información",
      body: "Completa o actualiza tu evaluación para estimar mejor tu probabilidad.",
    };
  }

  if (pct >= 70) {
    return {
      label: "Alta",
      tone: "good",
      title: "Tu perfil se ve sólido",
      body: "Con tus datos actuales, tu perfil muestra una base favorable para avanzar.",
    };
  }

  if (pct >= 45) {
    return {
      label: "Media",
      tone: "warn",
      title: "Hay ruta, pero puedes mejorar",
      body: "Tu perfil tiene una base, pero ajustar entrada, deudas o historial puede ayudarte.",
    };
  }

  return {
    label: "Baja",
    tone: "bad",
    title: "Primero conviene fortalecer tu perfil",
    body: "Todavía hay variables que podrían frenar una aprobación bancaria.",
  };
}

function normalizeProgram(value) {
  const v = String(value || "").toUpperCase();

  if (v === "VIS") return "VIS";
  if (v === "VIP") return "VIP";
  if (v.includes("BIESS")) return "BIESS";
  if (v === "PRIVATE" || v.includes("PRIVATE")) return "Banca privada";

  return value || "Ruta sugerida";
}

function getCapacitySummary(snapshot, journey) {
  const input = getInput(snapshot, journey);
  const best = getBestMortgage(snapshot);
  const financialCapacity =
    snapshot?.financialCapacity || snapshot?.output?.financialCapacity || null;

  const priceMax =
    toNum(financialCapacity?.estimatedMaxPropertyValue) ??
    toNum(best?.precioMaxVivienda) ??
    toNum(best?.maxHomePrice) ??
    toNum(snapshot?.precioMaxVivienda) ??
    toNum(snapshot?.output?.precioMaxVivienda) ??
    toNum(snapshot?.montoMaximo) ??
    null;

  const loanAmount =
    toNum(financialCapacity?.estimatedMaxLoanAmount) ??
    toNum(best?.montoPrestamo) ??
    toNum(best?.loanAmount) ??
    toNum(snapshot?.montoPrestamo) ??
    toNum(snapshot?.output?.montoPrestamo) ??
    null;

  const monthlyPayment =
    toNum(financialCapacity?.estimatedMonthlyPayment) ??
    toNum(best?.cuota) ??
    toNum(best?.monthlyPayment) ??
    toNum(snapshot?.cuotaEstimada) ??
    toNum(snapshot?.output?.cuotaEstimada) ??
    null;

  const annualRate =
    toNum(financialCapacity?.estimatedAnnualRate) ??
    toNum(best?.annualRate) ??
    toNum(best?.rate) ??
    toNum(snapshot?.tasaAnual) ??
    toNum(snapshot?.output?.tasaAnual) ??
    null;

  const termMonths =
    toNum(best?.termMonths) ??
    toNum(best?.plazoMeses) ??
    toNum(snapshot?.plazoMeses) ??
    toNum(snapshot?.output?.plazoMeses) ??
    null;

  const program =
    normalizeProgram(
      best?.segment ||
        best?.mortgageId ||
        best?.id ||
        snapshot?.productoSugerido ||
        snapshot?.output?.productoSugerido ||
        snapshot?.programa ||
        snapshot?.output?.programa
    );

  const bank =
    best?.bankName ||
    best?.banco ||
    best?.providerLabel ||
    snapshot?.bancoSugerido ||
    snapshot?.output?.bancoSugerido ||
    snapshot?.bancosTop3?.[0]?.banco ||
    snapshot?.output?.bancosTop3?.[0]?.banco ||
    "HabitaLibre Match";

  const income =
    toNum(input?.ingresoNetoMensual) ??
    toNum(input?.ingreso) ??
    toNum(journey?.form?.ingreso) ??
    0;

  const partnerIncome =
    toNum(input?.ingresoPareja) ??
    toNum(journey?.form?.ingresoPareja) ??
    0;

  const debts =
    toNum(input?.otrasDeudasMensuales) ??
    toNum(input?.deudas) ??
    toNum(journey?.form?.deudas) ??
    0;

  const downPayment =
    toNum(input?.entradaDisponible) ??
    toNum(input?.entrada) ??
    toNum(journey?.form?.entrada) ??
    0;

  const targetHomeValue =
    toNum(input?.valorVivienda) ??
    toNum(journey?.form?.valorVivienda) ??
    null;

  const totalIncome = income + partnerIncome;

  const dti =
    totalIncome > 0 && monthlyPayment != null
      ? ((debts + monthlyPayment) / totalIncome) * 100
      : null;

  const ltv =
    targetHomeValue && targetHomeValue > 0
      ? ((targetHomeValue - downPayment) / targetHomeValue) * 100
      : priceMax && loanAmount
      ? (loanAmount / priceMax) * 100
      : null;

  const entryPct =
    targetHomeValue && targetHomeValue > 0
      ? (downPayment / targetHomeValue) * 100
      : priceMax && downPayment
      ? (downPayment / priceMax) * 100
      : null;

  const limitingFactor =
    financialCapacity?.limitingFactor ||
    best?.factorLimitante ||
    snapshot?.factorLimitante ||
    snapshot?.output?.factorLimitante ||
    null;

  return {
    priceMax,
    loanAmount,
    monthlyPayment,
    annualRate,
    termMonths,
    program,
    bank,
    income,
    partnerIncome,
    debts,
    downPayment,
    targetHomeValue,
    totalIncome,
    dti,
    ltv,
    entryPct,
    limitingFactor,
    best,
  };
}

function getTermLabel(termMonths) {
  const n = Number(termMonths);
  if (!Number.isFinite(n) || n <= 0) return "—";
  const years = Math.round(n / 12);
  return `${years} años`;
}

function getFactorLabel(factor) {
  const f = String(factor || "").toLowerCase();
  if (f === "entrada") return "Entrada";
  if (f === "cuota") return "Cuota";
  if (f === "programa") return "Programa";
  if (f === "historial_crediticio") return "Historial crediticio";
  if (!f) return "—";
  return factor;
}

function getDtiMeta(dti) {
  if (dti == null) return { tone: "neutral", label: "—", hint: "Sin dato suficiente" };
  if (dti <= 35) return { tone: "good", label: `${Math.round(dti)}%`, hint: "Carga saludable" };
  if (dti <= 45) return { tone: "warn", label: `${Math.round(dti)}%`, hint: "Carga ajustada" };
  return { tone: "bad", label: `${Math.round(dti)}%`, hint: "Carga alta" };
}

function getEntryMeta(entryPct) {
  if (entryPct == null) return { tone: "neutral", label: "—", hint: "Sin dato suficiente" };
  if (entryPct >= 20) return { tone: "good", label: `${Math.round(entryPct)}%`, hint: "Entrada fuerte" };
  if (entryPct >= 10) return { tone: "warn", label: `${Math.round(entryPct)}%`, hint: "Entrada base" };
  return { tone: "bad", label: `${Math.round(entryPct)}%`, hint: "Entrada baja" };
}

function MetricCard({ icon, label, value, hint, tone = "neutral" }) {
  const toneStyles = {
    good: {
      border: "1px solid rgba(34,197,94,0.22)",
      bg: "rgba(34,197,94,0.08)",
    },
    warn: {
      border: "1px solid rgba(245,158,11,0.22)",
      bg: "rgba(245,158,11,0.08)",
    },
    bad: {
      border: "1px solid rgba(239,68,68,0.22)",
      bg: "rgba(239,68,68,0.08)",
    },
    neutral: {
      border: "1px solid rgba(148,163,184,0.14)",
      bg: "rgba(255,255,255,0.04)",
    },
  };

  const t = toneStyles[tone] || toneStyles.neutral;

  return (
    <div
      style={{
        padding: 15,
        borderRadius: 20,
        border: t.border,
        background: t.bg,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          color: "rgba(148,163,184,0.95)",
          fontSize: 12,
          fontWeight: 900,
        }}
      >
        {icon}
        {label}
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 22,
          lineHeight: 1.1,
          fontWeight: 980,
          color: "rgba(226,232,240,0.98)",
        }}
      >
        {value}
      </div>

      {hint ? (
        <div
          style={{
            marginTop: 7,
            fontSize: 12,
            color: "rgba(148,163,184,0.92)",
            lineHeight: 1.35,
          }}
        >
          {hint}
        </div>
      ) : null}
    </div>
  );
}

function EmptyCapacity({ onStart }) {
  return (
    <HabitaShell maxWidth={760}>
      <Card>
        <Chip tone="brand">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Calculator size={13} />
            Capacidad
          </span>
        </Chip>

        <div
          style={{
            marginTop: 14,
            fontSize: 30,
            fontWeight: 980,
            letterSpacing: -1,
            lineHeight: 1.05,
            maxWidth: 380,
          }}
        >
          Primero necesitamos calcular tu capacidad
        </div>

        <div
          style={{
            marginTop: 10,
            color: "rgba(148,163,184,0.95)",
            fontSize: 14,
            lineHeight: 1.45,
            maxWidth: 460,
          }}
        >
          Completa tu evaluación para ver cuánto podrías comprar, cuánto pagarías
          al mes y qué ruta hipotecaria parece más alineada contigo.
        </div>

        <div style={{ marginTop: 18 }}>
          <PrimaryButton onClick={onStart}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              Empezar evaluación
              <ArrowRight size={16} />
            </span>
          </PrimaryButton>
        </div>
      </Card>
    </HabitaShell>
  );
}

function MortgageOptionCard({ option, selected }) {
  if (!option) return null;

  const label =
    option?.label ||
    option?.productLabel ||
    option?.mortgageId ||
    option?.id ||
    "Ruta hipotecaria";

  const bank =
    option?.providerLabel ||
    option?.banco ||
    option?.bankName ||
    option?.provider ||
    "Entidad";

  const cuota =
    toNum(option?.cuota) ??
    toNum(option?.monthlyPayment) ??
    toNum(option?.estimatedMonthlyPayment);

  const rate =
    toNum(option?.annualRate) ??
    toNum(option?.tasaAnual) ??
    toNum(option?.rate);

  const priceMax =
    toNum(option?.precioMaxVivienda) ??
    toNum(option?.maxHomePrice) ??
    toNum(option?.priceMax);

  return (
    <InnerCard
      style={{
        background: selected
          ? "rgba(45,212,191,0.09)"
          : "rgba(255,255,255,0.04)",
        border: selected
          ? "1px solid rgba(45,212,191,0.22)"
          : "1px solid rgba(148,163,184,0.14)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 950 }}>{normalizeProgram(label)}</div>
          <div
            style={{
              marginTop: 5,
              fontSize: 12,
              color: "rgba(148,163,184,0.90)",
            }}
          >
            {bank}
          </div>
        </div>

        <Chip tone={selected ? "good" : "neutral"}>
          {selected ? "Sugerida" : "Alternativa"}
        </Chip>
      </div>

      <div
        style={{
          marginTop: 12,
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 8,
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: "rgba(148,163,184,0.85)" }}>Cuota</div>
          <div style={{ marginTop: 4, fontSize: 13, fontWeight: 900 }}>
            {moneySafe(cuota)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: "rgba(148,163,184,0.85)" }}>Tasa</div>
          <div style={{ marginTop: 4, fontSize: 13, fontWeight: 900 }}>
            {rate == null ? "—" : pctSafe(rate, 2)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: "rgba(148,163,184,0.85)" }}>
            Vivienda
          </div>
          <div style={{ marginTop: 4, fontSize: 13, fontWeight: 900 }}>
            {moneySafe(priceMax)}
          </div>
        </div>
      </div>
    </InnerCard>
  );
}

export default function Capacidad() {
  const navigate = useNavigate();

  const snapshot = useMemo(() => loadOwnedData(LS_SNAPSHOT), []);
  const journey = useMemo(() => loadOwnedData(LS_JOURNEY), []);
  const selectedProperty = useMemo(() => loadOwnedData(LS_SELECTED_PROPERTY), []);
  const selectedRoute = useMemo(
    () => loadOwnedData(LS_SELECTED_MORTGAGE_ROUTE),
    []
  );

  const unlocked = hasEvaluation(snapshot);

  const summary = useMemo(
    () => getCapacitySummary(snapshot || {}, journey || {}),
    [snapshot, journey]
  );

  const ranked = useMemo(() => getRankedMortgages(snapshot || {}), [snapshot]);

  const probability = getProbability(snapshot || {});
  const probabilityMeta = getProbabilityMeta(probability);

  const dtiMeta = getDtiMeta(summary.dti);
  const entryMeta = getEntryMeta(summary.entryPct);

  const goJourney = () => navigate("/app?mode=journey&afinando=1&force=1");
  const goMatch = () => navigate("/match");
  const goRuta = () => navigate("/ruta");

  if (!unlocked) {
    return <EmptyCapacity onStart={goJourney} />;
  }

  return (
    <HabitaShell maxWidth={860}>
      <div style={{ paddingBottom: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(148,163,184,0.95)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Calculator size={14} strokeWidth={2.4} />
              Capacidad
            </div>

            <div
              style={{
                marginTop: 7,
                fontSize: 32,
                lineHeight: 1.02,
                letterSpacing: -1,
                fontWeight: 980,
                maxWidth: 420,
              }}
            >
              Tu poder de compra estimado
            </div>

            <div
              style={{
                marginTop: 10,
                color: "rgba(148,163,184,0.95)",
                fontSize: 14,
                lineHeight: 1.45,
                maxWidth: 460,
              }}
            >
              Esta pantalla resume cuánto podrías comprar, cuánto pagarías y qué
              variables pesan más en tu perfil.
            </div>
          </div>

          <Chip tone={probabilityMeta.tone}>
            {probabilityMeta.label}
            {probability != null ? ` · ${Math.round(probability)}%` : ""}
          </Chip>
        </div>

        <Card style={{ marginTop: 18 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 14,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(148,163,184,0.95)",
                  fontWeight: 900,
                }}
              >
                Vivienda estimada
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 44,
                  lineHeight: 1,
                  letterSpacing: -1.4,
                  fontWeight: 980,
                }}
              >
                {moneySafe(summary.priceMax)}
              </div>

              <div
                style={{
                  marginTop: 8,
                  color: "rgba(148,163,184,0.95)",
                  fontSize: 13,
                  lineHeight: 1.4,
                  maxWidth: 380,
                }}
              >
                Es una estimación referencial según tus datos declarados. La
                aprobación final depende del banco o entidad financiera.
              </div>
            </div>

            <Chip tone="brand">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Home size={13} />
                {summary.program}
              </span>
            </Chip>
          </div>

          <div style={{ marginTop: 16 }}>
            <ProgressBar value={probability || 0} />
            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                lineHeight: 1.35,
                color: "rgba(148,163,184,0.92)",
              }}
            >
              <strong style={{ color: "rgba(226,232,240,0.95)" }}>
                {probabilityMeta.title}.
              </strong>{" "}
              {probabilityMeta.body}
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 10,
            }}
          >
            <MetricCard
              icon={<Banknote size={14} />}
              label="Cuota estimada"
              value={moneySafe(summary.monthlyPayment)}
              hint="Pago mensual referencial"
              tone="good"
            />

            <MetricCard
              icon={<Building2 size={14} />}
              label="Préstamo estimado"
              value={moneySafe(summary.loanAmount)}
              hint={summary.bank}
              tone="neutral"
            />

            <MetricCard
              icon={<Percent size={14} />}
              label="Tasa referencial"
              value={summary.annualRate == null ? "—" : pctSafe(summary.annualRate, 2)}
              hint="Puede variar por entidad"
              tone="neutral"
            />

            <MetricCard
              icon={<Clock size={14} />}
              label="Plazo referencial"
              value={getTermLabel(summary.termMonths)}
              hint="Según ruta sugerida"
              tone="neutral"
            />
          </div>

          <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
            <PrimaryButton onClick={goMatch}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                Ver propiedades e hipotecas compatibles
                <ArrowRight size={16} />
              </span>
            </PrimaryButton>

            <SecondaryButton onClick={goJourney}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <RefreshCw size={15} />
                Afinar mi resultado
              </span>
            </SecondaryButton>
          </div>
        </Card>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          <MetricCard
            icon={<TrendingUp size={14} />}
            label="Carga mensual aprox."
            value={dtiMeta.label}
            hint={dtiMeta.hint}
            tone={dtiMeta.tone}
          />

          <MetricCard
            icon={<ShieldCheck size={14} />}
            label="Entrada aproximada"
            value={entryMeta.label}
            hint={entryMeta.hint}
            tone={entryMeta.tone}
          />
        </div>

        <Card style={{ marginTop: 18 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: "rgba(148,163,184,0.95)",
                }}
              >
                Lectura rápida
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 18,
                  fontWeight: 980,
                  lineHeight: 1.2,
                }}
              >
                Qué está definiendo tu capacidad
              </div>
            </div>

            <Chip tone={summary.limitingFactor ? "warn" : "neutral"}>
              {getFactorLabel(summary.limitingFactor)}
            </Chip>
          </div>

          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            <InnerCard>
              <div style={{ fontSize: 13, lineHeight: 1.45, color: "rgba(226,232,240,0.88)" }}>
                Tu ingreso considerado es de{" "}
                <strong>{moneySafe(summary.totalIncome)}</strong> al mes, con
                deudas declaradas de <strong>{moneySafe(summary.debts)}</strong>.
              </div>
            </InnerCard>

            <InnerCard>
              <div style={{ fontSize: 13, lineHeight: 1.45, color: "rgba(226,232,240,0.88)" }}>
                Tu entrada actual es de{" "}
                <strong>{moneySafe(summary.downPayment)}</strong>. Una entrada
                más fuerte puede mejorar tu rango y condiciones.
              </div>
            </InnerCard>

            {selectedProperty ? (
              <InnerCard
                style={{
                  background: "rgba(45,212,191,0.08)",
                  border: "1px solid rgba(45,212,191,0.18)",
                }}
              >
                <div style={{ fontSize: 13, lineHeight: 1.45, color: "rgba(226,232,240,0.90)" }}>
                  Propiedad elegida:{" "}
                  <strong>
                    {selectedProperty?.titulo ||
                      selectedProperty?.nombre ||
                      selectedProperty?.proyecto ||
                      "Propiedad seleccionada"}
                  </strong>
                  . Puedes revisar el avance completo en tu Ruta.
                </div>
              </InnerCard>
            ) : (
              <InnerCard>
                <div style={{ fontSize: 13, lineHeight: 1.45, color: "rgba(226,232,240,0.88)" }}>
                  Todavía no has elegido una propiedad base. Elegir una ayuda a
                  aterrizar la ruta real.
                </div>
              </InnerCard>
            )}
          </div>
        </Card>

        <Card style={{ marginTop: 18 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: "rgba(148,163,184,0.95)",
                }}
              >
                Rutas hipotecarias
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 18,
                  fontWeight: 980,
                  lineHeight: 1.2,
                }}
              >
                Opciones detectadas para tu perfil
              </div>
            </div>

            <Chip tone={selectedRoute ? "good" : "neutral"}>
              {selectedRoute ? "Confirmada" : "Por confirmar"}
            </Chip>
          </div>

          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            {ranked.length > 0 ? (
              ranked.slice(0, 3).map((option, idx) => (
                <MortgageOptionCard
                  key={option?.mortgageId || option?.id || idx}
                  option={option}
                  selected={
                    idx === 0 ||
                    selectedRoute?.mortgageId === option?.mortgageId ||
                    selectedRoute?.id === option?.id
                  }
                />
              ))
            ) : (
              <InnerCard>
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.45,
                    color: "rgba(148,163,184,0.95)",
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                  }}
                >
                  <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                  Aún no hay varias rutas para comparar. Actualiza tu evaluación
                  o revisa el Match para confirmar una ruta.
                </div>
              </InnerCard>
            )}
          </div>

          <div style={{ marginTop: 14 }}>
            <SecondaryButton onClick={goRuta}>
              Ver mi ruta completa
            </SecondaryButton>
          </div>
        </Card>

        <div
          style={{
            marginTop: 16,
            textAlign: "center",
            fontSize: 11,
            lineHeight: 1.4,
            color: "rgba(148,163,184,0.78)",
          }}
        >
          Estimación referencial. HabitaLibre no reemplaza la evaluación final de
          una entidad financiera.
        </div>
      </div>
    </HabitaShell>
  );
}
