// src/pages/PropertyDetail.jsx
import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Home,
  Image as ImageIcon,
  Info,
  Landmark,
  MapPin,
} from "lucide-react";

import HabitaShell from "../components/HabitaShell.jsx";
import { moneyUSD } from "../lib/money";
import mockProperties from "../data/mockProperties.js";
import { getCustomer } from "../lib/customerSession.js";

const LS_SNAPSHOT = "hl_mobile_last_snapshot_v1";
const LS_JOURNEY = "hl_mobile_journey_v1";
const LS_SELECTED_PROPERTY = "hl_selected_property_v1";

/* ---------------- storage ---------------- */

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

  try {
    window.dispatchEvent(new Event("hl:user-app-state-hydrated"));
    window.dispatchEvent(new Event("hl:selected-property-updated"));
  } catch {
    // no-op
  }
}

/* ---------------- helpers ---------------- */

function pick(snapshot, keys) {
  if (!snapshot) return null;

  for (const k of keys) {
    if (snapshot?.[k] != null) return snapshot[k];
    if (snapshot?.output?.[k] != null) return snapshot.output[k];
  }

  return null;
}

function n(v, def = 0) {
  const x = Number(v);
  return Number.isFinite(x) ? x : def;
}

function maybeNum(v) {
  if (v == null || v === "") return null;
  const x = Number(v);
  return Number.isFinite(x) ? x : null;
}

function positiveNum(v) {
  const x = maybeNum(v);
  return x != null && x > 0 ? x : null;
}

function formatMoney(v) {
  const x = Number(v);
  return Number.isFinite(x) ? moneyUSD(x) : "—";
}

function formatPct(v, digits = 1) {
  const x = Number(v);
  if (!Number.isFinite(x)) return "—";
  return `${x.toFixed(digits)}%`;
}

function formatMonthly(v) {
  const x = Number(v);
  return Number.isFinite(x) ? `${moneyUSD(x)}/mes` : "—";
}

function formatMatchReason(reason) {
  const map = {
    precio: "Precio",
    entrada: "Entrada",
    precio_entrada: "Precio + entrada",
    cuota: "Cuota",
    programa: "Programa",
  };

  return map[reason] || reason || "Precio";
}

function formatEstadoCompra(estado) {
  const map = {
    top_match: "Top match",
    entrada_viable_hipoteca_futura_viable:
      "Entrada viable + hipoteca futura viable",
    entrada_viable_hipoteca_futura_debil:
      "Entrada viable, hipoteca por fortalecer",
    entrada_no_viable: "Entrada no viable",
    ruta_cercana: "Ruta cercana",
    fuera_de_reglas: "Fuera de reglas",
  };

  return map[estado] || "Pendiente de análisis";
}

function getSelectedPropertyStatusFromProperty(property) {
  if (!property) return null;

  const estado = String(property?.estadoCompra || "");

  if (
    property?.evaluacionHipotecaHoy?.viable === true ||
    property?.evaluacionHipoteca?.viable === true ||
    estado === "top_match"
  ) {
    return "selected_viable_now";
  }

  if (
    property?.evaluacionHipotecaFutura?.viable === true ||
    estado === "entrada_viable_hipoteca_futura_viable"
  ) {
    return "selected_future_viable";
  }

  if (
    estado === "entrada_viable_hipoteca_futura_debil" ||
    estado === "ruta_cercana"
  ) {
    return "selected_near_route";
  }

  return "selected_no_longer_viable";
}

function asArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

function imageUrlFromAny(item) {
  if (!item) return null;
  if (typeof item === "string") return item;

  return (
    item?.url ||
    item?.src ||
    item?.image ||
    item?.imagen ||
    item?.imageUrl ||
    item?.foto ||
    item?.cover ||
    null
  );
}

function uniqueList(list) {
  return [...new Set(list.filter(Boolean).map((v) => String(v).trim()))].filter(
    Boolean
  );
}

function collectPropertyImages(property) {
  const candidates = [
    property?.imagen,
    property?.image,
    property?.imageUrl,
    property?.foto,
    property?.cover,
    property?._normalizedImage,
    ...asArray(property?.imagenes),
    ...asArray(property?.images),
    ...asArray(property?.galeria),
    ...asArray(property?.gallery),
    ...asArray(property?.renders),
    ...asArray(property?.fotos),
    ...asArray(property?.planos),
  ]
    .map(imageUrlFromAny)
    .filter(Boolean);

  return uniqueList(candidates);
}

function getPropertyPrice(property = {}) {
  return (
    positiveNum(property?.precio) ??
    positiveNum(property?.price) ??
    positiveNum(property?.valor) ??
    positiveNum(property?.listPrice) ??
    positiveNum(property?.propertyPrice) ??
    positiveNum(property?._normalizedPrice) ??
    null
  );
}

