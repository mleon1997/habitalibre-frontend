// src/pages/QueMeFalta.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Target,
  PiggyBank,
  TrendingUp,
  Home,
  RefreshCw,
} from "lucide-react";

import HabitaShell from "../components/HabitaShell.jsx";
import {
  Card,
  Chip,
  PrimaryButton,
  SecondaryButton,
  ProgressBar,
} from "../ui/kit.jsx";
import { moneyUSD } from "../lib/money.js";
import { getCustomer, getCustomerToken } from "../lib/customerSession.js";

const LS_SNAPSHOT = "hl_mobile_last_snapshot_v1";
const LS_JOURNEY = "hl_mobile_journey_v1";

function loadJSON(key) {
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

function pick(snapshot, keys) {
  if (!snapshot) return null;

  for (const k of keys) {
    if (snapshot?.[k] != null) return snapshot[k];
    if (snapshot?.output?.[k] != null) return snapshot.output[k];
  }

  return null;
}

const isFiniteNum = (v) => typeof v === "number" && Number.isFinite(v);

function toNum(v) {
  if (isFiniteNum(v)) return v;
  if (v == null) return null;

  const s = String(v).replace(/[^\d.]/g, "");
  if (!s) return null;

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function fmtUSD(n) {
  const x = toNum(n);
  return x == null ? "—" : moneyUSD(x);
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, Number(n || 0)));
}

function InfoCard({ title, subtitle, children }) {
  return (
    <Card style={{ padding: 20 }}>
      <div
        style={{
          fontSize: 18,
          fontWeight: 950,
          color: "rgba(226,232,240,0.98)",
          letterSpacing: -0.2,
        }}
      >
        {title}
      </div>

      {subtitle ? (
        <div
          style={{
            marginTop: 8,
            fontSize: 13.5,
            lineHeight: 1.45,
            color: "rgba(148,163,184,0.95)",
          }}
        >
          {subtitle}
        </div>
      ) : null}

      <div style={{ marginTop: 15 }}>{children}</div>
    </Card>
  );
}

function MetricBox({ icon, label, value, hint }) {
  return (
    <div
      style={{
        padding: 15,
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.09)",
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          color: "rgba(148,163,184,0.92)",
          fontWeight: 850,
        }}
      >
        {icon}
        {label}
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 22,
          fontWeight: 980,
          color: "rgba(226,232,240,0.98)",
          lineHeight: 1.05,
        }}
      >
        {value}
      </div>

      {hint ? (
        <div
          style={{
            marginTop: 7,
            fontSize: 12,
            color: "rgba(148,163,184,0.88)",
            lineHeight: 1.35,
          }}
        >
          {hint}
        </div>
      ) : null}
    </div>
  );
}

function SuggestionRow({ title, subtitle, cta, onClick, tone = "neutral" }) {
  const toneMap = {
    neutral: {
      bg: "rgba(255,255,255,0.045)",
      bd: "rgba(255,255,255,0.10)",
    },
    good: {
      bg: "rgba(37,211,166,0.08)",
      bd: "rgba(37,211,166,0.25)",
    },
    warn: {
      bg: "rgba(251,191,36,0.08)",
      bd: "rgba(251,191,36,0.25)",
    },
  };

  const t = toneMap[tone] || toneMap.neutral;

  return (
    <div
      style={{
        padding: 15,
        borderRadius: 18,
        background: t.bg,
        border: `1px solid ${t.bd}`,
      }}
    >
      <div style={{ fontWeight: 950, fontSize: 14 }}>{title}</div>

      {subtitle ? (
        <div
          style={{
            marginTop: 7,
            fontSize: 13,
            color: "rgba(148,163,184,0.95)",
            lineHeight: 1.42,
          }}
        >
          {subtitle}
        </div>
      ) : null}

      {cta ? (
        <div style={{ marginTop: 12 }}>
          <SecondaryButton onClick={onClick}>{cta}</SecondaryButton>
        </div>
      ) : null}
    </div>
  );
}

