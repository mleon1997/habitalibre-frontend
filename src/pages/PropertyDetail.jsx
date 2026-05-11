// src/pages/PropertyDetail.jsx
import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";

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
}

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

function formatProbability(prob) {
  if (!prob) return "—";
  return String(prob);
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

const UI = {
  card: "rgba(15,23,42,0.72)",
  cardStrong: "rgba(8,15,32,0.86)",
  cardSoft: "rgba(255,255,255,0.05)",
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

function Pill({ children, tone = "neutral" }) {
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
        padding: "7px 11px",
        borderRadius: 999,
        background: bg,
        border: `1px solid ${br}`,
        color,
        fontWeight: 900,
        display: "inline-flex",
        alignItems: "center",
        lineHeight: 1,
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
        padding: 15,
        borderRadius: 18,
        border: "none",
        background:
          "linear-gradient(135deg, rgba(125,245,222,1), rgba(37,211,166,1))",
        color: "#052019",
        fontWeight: 950,
        cursor: "pointer",
        fontSize: 14,
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
        padding: 15,
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.05)",
        color: "rgba(226,232,240,0.96)",
        fontWeight: 950,
        cursor: "pointer",
        fontSize: 14,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        padding: 15,
        borderRadius: 20,
        background: UI.cardSoft,
        border: `1px solid ${UI.borderSoft}`,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: UI.textMuted,
          fontWeight: 850,
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 7,
          fontSize: 17,
          fontWeight: 950,
          color: "rgba(226,232,240,0.98)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InfoCard({ title, subtitle, children }) {
  return (
    <section
      style={{
        marginTop: 18,
        padding: 20,
        borderRadius: 28,
        background: UI.card,
        border: `1px solid ${UI.border}`,
        boxShadow: UI.shadowSoft,
      }}
    >
      <div
        style={{
          fontWeight: 950,
          fontSize: 18,
          letterSpacing: -0.2,
          color: "rgba(226,232,240,0.98)",
        }}
      >
        {title}
      </div>

      {subtitle ? (
        <div
          style={{
            marginTop: 8,
            fontSize: 13,
            lineHeight: 1.45,
            color: UI.textMuted,
          }}
        >
          {subtitle}
        </div>
      ) : null}

      <div style={{ marginTop: 14 }}>{children}</div>
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
        padding: 15,
        borderRadius: 20,
        background,
        border: `1px solid ${border}`,
        fontSize: 14,
        lineHeight: 1.45,
        color: "rgba(226,232,240,0.92)",
      }}
    >
      {children}
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
    return matchedProperties.find((p) => String(p.id) === String(id)) || null;
  }, [matchedProperties, id]);

  const propertyFromMock = useMemo(
    () => mockProperties.find((p) => String(p.id) === String(id)) || null,
    [id]
  );

  const property = propertyFromSnapshot || propertyFromMock;

  if (!property) {
    return <NotFound onBack={() => navigate("/match")} />;
  }

  const precio = n(property?.precio);

  const entradaDisponibleRaw =
    pick(snapshot, ["entradaDisponible"]) ??
    snapshot?.plan?.currentEntry ??
    snapshot?.financialCapacity?.plannedEntry?.currentEntry ??
    journey?.form?.entradaDisponible ??
    journey?.form?.entrada ??
    journey?.entrada ??
    property?.evaluacionEntrada?.entradaDisponibleHoy ??
    null;

  const entradaDisponible = maybeNum(entradaDisponibleRaw);

  const precioMaxViviendaRaw =
    pick(snapshot, ["precioMaxVivienda"]) ??
    pick(snapshot, ["precioMaxPerfil"]) ??
    pick(snapshot, ["precioMax"]) ??
    snapshot?.financialCapacity?.estimatedMaxPropertyValue ??
    snapshot?.homeRecommendation
      ?.profileProgramsThatCouldWorkIfRangeAdjusted?.[0]?.priceMax ??
    property?.evaluacionHipotecaHoy?.precioMaxVivienda ??
    property?.evaluacionHipotecaFutura?.precioMaxVivienda ??
    null;

  const precioMaxVivienda = maybeNum(precioMaxViviendaRaw);

  const productoElegido =
    pick(snapshot, ["productoElegido", "productoSugerido"]) ||
    property?.evaluacionHipotecaHoy?.productoSugerido ||
    property?.evaluacionHipotecaFutura?.productoSugerido ||
    null;

  const bancosTop3 =
    pick(snapshot, ["bancosTop3"]) ||
    pick(snapshot, ["bancosProbabilidad"]) ||
    snapshot?.rankedMortgages ||
    [];

  const bankSuggested =
    Array.isArray(bancosTop3) && bancosTop3.length ? bancosTop3[0] : null;

  const evaluacionEntrada = property?.evaluacionEntrada || null;
  const evaluacionHipotecaHoy =
    property?.evaluacionHipotecaHoy || property?.evaluacionHipoteca || null;
  const evaluacionHipotecaFutura = property?.evaluacionHipotecaFutura || null;
  const estadoCompra = property?.estadoCompra || null;

  const hasPrecioMax = precioMaxVivienda != null && precioMaxVivienda > 0;
  const hasEntradaDisponible = entradaDisponible != null;
  const hasEvaluacionEntrada = !!evaluacionEntrada;
  const hasHipotecaData =
    !!evaluacionHipotecaHoy || !!evaluacionHipotecaFutura || !!bankSuggested;

  const calzaPrecio = hasPrecioMax ? precio <= precioMaxVivienda : null;
  const gapPrecio = hasPrecioMax ? Math.max(0, precio - precioMaxVivienda) : null;

  const entradaPct =
    hasEntradaDisponible && precio > 0
      ? (entradaDisponible / precio) * 100
      : null;

  const entradaRequerida =
    evaluacionEntrada?.entradaRequerida == null
      ? null
      : maybeNum(evaluacionEntrada?.entradaRequerida);

  const faltanteEntrada =
    evaluacionEntrada?.faltanteEntrada == null
      ? null
      : maybeNum(evaluacionEntrada?.faltanteEntrada);

  const cuotaEntradaMensual =
    evaluacionEntrada?.cuotaEntradaMensual == null
      ? null
      : maybeNum(evaluacionEntrada?.cuotaEntradaMensual);

  const mesesConstruccion =
    evaluacionEntrada?.mesesConstruccionRestantes == null
      ? null
      : maybeNum(evaluacionEntrada?.mesesConstruccionRestantes);

  const hasAnalisisCompletoMinimo =
    hasPrecioMax && hasEntradaDisponible && (hasEvaluacionEntrada || hasHipotecaData);

  let toneEstado = "neutral";

  if (hasAnalisisCompletoMinimo) {
    toneEstado =
      estadoCompra === "top_match" ||
      estadoCompra === "entrada_viable_hipoteca_futura_viable"
        ? "green"
        : estadoCompra === "entrada_viable_hipoteca_futura_debil" ||
          estadoCompra === "ruta_cercana"
        ? "amber"
        : "red";
  } else {
    toneEstado = "amber";
  }

  const heroTitle =
    property.titulo || property.nombre || property.proyecto || "Propiedad";

  const heroLocation =
    property.sector ||
    property.zona ||
    property.ciudadZona ||
    property.ciudad ||
    "Quito";

  const descripcionReal =
    property.descripcion ||
    `${heroTitle} es una propiedad orientada a primera vivienda, ubicada en ${heroLocation}. Esta opción se muestra porque se alinea con tu perfil actual y con una ruta estimada de compra dentro de HabitaLibre.`;

  const mainBadgeLabel = hasAnalisisCompletoMinimo
    ? property?.matchBadgeCalculado ||
      property?.matchBadge ||
      formatEstadoCompra(estadoCompra)
    : "Pendiente de análisis";

  const estadoLabel = hasAnalisisCompletoMinimo
    ? formatEstadoCompra(estadoCompra)
    : "Análisis parcial";

  const futureReasonText = evaluacionHipotecaFutura?.viable
    ? faltanteEntrada === 0
      ? "Con la entrada requerida ya cubierta, esta propiedad podría calzar con tu ruta hipotecaria al momento de la entrega."
      : evaluacionHipotecaFutura?.razon || "No disponible"
    : evaluacionHipotecaFutura?.razon || "No disponible";

  function handleSelectProperty() {
    const propertyId =
      property?.id || property?._id || property?.propertyId || id || null;

    const propertyTitle =
      property?.titulo ||
      property?.nombre ||
      property?.title ||
      property?.name ||
      property?.proyecto ||
      "Propiedad elegida";

    const propertyCity =
      property?.ciudad ||
      property?.zona ||
      property?.ciudadZona ||
      property?.sector ||
      journey?.form?.ciudadCompra ||
      journey?.ciudadCompra ||
      "Ubicación pendiente";

    const propertyPriceRaw =
      property?.precio ?? property?.price ?? property?.valor ?? property?.listPrice ?? null;

    const propertyPrice = Number.isFinite(Number(propertyPriceRaw))
      ? Number(propertyPriceRaw)
      : null;

    const propertyImage =
      property?.imagen ||
      property?.image ||
      property?.imageUrl ||
      property?.foto ||
      property?.cover ||
      null;

    const normalizedProperty = {
      id: propertyId,
      _id: propertyId,
      propertyId,

      titulo: propertyTitle,
      nombre: propertyTitle,
      proyecto: propertyTitle,

      ciudad: propertyCity,
      zona: propertyCity,
      sector: property?.sector || propertyCity,
      ciudadZona: property?.ciudadZona || propertyCity,

      precio: propertyPrice,
      price: propertyPrice,

      imagen: propertyImage,
      image: propertyImage,

      cuotaEstimada:
        property?.cuotaEstimada ||
        property?.cuota ||
        property?.evaluacionHipotecaFutura?.cuotaReferencia ||
        property?.evaluacionHipotecaHoy?.cuotaReferencia ||
        snapshot?.cuotaEstimada ||
        snapshot?.cuotaMensual ||
        snapshot?.bestMortgage?.cuota ||
        null,

      entradaMinima:
        property?.entradaMinima ??
        property?.entradaRequerida ??
        property?.evaluacionEntrada?.entradaRequerida ??
        null,

      descripcion:
        property?.descripcion ||
        `${propertyTitle} es una propiedad que hoy se alinea con tu ruta estimada dentro de HabitaLibre.`,

      source: "property_detail",
      selectedAt: new Date().toISOString(),

      raw: property,
    };

    saveOwnedData(LS_SELECTED_PROPERTY, normalizedProperty);

    saveOwnedData(LS_JOURNEY, {
      ...(journey || {}),
      propiedadElegida: true,
      propiedadId: propertyId,
      propiedadSeleccionada: normalizedProperty,
    });

    navigate("/ruta");
  }

  return (
    <HabitaShell maxWidth={980}>
      <div style={{ paddingBottom: 32 }}>
        <div
          style={{
            position: "relative",
            height: 300,
            width: "100%",
            borderRadius: 32,
            overflow: "hidden",
            border: `1px solid ${UI.border}`,
            boxShadow: UI.shadow,
            background: property.imagen
              ? `linear-gradient(rgba(0,0,0,0.10), rgba(8,15,32,0.62)), url(${property.imagen}) center/cover`
              : "linear-gradient(135deg, rgba(37,211,166,0.18), rgba(255,255,255,0.06))",
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/match")}
            aria-label="Volver"
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              width: 48,
              height: 48,
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
            <ArrowLeft size={20} />
          </button>
        </div>

        <div
          style={{
            marginTop: -44,
            position: "relative",
            zIndex: 2,
            padding: "0 12px",
          }}
        >
          <div
            style={{
              padding: 22,
              borderRadius: 32,
              background: UI.cardStrong,
              border: `1px solid ${UI.border}`,
              boxShadow: UI.shadow,
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
          >
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Pill tone={toneEstado}>{mainBadgeLabel}</Pill>

              {property.proyectoNuevo ? (
                <Pill>Proyecto nuevo</Pill>
              ) : (
                <Pill>Entrega inmediata</Pill>
              )}

              <Pill>{formatMatchReason(property.matchReason)}</Pill>
            </div>

            <div
              style={{
                marginTop: 16,
                display: "flex",
                justifyContent: "space-between",
                gap: 18,
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <div style={{ minWidth: 0, flex: "1 1 420px" }}>
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 980,
                    letterSpacing: -1.1,
                    lineHeight: 1.03,
                    color: "rgba(226,232,240,0.98)",
                  }}
                >
                  {heroTitle}
                </div>

                <div
                  style={{
                    marginTop: 12,
                    fontSize: 14,
                    color: UI.textDim,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                >
                  <MapPin size={15} />
                  {heroLocation}
                </div>
              </div>

              <div style={{ flexShrink: 0 }}>
                <div
                  style={{
                    fontSize: 12,
                    color: UI.textMuted,
                    fontWeight: 850,
                  }}
                >
                  Precio
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 38,
                    fontWeight: 980,
                    letterSpacing: -1,
                    lineHeight: 1,
                    color: "rgba(226,232,240,0.98)",
                  }}
                >
                  {moneyUSD(precio)}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 18,
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              <StatCard
                label="Área"
                value={property.m2 != null ? `${property.m2} m²` : "—"}
              />
              <StatCard
                label="Dormitorios"
                value={property.dormitorios != null ? String(property.dormitorios) : "—"}
              />
              <StatCard
                label="Baños"
                value={property.banos != null ? String(property.banos) : "—"}
              />
              <StatCard
                label="Parqueaderos"
                value={
                  property.parqueaderos != null ? String(property.parqueaderos) : "—"
                }
              />
            </div>
          </div>
        </div>

        <InfoCard
          title="Cómo se alinea con tu perfil"
          subtitle="Aquí resumimos cómo se alinea esta propiedad con tu perfil actual y qué podrías ajustar."
        >
          <div style={{ display: "grid", gap: 10 }}>
            <ToneBox tone={toneEstado}>
              <strong>{estadoLabel}</strong>
              <div style={{ marginTop: 6 }}>
                {hasAnalisisCompletoMinimo
                  ? property?.matchReasonCalculado ||
                    "Analizamos esta propiedad con base en tu perfil y en el esquema financiero del proyecto."
                  : "Todavía no tenemos suficiente información para confirmar el encaje completo de esta propiedad con tu perfil."}
              </div>
            </ToneBox>

            <ToneBox>
              Esta propiedad se alinea principalmente por{" "}
              <strong>{formatMatchReason(property.matchReason)}</strong>.
            </ToneBox>

            <ToneBox>
              {hasPrecioMax ? (
                <>
                  Tu precio máximo estimado hoy es{" "}
                  <strong>{moneyUSD(precioMaxVivienda)}</strong>.
                  {calzaPrecio ? (
                    <>
                      {" "}
                      Esta propiedad <strong>sí entra</strong> dentro de ese rango.
                    </>
                  ) : (
                    <>
                      {" "}
                      Esta propiedad queda <strong>{moneyUSD(gapPrecio)}</strong>{" "}
                      por encima de tu rango hipotecario actual.
                    </>
                  )}
                </>
              ) : (
                <>Aún no tenemos tu precio máximo calculado.</>
              )}
            </ToneBox>

            <ToneBox>
              {hasEntradaDisponible ? (
                <>
                  Tu entrada registrada es{" "}
                  <strong>{moneyUSD(entradaDisponible)}</strong>, equivalente a{" "}
                  <strong>{formatPct(entradaPct)}</strong> del valor de esta
                  propiedad.
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
        >
          <div style={{ display: "grid", gap: 10 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              <StatCard
                label="Entrada requerida"
                value={formatMoney(entradaRequerida)}
              />

              <StatCard
                label="Faltante de entrada"
                value={
                  faltanteEntrada == null
                    ? "—"
                    : faltanteEntrada === 0
                    ? "$0 (completo)"
                    : formatMoney(faltanteEntrada)
                }
              />

              <StatCard
                label="Cuota mensual de entrada"
                value={
                  cuotaEntradaMensual == null
                    ? "No disponible"
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

            {hasEvaluacionEntrada ? (
              <ToneBox tone={evaluacionEntrada?.viableEntrada ? "green" : "red"}>
                <strong>
                  {evaluacionEntrada?.viableEntrada
                    ? faltanteEntrada === 0
                      ? "Ya cumples la entrada requerida para este proyecto."
                      : "La entrada se ve viable para ti."
                    : "La entrada todavía no se ve viable para ti."}
                </strong>

                <div style={{ marginTop: 6 }}>
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
                <strong>Entrada pendiente de análisis</strong>
                <div style={{ marginTop: 6 }}>
                  Todavía no tenemos suficiente información para calcular la entrada
                  de esta propiedad.
                </div>
              </ToneBox>
            )}
          </div>
        </InfoCard>

        <InfoCard
          title="Ruta hipotecaria"
          subtitle="Aquí ves si esta propiedad se alinea con una hipoteca hoy, una hipoteca futura o una recomendación general de tu perfil."
        >
          <div style={{ display: "grid", gap: 10 }}>
            {evaluacionHipotecaHoy ? (
              <ToneBox tone={evaluacionHipotecaHoy?.viable ? "green" : "amber"}>
                <strong>Hipoteca en escenario actual</strong>

                <div style={{ marginTop: 6 }}>
                  {evaluacionHipotecaHoy?.razon || "No disponible"}
                </div>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    opacity: 0.82,
                    lineHeight: 1.45,
                  }}
                >
                  Producto:{" "}
                  <strong>
                    {evaluacionHipotecaHoy?.productoSugerido || "—"}
                  </strong>
                  {" • "}Probabilidad:{" "}
                  <strong>
                    {formatProbability(evaluacionHipotecaHoy?.probabilidad)}
                  </strong>
                  {" • "}Score:{" "}
                  <strong>{n(evaluacionHipotecaHoy?.score)}</strong>
                </div>
              </ToneBox>
            ) : null}

            {evaluacionHipotecaFutura ? (
              <ToneBox tone={evaluacionHipotecaFutura?.viable ? "green" : "amber"}>
                <strong>Hipoteca futura al momento de entrega</strong>

                <div style={{ marginTop: 6 }}>{futureReasonText}</div>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    opacity: 0.82,
                    lineHeight: 1.45,
                  }}
                >
                  Monto hipotecario proyectado:{" "}
                  <strong>
                    {formatMoney(evaluacionHipotecaFutura?.montoHipotecaProyectado)}
                  </strong>
                  {" • "}Producto:{" "}
                  <strong>
                    {evaluacionHipotecaFutura?.productoSugerido || "—"}
                  </strong>
                  {" • "}Probabilidad:{" "}
                  <strong>
                    {formatProbability(evaluacionHipotecaFutura?.probabilidad)}
                  </strong>
                  {" • "}Score:{" "}
                  <strong>{n(evaluacionHipotecaFutura?.score)}</strong>
                </div>
              </ToneBox>
            ) : null}

            {!evaluacionHipotecaHoy && !evaluacionHipotecaFutura && bankSuggested ? (
              <ToneBox tone="amber">
                <strong>Mejor ruta estimada</strong>

                <div style={{ marginTop: 6 }}>
                  {bankSuggested.banco || "Hipoteca sugerida"}
                </div>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    opacity: 0.82,
                    lineHeight: 1.4,
                  }}
                >
                  {bankSuggested.tasaAnual != null
                    ? `Tasa ${(Number(bankSuggested.tasaAnual) * 100).toFixed(2)}%`
                    : "Tasa —"}
                  {" • "}
                  {bankSuggested.cuota != null
                    ? `Cuota aprox. ${moneyUSD(bankSuggested.cuota)}`
                    : "Cuota —"}
                  {" • "}
                  {bankSuggested.montoPrestamo != null
                    ? `Monto aprox. ${moneyUSD(bankSuggested.montoPrestamo)}`
                    : "Monto —"}
                </div>
              </ToneBox>
            ) : null}

            {!hasHipotecaData ? (
              <ToneBox tone="amber">
                <strong>Ruta hipotecaria pendiente</strong>
                <div style={{ marginTop: 6 }}>
                  Todavía no hay una ruta hipotecaria calculada para esta propiedad.
                </div>
              </ToneBox>
            ) : null}

            {productoElegido ? (
              <ToneBox>
                Tu producto sugerido general actual es{" "}
                <strong>{String(productoElegido)}</strong>.
              </ToneBox>
            ) : null}
          </div>
        </InfoCard>

        <InfoCard
          title="Descripción"
          subtitle="Resumen de la propiedad y de su encaje estimado dentro de tu escenario actual."
        >
          <div
            style={{
              fontSize: 14,
              color: UI.textDim,
              lineHeight: 1.55,
            }}
          >
            {descripcionReal}
          </div>
        </InfoCard>

        <div
          style={{
            marginTop: 22,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <PrimaryButton onClick={handleSelectProperty}>
            Seleccionar esta propiedad
          </PrimaryButton>

          <SecondaryButton onClick={() => navigate("/match")}>
            Ver más propiedades
          </SecondaryButton>
        </div>
      </div>
    </HabitaShell>
  );
}