function getPropertyId(property = {}, fallbackId = null) {
  return (
    property?.id ||
    property?._id ||
    property?.propertyId ||
    property?._normalizedId ||
    property?.slug ||
    fallbackId ||
    null
  );
}

function getPropertyTitle(property = {}) {
  return (
    property?.titulo ||
    property?.nombre ||
    property?.title ||
    property?.name ||
    property?.unidad ||
    property?.unitName ||
    "Propiedad"
  );
}

function getPropertyLocation(property = {}) {
  return (
    property?.sector ||
    property?.zona ||
    property?.ciudadZona ||
    property?.ciudad ||
    property?.city ||
    property?._normalizedCity ||
    ""
  );
}

function getProjectName(property = {}) {
  return (
    property?.proyecto ||
    property?.projectName ||
    property?._normalizedProjectName ||
    property?.nombreProyecto ||
    property?.raw?.proyecto ||
    ""
  );
}

function getDeveloperName(property = {}) {
  return (
    property?.promotor ||
    property?.developerName ||
    property?.developer ||
    property?.constructor ||
    property?.constructora ||
    property?.raw?.promotor ||
    ""
  );
}

function getPropertyType(property = {}) {
  return (
    property?.tipo ||
    property?.tipoVivienda ||
    property?.propertyType ||
    property?.type ||
    ""
  );
}

function getPropertyStatusLabel(property = {}) {
  if (property?.estadoProyecto) return property.estadoProyecto;
  if (property?.estado) return property.estado;
  if (property?.statusComercial) return property.statusComercial;
  if (property?.proyectoNuevo === true) return "Proyecto nuevo";
  if (property?.proyectoNuevo === false) return "Entrega inmediata";
  return "";
}

function getDescription(property = {}) {
  return (
    property?.descripcion ||
    property?.description ||
    property?.descripcionComercial ||
    property?.resumen ||
    property?.detalle ||
    ""
  );
}

function getAmenities(property = {}) {
  const explicit = [
    ...asArray(property?.amenidades),
    ...asArray(property?.amenities),
    ...asArray(property?.features),
    ...asArray(property?.caracteristicas),
    ...asArray(property?.servicios),
    ...asArray(property?.beneficios),
  ]
    .map((x) => (typeof x === "string" ? x : x?.name || x?.label || x?.title))
    .filter(Boolean);

  return uniqueList(explicit).slice(0, 12);
}

function getMainImage(property) {
  const imgs = collectPropertyImages(property);
  return imgs[0] || null;
}

function getGalleryImages(property) {
  return collectPropertyImages(property).slice(0, 4);
}

function getAvailableEntry({ snapshot, journey, property }) {
  return (
    positiveNum(property?.entradaDisponible) ??
    positiveNum(property?.availableEntry) ??
    positiveNum(property?.entradaRegistrada) ??
    positiveNum(property?.entrada) ??
    positiveNum(property?.downPayment) ??
    positiveNum(property?.downPaymentAmount) ??
    positiveNum(property?.selectedMatchPayload?.entradaDisponible) ??
    positiveNum(property?.match?.entradaDisponible) ??
    positiveNum(journey?.entradaDisponible) ??
    positiveNum(journey?.entrada) ??
    positiveNum(journey?.ahorroDisponible) ??
    positiveNum(journey?.ahorro) ??
    positiveNum(journey?.montoEntrada) ??
    positiveNum(journey?.input?.entradaDisponible) ??
    positiveNum(journey?.input?.entrada) ??
    positiveNum(journey?.input?.ahorroDisponible) ??
    positiveNum(journey?.input?.ahorro) ??
    positiveNum(journey?.input?.montoEntrada) ??
    positiveNum(journey?.form?.entradaDisponible) ??
    positiveNum(journey?.form?.entrada) ??
    positiveNum(journey?.form?.ahorroDisponible) ??
    positiveNum(snapshot?.entradaDisponible) ??
    positiveNum(snapshot?.entrada) ??
    positiveNum(snapshot?.ahorroDisponible) ??
    positiveNum(snapshot?.ahorro) ??
    positiveNum(snapshot?.montoEntrada) ??
    positiveNum(snapshot?.input?.entradaDisponible) ??
    positiveNum(snapshot?.input?.entrada) ??
    positiveNum(snapshot?.input?.ahorroDisponible) ??
    positiveNum(snapshot?.input?.ahorro) ??
    positiveNum(snapshot?.input?.montoEntrada) ??
    positiveNum(snapshot?.perfilInput?.entradaDisponible) ??
    positiveNum(snapshot?.perfilInput?.entrada) ??
    positiveNum(snapshot?.perfilInput?.ahorroDisponible) ??
    positiveNum(snapshot?.perfilInput?.ahorro) ??
    positiveNum(snapshot?.perfilInput?.montoEntrada) ??
    positiveNum(snapshot?.__entrada?.entradaDisponible) ??
    positiveNum(snapshot?.__entrada?.entrada) ??
    positiveNum(snapshot?.__entrada?.ahorroDisponible) ??
    positiveNum(snapshot?.output?.entradaDisponible) ??
    positiveNum(snapshot?.output?.entrada) ??
    positiveNum(snapshot?.output?.ahorroDisponible) ??
    positiveNum(snapshot?.output?.input?.entradaDisponible) ??
    positiveNum(snapshot?.output?.perfilInput?.entradaDisponible) ??
    positiveNum(snapshot?.inputNormalizado?.entradaDisponible) ??
    positiveNum(snapshot?.output?.inputNormalizado?.entradaDisponible) ??
    null
  );
}

