// src/components/PropertyCard.jsx
import React, { useMemo } from "react";
import {
  Bath,
  BedDouble,
  Building2,
  CarFront,
  Clock3,
  Landmark,
  ListChecks,
  MapPin,
  Ruler,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { moneyUSD } from "../lib/money";
import { buildPropertyPlan } from "../lib/planEngine.js";
import { Card, UI } from "../ui/kit.jsx";

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

function n(v, def = 0) {
  const x = Number(v);
  return Number.isFinite(x) ? x : def;
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function positiveNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function formatMoney(v) {
  const x = Number(v);
  return Number.isFinite(x) ? moneyUSD(x) : "—";
}

function formatMonthly(v) {
  const x = Number(v);
  return Number.isFinite(x) && x > 0 ? `${moneyUSD(x)}/mes` : "—";
}

function formatEstadoCompra(estado) {
  const map = {
    top_match: "Compra inmediata",
    apto_hoy: "Compra inmediata",
    APTO_HOY: "Compra inmediata",
    dentro_rango_actual: "Compra inmediata",
    entrada_viable_hipoteca_futura_viable: "Entrada viable + hipoteca viable",
    entrada_viable_hipoteca_futura_debil: "Entrada viable, hipoteca por fortalecer",
    entrada_no_viable: "Entrada no viable",
    ruta_cercana: "Ruta cercana",
    ruta_preparacion: "Ruta de preparación",
    fuera_de_rango: "Sobre tu rango actual",
    fuera_de_reglas: "Fuera de reglas",
  };

  return map[estado] || "Ruta por definir";
}

function getToneFromEstado(estado, planStatus) {
  if (
    planStatus === "viable_today" ||
    planStatus === "viable_future" ||
    estado === "top_match" ||
    estado === "apto_hoy" ||
    estado === "APTO_HOY" ||
    estado === "dentro_rango_actual" ||
    estado === "entrada_viable_hipoteca_futura_viable"
  ) {
    return "good";
  }

  if (
    planStatus === "needs_down_payment" ||
    estado === "entrada_viable_hipoteca_futura_debil" ||
    estado === "ruta_cercana" ||
    estado === "ruta_preparacion"
  ) {
    return "warn";
  }

  if (
    estado === "entrada_no_viable" ||
    estado === "fuera_de_reglas" ||
    estado === "fuera_de_rango"
  ) {
    return "danger";
  }

  return "neutral";
}

function getToneColors(estadoTone) {
  if (estadoTone === "good") {
    return {
      bg: "rgba(37,211,166,0.10)",
      border: "rgba(37,211,166,0.22)",
      text: "rgba(209,250,229,0.98)",
      dot: "rgba(37,211,166,0.95)",
      soft: "rgba(37,211,166,0.16)",
    };
  }

  if (estadoTone === "warn") {
    return {
      bg: "rgba(245,158,11,0.10)",
      border: "rgba(245,158,11,0.22)",
      text: "rgba(254,243,199,0.98)",
      dot: "rgba(245,158,11,0.95)",
      soft: "rgba(245,158,11,0.16)",
    };
  }

  if (estadoTone === "danger") {
    return {
      bg: "rgba(239,68,68,0.10)",
      border: "rgba(239,68,68,0.22)",
      text: "rgba(254,226,226,0.98)",
      dot: "rgba(239,68,68,0.95)",
      soft: "rgba(239,68,68,0.16)",
    };
  }

  return {
    bg: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.10)",
    text: UI.text,
    dot: "rgba(255,255,255,0.9)",
    soft: "rgba(255,255,255,0.08)",
  };
}

function sanitizeChipLabel(label) {
  const text = String(label || "").trim();

  const map = {
    "Puedes aplicar hoy": "Dentro de tu rango",
    "Ruta alineada": "Dentro de tu rango",
    "Apto hoy": "Dentro de tu rango",
    "Compra inmediata": "Dentro de tu rango",
    "Fuera de rango actual": "Sobre tu rango actual",
  };

  return map[text] || text;
}

function getHeadline({ planStatus, estadoCompra }) {
  if (
    planStatus === "viable_today" ||
    estadoCompra === "top_match" ||
    estadoCompra === "apto_hoy" ||
    estadoCompra === "APTO_HOY" ||
    estadoCompra === "dentro_rango_actual"
  ) {
    return "Dentro de tu rango";
  }

  if (
    planStatus === "viable_future" ||
    estadoCompra === "entrada_viable_hipoteca_futura_viable"
  ) {
    return "Meta alcanzable";
  }

  if (
    planStatus === "needs_down_payment" ||
    estadoCompra === "entrada_viable_hipoteca_futura_debil" ||
    estadoCompra === "ruta_preparacion" ||
    estadoCompra === "ruta_cercana"
  ) {
    return "Requiere preparación";
  }

  if (estadoCompra === "fuera_de_rango") {
    return "Sobre tu rango actual";
  }

  if (estadoCompra === "entrada_no_viable") {
    return "Entrada por fortalecer";
  }

  return formatEstadoCompra(estadoCompra);
}

function getSummaryText({ headline, estadoCompra, planStatus }) {
  if (headline === "Dentro de tu rango") {
    return "Esta propiedad sí podría encajar con tu perfil actual.";
  }

  if (headline === "Meta alcanzable") {
    return "Puede acercarse si completas entrada o avanzas con tu plan.";
  }

  if (headline === "Requiere preparación") {
    return "Interesante, pero todavía pide fortalecer entrada o perfil.";
  }

  if (headline === "Sobre tu rango actual") {
    return "Está sobre tu ruta actual; úsala como referencia para comparar.";
  }

  if (planStatus === "needs_down_payment" || estadoCompra === "entrada_no_viable") {
    return "La entrada todavía necesita fortalecerse para acercarte.";
  }

  return "Explora cómo se ve tu ruta estimada de entrada y financiamiento.";
}

function formatFeatureChips({
  titulo,
  tipoInmueble,
  area,
  dormitorios,
  banos,
  parqueaderos,
}) {
  const chips = [];

  if (area != null && Number(area) > 0) {
    chips.push({
      key: "area",
      label: `${area} m²`,
      Icon: Ruler,
    });
  }

  const title = String(titulo || "").toLowerCase();
  const type = String(tipoInmueble || "").toLowerCase();

  const isStudio =
    type === "estudio" ||
    type === "suite" ||
    title.includes("estudio") ||
    title.includes("suite");

  const dorms = toNumber(dormitorios);

  if (isStudio || dorms === 0) {
    chips.push({
      key: "studio",
      label: "Estudio",
      Icon: Building2,
    });
  } else if (dorms != null && dorms > 0) {
    chips.push({
      key: "dorms",
      label: `${dorms} dorm`,
      Icon: BedDouble,
    });
  }

  const baths = toNumber(banos);
  if (baths != null && baths > 0) {
    chips.push({
      key: "baths",
      label: `${baths} ${baths === 1 ? "baño" : "baños"}`,
      Icon: Bath,
    });
  }

  const parking = toNumber(parqueaderos);
  if (parking != null && parking > 0) {
    chips.push({
      key: "parking",
      label: `${parking} ${parking === 1 ? "parqueo" : "parqueos"}`,
      Icon: CarFront,
    });
  }

  return chips;
}

function compactMortgageLabel(value) {
  const raw = String(value || "").trim();
  if (!raw) return "Por definir";

  const s = raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (s.includes("interes social") || s === "vis") return "Ruta VIS";
  if (s.includes("interes publico") || s === "vip") return "Ruta VIP";
  if (s.includes("premier") || s.includes("credicasa")) return "BIESS Premier";
  if (s.includes("vis") && s.includes("vip")) return "BIESS VIS/VIP";
  if (s.includes("media")) return "BIESS Media";
  if (s.includes("alta")) return "BIESS Alta";
  if (s.includes("lujo")) return "BIESS Lujo";
  if (s.includes("privada") || s.includes("private")) return "Banca privada";
  if (s.includes("biess")) return "BIESS";

  return raw.length > 22 ? raw.slice(0, 22).trim() + "…" : raw;
}

function ImageBadge({ children, tone = "neutral", Icon }) {
  const colors = getToneColors(tone);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        width: "fit-content",
        maxWidth: "100%",
        padding: "8px 11px",
        borderRadius: 999,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        fontSize: 12,
        fontWeight: 950,
        lineHeight: 1.05,
        backdropFilter: "blur(10px)",
        boxShadow: "0 8px 22px rgba(0,0,0,0.20)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {Icon ? (
        <Icon
          size={14}
          strokeWidth={2.25}
          style={{ flexShrink: 0 }}
        />
      ) : null}
      <span>{children}</span>
    </span>
  );
}

