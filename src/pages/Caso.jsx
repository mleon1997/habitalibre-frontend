// src/pages/Caso.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  FileText,
  Home,
  Send,
  User,
  Sparkles,
  Landmark,
} from "lucide-react";

import HabitaShell from "../components/HabitaShell.jsx";
import {
  Card,
  Chip,
  PrimaryButton,
  SecondaryButton,
  ProgressBar,
} from "../ui/kit.jsx";
import { moneyUSD } from "../lib/money";
import { getCustomer, getCustomerToken } from "../lib/customerSession.js";

const LS_SNAPSHOT = "hl_mobile_last_snapshot_v1";
const LS_JOURNEY = "hl_mobile_journey_v1";
const LS_SELECTED_PROPERTY = "hl_selected_property_v1";
const LS_SELECTED_MORTGAGE_ROUTE = "hl_selected_mortgage_route_v1";
const LS_DOCS_CHECKLIST = "hl_docs_checklist_v1";

const RAW_API_BASE =
  import.meta.env.VITE_API_BASE || "https://habitalibre-backend.onrender.com";

const API_BASE = RAW_API_BASE.endsWith("/api")
  ? RAW_API_BASE
  : `${RAW_API_BASE}/api`;

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

function saveOwnedData(key, data) {
  const ownerEmail = getStorageOwnerEmail();
  try {
    localStorage.setItem(key, JSON.stringify({ ownerEmail, data }));
  } catch {}
}

function normalizeProperty(raw) {
  if (!raw || typeof raw !== "object") return null;

  const id =
    raw?.id ||
    raw?._id ||
    raw?.propertyId ||
    raw?._normalizedId ||
    null;

  const title =
    raw?.titulo ||
    raw?.nombre ||
    raw?.title ||
    raw?.name ||
    raw?.proyecto ||
    raw?.projectName ||
    raw?._normalizedProjectName ||
    "Propiedad elegida";

  const city =
    raw?.ciudad ||
    raw?.city ||
    raw?.zona ||
    raw?.sector ||
    raw?.ciudadZona ||
    raw?._normalizedCity ||
    "Ubicación pendiente";

  const priceRaw =
    raw?.precio ??
    raw?.price ??
    raw?.valor ??
    raw?.listPrice ??
    raw?._normalizedPrice ??
    null;

  const price = Number.isFinite(Number(priceRaw)) ? Number(priceRaw) : null;

  return {
    id,
    title,
    city,
    price,
    status: raw?.status || raw?.selectedPropertyStatus || null,
    raw,
  };
}

function normalizeMortgageRoute(raw) {
  if (!raw || typeof raw !== "object") return null;

  const providerLabel =
    raw.providerLabel ||
    raw.banco ||
    raw.provider ||
    raw.channel ||
    raw.raw?.providerLabel ||
    raw.raw?.banco ||
    null;

  const productLabel =
    raw.productLabel ||
    raw.tipoProducto ||
    raw.label ||
    raw.mortgageId ||
    raw.raw?.productLabel ||
    raw.raw?.tipoProducto ||
    raw.raw?.label ||
    raw.raw?.mortgageId ||
    null;

  const mortgageId =
    raw.mortgageId ||
    raw.id ||
    raw.raw?.mortgageId ||
    raw.raw?.id ||
    null;

  if (!providerLabel && !productLabel && !mortgageId) return null;

  return {
    mortgageId,
    providerLabel: providerLabel || "Entidad financiera",
    productLabel: productLabel || "Ruta hipotecaria",
    cuota: raw.cuota ?? raw.monthlyPayment ?? raw.raw?.cuota ?? null,
    annualRate:
      raw.annualRate ??
      raw.tasaAnual ??
      raw.rate ??
      raw.raw?.annualRate ??
      raw.raw?.tasaAnual ??
      null,
    montoPrestamo:
      raw.montoPrestamo ??
      raw.loanAmount ??
      raw.raw?.montoPrestamo ??
      raw.raw?.loanAmount ??
      null,
    plazoMeses:
      raw.plazoMeses ??
      raw.termMonths ??
      raw.raw?.plazoMeses ??
      raw.raw?.termMonths ??
      null,
    status: raw.status || null,
    raw,
  };
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

function MiniStat({ label, value }) {
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
          fontSize: 11,
          color: "rgba(148,163,184,0.92)",
          fontWeight: 850,
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 7,
          fontSize: 17,
          color: "rgba(226,232,240,0.98)",
          fontWeight: 950,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ActionRow({ icon, title, body }) {
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
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontWeight: 950,
          color: "rgba(226,232,240,0.98)",
          marginBottom: 8,
          fontSize: 14,
        }}
      >
        {icon}
        {title}
      </div>

      <div
        style={{
          fontSize: 13.5,
          lineHeight: 1.45,
          color: "rgba(148,163,184,0.95)",
        }}
      >
        {body}
      </div>
    </div>
  );
}