/* ---------------- UI ---------------- */

const UI = {
  card: "rgba(15,23,42,0.72)",
  cardStrong: "rgba(8,15,32,0.88)",
  cardSoft: "rgba(255,255,255,0.055)",
  border: "rgba(255,255,255,0.10)",
  borderSoft: "rgba(255,255,255,0.08)",
  textDim: "rgba(226,232,240,0.72)",
  textMuted: "rgba(148,163,184,0.95)",
  green: "#25d3a6",
  greenBg: "rgba(37,211,166,0.10)",
  greenBorder: "rgba(37,211,166,0.26)",
  amberBg: "rgba(251,191,36,0.10)",
  amberBorder: "rgba(251,191,36,0.26)",
  redBg: "rgba(239,68,68,0.10)",
  redBorder: "rgba(239,68,68,0.24)",
  shadow: "0 18px 60px rgba(0,0,0,0.30)",
  shadowSoft: "0 12px 34px rgba(0,0,0,0.22)",
};

function Pill({ children, tone = "neutral", style }) {
  let bg = "rgba(255,255,255,0.08)";
  let br = "rgba(255,255,255,0.10)";
  let color = "rgba(226,232,240,0.96)";

  if (tone === "green") {
    bg = "rgba(37,211,166,0.14)";
    br = "rgba(37,211,166,0.28)";
    color = "rgba(204,251,241,0.98)";
  }

  if (tone === "amber") {
    bg = "rgba(251,191,36,0.14)";
    br = "rgba(251,191,36,0.28)";
    color = "rgba(254,243,199,0.98)";
  }

  if (tone === "red") {
    bg = "rgba(239,68,68,0.14)";
    br = "rgba(239,68,68,0.28)";
    color = "rgba(254,202,202,0.98)";
  }

  return (
    <span
      style={{
        fontSize: 12,
        padding: "8px 12px",
        borderRadius: 999,
        background: bg,
        border: `1px solid ${br}`,
        color,
        fontWeight: 900,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        lineHeight: 1,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

function PrimaryButton({ children, onClick, style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        padding: 16,
        borderRadius: 18,
        border: "none",
        background:
          "linear-gradient(135deg, rgba(125,245,222,1), rgba(37,211,166,1))",
        color: "#052019",
        fontWeight: 950,
        cursor: "pointer",
        fontSize: 15,
        boxShadow: "0 18px 42px rgba(37,211,166,0.18)",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick, style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        padding: 16,
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.05)",
        color: "rgba(226,232,240,0.96)",
        fontWeight: 950,
        cursor: "pointer",
        fontSize: 15,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value, accent = false }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 20,
        background: accent ? "rgba(37,211,166,0.10)" : UI.cardSoft,
        border: accent
          ? `1px solid ${UI.greenBorder}`
          : `1px solid ${UI.borderSoft}`,
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: UI.textMuted,
          fontWeight: 900,
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 22,
          fontWeight: 980,
          letterSpacing: -0.6,
          color: "rgba(226,232,240,0.98)",
          lineHeight: 1.05,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InfoCard({ title, subtitle, children, icon }) {
  return (
    <section
      style={{
        marginTop: 18,
        padding: 22,
        borderRadius: 28,
        background: UI.card,
        border: `1px solid ${UI.border}`,
        boxShadow: UI.shadowSoft,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          fontWeight: 980,
          fontSize: 22,
          letterSpacing: -0.5,
          color: "rgba(226,232,240,0.98)",
        }}
      >
        {icon ? (
          <span style={{ color: "rgba(37,211,166,0.95)", display: "flex" }}>
            {icon}
          </span>
        ) : null}
        {title}
      </div>

      {subtitle ? (
        <div
          style={{
            marginTop: 10,
            fontSize: 15,
            lineHeight: 1.45,
            color: UI.textMuted,
            maxWidth: 820,
          }}
        >
          {subtitle}
        </div>
      ) : null}

      <div style={{ marginTop: 16 }}>{children}</div>
    </section>
  );
}

function ToneBox({ tone = "neutral", children }) {
  let background = UI.cardSoft;
  let border = UI.borderSoft;

  if (tone === "green") {
    background = UI.greenBg;
    border = UI.greenBorder;
  } else if (tone === "amber") {
    background = UI.amberBg;
    border = UI.amberBorder;
  } else if (tone === "red") {
    background = UI.redBg;
    border = UI.redBorder;
  }

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 20,
        background,
        border: `1px solid ${border}`,
        fontSize: 15,
        lineHeight: 1.48,
        color: "rgba(226,232,240,0.94)",
      }}
    >
      {children}
    </div>
  );
}

function CheckTile({ children }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 20,
        background: UI.cardSoft,
        border: `1px solid ${UI.borderSoft}`,
        color: "rgba(226,232,240,0.96)",
        fontSize: 15,
        fontWeight: 900,
        lineHeight: 1.2,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <CheckCircle2
        size={19}
        style={{ color: UI.green, flexShrink: 0 }}
      />
      {children}
    </div>
  );
}

