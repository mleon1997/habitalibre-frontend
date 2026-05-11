// src/pages/Perfil.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Home,
  Calculator,
  Building2,
  Map,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import HabitaShell from "../components/HabitaShell.jsx";
import {
  Card,
  InnerCard,
  Chip,
  PrimaryButton,
  SecondaryButton,
} from "../ui/kit.jsx";
import { moneyUSD } from "../lib/money";
import { getCustomer } from "../lib/customerSession.js";

const LS_CUSTOMER_TOKEN = "hl_customer_token";
const LS_CUSTOMER_DATA = "hl_customer_data";
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
    const customer = getCustomer?.() || safeParseLS(LS_CUSTOMER_DATA) || {};
    const email = String(customer?.email || customer?.correo || "")
      .trim()
      .toLowerCase();
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

function getName(customer) {
  const raw =
    customer?.nombre ||
    customer?.name ||
    customer?.fullName ||
    customer?.firstName ||
    "";

  if (raw) return String(raw).trim();

  const email = customer?.email || customer?.correo || "";
  if (email) return String(email).split("@")[0];

  return "Usuario HabitaLibre";
}

function getEmail(customer) {
  return customer?.email || customer?.correo || customer?.mail || "—";
}

function hasEvaluation(snapshot) {
  if (!snapshot) return false;

  return Boolean(
    snapshot?.bestMortgage ||
      snapshot?.output?.bestMortgage ||
      snapshot?.financialCapacity ||
      snapshot?.output?.financialCapacity ||
      snapshot?.precioMaxVivienda ||
      snapshot?.output?.precioMaxVivienda ||
      snapshot?.matchedProperties?.length ||
      snapshot?.output?.matchedProperties?.length
  );
}

function getCapacity(snapshot) {
  return (
    toNum(snapshot?.financialCapacity?.estimatedMaxPropertyValue) ??
    toNum(snapshot?.output?.financialCapacity?.estimatedMaxPropertyValue) ??
    toNum(snapshot?.bestMortgage?.precioMaxVivienda) ??
    toNum(snapshot?.output?.bestMortgage?.precioMaxVivienda) ??
    toNum(snapshot?.precioMaxVivienda) ??
    toNum(snapshot?.output?.precioMaxVivienda) ??
    toNum(snapshot?.montoMaximo) ??
    null
  );
}

function getPayment(snapshot) {
  return (
    toNum(snapshot?.financialCapacity?.estimatedMonthlyPayment) ??
    toNum(snapshot?.output?.financialCapacity?.estimatedMonthlyPayment) ??
    toNum(snapshot?.bestMortgage?.cuota) ??
    toNum(snapshot?.output?.bestMortgage?.cuota) ??
    toNum(snapshot?.cuotaEstimada) ??
    toNum(snapshot?.output?.cuotaEstimada) ??
    null
  );
}

function getProgram(snapshot, selectedRoute) {
  const raw =
    selectedRoute?.productLabel ||
    selectedRoute?.tipoProducto ||
    snapshot?.productoSugerido ||
    snapshot?.output?.productoSugerido ||
    snapshot?.bestMortgage?.segment ||
    snapshot?.output?.bestMortgage?.segment ||
    snapshot?.bestMortgage?.mortgageId ||
    "Ruta por definir";

  const value = String(raw || "").toUpperCase();

  if (value === "VIS") return "VIS";
  if (value === "VIP") return "VIP";
  if (value.includes("BIESS")) return "BIESS";
  if (value.includes("PRIVATE")) return "Banca privada";

  return raw;
}

function getSelectedPropertyName(property) {
  return (
    property?.titulo ||
    property?.nombre ||
    property?.proyecto ||
    property?.title ||
    property?.name ||
    null
  );
}