function TimelineItem({ title, body, done = false }) {
  return (
    <div
      style={{
        padding: 15,
        borderRadius: 18,
        border: done
          ? "1px solid rgba(34,197,94,0.18)"
          : "1px solid rgba(255,255,255,0.09)",
        background: done ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.04)",
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 950,
          color: "rgba(226,232,240,0.98)",
          marginBottom: 6,
        }}
      >
        {done ? "✓ " : ""}
        {title}
      </div>

      <div
        style={{
          fontSize: 13.5,
          lineHeight: 1.45,
          color: "rgba(148,163,184,0.95)",
        }}
      >
        {body}
      </div>
    </div>
  );
}

function getSimpleCaseDefinition({
  hasChosenProperty,
  hasConfirmedMortgageRoute,
  docsReady,
  activationRequestedAt,
  statusGeneral,
  projectStatus,
  bankStatus,
  projectSubmittedAt,
  bankSubmittedAt,
}) {
  const wasReceived = Boolean(
    activationRequestedAt || statusGeneral === "pendiente_revision_habitalibre"
  );

  const wasSent = Boolean(
    statusGeneral === "enviado" ||
      projectStatus === "enviado" ||
      bankStatus === "enviado" ||
      projectSubmittedAt ||
      bankSubmittedAt
  );

  if (wasSent) {
    return {
      statusLabel: "Enviado por HabitaLibre",
      statusTone: "good",
      heroTitle: "Tu caso ya fue enviado",
      heroBody:
        "HabitaLibre ya compartió tu perfil con los actores correspondientes según tu caso.",
      nextActorLabel: "Caso enviado",
      nextActorText:
        "Tu caso ya salió de HabitaLibre hacia el promotor, la entidad financiera o ambos.",
      userAction: "Esperar el siguiente contacto o respuesta según tu caso.",
      habitalibreAction:
        "Ya compartió tu perfil con los actores correspondientes.",
      nextExternalStep:
        "El promotor y/o la entidad financiera podrán revisar tu perfil y contactarte si aplica.",
      ctaLabel: "Volver a mi ruta",
      ctaPath: "/ruta",
      projectStatusLabel:
        projectStatus === "enviado" || projectSubmittedAt
          ? "Enviado al promotor"
          : "Pendiente de envío",
      bankStatusLabel:
        bankStatus === "enviado" || bankSubmittedAt
          ? "Enviado a entidad financiera"
          : "Pendiente de envío",
      timelineProjectTitle: "Caso enviado al promotor",
      timelineProjectBody:
        projectStatus === "enviado" || projectSubmittedAt
          ? "HabitaLibre ya compartió tu perfil con el promotor."
          : "Todavía no se ha enviado al promotor.",
      timelineBankTitle: "Caso enviado a entidad financiera",
      timelineBankBody:
        bankStatus === "enviado" || bankSubmittedAt
          ? "HabitaLibre ya compartió tu perfil con una entidad financiera."
          : "Todavía no se ha enviado a una entidad financiera.",
    };
  }

  if (wasReceived) {
    return {
      statusLabel: "En revisión interna",
      statusTone: "good",
      heroTitle: "Tu caso fue recibido por HabitaLibre",
      heroBody:
        "Ya recibimos tu caso. Ahora HabitaLibre revisará internamente si conviene moverlo al promotor, a una entidad financiera o a ambos.",
      nextActorLabel: "En revisión HabitaLibre",
      nextActorText:
        "Tu caso ya fue recibido y todavía no ha sido enviado externamente.",
      userAction: "Esperar mientras HabitaLibre revisa el caso.",
      habitalibreAction:
        "Revisar tu propiedad, ruta hipotecaria, documentos y perfil antes de enviarlo.",
      nextExternalStep:
        "Una vez enviado, aquí podrás ver por qué frente ya fue compartido tu caso.",
      ctaLabel: "Volver a mi ruta",
      ctaPath: "/ruta",
      projectStatusLabel: "Por revisar por HabitaLibre",
      bankStatusLabel: "Por revisar por HabitaLibre",
      timelineProjectTitle: "Envío al promotor pendiente",
      timelineProjectBody:
        "HabitaLibre todavía no ha compartido tu caso con el promotor.",
      timelineBankTitle: "Envío a entidad financiera pendiente",
      timelineBankBody:
        "HabitaLibre todavía no ha compartido tu caso con una entidad financiera.",
    };
  }

  if (!hasChosenProperty) {
    return {
      statusLabel: "Esperando propiedad base",
      statusTone: "neutral",
      heroTitle: "Antes de avanzar, falta elegir una propiedad base",
      heroBody:
        "Tu caso todavía no está listo porque falta definir la propiedad que va a guiar el proceso.",
      nextActorLabel: "Primero propiedad",
      nextActorText:
        "Antes de mover tu caso, conviene elegir una propiedad base.",
      userAction:
        "Elegir la propiedad que más te interese para aterrizar tu ruta.",
      habitalibreAction:
        "Usar esa propiedad para definir cómo mover tu caso.",
      nextExternalStep: "Después podrás enviar tu caso a HabitaLibre.",
      ctaLabel: "Elegir propiedad",
      ctaPath: "/match",
      projectStatusLabel: "Pendiente",
      bankStatusLabel: "Pendiente",
      timelineProjectTitle: "Envío al promotor pendiente",
      timelineProjectBody:
        "Todavía no puede enviarse porque falta una propiedad base.",
      timelineBankTitle: "Envío a entidad financiera pendiente",
      timelineBankBody:
        "Todavía no puede enviarse porque falta una base suficiente del caso.",
    };
  }

  if (!hasConfirmedMortgageRoute) {
    return {
      statusLabel: "Esperando ruta hipotecaria",
      statusTone: "neutral",
      heroTitle: "Antes de avanzar, falta confirmar tu ruta hipotecaria",
      heroBody:
        "Ya tienes una propiedad base, pero todavía falta confirmar con qué ruta hipotecaria quieres avanzar.",
      nextActorLabel: "Primero hipoteca",
      nextActorText:
        "Antes de mover tu caso, conviene confirmar una ruta financiera concreta.",
      userAction:
        "Comparar y confirmar la hipoteca que mejor encaja con tu propiedad base.",
      habitalibreAction:
        "Usar esa ruta hipotecaria para revisar tu caso con más precisión.",
      nextExternalStep: "Después podrás completar preparación y activar tu caso.",
      ctaLabel: "Comparar hipotecas",
      ctaPath: "/match",
      projectStatusLabel: "Pendiente",
      bankStatusLabel: "Pendiente",
      timelineProjectTitle: "Envío al promotor pendiente",
      timelineProjectBody:
        "Todavía no conviene enviarlo mientras falta una ruta hipotecaria confirmada.",
      timelineBankTitle: "Envío a entidad financiera pendiente",
      timelineBankBody:
        "Todavía no conviene enviarlo mientras falta una ruta hipotecaria confirmada.",
    };
  }

  if (!docsReady) {
    return {
      statusLabel: "Esperando preparación",
      statusTone: "neutral",
      heroTitle: "Tu caso va bien, pero todavía falta preparación",
      heroBody:
        "Ya tienes una propiedad base y una ruta hipotecaria confirmada. Antes de enviar tu caso a HabitaLibre, conviene completar mejor tu checklist documental.",
      nextActorLabel: "Primero preparación",
      nextActorText:
        "Antes de mover tu caso, conviene fortalecer tu base documental.",
      userAction:
        "Completar tu checklist para llegar más ordenado al siguiente paso.",
      habitalibreAction:
        "Validar si tu caso ya tiene base suficiente para ser enviado.",
      nextExternalStep:
        "Cuando tu preparación sea suficiente, podrás activar tu caso.",
      ctaLabel: "Ver checklist",
      ctaPath: "/checklist-documentos",
      projectStatusLabel: "Pendiente",
      bankStatusLabel: "Pendiente",
      timelineProjectTitle: "Envío al promotor pendiente",
      timelineProjectBody:
        "Todavía no conviene enviarlo mientras falta preparación.",
      timelineBankTitle: "Envío a entidad financiera pendiente",
      timelineBankBody:
        "Todavía no conviene enviarlo mientras falta preparación.",
    };
  }

  return {
    statusLabel: "Listo para activar",
    statusTone: "good",
    heroTitle: "Tu caso está listo para enviarse a HabitaLibre",
    heroBody:
      "Ya tienes propiedad base, ruta hipotecaria confirmada y una preparación documental suficiente.",
    nextActorLabel: "Listo para revisión",
    nextActorText: "El siguiente paso es activar tu caso con HabitaLibre.",
    userAction: "Enviar tu caso a HabitaLibre desde la pantalla de siguiente paso.",
    habitalibreAction:
      "Revisar internamente si conviene moverlo al promotor, al banco o a ambos.",
    nextExternalStep: "Después podrás ver aquí el estado real del caso.",
    ctaLabel: "Activar caso",
    ctaPath: "/siguiente-paso",
    projectStatusLabel: "Pendiente",
    bankStatusLabel: "Pendiente",
    timelineProjectTitle: "Envío al promotor pendiente",
    timelineProjectBody: "Todavía no se ha enviado al promotor.",
    timelineBankTitle: "Envío a entidad financiera pendiente",
    timelineBankBody: "Todavía no se ha enviado a una entidad financiera.",
  };
}