function FeatureChip({ chip }) {
  const Icon = chip?.Icon;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "9px 12px",
        borderRadius: 999,
        background: "rgba(255,255,255,0.055)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "rgba(226,232,240,0.94)",
        fontSize: 12,
        fontWeight: 900,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {Icon ? (
        <Icon
          size={14}
          strokeWidth={2.25}
          style={{
            color: "rgba(148,163,184,0.96)",
            flexShrink: 0,
          }}
        />
      ) : null}

      <span>{chip?.label}</span>
    </span>
  );
}

function MiniStat({ label, value, highlight = false, Icon }) {
  return (
    <div
      style={{
        minWidth: 0,
        padding: 14,
        borderRadius: 16,
        background: highlight
          ? "linear-gradient(180deg, rgba(37,211,166,0.12), rgba(37,211,166,0.075))"
          : "rgba(255,255,255,0.04)",
        border: highlight
          ? "1px solid rgba(37,211,166,0.22)"
          : "1px solid rgba(255,255,255,0.08)",
        boxShadow: highlight ? "0 10px 20px rgba(0,0,0,0.14)" : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          color: UI.subtext,
          lineHeight: 1.2,
          marginBottom: 6,
          fontWeight: 850,
        }}
      >
        {Icon ? (
          <Icon
            size={13}
            strokeWidth={2.25}
            style={{
              color: highlight ? "#25d3a6" : "rgba(148,163,184,0.94)",
              flexShrink: 0,
            }}
          />
        ) : null}

        <span
          style={{
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      </div>

      <div
        style={{
          fontSize: 14,
          fontWeight: 950,
          color: highlight ? "#25d3a6" : UI.text,
          lineHeight: 1.2,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function StepRow({ index, title, text, tone = "neutral" }) {
  const colors = getToneColors(tone);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "30px 1fr",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 999,
          display: "grid",
          placeItems: "center",
          fontSize: 13,
          fontWeight: 900,
          color: "white",
          background: colors.soft,
          border: `1px solid ${colors.border}`,
          flexShrink: 0,
        }}
      >
        {index}
      </div>

      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 900,
            color: UI.text,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 3,
            fontSize: 12.5,
            color: UI.subtext,
            lineHeight: 1.35,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

export default function PropertyCard({ property, onClick }) {
  const snapshot = useMemo(() => loadJSON(LS_SNAPSHOT), []);
  const journey = useMemo(() => loadJSON(LS_JOURNEY), []);

  const plan = useMemo(() => {
    if (!property) return null;

    try {
      return buildPropertyPlan({
        property,
        journey,
        snapshot,
      });
    } catch (e) {
      console.error("[HL][PropertyCard] buildPropertyPlan error:", e);
      return null;
    }
  }, [property, journey, snapshot]);

  if (!property) return null;

  const {
    titulo,
    precio,
    m2,
    areaM2,
    dormitorios,
    banos,
    parqueaderos,
    tipoInmueble,
    ciudadZona,
    ciudad,
    zona,
    sector,
    proyectoNuevo,
    matchBadge,
    matchBadgeCalculado,
    matchReasonCalculado,
    imagen,
    estadoCompra,
  } = property;

  const price = positiveNumber(precio ?? property?.price ?? property?._normalizedPrice);
  const area = m2 ?? areaM2 ?? null;
  const ubicacion = [sector, ciudadZona || ciudad || zona].filter(Boolean).join(" • ");

  const estadoTone = getToneFromEstado(estadoCompra, plan?.status);
  const toneColors = getToneColors(estadoTone);

  const headline = getHeadline({
    planStatus: plan?.status || null,
    estadoCompra,
  });

  const summaryText = getSummaryText({
    headline,
    estadoCompra,
    planStatus: plan?.status || null,
  });

  const badgeFinal = sanitizeChipLabel(
    matchBadgeCalculado || matchBadge || headline || "Buen match"
  );

  const estadoLabel = formatEstadoCompra(estadoCompra);

  const routeLabel =
    plan?.routeLabel ||
    matchReasonCalculado ||
    estadoLabel ||
    "Ruta por definir";

  const entradaTotal = plan?.entradaTotal ?? null;
  const teFaltaHoy = plan?.teFaltaHoy ?? null;
  const cuotaEntrada = plan?.cuotaEntrada ?? null;
  const hipotecaEstimada = plan?.hipotecaEstimada ?? null;
  const cuotaHipotecaEstimada = plan?.cuotaHipotecaEstimada ?? null;
  const mesesConstruccion = n(property?.evaluacionEntrada?.mesesConstruccionRestantes, 0);

  const compactRoute = compactMortgageLabel(hipotecaEstimada || routeLabel);

  const featureChips = formatFeatureChips({
    titulo,
    tipoInmueble,
    area,
    dormitorios,
    banos,
    parqueaderos,
  });

  const steps = Array.isArray(plan?.steps) ? plan.steps : [];

const handleCardClick = (event) => {
  if (!onClick) return;

  onClick(event);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const main = document.querySelector("main");
    if (main && typeof main.scrollTo === "function") {
      main.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    }
  };

  scrollToTop();
  requestAnimationFrame(scrollToTop);
  setTimeout(scrollToTop, 80);
};


  return (
    <Card
      soft
      style={{
        padding: 0,
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        borderRadius: 26,
      }}
    >
   <button
  type="button"
  onClick={handleCardClick}
        style={{
          width: "100%",
          border: "none",
          background: "transparent",
          color: "inherit",
          padding: 0,
          textAlign: "left",
          cursor: onClick ? "pointer" : "default",
        }}
      >
        <div
          style={{
            height: 176,
            width: "100%",
            background: imagen
              ? `linear-gradient(180deg, rgba(2,6,23,0.08) 0%, rgba(2,6,23,0.50) 100%), url(${imagen}) center/cover`
              : "linear-gradient(135deg, rgba(45,212,191,0.16), rgba(59,130,246,0.14))",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              right: 12,
              display: "flex",
              justifyContent: "space-between",
              gap: 8,
              alignItems: "flex-start",
            }}
          >
            <div style={{ minWidth: 0, maxWidth: "62%" }}>
              <ImageBadge tone={estadoTone}>{badgeFinal}</ImageBadge>
            </div>

            {proyectoNuevo ? (
              <ImageBadge tone="neutral" Icon={Sparkles}>
                Proyecto nuevo
              </ImageBadge>
            ) : null}
          </div>

          <div
            style={{
              position: "absolute",
              left: 12,
              right: 12,
              bottom: 12,
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                minWidth: 0,
                padding: "10px 13px",
                borderRadius: 18,
                background: "rgba(9,18,39,0.88)",
                border: "1px solid rgba(255,255,255,0.10)",
                backdropFilter: "blur(8px)",
                fontWeight: 900,
                fontSize: 13,
                color: "rgba(255,255,255,0.98)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {headline}
            </div>

            <div
              style={{
                width: 146,
                padding: "10px 14px",
                borderRadius: 20,
                background: "rgba(9,18,39,0.92)",
                border: "1px solid rgba(255,255,255,0.10)",
                backdropFilter: "blur(8px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.22)",
                boxSizing: "border-box",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.78)",
                  marginBottom: 2,
                  fontWeight: 800,
                  lineHeight: 1.1,
                }}
              >
                Precio ref.
              </div>
              <div
                style={{
                  fontWeight: 950,
                  fontSize: 18,
                  color: "rgba(255,255,255,0.98)",
                  lineHeight: 1.1,
                }}
              >
                {price ? moneyUSD(price) : "—"}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: 16 }}>
          <div>
            <div
              style={{
                fontWeight: 950,
                fontSize: 17,
                lineHeight: 1.15,
                color: UI.text,
              }}
            >
              {titulo}
            </div>

            <div
              style={{
                marginTop: 7,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                color: UI.subtext,
                lineHeight: 1.35,
              }}
            >
              <MapPin
                size={14}
                strokeWidth={2.25}
                style={{
                  color: "rgba(148,163,184,0.92)",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              />

              <span
                style={{
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {ubicacion || "Ubicación por definir"}
              </span>
            </div>
          </div>

          {featureChips.length ? (
            <div
              style={{
                marginTop: 12,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {featureChips.slice(0, 4).map((chip) => (
                <FeatureChip key={chip.key} chip={chip} />
              ))}
            </div>
          ) : null}

          <div
            style={{
              marginTop: 14,
              padding: 14,
              borderRadius: 22,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))",
              border: "1px solid rgba(255,255,255,0.09)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: UI.subtext,
                fontWeight: 850,
              }}
            >
              Plan de compra estimado
            </div>

            <div
              style={{
                marginTop: 4,
                fontWeight: 950,
                fontSize: 15,
                color: UI.text,
              }}
            >
              {routeLabel}
            </div>

            <div
              style={{
                marginTop: 12,
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              <MiniStat
                Icon={WalletCards}
                label="Entrada total"
                value={entradaTotal != null ? formatMoney(entradaTotal) : "—"}
                highlight
              />

              <MiniStat
                Icon={WalletCards}
                label="Te falta hoy"
                value={
                  teFaltaHoy != null
                    ? teFaltaHoy > 0
                      ? formatMoney(teFaltaHoy)
                      : "$0"
                    : "—"
                }
              />

              <MiniStat
                Icon={Landmark}
                label="Cuota entrada"
                value={
                  cuotaEntrada == null
                    ? "Pago inmediato"
                    : cuotaEntrada === 0
                    ? "$0"
                    : formatMonthly(cuotaEntrada)
                }
              />

              <MiniStat
                Icon={Building2}
                label="Hipoteca estimada"
                value={compactRoute || "Por definir"}
              />
            </div>

            <div
              style={{
                marginTop: 14,
                display: "grid",
                gap: 12,
              }}
            >
              {steps.length ? (
                steps.map((step, idx) => (
                  <StepRow
                    key={step.id || idx}
                    index={idx + 1}
                    title={step.title}
                    text={step.subtitle}
                    tone={step.tone || "neutral"}
                  />
                ))
              ) : (
                <>
                  <StepRow
                    index={1}
                    title="Reserva / entrada"
                    text="Revisa cuánto necesitas para separar y completar tu entrada."
                    tone="neutral"
                  />
                  <StepRow
                    index={2}
                    title="Hipoteca"
                    text="Todavía no hay una ruta hipotecaria sólida."
                    tone="danger"
                  />
                  <StepRow
                    index={3}
                    title="Resultado"
                    text="Explora cómo se ve tu ruta estimada de entrada y financiamiento."
                    tone="neutral"
                  />
                </>
              )}
            </div>
          </div>

          <div
            style={{
              marginTop: 12,
              padding: "12px 14px",
              borderRadius: 18,
              background: toneColors.bg,
              border: `1px solid ${toneColors.border}`,
              fontSize: 13,
              color: toneColors.text,
              lineHeight: 1.4,
            }}
          >
            <strong style={{ color: UI.text }}>{headline}.</strong>
            <div style={{ marginTop: 4 }}>{summaryText}</div>

            {mesesConstruccion > 0 ? (
              <div style={{ marginTop: 6 }}>
                Tiempo de construcción estimado:{" "}
                <strong style={{ color: UI.text }}>{mesesConstruccion} meses</strong>.
              </div>
            ) : null}

            {cuotaHipotecaEstimada != null ? (
              <div style={{ marginTop: 6 }}>
                Cuota hipotecaria estimada:{" "}
                <strong style={{ color: UI.text }}>
                  {moneyUSD(cuotaHipotecaEstimada)}
                </strong>.
              </div>
            ) : null}
          </div>

          <div
            style={{
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontSize: 12,
              color: "rgba(148,163,184,0.9)",
              lineHeight: 1.35,
            }}
          >
            <ListChecks size={14} strokeWidth={2.25} />
            <span>Toca para ver detalle, entrada y financiamiento.</span>
          </div>
        </div>
      </button>
    </Card>
  );
}