export default function QueMeFalta() {
  const nav = useNavigate();
  const token = getCustomerToken?.();
  const isLoggedIn = !!token;

  const journey = useMemo(() => loadOwnedData(LS_JOURNEY) || {}, []);
  const snapshot = useMemo(() => loadOwnedData(LS_SNAPSHOT) || {}, []);

  const valorViviendaJourney =
    toNum(journey?.form?.valorVivienda) ??
    toNum(journey?.form?.valor) ??
    toNum(journey?.form?.precioVivienda) ??
    null;

  const precioMaxVivienda =
    toNum(
      pick(snapshot, ["precioMaxVivienda", "precioMax", "valorMaxVivienda"])
    ) ?? null;

  const valorObjetivo = valorViviendaJourney ?? precioMaxVivienda ?? null;

  const ltv = toNum(pick(snapshot, ["ltv"])) ?? null;

  const entradaDisponible =
    toNum(journey?.form?.entradaDisponible) ??
    toNum(journey?.form?.entrada) ??
    toNum(journey?.form?.ahorro) ??
    toNum(pick(snapshot, ["entradaDisponible"])) ??
    null;

  const ingresoNeto =
    toNum(journey?.form?.ingresoNetoMensual) ??
    toNum(journey?.form?.ingreso) ??
    toNum(pick(snapshot, ["ingresoNetoMensual", "ingresoTotal"])) ??
    null;

  const dti = toNum(pick(snapshot, ["dtiConHipoteca", "dti"])) ?? null;

  const scoreObj = pick(snapshot, ["score", "hlScore", "scoreHL"]);
  const scoreTotal =
    typeof scoreObj === "object" ? toNum(scoreObj?.total) : toNum(scoreObj);

  const entradaRequerida = useMemo(() => {
    if (valorObjetivo == null) return null;

    if (ltv != null && ltv > 0 && ltv < 1) {
      return Math.max(0, valorObjetivo * (1 - ltv));
    }

    return Math.max(0, valorObjetivo * 0.2);
  }, [valorObjetivo, ltv]);

  const faltaEntrada = useMemo(() => {
    if (entradaRequerida == null) return null;
    const disp = entradaDisponible ?? 0;
    return Math.max(0, entradaRequerida - disp);
  }, [entradaRequerida, entradaDisponible]);

  const [ahorroMensual, setAhorroMensual] = useState(() => {
    const base = ingresoNeto != null ? ingresoNeto * 0.1 : 300;
    return Math.max(100, Math.round(base / 10) * 10);
  });

  const mesesParaMeta = useMemo(() => {
    if (faltaEntrada == null) return null;
    if (faltaEntrada <= 0) return 0;

    const a = Math.max(1, toNum(ahorroMensual) ?? 0);
    return Math.ceil(faltaEntrada / a);
  }, [faltaEntrada, ahorroMensual]);

  const dtiLabel = useMemo(() => {
    if (dti == null) return null;
    if (dti <= 0.35) return { txt: "Saludable", tone: "good" };
    if (dti <= 0.45) return { txt: "Ajustado", tone: "warn" };
    return { txt: "Riesgoso", tone: "warn" };
  }, [dti]);

  const progressEntrada =
    entradaRequerida != null
      ? entradaDisponible == null
        ? 0
        : (clamp(entradaDisponible, 0, entradaRequerida) /
            Math.max(1, entradaRequerida)) *
          100
      : 0;

  const headline = useMemo(() => {
    if (!isLoggedIn) {
      return {
        title: "Inicia sesión para guardar tu plan",
        subtitle:
          "Puedes explorar igual, pero con tu cuenta guardas tu meta y tu ruta.",
        cta: "Entrar a mi cuenta",
        to: "/login",
        tone: "neutral",
      };
    }

    if (valorObjetivo == null) {
      return {
        title: "Define tu vivienda objetivo",
        subtitle:
          "Necesitamos un precio objetivo para decirte exactamente qué te falta.",
        cta: "Ir a evaluación",
        to: "/app?mode=journey&afinando=1&force=1",
        tone: "neutral",
      };
    }

    if (faltaEntrada != null && faltaEntrada > 0) {
      return {
        title: "Te falta completar tu entrada",
        subtitle: `Te faltan aprox. ${fmtUSD(
          faltaEntrada
        )} para una vivienda de ${fmtUSD(valorObjetivo)}.`,
        cta: "Ajustar mi escenario",
        to: "/app?mode=journey&afinando=1&force=1",
        tone: "warn",
      };
    }

    return {
      title: "Tu entrada ya está lista",
      subtitle:
        "Ahora el foco es documentos y cerrar tu ruta con el banco correcto.",
      cta: "Ver checklist",
      to: "/checklist-documentos",
      tone: "good",
    };
  }, [isLoggedIn, valorObjetivo, faltaEntrada]);

  return (
    <HabitaShell maxWidth={860}>
      <div style={{ paddingBottom: 32 }}>
        <button
          type="button"
          onClick={() => nav("/ruta")}
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
            width: "fit-content",
            marginBottom: 18,
          }}
        >
          <ArrowLeft size={15} />
          Volver a Ruta
        </button>

        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 13,
              color: "rgba(148,163,184,0.95)",
              fontWeight: 850,
              marginBottom: 8,
            }}
          >
            Qué me falta
          </div>

          <div
            style={{
              fontSize: 36,
              lineHeight: 1.02,
              fontWeight: 980,
              letterSpacing: -1.2,
              color: "rgba(226,232,240,0.98)",
              maxWidth: 680,
            }}
          >
            Qué te falta para comprar
          </div>

          <div
            style={{
              marginTop: 10,
              fontSize: 15,
              lineHeight: 1.45,
              color: "rgba(148,163,184,0.95)",
              maxWidth: 680,
            }}
          >
            Te mostramos tu brecha principal y un plan simple para cerrarla.
          </div>
        </div>

        <InfoCard title={headline.title} subtitle={headline.subtitle}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Chip tone={headline.tone}>{valorObjetivo != null ? "Meta" : "Paso 1"}</Chip>

            {isLoggedIn ? (
              <Chip tone="good">Plan guardable</Chip>
            ) : (
              <Chip tone="neutral">Explorar</Chip>
            )}

            {valorObjetivo != null ? (
              <Chip tone="neutral">Vivienda {fmtUSD(valorObjetivo)}</Chip>
            ) : null}
          </div>

          <div style={{ marginTop: 16 }}>
            <PrimaryButton onClick={() => nav(headline.to)}>
              {headline.cta}
            </PrimaryButton>
          </div>
        </InfoCard>

        <Card style={{ marginTop: 18, padding: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(148,163,184,0.95)",
                  fontWeight: 850,
                }}
              >
                Tu brecha
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 22,
                  fontWeight: 980,
                  color: "rgba(226,232,240,0.98)",
                }}
              >
                Entrada y preparación
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {scoreTotal != null ? (
                <Chip tone="neutral">Score HL {scoreTotal}</Chip>
              ) : null}

              {dtiLabel?.txt ? (
                <Chip tone={dtiLabel.tone}>DTI {dtiLabel.txt}</Chip>
              ) : null}
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 10,
            }}
          >
            <MetricBox
              icon={<Target size={14} />}
              label="Entrada requerida aprox."
              value={entradaRequerida != null ? fmtUSD(entradaRequerida) : "—"}
              hint={`Basado en LTV ${
                ltv != null ? `${Math.round(ltv * 100)}%` : "estimado"
              }.`}
            />

            <MetricBox
              icon={<PiggyBank size={14} />}
              label="Te falta"
              value={faltaEntrada != null ? fmtUSD(faltaEntrada) : "—"}
              hint={`Entrada disponible: ${
                entradaDisponible != null ? fmtUSD(entradaDisponible) : "—"
              }`}
            />
          </div>

          {entradaRequerida != null ? (
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(148,163,184,0.92)",
                  fontWeight: 850,
                  marginBottom: 8,
                }}
              >
                Progreso hacia tu entrada
              </div>

              <ProgressBar value={progressEntrada} />

              <div
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: "rgba(148,163,184,0.85)",
                }}
              >
                {Math.round(progressEntrada)}%
              </div>
            </div>
          ) : null}
        </Card>

        <InfoCard
          title="Plan simple para cerrar la brecha"
          subtitle="Ajusta un ahorro mensual y te estimamos el tiempo."
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 10,
            }}
          >
            <MetricBox
              icon={<PiggyBank size={14} />}
              label="Ahorro mensual"
              value={fmtUSD(ahorroMensual)}
              hint="Puedes ajustarlo abajo."
            />

            <MetricBox
              icon={<TrendingUp size={14} />}
              label="Tiempo estimado"
              value={
                mesesParaMeta == null
                  ? "—"
                  : mesesParaMeta === 0
                  ? "0 meses"
                  : `${mesesParaMeta} meses`
              }
              hint="Estimación simple."
            />
          </div>

          <input
            type="range"
            min={100}
            max={5000}
            step={50}
            value={clamp(ahorroMensual, 100, 5000)}
            onChange={(e) => setAhorroMensual(Number(e.target.value))}
            style={{
              width: "100%",
              marginTop: 18,
              accentColor: "#25d3a6",
            }}
            aria-label="Ahorro mensual"
          />

          <div
            style={{
              marginTop: 12,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            <SecondaryButton
              onClick={() =>
                setAhorroMensual((v) => Math.max(100, Number(v || 0) - 100))
              }
            >
              − Bajar $100
            </SecondaryButton>

            <SecondaryButton
              onClick={() =>
                setAhorroMensual((v) => Math.min(5000, Number(v || 0) + 100))
              }
            >
              + Subir $100
            </SecondaryButton>
          </div>
        </InfoCard>

        <InfoCard
          title="Opciones para mejorar tu ruta"
          subtitle="Estas son las palancas que más suelen mover tu resultado."
        >
          <div style={{ display: "grid", gap: 10 }}>
            <SuggestionRow
              tone={faltaEntrada != null && faltaEntrada > 0 ? "warn" : "good"}
              title="1) Aumentar entrada"
              subtitle={
                faltaEntrada == null
                  ? "Define tu objetivo para calcular brecha."
                  : faltaEntrada > 0
                  ? `Si consigues ${fmtUSD(
                      Math.min(faltaEntrada, 5000)
                    )} extra, tu ruta puede mejorar visiblemente.`
                  : "Tu entrada está cubierta."
              }
              cta="Ajustar escenario"
              onClick={() => nav("/app?mode=journey&afinando=1&force=1")}
            />

            <SuggestionRow
              tone={dti != null && dti > 0.45 ? "warn" : "neutral"}
              title="2) Bajar deudas"
              subtitle={
                dti == null
                  ? "DTI no disponible en snapshot."
                  : dti > 0.45
                  ? "Tu DTI está alto. Bajar deudas mensuales suele subir aprobación rápido."
                  : `Tu DTI está ${dtiLabel?.txt || "ok"}. Igual puedes optimizarlo.`
              }
              cta="Actualizar datos"
              onClick={() => nav("/app?mode=journey&afinando=1&force=1")}
            />

            <SuggestionRow
              tone="neutral"
              title="3) Probar una vivienda más baja"
              subtitle={
                valorObjetivo == null
                  ? "Define tu precio objetivo."
                  : `Probar ${fmtUSD(valorObjetivo * 0.9)} o ${fmtUSD(
                      valorObjetivo * 0.8
                    )} puede cambiar bastante tu escenario.`
              }
              cta="Simular otro precio"
              onClick={() => nav("/app?mode=journey&afinando=1&force=1")}
            />
          </div>
        </InfoCard>

        <Card style={{ marginTop: 18, padding: 20 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 10,
            }}
          >
            <PrimaryButton onClick={() => nav("/capacidad")}>
              Ver mi capacidad
            </PrimaryButton>

            <SecondaryButton onClick={() => nav("/match")}>
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <Home size={15} />
                Ver mi Match
              </span>
            </SecondaryButton>

            <SecondaryButton onClick={() => nav("/progreso")}>
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <RefreshCw size={15} />
                Volver a Home
              </span>
            </SecondaryButton>
          </div>
        </Card>

        <div
          style={{
            marginTop: 16,
            fontSize: 12,
            color: "rgba(148,163,184,0.72)",
            lineHeight: 1.4,
            textAlign: "center",
          }}
        >
          Nota: esto es una estimación. La preaprobación real depende de
          documentos y políticas de la entidad financiera.
        </div>
      </div>
    </HabitaShell>
  );
}