export default function Caso() {
  const navigate = useNavigate();
  const [remoteCase, setRemoteCase] = useState(null);
  const [isLoadingRemote, setIsLoadingRemote] = useState(true);

  const snapshot = useMemo(() => loadOwnedData(LS_SNAPSHOT) || {}, []);
  const journey = useMemo(() => loadOwnedData(LS_JOURNEY) || {}, []);
  const selectedPropertyRef = useMemo(
  () => loadOwnedData(LS_SELECTED_PROPERTY),
  []
);

const selectedMortgageRouteRef = useMemo(
  () => loadOwnedData(LS_SELECTED_MORTGAGE_ROUTE),
  []
);

const docsChecklist = useMemo(() => loadOwnedData(LS_DOCS_CHECKLIST) || {}, []);
  useEffect(() => {
    let cancelled = false;

    async function loadLatestCase() {
      try {
        const token = getCustomerToken?.();

        if (!token) {
          if (!cancelled) setIsLoadingRemote(false);
          return;
        }

        const res = await fetch(`${API_BASE}/casos-activacion/mine/latest`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          if (!cancelled) setIsLoadingRemote(false);
          return;
        }

        const caso = data?.caso || null;

        if (!cancelled) {
          setRemoteCase(caso);
          setIsLoadingRemote(false);
        }

        if (caso && !cancelled) {
          const nextJourney = {
            ...(journey || {}),
            activationRequestId: caso?._id || null,
            activationRequestedAt: caso?.requestedAt || null,
            activationRequestStatus: caso?.statusGeneral || null,
            activationRequestLabel:
              caso?.statusGeneral === "pendiente_revision_habitalibre"
                ? "Caso recibido por HabitaLibre"
                : caso?.statusGeneral === "enviado"
                ? "Enviado por HabitaLibre"
                : journey?.activationRequestLabel || null,
            statusGeneral: caso?.statusGeneral || null,
            projectStatus: caso?.projectStatus || null,
            bankStatus: caso?.bankStatus || null,
            projectSubmittedAt: caso?.projectSubmittedAt || null,
            bankSubmittedAt: caso?.bankSubmittedAt || null,
            projectSubmissionStatus:
              caso?.projectStatus === "enviado"
                ? "Enviado al promotor"
                : "Pendiente de envío",
            bankSubmissionStatus:
              caso?.bankStatus === "enviado"
                ? "Enviado a entidad financiera"
                : "Pendiente de envío",
          };

          saveOwnedData(LS_JOURNEY, nextJourney);
        }
      } catch {
        if (!cancelled) setIsLoadingRemote(false);
      }
    }

    loadLatestCase();

    return () => {
      cancelled = true;
    };
  }, [journey]);

  const property =
  normalizeProperty(remoteCase?.selectedProperty) ||
  normalizeProperty(selectedPropertyRef) ||
  normalizeProperty(journey?.propiedadSeleccionada) ||
  normalizeProperty(journey?.selectedProperty) ||
  normalizeProperty(journey?.property) ||
  null;

const selectedMortgageRoute =
  normalizeMortgageRoute(remoteCase?.selectedMortgageRoute) ||
  normalizeMortgageRoute(selectedMortgageRouteRef) ||
  normalizeMortgageRoute(journey?.mortgageRoute) ||
  null;

const hasChosenProperty = Boolean(property?.id);

const hasConfirmedMortgageRoute = Boolean(
  selectedMortgageRoute?.status === "confirmed" ||
    selectedMortgageRoute?.status === "selected" ||
    journey?.mortgageRouteConfirmed === true
);

  const remoteDocsChecklist = remoteCase?.docsChecklist || null;
  const effectiveDocsChecklist = remoteDocsChecklist || docsChecklist;

  const docsDone = Object.values(effectiveDocsChecklist).filter(Boolean).length;
  const docsTotal = 10;
  const docsProgress = Math.max(
    0,
    Math.min(100, Math.round((docsDone / docsTotal) * 100))
  );
  const docsReady = docsProgress >= 60;

  const effectiveSnapshot = remoteCase?.snapshot || snapshot;

  const cuota =
    remoteCase?.estimatedQuota ??
    effectiveSnapshot?.cuotaMensual ??
    effectiveSnapshot?.kpis?.cuotaMensual ??
    effectiveSnapshot?.resultado?.cuotaMensual ??
    effectiveSnapshot?.cuotaEstimada ??
    effectiveSnapshot?.bestMortgage?.cuota ??
    null;

  const maxCompra =
    remoteCase?.estimatedMaxPurchase ??
    effectiveSnapshot?.maxCompra ??
    effectiveSnapshot?.kpis?.maxCompra ??
    effectiveSnapshot?.resultado?.maxCompra ??
    effectiveSnapshot?.precioMaxVivienda ??
    effectiveSnapshot?.montoMaximo ??
    null;

  const activationRequestedAt =
    remoteCase?.requestedAt || journey?.activationRequestedAt || null;

  const statusGeneral =
    remoteCase?.statusGeneral || journey?.statusGeneral || null;

  const projectStatus =
    remoteCase?.projectStatus || journey?.projectStatus || "por_revisar";

  const bankStatus =
    remoteCase?.bankStatus || journey?.bankStatus || "por_revisar";

  const projectSubmittedAt =
    remoteCase?.projectSubmittedAt || journey?.projectSubmittedAt || null;

  const bankSubmittedAt =
    remoteCase?.bankSubmittedAt || journey?.bankSubmittedAt || null;

const caseDef = getSimpleCaseDefinition({
  hasChosenProperty,
  hasConfirmedMortgageRoute,
  docsReady,
  activationRequestedAt,
  statusGeneral,
  projectStatus,
  bankStatus,
  projectSubmittedAt,
  bankSubmittedAt,
});

  return (
    <HabitaShell maxWidth={860}>
      <div style={{ paddingBottom: 32 }}>
        <div style={{ marginBottom: 18 }}>
          <button
            type="button"
            onClick={() => navigate("/ruta")}
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

          <div
            style={{
              fontSize: 13,
              color: "rgba(148,163,184,0.95)",
              fontWeight: 850,
              marginBottom: 8,
            }}
          >
            Mi caso
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
            {caseDef.heroTitle}
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
            {caseDef.heroBody}
          </div>

          {isLoadingRemote ? (
            <div
              style={{
                marginTop: 10,
                fontSize: 12.5,
                color: "rgba(148,163,184,0.85)",
                fontWeight: 700,
              }}
            >
              Actualizando estado desde HabitaLibre...
            </div>
          ) : null}
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <InfoCard
            title="Estado actual"
            subtitle="Esto resume en qué punto está tu caso hoy."
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              <Chip tone={caseDef.statusTone}>{caseDef.statusLabel}</Chip>

              <Chip tone={hasChosenProperty ? "good" : "neutral"}>
                {hasChosenProperty ? "Propiedad base lista" : "Sin propiedad base"}
              </Chip>

              <Chip tone={docsReady ? "good" : "neutral"}>
                {docsDone}/{docsTotal} ítems listos
              </Chip>
            </div>

<Chip tone={hasConfirmedMortgageRoute ? "good" : "neutral"}>
  {hasConfirmedMortgageRoute ? "Hipoteca confirmada" : "Falta hipoteca"}
</Chip>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 10,
              }}
            >
              <MiniStat
                label="Meta estimada"
                value={maxCompra ? moneyUSD(maxCompra) : "—"}
              />
              <MiniStat
                label="Cuota estimada"
                value={cuota ? moneyUSD(cuota) : "—"}
              />
            </div>

            {activationRequestedAt ? (
              <div
                style={{
                  marginTop: 12,
                  fontSize: 12.5,
                  lineHeight: 1.4,
                  color: "rgba(148,163,184,0.92)",
                }}
              >
                Caso recibido: {new Date(activationRequestedAt).toLocaleString()}
              </div>
            ) : null}
          </InfoCard>

          <InfoCard title="Qué pasa ahora" subtitle={caseDef.nextActorText}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
              <Chip tone={caseDef.statusTone}>{caseDef.nextActorLabel}</Chip>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 10,
              }}
            >
              <ActionRow
                icon={<User size={15} />}
                title="Tu acción ahora"
                body={caseDef.userAction}
              />
              <ActionRow
                icon={<Sparkles size={15} />}
                title="Lo que hará HabitaLibre"
                body={caseDef.habitalibreAction}
              />
              <ActionRow
                icon={<Send size={15} />}
                title="Lo que sigue después"
                body={caseDef.nextExternalStep}
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <PrimaryButton onClick={() => navigate(caseDef.ctaPath)}>
                {caseDef.ctaLabel}
              </PrimaryButton>
            </div>
          </InfoCard>

          <InfoCard
            title="Estado por frente"
            subtitle="Así avanza tu caso con cada actor importante."
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 10,
              }}
            >
              <ActionRow
                icon={<Building2 size={15} />}
                title="Proyecto / promotor"
                body={caseDef.projectStatusLabel}
              />
              <ActionRow
                icon={<Landmark size={15} />}
                title="Entidad financiera"
                body={caseDef.bankStatusLabel}
              />
            </div>
          </InfoCard>

          <InfoCard
            title="Resumen de tu base"
            subtitle="Lo que hoy está sosteniendo tu caso."
          >
            <div style={{ display: "grid", gap: 12 }}>
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
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: 950,
                    color: "rgba(226,232,240,0.98)",
                    marginBottom: 8,
                  }}
                >
                  <Home size={15} />
                  Propiedad base
                </div>

                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 950,
                    color: "rgba(226,232,240,0.98)",
                  }}
                >
                  {property ? property.title : "Aún no definida"}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 13.5,
                    color: "rgba(148,163,184,0.95)",
                    lineHeight: 1.45,
                  }}
                >
                  {property
                    ? `${property.city}${
                        property.price != null ? ` · ${moneyUSD(property.price)}` : ""
                      }`
                    : "Primero debes elegir una propiedad."}
                </div>
              </div>

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
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: 950,
                    color: "rgba(226,232,240,0.98)",
                    marginBottom: 8,
                  }}
                >
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
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      fontWeight: 950,
      color: "rgba(226,232,240,0.98)",
      marginBottom: 8,
    }}
  >
    <Landmark size={15} />
    Ruta hipotecaria
  </div>

  <div
    style={{
      fontSize: 15,
      fontWeight: 950,
      color: "rgba(226,232,240,0.98)",
    }}
  >
    {selectedMortgageRoute
      ? `${selectedMortgageRoute.providerLabel} · ${selectedMortgageRoute.productLabel}`
      : "Aún no confirmada"}
  </div>

  <div
    style={{
      marginTop: 6,
      fontSize: 13.5,
      color: "rgba(148,163,184,0.95)",
      lineHeight: 1.45,
    }}
  >
    {selectedMortgageRoute
      ? `${
          selectedMortgageRoute.cuota != null
            ? `Cuota aprox. ${moneyUSD(selectedMortgageRoute.cuota)}`
            : "Cuota pendiente"
        }${
          selectedMortgageRoute.annualRate != null
            ? ` · Tasa ${
                Number(selectedMortgageRoute.annualRate) <= 1
                  ? (Number(selectedMortgageRoute.annualRate) * 100).toFixed(2)
                  : Number(selectedMortgageRoute.annualRate).toFixed(2)
              }%`
            : ""
        }`
      : "Primero confirma la ruta hipotecaria con la que quieres avanzar."}
  </div>
