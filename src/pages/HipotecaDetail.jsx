// src/pages/HipotecaDetail.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  Clock,
  Landmark,
  PiggyBank,
  TrendingUp,
} from "lucide-react";

import HabitaShell from "../components/HabitaShell.jsx";
import { moneyUSD } from "../lib/money.js";
import { getCustomer } from "../lib/customerSession.js";

const LS_SNAPSHOT = "hl_mobile_last_snapshot_v1";
const LS_JOURNEY = "hl_mobile_journey_v1";
const LS_SELECTED_MORTGAGE_ROUTE = "hl_selected_mortgage_route_v1";

function loadJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveJSON(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
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
  const envelope = loadJSON(key);

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

function saveOwnedData(key, data) {
  const ownerEmail = getStorageOwnerEmail();
  saveJSON(key, { ownerEmail, data });
}

function pick(snapshot, keys) {
  if (!snapshot) return null;

  for (const k of keys) {
    if (snapshot?.[k] != null) return snapshot[k];
    if (snapshot?.output?.[k] != null) return snapshot.output[k];
  }

  return null;
}

function asNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function maybeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeRate(rate) {
  const n = Number(rate);
  if (!Number.isFinite(n) || n <= 0) return 0.0499;
  return n > 1 ? n / 100 : n;
}

function monthlyPayment({ principal, annualRate, years }) {
  const p = asNumber(principal, 0);
  const r = normalizeRate(annualRate) / 12;
  const months = years * 12;

  if (!p || !r || !months) return 0;

  return (p * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function buildScheduleSnapshot({ principal, annualRate, years, month }) {
  const p = asNumber(principal, 0);
  const r = normalizeRate(annualRate) / 12;
  const payment = monthlyPayment({ principal: p, annualRate, years });

  let balance = p;
  let interest = 0;
  let capital = 0;

  for (let i = 1; i <= month; i += 1) {
    interest = balance * r;
    capital = payment - interest;
    balance = Math.max(0, balance - capital);
  }

  return {
    month,
    payment,
    interest,
    capital,
    balance,
  };
}

function simulateExtraPayment({ principal, annualRate, years, extraMonthly }) {
  const p = asNumber(principal, 0);
  const r = normalizeRate(annualRate) / 12;
  const basePayment = monthlyPayment({ principal: p, annualRate, years });
  const targetPayment = basePayment + asNumber(extraMonthly, 0);

  const baseTotal = basePayment * years * 12;
  const baseInterest = baseTotal - p;

  let balance = p;
  let months = 0;
  let totalPaid = 0;

  while (balance > 0.5 && months < 720) {
    const interest = balance * r;
    const capital = Math.min(balance, targetPayment - interest);

    if (capital <= 0) break;

    balance -= capital;
    totalPaid += interest + capital;
    months += 1;
  }

  const interestPaid = totalPaid - p;
  const savedInterest = Math.max(0, baseInterest - interestPaid);
  const savedMonths = Math.max(0, years * 12 - months);

  return {
    months,
    years: months / 12,
    interestPaid,
    savedInterest,
    savedMonths,
  };
}

function formatYearsMonths(months) {
  const total = Math.max(0, Math.round(months));
  const y = Math.floor(total / 12);
  const m = total % 12;

  if (y <= 0) return `${m} meses`;
  if (m === 0) return `${y} años`;
  return `${y} años y ${m} meses`;
}

function formatRate(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  const r = n <= 1 ? n * 100 : n;
  return `${r.toFixed(2)}%`;
}

function uniqueSortedYears(values = []) {
  return Array.from(
    new Set(
      values
        .map((value) => Math.round(asNumber(value, 0)))
        .filter((value) => value > 0)
    )
  ).sort((a, b) => a - b);
}

function getRouteValue(route, keys, fallback = null) {
  for (const key of keys) {
    if (route?.[key] != null) return route[key];
    if (route?.raw?.[key] != null) return route.raw[key];
  }

  return fallback;
}

function resolveRouteYears(route) {
  const directYears = asNumber(
    getRouteValue(route, ["termYears", "defaultTermYears", "plazoAnios", "years"], 0),
    0
  );

  if (directYears > 0) return Math.round(directYears);

  const directMonths = asNumber(
    getRouteValue(route, ["termMonths", "defaultTermMonths", "plazoMeses", "months"], 0),
    0
  );

  if (directMonths > 0) return Math.round(directMonths / 12);

  const productDefaultYears = asNumber(route?.product?.term?.defaultYears, 0);
  if (productDefaultYears > 0) return Math.round(productDefaultYears);

  const rawProductDefaultYears = asNumber(route?.raw?.product?.term?.defaultYears, 0);
  if (rawProductDefaultYears > 0) return Math.round(rawProductDefaultYears);

  return 25;
}

function resolveTermOptionsYears(route, routeYears) {
  const directOptionsYears = Array.isArray(route?.termOptionsYears)
    ? route.termOptionsYears
    : [];

  const rawOptionsYears = Array.isArray(route?.raw?.termOptionsYears)
    ? route.raw.termOptionsYears
    : [];

  const directOptionsMonths = Array.isArray(route?.termOptionsMonths)
    ? route.termOptionsMonths.map((m) => asNumber(m, 0) / 12)
    : [];

  const rawOptionsMonths = Array.isArray(route?.raw?.termOptionsMonths)
    ? route.raw.termOptionsMonths.map((m) => asNumber(m, 0) / 12)
    : [];

  const productOptionsYears = Array.isArray(route?.product?.term?.optionsYears)
    ? route.product.term.optionsYears
    : [];

  const rawProductOptionsYears = Array.isArray(route?.raw?.product?.term?.optionsYears)
    ? route.raw.product.term.optionsYears
    : [];

  const options = uniqueSortedYears([
    ...directOptionsYears,
    ...rawOptionsYears,
    ...directOptionsMonths,
    ...rawOptionsMonths,
    ...productOptionsYears,
    ...rawProductOptionsYears,
  ]);

  if (options.length) return options;

  if (routeYears >= 20 && routeYears <= 30) {
    return uniqueSortedYears([20, routeYears, 30]);
  }

  return uniqueSortedYears([routeYears]);
}

function getProviderLabel(route) {
  const raw =
    route?.providerLabel ||
    route?.banco ||
    route?.provider ||
    route?.channel ||
    route?.raw?.providerLabel ||
    route?.raw?.banco ||
    route?.raw?.provider ||
    route?.raw?.channel ||
    route?.product?.channel ||
    route?.raw?.product?.channel ||
    "Banca Privada";

  const key = String(raw).toUpperCase();

  const map = {
    PRIVATE_BANK: "Banca Privada",
    PRIVATE: "Banca Privada",
    BANCA_PRIVADA: "Banca Privada",
    BIESS: "BIESS",
  };

  return map[key] || raw;
}

function getProductLabel(route) {
  const raw =
    route?.productLabel ||
    route?.tipoProducto ||
    route?.producto ||
    route?.mortgageId ||
    route?.id ||
    route?.raw?.productLabel ||
    route?.raw?.tipoProducto ||
    route?.raw?.label ||
    route?.raw?.mortgageId ||
    "Ruta hipotecaria";

  const key = String(raw).toUpperCase();

  const map = {
    VIS: "Vivienda de Interés Social",
    VIP: "Vivienda de Interés Público",
    VIS_II: "Subsidio VIS II",
    PRIVATE: "Hipoteca Privada",
    PRIVATE_BANK: "Banca Privada",
    BIESS: "BIESS",
    BIESS_CREDICASA: "BIESS Vivienda Premier 2.99%",
    BIESS_VIS_VIP: "BIESS Vivienda VIS / VIP",
    BIESS_MEDIA: "BIESS Vivienda Media",
    BIESS_ALTA: "BIESS Vivienda Alta",
    BIESS_LUJO: "BIESS Vivienda de Lujo",
  };

  return map[key] || raw;
}

function getFallbackRoute(snapshot) {
  const bestMortgage = pick(snapshot, ["bestMortgage"]);
  const ranked = pick(snapshot, ["rankedMortgages"]);
  const marketplace = pick(snapshot, ["mortgageMarketplace"]);

  if (bestMortgage) return bestMortgage;

  if (Array.isArray(ranked) && ranked.length) return ranked[0];

  if (marketplace?.bestForCurrentGoal) return marketplace.bestForCurrentGoal;

  if (
    Array.isArray(marketplace?.couldWorkIfAdjusted) &&
    marketplace.couldWorkIfAdjusted.length
  ) {
    return marketplace.couldWorkIfAdjusted[0];
  }

  return null;
}

function normalizeRoute(route, snapshot) {
  const fallback = getFallbackRoute(snapshot);
  const source = route || fallback || null;

  if (!source) return null;

  const annualRate =
    getRouteValue(source, ["annualRate", "tasaAnual", "rate"], null) ??
    pick(snapshot, ["annualRate", "tasaAnual", "interestRate"]);

  const loanAmount =
    getRouteValue(source, ["montoPrestamo", "loanAmount", "monto", "amount"], null) ??
    pick(snapshot, ["montoPrestamo", "loanAmount", "maxLoanAmount", "montoMaximo"]);

  const homeValue =
    getRouteValue(source, ["valorViviendaEstimado", "precioMaxVivienda", "priceMax", "homeValue", "propertyValue"], null) ??
    pick(snapshot, ["precioMaxVivienda", "precioMax", "valorMaxVivienda", "homePrice"]);

  const monthly =
    getRouteValue(source, ["cuota", "monthlyPayment", "cuotaEstimada"], null) ??
    pick(snapshot, ["cuotaEstimada", "cuotaMensual", "monthlyPayment"]);

  return {
    ...source,
    annualRate,
    tasaAnual: annualRate,
    montoPrestamo: loanAmount,
    loanAmount,
    valorViviendaEstimado: homeValue,
    precioMaxVivienda: homeValue,
    cuota: monthly,
    providerLabel: getProviderLabel(source),
    productLabel: getProductLabel(source),
  };
}

const UI = {
  green: "#25d3a6",
  card: "rgba(255,255,255,0.055)",
  card2: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.10)",
  borderSoft: "rgba(255,255,255,0.08)",
  text: "rgba(226,232,240,0.98)",
  muted: "rgba(148,163,184,0.95)",
  dim: "rgba(203,213,225,0.72)",
  shadow: "0 22px 70px rgba(0,0,0,0.32)",
};

function Pill({ children, tone = "neutral" }) {
  const bg =
    tone === "green"
      ? "rgba(37,211,166,0.14)"
      : tone === "blue"
      ? "rgba(96,165,250,0.14)"
      : tone === "amber"
      ? "rgba(251,191,36,0.14)"
      : "rgba(255,255,255,0.07)";

  const border =
    tone === "green"
      ? "rgba(37,211,166,0.28)"
      : tone === "blue"
      ? "rgba(96,165,250,0.28)"
      : tone === "amber"
      ? "rgba(251,191,36,0.28)"
      : "rgba(255,255,255,0.10)";

  const color =
    tone === "green"
      ? "rgba(204,251,241,0.98)"
      : tone === "blue"
      ? "rgba(191,219,254,0.98)"
      : tone === "amber"
      ? "rgba(254,243,199,0.98)"
      : "rgba(226,232,240,0.92)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "8px 12px",
        borderRadius: 999,
        background: bg,
        border: `1px solid ${border}`,
        color,
        fontSize: 12,
        fontWeight: 900,
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  );
}

function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        height: 56,
        borderRadius: 20,
        border: "none",
        background:
          "linear-gradient(135deg, rgba(125,245,222,1), rgba(37,211,166,1))",
        color: "#052019",
        fontSize: 15,
        fontWeight: 950,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.55 : 1,
        boxShadow: "0 18px 45px rgba(37,211,166,0.16)",
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        height: 56,
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.13)",
        background: "rgba(255,255,255,0.045)",
        color: "white",
        fontSize: 15,
        fontWeight: 900,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {children}
    </button>
  );
}