function FinancialDisclaimer() {
  return (
    <div
      style={{
        marginTop: 16,
        padding: 16,
        borderRadius: 20,
        border: "1px solid rgba(245,158,11,0.24)",
        background: "rgba(245,158,11,0.08)",
        color: "rgba(254,243,199,0.96)",
        fontSize: 14,
        lineHeight: 1.45,
      }}
    >
      <strong>Estimación referencial.</strong> HabitaLibre no otorga ni aprueba
      créditos. Las condiciones finales dependen de cada entidad financiera.
    </div>
  );
}

function NotFound({ onBack }) {
  return (
    <HabitaShell maxWidth={760}>
      <div style={{ paddingBottom: 32 }}>
        <InfoCard
          title="No encontramos esta propiedad"
          subtitle="Puede que el id no exista o que todavía no esté cargada en tu inventario."
        >
          <PrimaryButton onClick={onBack}>Volver a propiedades</PrimaryButton>
        </InfoCard>
      </div>
    </HabitaShell>
  );
}

/* ---------------- page ---------------- */

export default function PropertyDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const snapshot = useMemo(() => loadOwnedData(LS_SNAPSHOT), []);
  const journey = useMemo(() => loadOwnedData(LS_JOURNEY), []);

  const matchedProperties =
    pick(snapshot, ["matchedProperties"]) ||
    snapshot?.plan?.routeSignals?.matchedProperties ||
    snapshot?.routeSignals?.matchedProperties ||
    snapshot?.output?.routeSignals?.matchedProperties ||
    journey?.match?.propiedades ||
    journey?.match?.items ||
    pick(snapshot, ["propiedades"]) ||
    [];

  const propertyFromSnapshot = useMemo(() => {
    if (!Array.isArray(matchedProperties)) return null;

    return (
      matchedProperties.find((p) => {
        const candidateId =
          p?.id || p?._id || p?.propertyId || p?._normalizedId || null;

        return String(candidateId) === String(id);
      }) || null
    );
  }, [matchedProperties, id]);

  const propertyFromMock = useMemo(
    () => mockProperties.find((p) => String(p.id) === String(id)) || null,
    [id]
  );

  const property = propertyFromSnapshot || propertyFromMock;

  if (!property) {
    return <NotFound onBack={() => navigate("/match")} />;
  }

  const propertyId = getPropertyId(property, id);
  const precio = getPropertyPrice(property) ?? n(property?.precio);
  const heroTitle = getPropertyTitle(property);
  const heroLocation = getPropertyLocation(property);
  const projectName = getProjectName(property);
  const developerName = getDeveloperName(property);
  const propertyType = getPropertyType(property);
  const estadoProyecto = getPropertyStatusLabel(property);
  const descripcionReal = getDescription(property);
  const mainImage = getMainImage(property);
  const galleryImages = getGalleryImages(property);
  const amenities = getAmenities(property);

  const entradaDisponible = getAvailableEntry({
    snapshot,
    journey,
    property,
  });

  const precioMaxViviendaRaw =
    pick(snapshot, ["precioMaxVivienda"]) ??
    pick(snapshot, ["precioMaxPerfil"]) ??
    pick(snapshot, ["precioMax"]) ??
    snapshot?.financialCapacity?.estimatedMaxPropertyValue ??
    snapshot?.output?.financialCapacity?.estimatedMaxPropertyValue ??
    snapshot?.homeRecommendation
      ?.profileProgramsThatCouldWorkIfRangeAdjusted?.[0]?.priceMax ??
    property?.evaluacionHipotecaHoy?.precioMaxVivienda ??
    property?.evaluacionHipotecaFutura?.precioMaxVivienda ??
    null;

  const precioMaxVivienda = maybeNum(precioMaxViviendaRaw);

  const evaluacionEntrada = property?.evaluacionEntrada || null;
  const evaluacionHipotecaHoy =
    property?.evaluacionHipotecaHoy || property?.evaluacionHipoteca || null;
  const evaluacionHipotecaFutura = property?.evaluacionHipotecaFutura || null;
  const estadoCompra = property?.estadoCompra || null;

  const entradaRequerida =
    positiveNum(property?.entradaRequerida) ??
    positiveNum(property?.entradaMinima) ??
    positiveNum(evaluacionEntrada?.entradaRequerida) ??
    (precio ? Math.round(precio * 0.1) : null);

  const faltanteEntrada =
    maybeNum(evaluacionEntrada?.faltanteEntrada) ??
    (entradaRequerida != null && entradaDisponible != null
      ? Math.max(0, entradaRequerida - entradaDisponible)
      : null);

  const cuotaEntradaMensual =
    maybeNum(evaluacionEntrada?.cuotaEntradaMensual) ??
    maybeNum(property?.cuotaEntradaMensual) ??
    null;

  const mesesConstruccion =
    maybeNum(evaluacionEntrada?.mesesConstruccionRestantes) ??
    maybeNum(property?.mesesConstruccionRestantes) ??
    maybeNum(property?.mesesConstruccion) ??
    null;

  const entradaPct =
    entradaDisponible != null && precio > 0
      ? (entradaDisponible / precio) * 100
      : null;

  const saldoAFinanciar =
    precio && entradaRequerida != null
      ? Math.max(0, precio - entradaRequerida)
      : null;

  const cuotaReferencial =
    positiveNum(property?.cuotaEstimada) ??
    positiveNum(property?.cuota) ??
    positiveNum(evaluacionHipotecaHoy?.cuotaReferencia) ??
    positiveNum(evaluacionHipotecaFutura?.cuotaReferencia) ??
    positiveNum(snapshot?.cuotaEstimada) ??
    positiveNum(snapshot?.cuotaMensual) ??
    positiveNum(snapshot?.bestMortgage?.cuota) ??
    positiveNum(snapshot?.output?.cuotaEstimada) ??
    null;

  const calzaPrecio =
    precioMaxVivienda != null && precio > 0 ? precio <= precioMaxVivienda : null;

  const hasPrecioMax = precioMaxVivienda != null && precioMaxVivienda > 0;
  const hasEntradaDisponible = entradaDisponible != null;
  const hasEvaluacionEntrada = !!evaluacionEntrada;
  const hasHipotecaData = !!evaluacionHipotecaHoy || !!evaluacionHipotecaFutura;

  const hasAnalisisCompletoMinimo =
    hasPrecioMax &&
    hasEntradaDisponible &&
    (hasEvaluacionEntrada || hasHipotecaData);

  let toneEstado = "amber";

  if (hasAnalisisCompletoMinimo) {
    toneEstado =
      estadoCompra === "top_match" ||
      estadoCompra === "entrada_viable_hipoteca_futura_viable"
        ? "green"
        : estadoCompra === "entrada_viable_hipoteca_futura_debil" ||
          estadoCompra === "ruta_cercana"
        ? "amber"
        : "red";
  }

  const mainBadgeLabel = hasAnalisisCompletoMinimo
    ? property?.matchBadgeCalculado ||
      property?.matchBadge ||
      formatEstadoCompra(estadoCompra)
    : property?.matchBadge || "Pendiente de análisis";

  const lecturaTitle = hasAnalisisCompletoMinimo
    ? formatEstadoCompra(estadoCompra)
    : property?.matchBadge || "Lectura referencial";

  const lecturaBody =
    property?.matchReasonCalculado ||
    (calzaPrecio === true
      ? "Esta propiedad se alinea con tu perfil y tu ruta estimada."
      : calzaPrecio === false
      ? "Esta propiedad puede servir como referencia, pero requiere revisar el encaje financiero."
      : "Esta propiedad puede servir como referencia para revisar tu camino de compra.");

  const projectInfoItems = [
    projectName ? { label: "Proyecto", value: projectName } : null,
    propertyType ? { label: "Tipo", value: propertyType } : null,
    estadoProyecto ? { label: "Estado", value: estadoProyecto } : null,
    developerName ? { label: "Promotor", value: developerName } : null,
  ].filter(Boolean);

  function buildNormalizedProperty() {
    const propertyTitle =
      property?.titulo ||
      property?.nombre ||
      property?.title ||
      property?.name ||
      property?.proyecto ||
      property?._normalizedProjectName ||
      "Propiedad elegida";

    const propertyCity =
      property?.ciudad ||
      property?.city ||
      property?.zona ||
      property?.ciudadZona ||
      property?.sector ||
      property?._normalizedCity ||
      journey?.form?.ciudadCompra ||
      journey?.ciudadCompra ||
      "Ubicación pendiente";

    const propertyPrice = Number.isFinite(Number(precio))
      ? Number(precio)
      : null;

    const propertyImage =
      property?.imagen ||
      property?.image ||
      property?.imageUrl ||
      property?.foto ||
      property?.cover ||
      property?._normalizedImage ||
      null;

    const computedSelectedStatus =
      getSelectedPropertyStatusFromProperty(property);

    return {
      id: propertyId,
      _id: propertyId,
      propertyId,

      titulo: propertyTitle,
      nombre: propertyTitle,
      proyecto: property?.proyecto || property?._normalizedProjectName || "",

      ciudad: propertyCity,
      zona: propertyCity,
      sector: property?.sector || propertyCity,
      ciudadZona: property?.ciudadZona || propertyCity,

      precio: propertyPrice,
      price: propertyPrice,

      imagen: propertyImage,
      image: propertyImage,

      cuotaEstimada: cuotaReferencial,

      entradaMinima:
        property?.entradaMinima ??
        property?.entradaRequerida ??
        property?.evaluacionEntrada?.entradaRequerida ??
        entradaRequerida ??
        null,

      descripcion: descripcionReal || "",

      status: computedSelectedStatus,
      source: "property_detail",
      selectedAt: new Date().toISOString(),

      raw: property,
    };
  }

  function handleSelectProperty(nextPath = "/financiamiento-propiedad") {
    const normalizedProperty = buildNormalizedProperty();
    const computedSelectedStatus = normalizedProperty.status;

    saveOwnedData(LS_SELECTED_PROPERTY, normalizedProperty);

    saveOwnedData(LS_JOURNEY, {
      ...(journey || {}),
      matchExplorado: true,
      propiedadElegida: true,
      propiedadId,
      propiedadSeleccionada: normalizedProperty,
      selectedPropertyStatus: computedSelectedStatus,
    });

    navigate(nextPath);
  }

  return (
    <HabitaShell maxWidth={980}>
      <div style={{ paddingBottom: 36 }}>
        <div
          style={{
            position: "relative",
            minHeight: 360,
            width: "100%",
            borderRadius: 32,
            overflow: "hidden",
            border: `1px solid ${UI.border}`,
            boxShadow: UI.shadow,
            background: mainImage
              ? `linear-gradient(180deg, rgba(3,7,18,0.08) 0%, rgba(3,7,18,0.28) 46%, rgba(8,15,32,0.94) 100%), url(${mainImage}) center/cover`
              : "linear-gradient(135deg, rgba(37,211,166,0.18), rgba(255,255,255,0.06))",
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/match")}
            aria-label="Volver"
            style={{
              position: "absolute",
              top: 18,
              left: 18,
              width: 50,
              height: 50,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(9,18,38,0.88)",
              color: "white",
              borderRadius: 999,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "0 10px 28px rgba(0,0,0,0.28)",
            }}
          >
            <ArrowLeft size={21} />
          </button>

          <div
            style={{
              position: "absolute",
              left: 24,
              right: 24,
              bottom: 24,
              padding: 24,
              borderRadius: 28,
              background: "rgba(8,15,32,0.91)",
              border: `1px solid ${UI.border}`,
              boxShadow: UI.shadow,
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Pill tone={toneEstado}>{mainBadgeLabel}</Pill>

              {estadoProyecto ? <Pill>{estadoProyecto}</Pill> : null}

              {property.matchReason ? (
                <Pill>{formatMatchReason(property.matchReason)}</Pill>
              ) : null}
            </div>

            <div
              style={{
                marginTop: 18,
                display: "grid",
                gridTemplateColumns: "minmax(0,1fr) auto",
                gap: 22,
                alignItems: "end",
              }}
            >
              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 40,
                    lineHeight: 1.02,
                    fontWeight: 980,
                    letterSpacing: -1.4,
                    color: "rgba(248,250,252,0.98)",
                    maxWidth: 720,
                  }}
                >
                  {heroTitle}
                </h1>

                {heroLocation ? (
                  <div
                    style={{
                      marginTop: 14,
                      fontSize: 16,
                      color: "rgba(203,213,225,0.90)",
                      display: "flex",
                      alignItems: "center",
                      gap: 9,
                    }}
                  >
                    <MapPin size={17} />
                    {heroLocation}
                  </div>
                ) : null}
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 13,
                    color: UI.textMuted,
                    fontWeight: 900,
                  }}
                >
                  Precio de referencia
                </div>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 38,
                    fontWeight: 980,
                    letterSpacing: -1.2,
                    lineHeight: 1,
                    color: "rgba(248,250,252,0.98)",
                  }}
                >
                  {formatMoney(precio)}
                </div>
              </div>
            </div>

            <FinancialDisclaimer />

            <div
              style={{
                marginTop: 18,
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              <StatCard
                label="Área"
                value={property.m2 != null ? `${property.m2} m²` : "—"}
              />
              <StatCard
                label="Dormitorios"
                value={
                  property.dormitorios != null
                    ? String(property.dormitorios)
                    : "—"
                }
              />
              <StatCard
                label="Baños"
                value={property.banos != null ? String(property.banos) : "—"}
              />
              <StatCard
                label="Parqueaderos"
                value={
                  property.parqueaderos != null
                    ? String(property.parqueaderos)
                    : "—"
                }
              />
            </div>
          </div>
        </div>

        <InfoCard
          title="Tu lectura HabitaLibre"
          subtitle="Una lectura simple para saber si esta propiedad calza con tu camino de compra."
          icon={<Info size={22} />}
        >
          <div style={{ display: "grid", gap: 14 }}>
            <ToneBox tone={toneEstado}>
              <strong>{lecturaTitle}</strong>
              <div style={{ marginTop: 8 }}>{lecturaBody}</div>
            </ToneBox>

            <ToneBox>
              {hasPrecioMax ? (
                <>
                  Esta propiedad cuesta <strong>{formatMoney(precio)}</strong>.
                  Tu capacidad prudente hoy es{" "}
                  <strong>{formatMoney(precioMaxVivienda)}</strong>.
                </>
              ) : (
                <>
                  Esta propiedad cuesta <strong>{formatMoney(precio)}</strong>.
                  Aún falta confirmar tu capacidad prudente actual.
                </>
              )}
            </ToneBox>

            <ToneBox tone="green">
              <strong>Siguiente paso sugerido:</strong> puedes usar esta
              propiedad como referencia para revisar tu ruta, comparar opciones
              hipotecarias y avanzar con mayor claridad.
            </ToneBox>

            <PrimaryButton
              onClick={() => handleSelectProperty("/financiamiento-propiedad")}
            >
              Evaluar mi ruta con esta propiedad
            </PrimaryButton>
          </div>
        </InfoCard>

        <InfoCard
          title="Plan referencial"
          subtitle="Un resumen simple para entender precio, entrada, saldo y posible esfuerzo mensual."
          icon={<Landmark size={22} />}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            <StatCard label="Precio" value={formatMoney(precio)} />
            <StatCard
              label="Entrada estimada"
              value={formatMoney(entradaRequerida)}
            />
            <StatCard
              label="Saldo a financiar"
              value={formatMoney(saldoAFinanciar)}
            />
            <StatCard
              label="Cuota referencial"
              value={
                cuotaReferencial != null
                  ? formatMonthly(cuotaReferencial)
                  : "Por calcular"
              }
              accent={Boolean(cuotaReferencial)}
            />
          </div>

          <div style={{ marginTop: 14 }}>
            <ToneBox>
              {entradaDisponible != null ? (
                <>
                  Tu entrada registrada es{" "}
                  <strong>{formatMoney(entradaDisponible)}</strong>
                  {entradaPct != null ? (
                    <>
                      , equivalente a <strong>{formatPct(entradaPct)}</strong>{" "}
                      del valor de esta propiedad.
                    </>
                  ) : (
                    "."
                  )}
                </>
              ) : (
                <>Aún no tenemos una entrada registrada para esta propiedad.</>
              )}
            </ToneBox>
          </div>
        </InfoCard>

        <InfoCard
          title="Entrada al proyecto"
          subtitle="Te mostramos cuánto pide el proyecto, cuánto te faltaría y cómo se ve esa entrada para tu situación."
          icon={<Home size={22} />}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            <StatCard
              label="Entrada requerida"
              value={formatMoney(entradaRequerida)}
            />

            <StatCard
              label="Faltante"
              value={
                faltanteEntrada == null
                  ? "—"
                  : faltanteEntrada === 0
                  ? "$0"
                  : formatMoney(faltanteEntrada)
              }
              accent={faltanteEntrada === 0}
            />

            <StatCard
              label="Cuota mensual de entrada"
              value={
                cuotaEntradaMensual == null
                  ? "No requerida"
                  : cuotaEntradaMensual === 0
                  ? "No requerida"
                  : formatMonthly(cuotaEntradaMensual)
              }
            />

            <StatCard
              label="Meses de construcción"
              value={
                mesesConstruccion != null && mesesConstruccion > 0
                  ? `${mesesConstruccion} meses`
                  : "—"
              }
            />
          </div>

          <div style={{ marginTop: 14 }}>
            {hasEvaluacionEntrada ? (
              <ToneBox tone={evaluacionEntrada?.viableEntrada ? "green" : "red"}>
                <strong>
                  {evaluacionEntrada?.viableEntrada
                    ? faltanteEntrada === 0
                      ? "Ya cumples la entrada requerida para este proyecto."
                      : "La entrada se ve viable para ti."
                    : "La entrada todavía no se ve viable para ti."}
                </strong>

                <div style={{ marginTop: 8 }}>
                  {evaluacionEntrada?.viableEntrada
                    ? faltanteEntrada === 0
                      ? "No necesitas completar una cuota mensual de entrada en esta etapa."
                      : evaluacionEntrada?.razon ||
                        "La entrada podría completarse dentro del plazo estimado."
                    : evaluacionEntrada?.razon ||
                      "No tenemos todavía el análisis de entrada."}
                </div>
              </ToneBox>
            ) : (
              <ToneBox tone="amber">
                <strong>Entrada pendiente de análisis.</strong>
                <div style={{ marginTop: 8 }}>
                  Todavía no tenemos suficiente información para calcular la
                  entrada específica de esta propiedad.
                </div>
              </ToneBox>
            )}
          </div>
        </InfoCard>

        {amenities.length ? (
          <InfoCard
            title="Entorno y ubicación"
            subtitle="Información cargada sobre el entorno y servicios del proyecto."
            icon={<MapPin size={22} />}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              {amenities.map((item, index) => (
                <CheckTile key={`${item}-${index}`}>{item}</CheckTile>
              ))}
            </div>
          </InfoCard>
        ) : null}

        {galleryImages.length ? (
          <InfoCard
            title="Galería y distribución"
            subtitle="Fotos, renders y plano cargados para esta propiedad."
            icon={<ImageIcon size={22} />}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: galleryImages.length > 1 ? "1.35fr 0.65fr" : "1fr",
                gap: 12,
              }}
            >
              <div
                style={{
                  minHeight: 340,
                  borderRadius: 24,
                  overflow: "hidden",
                  border: `1px solid ${UI.border}`,
                  background: `url(${galleryImages[0]}) center/cover`,
                }}
              />

              {galleryImages.length > 1 ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {galleryImages.slice(1, 4).map((img, index) => (
                    <div
                      key={`${img}-${index}`}
                      style={{
                        minHeight: 104,
                        borderRadius: 20,
                        overflow: "hidden",
                        border: `1px solid ${UI.border}`,
                        background: `url(${img}) center/cover`,
                      }}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </InfoCard>
        ) : null}

        {projectInfoItems.length || amenities.length ? (
          <InfoCard
            title="Sobre el proyecto"
            subtitle="Información cargada para ayudarte a decidir si vale la pena avanzar con esta unidad."
            icon={<Building2 size={22} />}
          >
            {projectInfoItems.length ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${Math.min(
                    projectInfoItems.length,
                    4
                  )}, minmax(0, 1fr))`,
                  gap: 12,
                }}
              >
                {projectInfoItems.map((item) => (
                  <StatCard
                    key={item.label}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </div>
            ) : null}

            {amenities.length ? (
              <div style={{ marginTop: projectInfoItems.length ? 20 : 0 }}>
                <div
                  style={{
                    fontSize: 15,
                    color: UI.textMuted,
                    fontWeight: 950,
                    marginBottom: 12,
                  }}
                >
                  Amenidades
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {amenities.slice(0, 8).map((item, index) => (
                    <Pill key={`${item}-${index}`}>{item}</Pill>
                  ))}
                </div>
              </div>
            ) : null}
          </InfoCard>
        ) : null}

        {descripcionReal ? (
          <InfoCard
            title="Descripción"
            subtitle="Resumen cargado de la propiedad."
            icon={<Info size={22} />}
          >
            <div
              style={{
                fontSize: 16,
                color: UI.textDim,
                lineHeight: 1.6,
                maxWidth: 860,
              }}
            >
              {descripcionReal}
            </div>
          </InfoCard>
        ) : null}

        <div
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <PrimaryButton
            onClick={() => handleSelectProperty("/financiamiento-propiedad")}
          >
            Guardar esta propiedad y continuar
          </PrimaryButton>

          <SecondaryButton onClick={() => navigate("/match")}>
            Ver más propiedades
          </SecondaryButton>
        </div>
      </div>
    </HabitaShell>
  );
}