</div>

                  <FileText size={15} />
                  Preparación documental
                </div>

                <div style={{ marginBottom: 10 }}>
                  <ProgressBar value={docsProgress} />
                </div>

                <div
                  style={{
                    fontSize: 13.5,
                    color: "rgba(148,163,184,0.95)",
                    lineHeight: 1.45,
                  }}
                >
                  Tienes {docsDone} de {docsTotal} ítems marcados en tu checklist.
                </div>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Timeline del caso" subtitle="Esto es lo que ya quedó resuelto.">
            <div style={{ display: "grid", gap: 10 }}>
              <TimelineItem
                title="Precalificación completada"
                body="Tu perfil financiero ya fue analizado."
                done
              />
              <TimelineItem
                title="Propiedad base"
                body={
                  hasChosenProperty
                    ? "Ya tienes una propiedad base para guiar el proceso."
                    : "Todavía falta definir una propiedad base."
                }
                done={hasChosenProperty}
              />

            <TimelineItem
  title="Ruta hipotecaria confirmada"
  body={
    hasConfirmedMortgageRoute
      ? "Ya confirmaste una ruta hipotecaria base para tu caso."
      : "Todavía falta confirmar la ruta hipotecaria con la que quieres avanzar."
  }
  done={hasConfirmedMortgageRoute}