function Section({ title, subtitle, children, right }) {
  return (
    <section
      style={{
        marginTop: 18,
        padding: 20,
        borderRadius: 30,
        background: UI.card,
        border: `1px solid ${UI.border}`,
        boxShadow: "0 16px 46px rgba(0,0,0,0.22)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 14,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h2
            style={{
              margin: 0,
              color: UI.text,
              fontSize: 23,
              lineHeight: 1.1,
              letterSpacing: -0.5,
              fontWeight: 980,
            }}
          >
            {title}
          </h2>

          {subtitle ? (
            <div
              style={{
                marginTop: 8,
                color: UI.muted,
                fontSize: 14,
                lineHeight: 1.45,
                maxWidth: 720,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        {right || null}
      </div>

      <div style={{ marginTop: 16 }}>{children}</div>
    </section>
  );
}

function MetricCard({ label, value, hint, icon }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 22,
        background: UI.card2,
        border: `1px solid ${UI.borderSoft}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          color: UI.muted,
          fontSize: 12,
          fontWeight: 850,
        }}
      >
        {icon || null}
        {label}
      </div>

      <div
        style={{
          marginTop: 8,
          color: UI.text,
          fontSize: 24,
          lineHeight: 1,
          letterSpacing: -0.6,
          fontWeight: 980,
        }}
      >
        {value}
      </div>

      {hint ? (
        <div
          style={{
            marginTop: 8,
            color: "rgba(148,163,184,0.82)",
            fontSize: 12,
            lineHeight: 1.35,
          }}
        >
          {hint}
        </div>
      ) : null}
    </div>
  );
}

function Bar({ left, right, leftLabel, rightLabel }) {
  const total = Math.max(1, left + right);
  const leftPct = Math.max(8, Math.min(92, (left / total) * 100));
  const rightPct = 100 - leftPct;

  return (
    <div>
      <div
        style={{
          height: 18,
          width: "100%",
          borderRadius: 999,
          overflow: "hidden",
          display: "flex",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            width: `${leftPct}%`,
            background:
              "linear-gradient(90deg, rgba(45,212,191,1), rgba(143,227,212,1))",
          }}
        />
        <div
          style={{
            width: `${rightPct}%`,
            background: "rgba(96,165,250,0.72)",
          }}
        />
      </div>

      <div
        style={{
          marginTop: 8,
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          fontSize: 12,
          color: "rgba(226,232,240,0.70)",
          lineHeight: 1.35,
        }}
      >
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}

export default function HipotecaDetail() {
  const navigate = useNavigate();

  const snapshot = useMemo(() => loadOwnedData(LS_SNAPSHOT) || {}, []);
  const journey = useMemo(() => loadOwnedData(LS_JOURNEY) || {}, []);
  const storedRoute = useMemo(() => loadOwnedData(LS_SELECTED_MORTGAGE_ROUTE), []);

  const route = useMemo(
    () => normalizeRoute(storedRoute, snapshot),
    [storedRoute, snapshot]
  );

  const routeYears = useMemo(() => resolveRouteYears(route), [route]);
  const termOptionsYears = useMemo(
    () => resolveTermOptionsYears(route, routeYears),
    [route, routeYears]
  );

  const [selectedYears, setSelectedYears] = useState(routeYears);
  const [extraMonthly, setExtraMonthly] = useState(0);

  const userAge =
    maybeNumber(journey?.form?.edad) ??
    maybeNumber(snapshot?.inputNormalizado?.edad) ??
    maybeNumber(snapshot?.output?.inputNormalizado?.edad) ??
    29;

  const data = useMemo(() => {
    if (!route) return null;

    const loanAmount = asNumber(route?.montoPrestamo ?? route?.loanAmount, 0);
    const annualRate = normalizeRate(route?.annualRate ?? route?.tasaAnual);
    const estimatedHomeValue = asNumber(
      route?.valorViviendaEstimado ??
        route?.precioMaxVivienda ??
        route?.priceMax ??
        route?.homeValue,
      loanAmount
    );

    const downPayment = Math.max(0, estimatedHomeValue - loanAmount);

    const options = termOptionsYears.map((years) => {
      const payment = monthlyPayment({
        principal: loanAmount,
        annualRate,
        years,
      });

      const totalPaid = payment * years * 12;
      const totalInterest = Math.max(0, totalPaid - loanAmount);

      return {
        years,
        payment,
        totalPaid,
        totalInterest,
        finishAge: userAge + years,
        isRouteTerm: years === routeYears,
      };
    });

    const selected =
      options.find((option) => option.years === selectedYears) ||
      options.find((option) => option.years === routeYears) ||
      options[0];

    const safeYears = selected?.years || routeYears;

    const month1 = buildScheduleSnapshot({
      principal: loanAmount,
      annualRate,
      years: safeYears,
      month: 1,
    });

    const year5 = buildScheduleSnapshot({
      principal: loanAmount,
      annualRate,
      years: safeYears,
      month: Math.min(60, safeYears * 12),
    });

    const year10 = buildScheduleSnapshot({
      principal: loanAmount,
      annualRate,
      years: safeYears,
      month: Math.min(120, safeYears * 12),
    });

    const extra = simulateExtraPayment({
      principal: loanAmount,
      annualRate,
      years: safeYears,
      extraMonthly,
    });

    return {
      loanAmount,
      annualRate,
      estimatedHomeValue,
      downPayment,
      options,
      selected,
      routeYears,
      month1,
      year5,
      year10,
      extra,
    };
  }, [route, termOptionsYears, selectedYears, routeYears, userAge, extraMonthly]);

  function confirmRoute() {
    if (!route) return;

    const confirmedRoute = {
      ...route,
      status: "confirmed",
      source: route?.source || "hipoteca_detail",
      selectedAt: route?.selectedAt || new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
    };

    saveOwnedData(LS_SELECTED_MORTGAGE_ROUTE, confirmedRoute);

    const nextJourney = {
      ...(journey || {}),
      matchExplorado: true,
      mortgageRouteConfirmed: true,
      mortgageRoute: confirmedRoute,
      mortgageRouteConfirmedAt: new Date().toISOString(),
    };

    saveOwnedData(LS_JOURNEY, nextJourney);
    navigate("/ruta");
  }

  if (!route || !data) {
    return (
      <HabitaShell maxWidth={860}>
        <div style={{ paddingBottom: 32 }}>
          <button
            type="button"
            onClick={() => navigate("/match")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "white",
              borderRadius: 999,
              padding: "10px 14px",
              cursor: "pointer",
              fontWeight: 850,
              marginBottom: 18,
            }}
          >
            <ArrowLeft size={15} />
            Volver a Match
          </button>

          <Section
            title="No encontramos una hipoteca seleccionada"
            subtitle="Primero entra a Match, revisa tus opciones hipotecarias y abre el detalle desde ahí."
          >
            <PrimaryButton onClick={() => navigate("/match")}>
              Ir a Match
            </PrimaryButton>
          </Section>
        </div>
      </HabitaShell>
    );
  }

  const providerLabel = route.providerLabel || getProviderLabel(route);
  const productLabel = route.productLabel || getProductLabel(route);

  return (
    <HabitaShell maxWidth={980}>
      <div style={{ paddingBottom: 32 }}>
        <button
          type="button"
          onClick={() => navigate("/match")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "white",
            borderRadius: 999,
            padding: "10px 14px",
            cursor: "pointer",
            fontWeight: 850,
            marginBottom: 18,
          }}
        >
          <ArrowLeft size={15} />
          Volver a Match
        </button>

        <div
          style={{
            padding: 24,
            borderRadius: 34,
            background:
              "radial-gradient(900px 420px at 20% 0%, rgba(37,211,166,0.16), transparent 58%), rgba(255,255,255,0.055)",
            border: `1px solid ${UI.border}`,
            boxShadow: UI.shadow,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 18,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 0, flex: "1 1 520px" }}>
              <div
                style={{
                  color: "#8FE3D4",
                  fontSize: 13,
                  fontWeight: 900,
                }}
              >
                Comparador visual
              </div>

              <h1
                style={{
                  margin: "8px 0 0",
                  color: UI.text,
                  fontSize: 44,
                  lineHeight: 1,
                  letterSpacing: -1.6,
                  fontWeight: 980,
                  maxWidth: 720,
                }}
              >
                Entiende tu hipoteca
              </h1>

              <div
                style={{
                  marginTop: 12,
                  color: UI.muted,
                  fontSize: 16,
                  lineHeight: 1.5,
                  maxWidth: 760,
                }}
              >
                Tu ruta fue calculada con un plazo referencial de{" "}
                <strong style={{ color: "white" }}>{data.routeYears} años</strong>.
                Mira cómo cambia la cuota, el tiempo y los intereses.
              </div>
            </div>

            <Pill tone="green">
              <Landmark size={14} />
              {providerLabel}
            </Pill>
          </div>

          <div
            style={{
              marginTop: 22,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            <MetricCard
              icon={<Landmark size={14} />}
              label="Producto"
              value={productLabel}
            />

            <MetricCard
              icon={<Calculator size={14} />}
              label="Valor vivienda"
              value={moneyUSD(data.estimatedHomeValue)}
            />

            <MetricCard
              icon={<PiggyBank size={14} />}
              label="Préstamo"
              value={moneyUSD(data.loanAmount)}
            />

            <MetricCard
              icon={<TrendingUp size={14} />}
              label="Tasa referencial"
              value={formatRate(data.annualRate)}
            />
          </div>
        </div>

        <Section
          title="Cómo cambia según el plazo"
          subtitle="Compara plazos referenciales. La entidad financiera define la oferta final."
          right={<Pill tone="blue">Tu ruta: {data.routeYears} años</Pill>}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            {data.options.map((option) => {
              const active = option.years === selectedYears;

              return (
                <button
                  type="button"
                  key={option.years}
                  onClick={() => setSelectedYears(option.years)}
                  style={{
                    textAlign: "left",
                    cursor: "pointer",
                    padding: 18,
                    borderRadius: 24,
                    border: active
                      ? "1px solid rgba(37,211,166,0.65)"
                      : "1px solid rgba(255,255,255,0.10)",
                    background: active
                      ? "rgba(37,211,166,0.13)"
                      : "rgba(255,255,255,0.045)",
                    color: "white",
                    position: "relative",
                  }}
                >
                  {option.isRouteTerm ? (
                    <span
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        padding: "5px 8px",
                        borderRadius: 999,
                        background: "rgba(37,211,166,0.14)",
                        border: "1px solid rgba(37,211,166,0.25)",
                        color: "#8FE3D4",
                        fontSize: 10,
                        fontWeight: 950,
                      }}
                    >
                      Tu ruta
                    </span>
                  ) : null}

                  <div
                    style={{
                      fontSize: 30,
                      fontWeight: 980,
                      lineHeight: 1,
                    }}
                  >
                    {option.years}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      color: UI.muted,
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    años
                  </div>

                  <div
                    style={{
                      marginTop: 16,
                      color: active ? "#8FE3D4" : UI.text,
                      fontSize: 22,
                      fontWeight: 980,
                    }}
                  >
                    {moneyUSD(option.payment)}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      color: "rgba(148,163,184,0.82)",
                      fontSize: 12,
                    }}
                  >
                    cuota aprox.
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        <Section
          title={`Escenario a ${data.selected?.years || data.routeYears} años`}
          subtitle={
            data.selected?.isRouteTerm
              ? "Este es el plazo usado para calcular tu ruta principal."
              : "Este escenario es una comparación educativa."
          }
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            <MetricCard
              label="Cuota mensual"
              value={moneyUSD(data.selected?.payment || 0)}
              hint="Referencia mensual estimada"
            />

            <MetricCard
              label="Terminarías aprox."
              value={`${data.selected?.finishAge || userAge + data.routeYears} años`}
              hint={`Edad actual usada: ${userAge}`}
            />

            <MetricCard
              label="Total pagado"
              value={moneyUSD(data.selected?.totalPaid || 0)}
              hint="Cuotas acumuladas"
            />

            <MetricCard
              label="Intereses"
              value={moneyUSD(data.selected?.totalInterest || 0)}
              hint="Costo financiero estimado"
            />
          </div>

          <div style={{ marginTop: 18 }}>
            <Bar
              left={data.loanAmount}
              right={data.selected?.totalInterest || 0}
              leftLabel={`Capital ${moneyUSD(data.loanAmount)}`}
              rightLabel={`Intereses ${moneyUSD(data.selected?.totalInterest || 0)}`}
            />
          </div>
        </Section>

        <Section
          title="¿A dónde se va tu cuota?"
          subtitle="Al inicio, una parte importante suele ir a intereses. Con el tiempo, más parte va a capital."
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            {[
              { label: "Mes 1", item: data.month1 },
              { label: "Año 5", item: data.year5 },
              { label: "Año 10", item: data.year10 },
            ].map(({ label, item }) => (
              <div
                key={label}
                style={{
                  padding: 16,
                  borderRadius: 22,
                  background: UI.card2,
                  border: `1px solid ${UI.borderSoft}`,
                }}
              >
                <div
                  style={{
                    marginBottom: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    color: UI.text,
                    fontSize: 14,
                    fontWeight: 900,
                  }}
                >
                  <span>{label}</span>
                  <span>{moneyUSD(item.payment)}</span>
                </div>

                <Bar
                  left={item.capital}
                  right={item.interest}
                  leftLabel={`Capital ${moneyUSD(item.capital)}`}
                  rightLabel={`Interés ${moneyUSD(item.interest)}`}
                />
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="¿Quieres terminar antes?"
          subtitle="Si la entidad permite abonos a capital, podrías reducir tiempo e intereses."
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 10,
            }}
          >
            {[0, 50, 100, 150].map((amount) => {
              const active = amount === extraMonthly;

              return (
                <button
                  type="button"
                  key={amount}
                  onClick={() => setExtraMonthly(amount)}
                  style={{
                    height: 54,
                    borderRadius: 18,
                    border: active
                      ? "1px solid rgba(37,211,166,0.65)"
                      : "1px solid rgba(255,255,255,0.10)",
                    background: active
                      ? "rgba(37,211,166,0.14)"
                      : "rgba(255,255,255,0.045)",
                    color: active ? "#8FE3D4" : "white",
                    fontSize: 15,
                    fontWeight: 950,
                    cursor: "pointer",
                  }}
                >
                  +{moneyUSD(amount)}
                </button>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 16,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            <MetricCard
              icon={<Clock size={14} />}
              label="Terminarías en"
              value={formatYearsMonths(data.extra.months)}
              hint={
                extraMonthly > 0
                  ? `Ahorras ${formatYearsMonths(data.extra.savedMonths)}`
                  : "Sin abono extra"
              }
            />

            <MetricCard
              icon={<PiggyBank size={14} />}
              label="Interés que podrías ahorrar"
              value={moneyUSD(data.extra.savedInterest)}
              hint={
                extraMonthly > 0
                  ? `Pagando ${moneyUSD(extraMonthly)} extra al mes`
                  : "Elige un abono extra"
              }
            />
          </div>
        </Section>

        <Section title="Lectura rápida">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 12,
            }}
          >
            {[
              `Tu ruta principal fue calculada a ${data.routeYears} años.`,
              "Un plazo más largo suele bajar la cuota, pero aumenta el tiempo de pago.",
              "Un plazo más corto suele subir la cuota, pero puede reducir intereses.",
              "Los plazos finales dependen de la entidad financiera y del producto.",
            ].map((text, idx) => (
              <div
                key={idx}
                style={{
                  padding: 15,
                  borderRadius: 20,
                  background: UI.card2,
                  border: `1px solid ${UI.borderSoft}`,
                  color: "rgba(226,232,240,0.86)",
                  fontSize: 14,
                  lineHeight: 1.45,
                  fontWeight: 750,
                  display: "flex",
                  gap: 10,
                }}
              >
                <CheckCircle2
                  size={16}
                  color="#8FE3D4"
                  style={{ flexShrink: 0, marginTop: 2 }}
                />
                {text}
              </div>
            ))}
          </div>
        </Section>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 12,
          }}
        >
          <PrimaryButton onClick={confirmRoute}>
            Confirmar esta ruta hipotecaria
          </PrimaryButton>

          <SecondaryButton onClick={() => navigate("/match")}>
            Volver a comparar
          </SecondaryButton>
        </div>

        <div
          style={{
            marginTop: 16,
            color: "rgba(148,163,184,0.72)",
            fontSize: 12,
            lineHeight: 1.45,
            textAlign: "center",
          }}
        >
          Simulación referencial. No representa aprobación final ni oferta
          definitiva de una entidad financiera.
        </div>
      </div>
    </HabitaShell>
  );
}