// src/pages/Ruta.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  MapPinned,
  Home,
  FileText,
  ShieldCheck,
  Send,
  BadgeCheck,
} from "lucide-react";
import {
  Card,
  Chip,
  PrimaryButton,
  SecondaryButton,
  ProgressBar,
} from "../ui/kit.jsx";
import HabitaShell from "../components/HabitaShell.jsx";
import { moneyUSD } from "../lib/money";
import { getCustomer } from "../lib/customerSession.js";

const LS_SNAPSHOT = "hl_mobile_last_snapshot_v1";
const LS_JOURNEY = "hl_mobile_journey_v1";
const LS_SELECTED_PROPERTY = "hl_selected_property_v1";
const LS_SELECTED_MORTGAGE_ROUTE = "hl_selected_mortgage_route_v1";
const LS_DOCS_CHECKLIST = "hl_docs_checklist_v1";

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

    if (!ownerEmail) {
      return envelope.data ?? null;
    }

    return null;
  }

  return envelope;
}

const clamp = (n, a, b) => Math.max(a, Math.min(b, Number(n || 0)));

function toPct(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return null;
  const pct = x <= 1 ? x * 100 : x;
  return clamp(Math.round(pct), 0, 100);
}


function toNumValue(v) {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function moneySafe(v) {
  const n = toNumValue(v);
  return n == null ? "—" : moneyUSD(n);
}

function probMeta(probPct) {
  if (probPct == null) return { label: "—", tone: "neutral" };
  if (probPct >= 70) return { label: "Alta", tone: "good" };
  if (probPct >= 45) return { label: "Media", tone: "warn" };
  return { label: "Baja", tone: "bad" };
}

function statusMeta(status) {
  if (status === "done") {
    return {
      label: "Completado",
      tone: "good",
      dot: "rgba(34,197,94,1)",
      glow: "0 0 0 6px rgba(34,197,94,0.12)",
    };
  }

  if (status === "next") {
    return {
      label: "Siguiente",
      tone: "good",
      dot: "rgba(45,212,191,1)",
      glow: "0 0 0 8px rgba(45,212,191,0.16)",
    };
  }

  if (status === "pending") {
    return {
      label: "Pendiente",
      tone: "neutral",
      dot: "rgba(148,163,184,0.85)",
      glow: "none",
    };
  }

  return {
    label: "Bloqueado",
    tone: "neutral",
    dot: "rgba(148,163,184,0.35)",
    glow: "none",
  };
}

function getSelectedPropertyStatusMeta(status, hasChosenProperty) {
  if (!hasChosenProperty) {
    return {
      short: "Pendiente",
      hint: "Elegir una propiedad te ayuda a aterrizar tu siguiente paso con más claridad.",
      tone: "neutral",
    };
  }

  if (status === "selected_viable_now") {
    return {
      short: "Sigue alineada",
      hint: "Tu propiedad elegida sigue siendo una buena ruta con tu perfil actual.",
      tone: "good",
    };
  }

  if (status === "selected_future_viable") {
    return {
      short: "Ruta futura",
      hint: "Tu propiedad elegida todavía puede funcionar como ruta futura.",
      tone: "neutral",
    };
  }

  if (status === "selected_near_route") {
    return {
      short: "Revisar encaje",
      hint: "Tu perfil cambió y conviene revisar si esta sigue siendo de tus mejores opciones.",
      tone: "neutral",
    };
  }

  if (status === "selected_no_longer_viable") {
    return {
      short: "Ya no calza hoy",
      hint: "Tu información cambió y esta propiedad ya no se ve alineada con tu ruta más recomendable.",
      tone: "neutral",
    };
  }

  return {
    short: "Elegida",
    hint: "Tu ruta ya puede avanzar con esa propiedad como base.",
    tone: "good",
  };
}

function getMortgageRouteLabel(route) {
  const provider =
    route?.providerLabel ||
    route?.banco ||
    route?.provider ||
    "Ruta hipotecaria";

  const product =
    route?.productLabel ||
    route?.tipoProducto ||
    route?.label ||
    route?.mortgageId ||
    "Producto recomendado";

  return `${provider} · ${product}`;
}

function getCaseReadinessStatus({
  hasChosenProperty,
  selectedPropertyStatus,
  hasConfirmedMortgageRoute,
  docsReady,
}) {
  if (!hasChosenProperty) return "no_listo";
  if (selectedPropertyStatus === "selected_no_longer_viable") {
    return "revisar_ruta";
  }
  if (selectedPropertyStatus === "selected_near_route") {
    return "comparar_propiedades";
  }
  if (!hasConfirmedMortgageRoute) return "confirmar_hipoteca";
  if (!docsReady) return "no_listo";
  return "listo_para_revision_habitalibre";
}

function getCaseStepMeta({
  caseReadinessStatus,
  activationRequestedAt,
  projectSubmittedAt,
  bankSubmittedAt,
}) {
  const wasSentExternally = Boolean(projectSubmittedAt || bankSubmittedAt);
  const wasReceivedByHabitaLibre = Boolean(activationRequestedAt);

  if (wasSentExternally) {
    return {
      validateDone: true,
      sendDone: true,
      statusDone: false,
      validateStatus: "done",
      sendStatus: "done",
      statusStatus: "next",
      validateChip: "Validado",
      sendChip: "Recibido por HL",
      statusChip: "En seguimiento",
      validateHint: "Tu caso ya fue validado por el sistema.",
      sendHint:
        "Tu caso ya fue recibido por HabitaLibre y luego movido al siguiente frente.",
      statusHint: "Aquí puedes seguir el estado real de tu caso.",
      validateCta: "Ver validación",
      sendCta: "Ver envío",
      statusCta: "Ver estado",
    };
  }

  if (wasReceivedByHabitaLibre) {
    return {
      validateDone: true,
      sendDone: true,
      statusDone: false,
      validateStatus: "done",
      sendStatus: "done",
      statusStatus: "next",
      validateChip: "Validado",
      sendChip: "Recibido por HL",
      statusChip: "En revisión",
      validateHint: "Tu caso ya fue validado y sí tiene base suficiente.",
      sendHint: "Tu caso ya fue enviado a la cola operativa de HabitaLibre.",
      statusHint:
        "Aquí puedes ver que HabitaLibre lo está revisando antes de moverlo.",
      validateCta: "Ver validación",
      sendCta: "Ver envío",
      statusCta: "Ver estado",
    };
  }

  if (caseReadinessStatus === "listo_para_revision_habitalibre") {
    return {
      validateDone: false,
      sendDone: false,
      statusDone: false,
      validateStatus: "next",
      sendStatus: "pending",
      statusStatus: "pending",
      validateChip: "Validación disponible",
      sendChip: "Pendiente",
      statusChip: "Pendiente",
      validateHint:
        "Tu propiedad, tu ruta hipotecaria y tu preparación ya se ven suficientes para revisar si el caso puede enviarse a HabitaLibre.",
      sendHint:
        "Cuando la validación esté lista, podrás enviar tu caso a la cola operativa de HabitaLibre.",
      statusHint:
        "Aquí verás el estado real una vez que tu caso ya haya sido recibido por HabitaLibre.",
      validateCta: "Ver validación",
      sendCta: "Ir al envío",
      statusCta: "Ver estado",
    };
  }

  if (caseReadinessStatus === "confirmar_hipoteca") {
    return {
      validateDone: false,
      sendDone: false,
      statusDone: false,
      validateStatus: "locked",
      sendStatus: "locked",
      statusStatus: "pending",
      validateChip: "Falta hipoteca",
      sendChip: "Bloqueado",
      statusChip: "Pendiente",
      validateHint:
        "Antes de validar tu caso, confirma la ruta hipotecaria con la que quieres avanzar.",
      sendHint:
        "No conviene enviar el caso mientras la ruta hipotecaria no esté confirmada.",
      statusHint:
        "Aquí verás el estado real cuando tu caso ya haya sido recibido por HabitaLibre.",
      validateCta: "Ver validación",
      sendCta: "Ir al envío",
      statusCta: "Ver estado",
    };
  }

  if (
    caseReadinessStatus === "revisar_ruta" ||
    caseReadinessStatus === "comparar_propiedades"
  ) {
    return {
      validateDone: false,
      sendDone: false,
      statusDone: false,
      validateStatus: "next",
      sendStatus: "locked",
      statusStatus: "pending",
      validateChip: "Primero revisar",
      sendChip: "Bloqueado",
      statusChip: "Pendiente",
      validateHint:
        "Antes de enviar tu caso, conviene revisar si esta sigue siendo la propiedad correcta.",
      sendHint: "No conviene enviar el caso mientras la ruta no esté clara.",
      statusHint:
        "Aquí verás el estado real cuando tu caso ya haya sido recibido por HabitaLibre.",
      validateCta: "Revisar mi caso",
      sendCta: "Ir al envío",
      statusCta: "Ver estado",
    };
  }

  return {
    validateDone: false,
    sendDone: false,
    statusDone: false,
    validateStatus: "locked",
    sendStatus: "locked",
    statusStatus: "locked",
    validateChip: "Falta evaluación",
    sendChip: "Bloqueado",
    statusChip: "Bloqueado",
    validateHint: "Primero debes completar tu evaluación para abrir una ruta real.",
    sendHint:
      "El envío solo se habilita cuando ya existe una base suficiente del caso.",
    statusHint:
      "Aquí verás el estado real cuando tu caso ya haya sido recibido por HabitaLibre.",
    validateCta: "Ver evaluación",
    sendCta: "Ir al envío",
    statusCta: "Ver estado",
  };
}

function hasUnlockedEvaluation(snapshot) {
  return Boolean(
    snapshot?.unlocked === true ||
      snapshot?.output?.unlocked === true ||
      snapshot?.ok === true ||
      snapshot?.output?.ok === true ||
      snapshot?.score != null ||
      snapshot?.output?.score != null ||
      snapshot?.financialCapacity?.estimatedMaxPropertyValue != null ||
      snapshot?.output?.financialCapacity?.estimatedMaxPropertyValue != null
  );
}

function mapMobilePathToWeb(path) {
  const p = String(path || "").trim();

  if (!p || p === "/") return "/progreso";

  // Rutas mobile antiguas → rutas web reales
  if (p === "/journey/full") return "/app?mode=journey&afinando=1&force=1";
  if (p === "/journey") return "/app?mode=journey";
  if (p === "/marketplace") return "/match";

  // Rutas web nuevas: NO convertirlas en secciones internas de /ruta
  if (p === "/checklist-documentos") return "/checklist-documentos";
  if (p === "/siguiente-paso") return "/siguiente-paso";
  if (p === "/caso") return "/caso";
  if (p === "/hipoteca-detalle") return "/hipoteca-detalle";
  if (p === "/match") return "/match";
  if (p === "/progreso") return "/progreso";
  if (p === "/capacidad") return "/capacidad";
  if (p === "/que-me-falta") return "/que-me-falta";
  if (p === "/mejorar-perfil") return "/mejorar-perfil";

  // PropertyDetail ya existe como pantalla real en web
  if (p.startsWith("/property/")) return p;

  return p;
}

function TimelineDot({ status }) {
  const meta = statusMeta(status);

  return (
    <span
      style={{
        width: 14,
        height: 14,
        borderRadius: 999,
        background: meta.dot,
        boxShadow: meta.glow,
        flex: "0 0 auto",
      }}
    />
  );
}

function RightMetric({ children, tone = "neutral" }) {
  return (
    <Chip tone={tone} style={{ alignSelf: "flex-end" }}>
      {children}
    </Chip>
  );
}

function StepTimelineCard({
  stepNum,
  title,
  subtitle,
  status,
  rightChips = null,
  ctaLabel,
  onClick,
  disabled,
  hint,
  featured = false,
  icon = null,
}) {
  const meta = statusMeta(status);
  const isLocked = status === "locked" || disabled;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "30px 1fr",
        gap: 14,
        alignItems: "stretch",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: 100,
        }}
      >
        <TimelineDot status={status} />
        <div
          style={{
            width: 2,
            flex: 1,
            marginTop: 10,
            borderRadius: 999,
            background:
              status === "done" || status === "next"
                ? "linear-gradient(180deg, rgba(45,212,191,0.28), rgba(148,163,184,0.14))"
                : "rgba(148,163,184,0.16)",
          }}
        />
      </div>

      <Card
        soft
        style={{
          padding: featured ? 16 : 14,
          opacity: isLocked ? 0.74 : 1,
          boxShadow: featured ? "0 12px 34px rgba(0,0,0,0.22)" : undefined,
          background: featured
            ? "linear-gradient(180deg, rgba(37,211,166,0.06), rgba(255,255,255,0.04))"
            : undefined,
          border:
            status === "next"
              ? "1px solid rgba(45,212,191,0.22)"
              : status === "done"
              ? "1px solid rgba(34,197,94,0.14)"
              : undefined,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <Chip tone={meta.tone}>{meta.label}</Chip>
              <span
                style={{
                  fontSize: 12,
                  color: "rgba(148,163,184,0.95)",
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {icon}
                Paso {stepNum}
              </span>
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: featured ? 16 : 15,
                fontWeight: 980,
                letterSpacing: 0.15,
                color: "rgba(226,232,240,0.98)",
                lineHeight: 1.15,
              }}
            >
              {title}
            </div>

            <div
              style={{
                marginTop: 7,
                fontSize: 13,
                color: "rgba(148,163,184,0.95)",
                lineHeight: 1.4,
                maxWidth: 440,
              }}
            >
              {subtitle}
            </div>
          </div>

          {!!rightChips && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                alignItems: "flex-end",
                flexShrink: 0,
              }}
            >
              {rightChips}
            </div>
          )}
        </div>

        {!!hint && (
          <div
            style={{
              marginTop: 12,
              fontSize: 12.5,
              color: "rgba(148,163,184,0.88)",
              lineHeight: 1.4,
            }}
          >
            {hint}
          </div>
        )}

        <div style={{ marginTop: 14 }}>
          {status === "next" ? (
            <PrimaryButton disabled={isLocked} onClick={onClick}>
              {ctaLabel}
            </PrimaryButton>
          ) : (
            <SecondaryButton disabled={isLocked} onClick={onClick}>
              {ctaLabel}
            </SecondaryButton>
          )}
        </div>
      </Card>
    </div>
  );
}