function SettingRow({ icon, title, subtitle, action, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        border: "1px solid rgba(148,163,184,0.14)",
        background: danger ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.04)",
        color: "inherit",
        borderRadius: 18,
        padding: 14,
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 14,
            display: "grid",
            placeItems: "center",
            background: danger
              ? "rgba(239,68,68,0.12)"
              : "rgba(45,212,191,0.10)",
            color: danger ? "rgba(254,202,202,0.95)" : "#25d3a6",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 950,
              color: danger
                ? "rgba(254,202,202,0.96)"
                : "rgba(226,232,240,0.98)",
            }}
          >
            {title}
          </div>

          {subtitle ? (
            <div
              style={{
                marginTop: 4,
                fontSize: 12,
                lineHeight: 1.35,
                color: "rgba(148,163,184,0.92)",
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        {action ? <Chip tone={danger ? "bad" : "neutral"}>{action}</Chip> : null}
      </div>
    </button>
  );
}

export default function Perfil() {
  const navigate = useNavigate();

  const customer = useMemo(() => {
    return getCustomer?.() || safeParseLS(LS_CUSTOMER_DATA) || {};
  }, []);

  const snapshot = useMemo(() => loadOwnedData(LS_SNAPSHOT), []);
  const journey = useMemo(() => loadOwnedData(LS_JOURNEY), []);
  const selectedProperty = useMemo(() => loadOwnedData(LS_SELECTED_PROPERTY), []);
  const selectedRoute = useMemo(
    () => loadOwnedData(LS_SELECTED_MORTGAGE_ROUTE),
    []
  );
  const docsChecklist = useMemo(() => loadOwnedData(LS_DOCS_CHECKLIST) || {}, []);

  const name = getName(customer);
  const email = getEmail(customer);

  const evaluationReady = hasEvaluation(snapshot);
  const capacity = getCapacity(snapshot);
  const payment = getPayment(snapshot);
  const program = getProgram(snapshot, selectedRoute);
  const propertyName = getSelectedPropertyName(selectedProperty);

  const docsDone = Object.values(docsChecklist).filter(Boolean).length;
  const docsTotal = 10;

  function goJourney() {
    navigate("/app?mode=journey&afinando=1&force=1");
  }

  function goHome() {
    navigate("/progreso");
  }

  function goMatch() {
    navigate("/match");
  }

  function goRuta() {
    navigate("/ruta");
  }

  function clearScenario() {
    const ok = window.confirm(
      "¿Seguro que quieres borrar tu resultado local? Podrás volver a calcularlo cuando quieras."
    );

    if (!ok) return;

    try {
      localStorage.removeItem(LS_SNAPSHOT);
      localStorage.removeItem(LS_JOURNEY);
      localStorage.removeItem(LS_SELECTED_PROPERTY);
      localStorage.removeItem(LS_SELECTED_MORTGAGE_ROUTE);
      localStorage.removeItem(LS_DOCS_CHECKLIST);
    } catch {}

    navigate("/progreso", { replace: true });
  }

  function logout() {
    try {
      localStorage.removeItem(LS_CUSTOMER_TOKEN);
      localStorage.removeItem(LS_CUSTOMER_DATA);
      localStorage.removeItem(LS_SNAPSHOT);
      localStorage.removeItem(LS_JOURNEY);
      localStorage.removeItem(LS_SELECTED_PROPERTY);
      localStorage.removeItem(LS_SELECTED_MORTGAGE_ROUTE);
    } catch {}

    navigate("/login", { replace: true });
  }

  return (
    <HabitaShell maxWidth={760}>
      <div style={{ paddingBottom: 24 }}>
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 14,
            }}
          >
            <div>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 24,
                  background:
                    "linear-gradient(180deg, rgba(45,212,191,0.18), rgba(45,212,191,0.08))",
                  border: "1px solid rgba(45,212,191,0.24)",
                  display: "grid",
                  placeItems: "center",
                  color: "#25d3a6",
                  fontSize: 24,
                  fontWeight: 980,
                }}
              >
                {String(name || "H").slice(0, 1).toUpperCase()}
              </div>

              <div
                style={{
                  marginTop: 14,
                  fontSize: 30,
                  fontWeight: 980,
                  letterSpacing: -1,
                  lineHeight: 1.05,
                }}
              >
                {name}
              </div>

              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  color: "rgba(148,163,184,0.95)",
                  fontSize: 13,
                }}
              >
                <Mail size={14} />
                {email}
              </div>
            </div>

            <Chip tone={evaluationReady ? "good" : "neutral"}>
              {evaluationReady ? "Evaluación lista" : "Pendiente"}
            </Chip>
          </div>
        </Card>

        <Card style={{ marginTop: 18 }}>
          <div
            style={{
              fontSize: 13,
              color: "rgba(148,163,184,0.95)",
              fontWeight: 900,
            }}
          >
            Tu resumen HabitaLibre
          </div>

          <div
            style={{
              marginTop: 12,
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 10,
            }}
          >
            <InnerCard>
              <div style={{ fontSize: 12, color: "rgba(148,163,184,0.92)" }}>
                Capacidad
              </div>
              <div style={{ marginTop: 6, fontSize: 19, fontWeight: 950 }}>
                {moneySafe(capacity)}
              </div>
            </InnerCard>

            <InnerCard>
              <div style={{ fontSize: 12, color: "rgba(148,163,184,0.92)" }}>
                Cuota
              </div>
              <div style={{ marginTop: 6, fontSize: 19, fontWeight: 950 }}>
                {moneySafe(payment)}
              </div>
            </InnerCard>

            <InnerCard>
              <div style={{ fontSize: 12, color: "rgba(148,163,184,0.92)" }}>
                Ruta
              </div>
              <div style={{ marginTop: 6, fontSize: 16, fontWeight: 950 }}>
                {program}
              </div>
            </InnerCard>

            <InnerCard>
              <div style={{ fontSize: 12, color: "rgba(148,163,184,0.92)" }}>
                Documentos
              </div>
              <div style={{ marginTop: 6, fontSize: 16, fontWeight: 950 }}>
                {docsDone}/{docsTotal}
              </div>
            </InnerCard>
          </div>

          {propertyName ? (
            <InnerCard
              style={{
                marginTop: 12,
                background: "rgba(45,212,191,0.08)",
                border: "1px solid rgba(45,212,191,0.18)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(148,163,184,0.92)",
                  fontWeight: 900,
                }}
              >
                Propiedad elegida
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 15,
                  fontWeight: 950,
                  color: "rgba(226,232,240,0.96)",
                }}
              >
                {propertyName}
              </div>
            </InnerCard>
          ) : null}
        </Card>

        <Card style={{ marginTop: 18 }}>
          <div
            style={{
              fontSize: 13,
              color: "rgba(148,163,184,0.95)",
              fontWeight: 900,
            }}
          >
            Acciones rápidas
          </div>

          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            <SettingRow
              icon={<Home size={18} />}
              title="Volver a Home"
              subtitle="Revisar tu resumen principal."
              action="Abrir"
              onClick={goHome}
            />

            <SettingRow
              icon={<Calculator size={18} />}
              title="Afinar mi evaluación"
              subtitle="Actualizar ingresos, entrada, deudas o vivienda objetivo."
              action="Editar"
              onClick={goJourney}
            />

            <SettingRow
              icon={<Building2 size={18} />}
              title="Ir a Match"
              subtitle="Ver propiedades e hipotecas alineadas con tu perfil."
              action="Ver"
              onClick={goMatch}
            />

            <SettingRow
              icon={<Map size={18} />}
              title="Ver mi Ruta"
              subtitle="Seguir tus pasos hacia una compra real."
              action="Ruta"
              onClick={goRuta}
            />
          </div>
        </Card>

        <Card style={{ marginTop: 18 }}>
          <div
            style={{
              fontSize: 13,
              color: "rgba(148,163,184,0.95)",
              fontWeight: 900,
            }}
          >
            Cuenta y datos
          </div>

          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            <SettingRow
              icon={<ShieldCheck size={18} />}
              title="Sesión activa"
              subtitle="Tu progreso se guarda asociado a esta cuenta."
              action="OK"
              onClick={() => {}}
            />

            <SettingRow
              icon={<RefreshCw size={18} />}
              title="Recalcular resultado"
              subtitle="Volver al Journey para actualizar tu capacidad."
              action="Recalcular"
              onClick={goJourney}
            />

            <SettingRow
              icon={<Trash2 size={18} />}
              title="Borrar resultado local"
              subtitle="Elimina los datos guardados en este navegador."
              action="Borrar"
              danger
              onClick={clearScenario}
            />

            <SettingRow
              icon={<LogOut size={18} />}
              title="Cerrar sesión"
              subtitle="Salir de tu cuenta HabitaLibre."
              action="Salir"
              danger
              onClick={logout}
            />
          </div>
        </Card>

        <div
          style={{
            marginTop: 16,
            textAlign: "center",
            fontSize: 11,
            color: "rgba(148,163,184,0.72)",
            lineHeight: 1.4,
          }}
        >
          HabitaLibre te ayuda a entender tu ruta, pero no reemplaza la
          aprobación final de una entidad financiera.
        </div>
      </div>
    </HabitaShell>
  );
}