/>
              <TimelineItem
                title="Preparación documental"
                body={
                  docsReady
                    ? "Ya tienes una base documental útil para avanzar."
                    : "Todavía conviene completar tu checklist."
                }
                done={docsReady}
              />
              <TimelineItem
                title="Caso recibido por HabitaLibre"
                body={
                  activationRequestedAt
                    ? "Tu caso ya fue recibido por HabitaLibre."
                    : "Todavía no has enviado tu caso a HabitaLibre."
                }
                done={Boolean(activationRequestedAt)}
              />
              <TimelineItem
                title={caseDef.timelineProjectTitle}
                body={caseDef.timelineProjectBody}
                done={projectStatus === "enviado"}
              />
              <TimelineItem
                title={caseDef.timelineBankTitle}
                body={caseDef.timelineBankBody}
                done={bankStatus === "enviado"}
              />
            </div>
          </InfoCard>

          <InfoCard
            title="Qué puedes hacer desde aquí"
            subtitle="Accesos rápidos según tu situación actual."
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 10,
              }}
            >
              {property ? (
                <PrimaryButton onClick={() => navigate(`/property/${property.id}`)}>
                  Ver propiedad elegida
                </PrimaryButton>
              ) : (
                <PrimaryButton onClick={() => navigate("/match")}>
                  Elegir propiedad
                </PrimaryButton>
              )}

              <SecondaryButton onClick={() => navigate("/checklist-documentos")}>
                Ver checklist
              </SecondaryButton>

              <SecondaryButton onClick={() => navigate("/ruta")}>
                Volver a mi ruta
              </SecondaryButton>
            </div>
          </InfoCard>
        </div>
      </div>
    </HabitaShell>
  );
}