function PreparationRouteCard({
  currentMaxPropertyValue,
  currentMonthlyPayment,
  projectedEntryMaxPropertyValue,
  projectedEntryMonths,
  projectedFutureEntry,
  debtReductionTargetPrice,
  debtReductionNeeded,
  targetDebtAfterReduction,
  currentDebt,
  onGoMatch,
  onAdjust,
}) {
  const hasEntryProjection =
    toNumValue(projectedEntryMaxPropertyValue) != null &&
    toNumValue(projectedEntryMaxPropertyValue) > 0;

  const hasDebtReductionRoute =
    toNumValue(debtReductionTargetPrice) != null &&
    toNumValue(debtReductionTargetPrice) > 0 &&
    toNumValue(debtReductionNeeded) != null &&
    toNumValue(debtReductionNeeded) > 0;

  if (!hasEntryProjection && !hasDebtReductionRoute) return null;

  return (
    <Card
      style={{
        marginTop: 18,
        padding: 18,
        background:
          "linear-gradient(135deg, rgba(37,211,166,0.10), rgba(59,130,246,0.08))",
        border: "1px solid rgba(37,211,166,0.18)",
        boxShadow: "0 18px 44px rgba(0,0,0,0.24)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(167,243,208,0.95)",
              fontWeight: 950,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <MapPinned size={14} strokeWidth={2.4} />
            Ruta de preparación
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 22,
              fontWeight: 980,
              lineHeight: 1.08,
              color: "rgba(248,250,252,0.98)",
              maxWidth: 430,
            }}
          >
            Tu capacidad actual no es el techo
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 13.5,
              lineHeight: 1.45,
              color: "rgba(203,213,225,0.92)",
              maxWidth: 520,
            }}
          >
            Hoy vemos un rango prudente. Pero si usas tu horizonte para completar
            entrada y bajar deudas, puedes acercarte a un rango más alto antes de
            aplicar a una hipoteca.
          </div>
        </div>

        <Chip tone="good">Plan accionable</Chip>
      </div>

      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 10,
        }}
      >
        <div
          style={{
            padding: 14,
            borderRadius: 18,
            background: "rgba(15,23,42,0.62)",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        >
          <div style={{ fontSize: 12, color: "rgba(148,163,184,0.95)" }}>
            Rango prudente hoy
          </div>
          <div style={{ marginTop: 6, fontSize: 24, fontWeight: 980 }}>
            {moneySafe(currentMaxPropertyValue)}
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              lineHeight: 1.35,
              color: "rgba(203,213,225,0.78)",
            }}
          >
            Con tus deudas actuales y una cuota referencial de{" "}
            {moneySafe(currentMonthlyPayment)}.
          </div>
        </div>

        {hasEntryProjection ? (
          <div
            style={{
              padding: 14,
              borderRadius: 18,
              background: "rgba(15,23,42,0.62)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <div style={{ fontSize: 12, color: "rgba(148,163,184,0.95)" }}>
              Completando entrada
            </div>
            <div style={{ marginTop: 6, fontSize: 24, fontWeight: 980 }}>
              {moneySafe(projectedEntryMaxPropertyValue)}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                lineHeight: 1.35,
                color: "rgba(203,213,225,0.78)",
              }}
            >
              Ahorrando durante {Math.round(projectedEntryMonths || 0)} meses
              hasta llegar a {moneySafe(projectedFutureEntry)} de entrada.
            </div>
          </div>
        ) : null}

        {hasDebtReductionRoute ? (
          <div
            style={{
              padding: 14,
              borderRadius: 18,
              background: "rgba(37,211,166,0.14)",
              border: "1px solid rgba(37,211,166,0.24)",
            }}
          >
            <div style={{ fontSize: 12, color: "rgba(167,243,208,0.95)" }}>
              Ruta potencial
            </div>
            <div style={{ marginTop: 6, fontSize: 24, fontWeight: 980 }}>
              {moneySafe(debtReductionTargetPrice)}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 12,
                lineHeight: 1.35,
                color: "rgba(209,250,229,0.84)",
              }}
            >
              Si reduces cerca de {moneySafe(debtReductionNeeded)} de deudas
              mensuales, podrías apuntar más alto.
            </div>
          </div>
        ) : null}
      </div>

      <div
        style={{
          marginTop: 14,
          padding: 14,
          borderRadius: 18,
          background: "rgba(2,6,23,0.26)",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "grid",
          gap: 10,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 950,
            color: "rgba(248,250,252,0.95)",
          }}
        >
          Qué deberías hacer ahora
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontSize: 13, lineHeight: 1.4, color: "rgba(226,232,240,0.88)" }}>
            1. Mantén tu ahorro mensual para llevar tu entrada hacia{" "}
            <strong>{moneySafe(projectedFutureEntry)}</strong>.
          </div>

          {hasDebtReductionRoute ? (
            <div style={{ fontSize: 13, lineHeight: 1.4, color: "rgba(226,232,240,0.88)" }}>
              2. Baja tus deudas mensuales desde aproximadamente{" "}
              <strong>{moneySafe(currentDebt)}</strong> hacia{" "}
              <strong>{moneySafe(targetDebtAfterReduction)}</strong> antes de la
              aprobación hipotecaria.
            </div>
          ) : null}

          <div style={{ fontSize: 13, lineHeight: 1.4, color: "rgba(226,232,240,0.88)" }}>
            3. Busca proyectos que permitan completar entrada durante construcción
            y que estén cerca del rango objetivo.
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
        }}
      >
        <PrimaryButton onClick={onGoMatch}>Ver propiedades compatibles</PrimaryButton>
        <SecondaryButton onClick={onAdjust}>Ajustar mi escenario</SecondaryButton>
      </div>
    </Card>
  );
}

export default function Ruta() {
  const nav = useNavigate();
  const go = (path) => nav(mapMobilePathToWeb(path));

  const snapshot = useMemo(() => loadOwnedData(LS_SNAPSHOT), []);
  const journey = useMemo(() => loadOwnedData(LS_JOURNEY), []);

  const selectedPropertyRef = useMemo(
    () => loadOwnedData(LS_SELECTED_PROPERTY),
    []
  );

  const selectedMortgageRoute = useMemo(
    () => loadOwnedData(LS_SELECTED_MORTGAGE_ROUTE),
    []
  );

  const docsChecklist = useMemo(
    () => loadOwnedData(LS_DOCS_CHECKLIST) || {},
    []
  );

  const hasEvaluation = hasUnlockedEvaluation(snapshot);

  const cuota = hasEvaluation
    ? snapshot?.cuotaMensual ??
      snapshot?.kpis?.cuotaMensual ??
      snapshot?.resultado?.cuotaMensual ??
      snapshot?.cuotaEstimada ??
      snapshot?.financialCapacity?.estimatedMonthlyPayment ??
      snapshot?.output?.financialCapacity?.estimatedMonthlyPayment ??
      snapshot?.bestMortgage?.cuota ??
      null
    : null;

  const maxCompra = hasEvaluation
    ? snapshot?.maxCompra ??
      snapshot?.kpis?.maxCompra ??
      snapshot?.resultado?.maxCompra ??
      snapshot?.precioMaxVivienda ??
      snapshot?.financialCapacity?.estimatedMaxPropertyValue ??
      snapshot?.output?.financialCapacity?.estimatedMaxPropertyValue ??
      snapshot?.montoMaximo ??
      null
    : null;

  const visTag = hasEvaluation
    ? snapshot?.programa ??
      snapshot?.kpis?.programa ??
      snapshot?.resultado?.programa ??
      snapshot?.productoSugerido ??
      snapshot?.bestMortgage?.segment ??
      snapshot?.output?.bestMortgage?.segment ??
      selectedMortgageRoute?.productLabel ??
      "VIS"
    : "—";

  const probPct = hasEvaluation
    ? toPct(
        snapshot?.probAprobacion ??
          snapshot?.kpis?.probAprobacion ??
          snapshot?.resultado?.probAprobacion ??
          snapshot?.score ??
          snapshot?.output?.score
      )
    : null;

  const prob = probMeta(probPct);


  const financialCapacity =
    snapshot?.financialCapacity ?? snapshot?.output?.financialCapacity ?? null;

  const homeRecommendation =
    snapshot?.homeRecommendation ?? snapshot?.output?.homeRecommendation ?? null;

  const homeAlternatives = Array.isArray(homeRecommendation?.alternatives)
    ? homeRecommendation.alternatives
    : [];

  const entryInstallmentsAlternative =
    homeAlternatives.find((a) => a?.kind === "entry_installments") || null;

  const debtReductionAlternative =
    homeAlternatives.find((a) => a?.kind === "debt_reduction_route") || null;

  const plannedEntry = financialCapacity?.plannedEntry || null;

  const projectedEntryMaxPropertyValue =
    toNumValue(plannedEntry?.estimatedMaxPropertyValue) ??
    toNumValue(entryInstallmentsAlternative?.alternativePrice) ??
    null;

  const projectedEntryMonths =
    toNumValue(plannedEntry?.months) ??
    toNumValue(entryInstallmentsAlternative?.months) ??
    null;

  const projectedFutureEntry =
    toNumValue(plannedEntry?.futureEntry) ??
    toNumValue(entryInstallmentsAlternative?.futureEntry) ??
    null;

  const debtReductionTargetPrice =
    toNumValue(debtReductionAlternative?.alternativePrice) ?? null;

  const debtReductionNeeded =
    toNumValue(debtReductionAlternative?.debtReductionNeeded) ?? null;

  const targetDebtAfterReduction =
    toNumValue(debtReductionAlternative?.targetDebtAfterReduction) ?? null;

  const currentDebt =
    toNumValue(debtReductionAlternative?.currentDebt) ??
    toNumValue(snapshot?.input?.otrasDeudasMensuales) ??
    toNumValue(snapshot?.perfilInput?.otrasDeudasMensuales) ??
    toNumValue(snapshot?.inputNormalizado?.otrasDeudasMensuales) ??
    toNumValue(snapshot?.otrasDeudasMensuales) ??
    null;

  const hasEntryProjection =
    projectedEntryMaxPropertyValue != null &&
    projectedEntryMaxPropertyValue > 0 &&
    projectedEntryMaxPropertyValue > (toNumValue(maxCompra) || 0);

  const hasDebtReductionRoute =
    debtReductionTargetPrice != null &&
    debtReductionTargetPrice > 0 &&
    debtReductionNeeded != null &&
    debtReductionNeeded > 0;

  const showPreparationRoute =
    hasEvaluation && (hasEntryProjection || hasDebtReductionRoute);


  const matchedPropsFromJourney =
    journey?.match?.propiedades?.length ??
    journey?.match?.items?.length ??
    journey?.matchCount ??
    null;

  const matchedPropsFromSnapshot = hasEvaluation
    ? snapshot?.matchedProperties?.length ??
      snapshot?.output?.matchedProperties?.length ??
      snapshot?.plan?.routeSignals?.matchedProperties?.length ??
      snapshot?.routeSignals?.matchedProperties?.length ??
      null
    : null;

  const propsCount = matchedPropsFromJourney ?? matchedPropsFromSnapshot ?? null;

const selectedPropertyId =
  selectedPropertyRef?.id ||
  selectedPropertyRef?._id ||
  selectedPropertyRef?.propertyId ||
  journey?.propiedadId ||
  journey?.propiedadSeleccionada?.id ||
  journey?.propiedadSeleccionada?._id ||
  journey?.propiedadSeleccionada?.propertyId ||
  null;

const selectedPropertyStatus =
  selectedPropertyRef?.status ||
  journey?.selectedPropertyStatus ||
  journey?.propiedadSeleccionada?.status ||
  null;

const hasChosenProperty = Boolean(
  selectedPropertyId ||
  selectedPropertyRef ||
  journey?.propiedadElegida ||
  journey?.propiedadId ||
  journey?.propiedadSeleccionada
);

const selectedPropertyStatusMeta = getSelectedPropertyStatusMeta(
  selectedPropertyStatus,
  hasChosenProperty
);

  const hasConfirmedMortgageRoute = Boolean(
    selectedMortgageRoute?.status === "confirmed" ||
      selectedMortgageRoute?.status === "selected" ||
      journey?.mortgageRouteConfirmed === true
  );

  const mortgageRouteLabel = selectedMortgageRoute
    ? getMortgageRouteLabel(selectedMortgageRoute)
    : null;

  const docsDone = Object.values(docsChecklist).filter(Boolean).length;
  const docsTotal = 10;
  const docsProgress = Math.max(
    0,
    Math.min(100, Math.round((docsDone / docsTotal) * 100))
  );

  const docsReady = docsProgress >= 60;

  const caseReadinessStatus = hasEvaluation
    ? getCaseReadinessStatus({
        hasChosenProperty,
        selectedPropertyStatus,
        hasConfirmedMortgageRoute,
        docsReady,
      })
    : "no_listo";

  const activationRequestedAt = journey?.activationRequestedAt || null;
  const projectSubmittedAt = journey?.projectSubmittedAt || null;
  const bankSubmittedAt = journey?.bankSubmittedAt || null;

  const caseSteps = getCaseStepMeta({
    caseReadinessStatus,
    activationRequestedAt,
    projectSubmittedAt,
    bankSubmittedAt,
  });

  const flags = {
    precalificacion: hasEvaluation,
    matchExplorado:
      hasEvaluation &&
      Boolean(
        journey?.matchExplorado ||
          journey?.match?.visto ||
          (propsCount && propsCount > 0)
      ),
    propiedadElegida: hasEvaluation && hasChosenProperty,
    rutaHipotecariaConfirmada:
      hasEvaluation && hasChosenProperty && hasConfirmedMortgageRoute,
    docsSubidos:
      hasEvaluation && hasChosenProperty && hasConfirmedMortgageRoute && docsReady,
    casoValidado:
      hasEvaluation &&
      (caseReadinessStatus === "listo_para_revision_habitalibre" ||
        Boolean(activationRequestedAt) ||
        Boolean(projectSubmittedAt) ||
        Boolean(bankSubmittedAt)),
    casoEnviado: hasEvaluation && Boolean(activationRequestedAt),
    estadoRevision:
      hasEvaluation &&
      (Boolean(activationRequestedAt) ||
        Boolean(projectSubmittedAt) ||
        Boolean(bankSubmittedAt)),
  };

  const stepsOrder = [
    "precalificacion",
    "matchExplorado",
    "propiedadElegida",
    "rutaHipotecariaConfirmada",
    "docsSubidos",
    "casoValidado",
    "casoEnviado",
    "estadoRevision",
  ];

  const doneCount = stepsOrder.filter((k) => flags[k]).length;
  const progressPct = clamp(
    Math.round((doneCount / stepsOrder.length) * 100),
    0,
    100
  );
  const remaining = stepsOrder.length - doneCount;

  const nextStepKey = stepsOrder.find((k) => !flags[k]) || "estadoRevision";

  const nextStepLabel =
    nextStepKey === "precalificacion"
      ? "Empezar evaluación"
      : nextStepKey === "matchExplorado"
      ? "Explorar tu Match"
      : nextStepKey === "propiedadElegida"
      ? "Elegir una propiedad"
      : nextStepKey === "rutaHipotecariaConfirmada"
      ? "Confirmar ruta hipotecaria"
      : nextStepKey === "docsSubidos"
      ? "Preparar documentos"
      : nextStepKey === "casoValidado"
      ? "Validar tu caso"
      : nextStepKey === "casoEnviado"
      ? "Enviar caso a HabitaLibre"
      : "Estado de revisión";

  const goNext = () => {
    if (nextStepKey === "precalificacion") go("/journey/full");
    else if (nextStepKey === "matchExplorado") go("/marketplace");
    else if (nextStepKey === "propiedadElegida") go("/marketplace");
    else if (nextStepKey === "rutaHipotecariaConfirmada") go("/marketplace");
    else if (nextStepKey === "docsSubidos") go("/checklist-documentos");
    else if (nextStepKey === "casoValidado") go("/siguiente-paso");
    else if (nextStepKey === "casoEnviado") go("/siguiente-paso");
    else go("/caso");
  };

  return (
<HabitaShell maxWidth={760}>
  <div className="hl-route-shell" style={{ paddingBottom: 24 }}>
    <style>
      {`
        .hl-route-shell {
          padding-bottom: 24px;
        }

        .hl-route-summary-head {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: flex-start;
        }

        .hl-route-summary-chips {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-end;
          flex-shrink: 0;
        }

        .hl-route-next-content {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-width: 0;
        }

        .hl-route-next-copy {
          min-width: 0;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .hl-route-next-eyebrow {
          white-space: nowrap;
        }

        .hl-route-next-label {
          min-width: 0;
          white-space: normal;
        }

        .hl-route-next-arrow {
          flex: 0 0 auto;
        }

        @media (max-width: 520px) {
          .hl-route-shell {
            padding-bottom: calc(150px + env(safe-area-inset-bottom));
          }

          .hl-route-summary-head {
            flex-direction: column;
            align-items: stretch;
          }

          .hl-route-summary-chips {
            flex-direction: row;
            align-items: flex-start;
            justify-content: flex-start;
            flex-wrap: wrap;
          }

          .hl-route-next-content {
            justify-content: space-between;
            gap: 12px;
            text-align: left;
          }

          .hl-route-next-copy {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 2px;
          }

          .hl-route-next-eyebrow {
            font-size: 11px;
            line-height: 1;
            font-weight: 950;
            opacity: 0.72;
          }

          .hl-route-next-label {
            font-size: 15px;
            line-height: 1.12;
            font-weight: 980;
            letter-spacing: -0.1px;
            overflow-wrap: anywhere;
          }
        }
      `}
    </style>
        <Card
          style={{
            padding: "18px 18px 18px",
            boxShadow: "0 14px 36px rgba(0,0,0,0.22)",
          }}
        >
      <div className="hl-route-summary-head">
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(148,163,184,0.95)",
                  fontWeight: 850,
                  marginBottom: 8,
                }}
              >
                Ruta
              </div>

              <div
                style={{
                  fontSize: 20,
                  fontWeight: 980,
                  letterSpacing: 0.2,
                  lineHeight: 1.08,
                }}
              >
                Tu camino a tu casa
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 13.5,
                  color: "rgba(148,163,184,0.95)",
                  lineHeight: 1.4,
                  maxWidth: 360,
                }}
              >
                Pasos claros. Progreso real.
              </div>
            </div>

         <div className="hl-route-summary-chips">
              <Chip tone={prob.tone}>
                Probabilidad {prob.label}
                {probPct != null ? ` · ${probPct}%` : ""}
              </Chip>
              <Chip tone="neutral">{progressPct}% completado</Chip>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(148,163,184,0.95)",
                  fontWeight: 800,
                }}
              >
                Progreso
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(226,232,240,0.92)",
                  fontWeight: 950,
                }}
              >
                {progressPct}%
              </div>
            </div>

            <ProgressBar value={progressPct} />

            <div
              style={{
                marginTop: 10,
                fontSize: 12.5,
                color: "rgba(148,163,184,0.95)",
                lineHeight: 1.4,
              }}
            >
              {remaining > 0 ? (
                <>
                  Te faltan{" "}
                  <b style={{ color: "rgba(226,232,240,0.95)" }}>
                    {remaining}
                  </b>{" "}
                  pasos para continuar.
                </>
              ) : (
                <>¡Listo! Ya completaste todos los pasos.</>
              )}
            </div>

            <div style={{ marginTop: 14 }}>
             <PrimaryButton
  onClick={goNext}
  style={{
    padding: "14px 16px",
    minHeight: 58,
  }}
>
  <span className="hl-route-next-content">
    <span className="hl-route-next-copy">
      <span className="hl-route-next-eyebrow">Siguiente paso</span>
      <span className="hl-route-next-label">{nextStepLabel}</span>
    </span>

    <ArrowRight className="hl-route-next-arrow" size={18} />
  </span>
</PrimaryButton>
            </div>
          </div>
        </Card>

        {showPreparationRoute ? (
          <PreparationRouteCard
            currentMaxPropertyValue={maxCompra}
            currentMonthlyPayment={cuota}
            projectedEntryMaxPropertyValue={projectedEntryMaxPropertyValue}
            projectedEntryMonths={projectedEntryMonths}
            projectedFutureEntry={projectedFutureEntry}
            debtReductionTargetPrice={debtReductionTargetPrice}
            debtReductionNeeded={debtReductionNeeded}
            targetDebtAfterReduction={targetDebtAfterReduction}
            currentDebt={currentDebt}
            onGoMatch={() => go("/marketplace")}
            onAdjust={() => go("/journey/full")}
          />
        ) : null}

        <div
          style={{
            marginTop: 18,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <StepTimelineCard
            stepNum={1}
            title="Precalificación"
            subtitle={
              hasEvaluation
                ? "Tu perfil hipotecario ya está listo."
                : "Completa tu evaluación para abrir tu ruta real."
            }
            status={hasEvaluation ? "done" : "next"}
            featured={!hasEvaluation}
            icon={<CheckCircle2 size={13} />}
            rightChips={
              <>
                <RightMetric>{hasEvaluation ? "Score" : "Pendiente"}</RightMetric>
                <RightMetric>
                  {hasEvaluation && cuota ? `Cuota ${moneyUSD(cuota)}` : "Cuota —"}
                </RightMetric>
              </>
            }
            ctaLabel={hasEvaluation ? "Ver mi resultado" : "Empezar evaluación"}
            onClick={() => go(hasEvaluation ? "/" : "/journey/full")}
            hint={
              hasEvaluation
                ? "Este es el paso más importante. Lo demás es elegir la mejor opción."
                : "Aquí se activa tu capacidad estimada, tu cuota referencial y tu siguiente mejor paso."
            }
          />

          <StepTimelineCard
            stepNum={2}
            title="Explorar tu Match"
            subtitle="Compara propiedades e hipotecas que encajan con tu perfil."
            status={
              !hasEvaluation
                ? "locked"
                : flags.matchExplorado
                ? "done"
                : "next"
            }
            featured={hasEvaluation && !flags.matchExplorado}
            icon={<MapPinned size={13} />}
            rightChips={
              <>
                <RightMetric>{hasEvaluation ? visTag : "—"}</RightMetric>
                <RightMetric>
                  {hasEvaluation && maxCompra ? `Hasta ${moneyUSD(maxCompra)}` : "Hasta —"}
                </RightMetric>
              </>
            }
            ctaLabel={propsCount ? `Ver ${propsCount} propiedades` : "Ir a Match"}
            onClick={() => go("/marketplace")}
            disabled={!hasEvaluation}
            hint={
              hasEvaluation
                ? cuota && maxCompra
                  ? (
                    <>
                      Tu rango:{" "}
                      <b style={{ color: "rgba(226,232,240,0.95)" }}>
                        {moneyUSD(maxCompra)}
                      </b>{" "}
                      · cuotas desde{" "}
                      <b style={{ color: "rgba(226,232,240,0.95)" }}>
                        {moneyUSD(cuota)}
                      </b>
                      .
                    </>
                    )
                  : "Aquí ves casas, hipotecas y cuotas en un solo lugar."
                : "Primero necesitas completar tu evaluación para ver opciones alineadas con tu perfil."
            }
          />

          <StepTimelineCard
            stepNum={3}
            title="Elegir una propiedad base"
            subtitle={
              flags.propiedadElegida
                ? "Ya elegiste una propiedad para continuar tu ruta."
                : "Selecciona la vivienda que te interesa para seguir avanzando."
            }
            status={
              !hasEvaluation
                ? "locked"
                : flags.propiedadElegida
                ? "done"
                : flags.matchExplorado
                ? "pending"
                : "locked"
            }
            icon={<Home size={13} />}
            rightChips={
              <RightMetric
                tone={flags.propiedadElegida ? selectedPropertyStatusMeta.tone : "neutral"}
              >
                {flags.propiedadElegida
                  ? selectedPropertyStatusMeta.short
                  : "Pendiente"}
              </RightMetric>
            }
            ctaLabel={
              flags.propiedadElegida ? "Ver propiedad elegida" : "Elegir en Match"
            }
            onClick={() =>
              go(
                flags.propiedadElegida && selectedPropertyId
                  ? `/property/${selectedPropertyId}`
                  : "/marketplace"
              )
            }
            disabled={!hasEvaluation || !flags.matchExplorado}
            hint={
              flags.propiedadElegida
                ? selectedPropertyStatusMeta.hint
                : "Elegir una propiedad te ayuda a aterrizar tu siguiente paso con más claridad."
            }
          />

          <StepTimelineCard
            stepNum={4}
            title="Confirmar ruta hipotecaria"
            subtitle={
              flags.rutaHipotecariaConfirmada
                ? "Ya confirmaste la ruta hipotecaria con la que quieres avanzar."
                : "Elige y confirma la hipoteca que mejor encaja con tu perfil y tu propiedad base."
            }
            status={
              !hasEvaluation
                ? "locked"
                : flags.rutaHipotecariaConfirmada
                ? "done"
                : flags.propiedadElegida
                ? "next"
                : "locked"
            }
            featured={
              hasEvaluation &&
              flags.propiedadElegida &&
              !flags.rutaHipotecariaConfirmada
            }
            icon={<ShieldCheck size={13} />}
            rightChips={
              <>
                <RightMetric tone={flags.rutaHipotecariaConfirmada ? "good" : "neutral"}>
                  {flags.rutaHipotecariaConfirmada ? "Confirmada" : "Pendiente"}
                </RightMetric>
                <RightMetric>
                  {selectedMortgageRoute?.productLabel ||
                    selectedMortgageRoute?.tipoProducto ||
                    visTag ||
                    "Hipoteca"}
                </RightMetric>
              </>
            }
            ctaLabel={
              flags.rutaHipotecariaConfirmada
                ? "Ver ruta hipotecaria"
                : "Comparar hipotecas"
            }
            onClick={() =>
              go(
                flags.rutaHipotecariaConfirmada
                  ? "/hipoteca-detalle"
                  : "/marketplace"
              )
            }
            disabled={!hasEvaluation || !flags.propiedadElegida}
            hint={
              flags.rutaHipotecariaConfirmada
                ? `${mortgageRouteLabel || "Ruta hipotecaria confirmada"}${
                    selectedMortgageRoute?.cuota
                      ? ` · cuota estimada ${moneyUSD(selectedMortgageRoute.cuota)}`
                      : ""
                  }${
                    selectedMortgageRoute?.annualRate || selectedMortgageRoute?.tasaAnual
                      ? ` · tasa ${(Number(
                          selectedMortgageRoute.annualRate ||
                            selectedMortgageRoute.tasaAnual
                        ) <= 1
                          ? Number(
                              selectedMortgageRoute.annualRate ||
                                selectedMortgageRoute.tasaAnual
                            ) * 100
                          : Number(
                              selectedMortgageRoute.annualRate ||
                                selectedMortgageRoute.tasaAnual
                            )
                        ).toFixed(2)}%`
                      : ""
                  }`
                : "Antes de preparar documentos, confirma si quieres avanzar con la ruta recomendada o comparar otras opciones."
            }
          />

          <StepTimelineCard
            stepNum={5}
            title="Preparar documentos"
            subtitle="Te mostramos qué deberías tener listo para avanzar con esta ruta hipotecaria."
            status={
              !hasEvaluation
                ? "locked"
                : flags.docsSubidos
                ? "done"
                : flags.rutaHipotecariaConfirmada
                ? "pending"
                : "locked"
            }
            icon={<FileText size={13} />}
            rightChips={
              <RightMetric tone={flags.docsSubidos ? "good" : "neutral"}>
                {flags.docsSubidos ? "Listo" : "Pendiente"}
              </RightMetric>
            }
            ctaLabel="Ver checklist"
            onClick={() => go("/checklist-documentos")}
            disabled={!hasEvaluation || !flags.rutaHipotecariaConfirmada}
            hint={
              docsDone > 0
                ? `Tienes ${docsDone} de ${docsTotal} ítems marcados en tu checklist.`
                : "Mientras más preparado estés, más fácil será dar el siguiente paso."
            }
          />

          <StepTimelineCard
            stepNum={6}
            title="Validar tu caso"
            subtitle="El sistema revisa si tu propiedad elegida, tu ruta hipotecaria y tu preparación actual ya son suficientes para enviar tu caso a revisión HabitaLibre."
            status={caseSteps.validateStatus}
            featured={caseSteps.validateStatus === "next"}
            icon={<ShieldCheck size={13} />}
            rightChips={
              <RightMetric tone={caseSteps.validateStatus === "done" ? "good" : "neutral"}>
                {caseSteps.validateChip}
              </RightMetric>
            }
            ctaLabel={caseSteps.validateCta}
            onClick={() => go(hasEvaluation ? "/siguiente-paso" : "/journey/full")}
            disabled={!hasEvaluation || !flags.docsSubidos}
            hint={
              hasEvaluation
                ? caseSteps.validateHint
                : "Primero necesitas una evaluación real para abrir este paso."
            }
          />

          <StepTimelineCard
            stepNum={7}
            title="Enviar caso a HabitaLibre"
            subtitle="Cuando tu caso esté listo, podrás enviarlo a HabitaLibre para que lo revise."
            status={caseSteps.sendStatus}
            featured={caseSteps.sendStatus === "next"}
            icon={<Send size={13} />}
            rightChips={
              <RightMetric tone={caseSteps.sendStatus === "done" ? "good" : "neutral"}>
                {caseSteps.sendChip}
              </RightMetric>
            }
            ctaLabel={caseSteps.sendCta}
            onClick={() => go(hasEvaluation ? "/siguiente-paso" : "/journey/full")}
            disabled={!hasEvaluation || caseSteps.sendStatus === "locked"}
            hint={
              hasEvaluation
                ? caseSteps.sendHint
                : "Este paso solo se habilita después de completar tu evaluación."
            }
          />

          <StepTimelineCard
            stepNum={8}
            title="Estado de revisión"
            subtitle="Aquí verás cuando HabitaLibre reciba tu caso y cómo va avanzando la revisión."
            status={caseSteps.statusStatus}
            icon={<BadgeCheck size={13} />}
            rightChips={
              <RightMetric
                tone={
                  caseSteps.statusStatus === "done" || caseSteps.statusStatus === "next"
                    ? "good"
                    : "neutral"
                }
              >
                {caseSteps.statusChip}
              </RightMetric>
            }
            ctaLabel={caseSteps.statusCta}
            onClick={() => go(hasEvaluation ? "/caso" : "/journey/full")}
            disabled={!hasEvaluation || caseSteps.statusStatus === "locked"}
            hint={
              hasEvaluation
                ? caseSteps.statusHint
                : "Este seguimiento aparecerá cuando ya exista una evaluación y un caso activo."
            }
          />
        </div>
      </div>
    </HabitaShell>
  );
}