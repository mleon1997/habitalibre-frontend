// src/pages/SimuladorPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  HomeModernIcon,
  MapPinIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

import WizardHL from "../components/WizardHL.jsx";
import { useLeadCapture } from "../context/LeadCaptureContext.jsx";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";
import { getPublicPropertyBySlug } from "../lib/publicPropertiesApi";
import { trackEvent } from "../lib/analytics";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function parseStoredProperty() {
  try {
    const raw = localStorage.getItem("hl_selected_public_property");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function getPropertyImage(property) {
  return (
    property?.imageUrl ||
    property?.imagen ||
    property?.imagenes?.[0] ||
    property?.galeria?.[0] ||
    ""
  );
}

function formatPrice(value, fallback = "") {
  const n = Number(value || 0);

  if (!Number.isFinite(n) || n <= 0) return fallback;

  return `$${n.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

function normalizePercent(value, fallback = 0.1) {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  if (n > 1) return n / 100;
  return n;
}

function getEntradaReferencial(property) {
  const explicit =
    Number(property?.entradaReferencial || 0) ||
    Number(property?.entradaMinima || 0) ||
    Number(property?.entradaRequerida || 0) ||
    Number(property?.financing?.downPaymentAmount || 0);

  if (explicit > 0) return explicit;

  const price = Number(property?.precio || property?.price || 0);
  if (!price) return 0;

  const pct = normalizePercent(
    property?.porcentajeEntrada ||
      property?.porcentajeEntradaRequerida ||
      property?.porcentajeEntradaMinima ||
      property?.downPaymentPercent ||
      property?.financing?.downPaymentPct,
    0.1
  );

  return Math.round(price * pct);
}

function getMesesHastaEntrega(property) {
  const explicit =
    Number(property?.mesesHastaEntrega || 0) ||
    Number(property?.mesesEntrega || 0) ||
    Number(property?.mesesConstruccion || 0) ||
    Number(property?.mesesConstruccionRestantes || 0) ||
    Number(property?.numeroCuotasEntrada || 0) ||
    Number(property?.financing?.monthsConstruction || 0) ||
    Number(property?.financing?.entryInstallmentsCount || 0);

  if (explicit > 0) return explicit;

  const raw = String(
    property?.fechaEntrega || property?.fechaEntregaEstimada || ""
  )
    .toLowerCase()
    .trim();

  if (!raw) return 0;

  const now = new Date();
  const yearMatch = raw.match(/20\d{2}/);
  const year = yearMatch ? Number(yearMatch[0]) : null;

  if (!year) return 0;

  let targetMonth = 11;

  if (raw.includes("1t") || raw.includes("q1") || raw.includes("primer")) {
    targetMonth = 2;
  } else if (raw.includes("2t") || raw.includes("q2") || raw.includes("segundo")) {
    targetMonth = 5;
  } else if (raw.includes("3t") || raw.includes("q3") || raw.includes("tercer")) {
    targetMonth = 8;
  } else if (
    raw.includes("4t") ||
    raw.includes("q4") ||
    raw.includes("cuarto") ||
    raw.includes("4to")
  ) {
    targetMonth = 11;
  }

  const target = new Date(year, targetMonth, 1);
  const months =
    (target.getFullYear() - now.getFullYear()) * 12 +
    (target.getMonth() - now.getMonth());

  return Math.max(months, 0);
}

function isFutureProject(property) {
  const meses = getMesesHastaEntrega(property);
  if (meses > 0) return true;

  const estado = String(
    property?.estadoProyecto ||
      property?.estadoComercial ||
      property?.etapaProyecto ||
      property?.tipoEntrega ||
      property?.tipoVivienda ||
      property?.tipoInmueble ||
      property?.fechaEntrega ||
      property?.fechaEntregaEstimada ||
      ""
  ).toLowerCase();

  return (
    estado.includes("proyecto") ||
    estado.includes("construccion") ||
    estado.includes("construcción") ||
    estado.includes("planos") ||
    estado.includes("por_estrenar") ||
    estado.includes("por estrenar")
  );
}

function SelectedPropertyBanner({ property, onBack }) {
  if (!property) return null;

  const image = getPropertyImage(property);
  const area = property.m2Construccion || property.m2 || property.area || 0;
  const priceLabel = property.precioLabel || formatPrice(property.precio);

  return (
    <div className="mb-5 overflow-hidden rounded-3xl border border-emerald-400/25 bg-emerald-400/[0.04] shadow-[0_18px_60px_rgba(16,185,129,0.08)]">
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-32 sm:h-auto sm:w-40 bg-slate-950/70 border-b sm:border-b-0 sm:border-r border-slate-800 overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={property.titulo || "Propiedad seleccionada"}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <HomeModernIcon className="h-10 w-10 text-emerald-300" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
        </div>

        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-slate-950/40 px-3 py-1 text-[11px] text-emerald-300 mb-2">
                <ShieldCheckIcon className="h-3.5 w-3.5" />
                Simulación para una propiedad específica
              </div>

              <h2 className="text-base md:text-lg font-semibold text-slate-50 leading-snug">
                {property.titulo || property.name || "Propiedad seleccionada"}
              </h2>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-400">
                {[property.sector, property.ciudad].filter(Boolean).length > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <MapPinIcon className="h-3.5 w-3.5 text-emerald-300" />
                    {[property.sector, property.ciudad].filter(Boolean).join(", ")}
                  </span>
                )}

                {priceLabel ? <span>{priceLabel}</span> : null}
                {area ? <span>{area} m²</span> : null}
              </div>
            </div>

            {typeof onBack === "function" ? (
              <button
                type="button"
                onClick={onBack}
                className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-100 transition"
              >
                <ArrowLeftIcon className="h-3.5 w-3.5" />
                Volver
              </button>
            ) : null}
          </div>

          <p className="mt-3 text-[12px] text-slate-400 leading-relaxed">
            Completa el quick win normal de HabitaLibre. Al final podremos
            comparar tu capacidad estimada con el precio de esta propiedad.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SimuladorPage() {
  const nav = useNavigate();
  const { resetLeadCapture, isOpen } = useLeadCapture();
  const { isAuthed } = useCustomerAuth();

  const q = useQuery();

  // ✅ modo explícito por query param (default: quick)
  const mode = (q.get("mode") || "quick").toLowerCase(); // "quick" | "journey"
  const onboarding = q.get("onboarding") === "1";

  // ✅ permite saltarte reglas
  const force = q.get("force") === "1";

  // ✅ CLAVE: si vienes desde /progreso con "Afinar", esto debe ABRIR el wizard
  const afinando = q.get("afinando") === "1";

  // ✅ Contexto opcional de propiedad pública
  const propertyId = q.get("propertyId") || "";
  const propertySlug = q.get("propertySlug") || "";
  const hasPropertyContext = Boolean(propertyId || propertySlug);

  const [selectedProperty, setSelectedProperty] = useState(null);

  useEffect(() => {
    if (!hasPropertyContext) {
      setSelectedProperty(null);
      return;
    }

    let alive = true;

    async function loadSelectedProperty() {
      const stored = parseStoredProperty();

      if (stored?.id || stored?.slug) {
        const sameProperty =
          stored.id === propertyId ||
          stored.slug === propertySlug ||
          stored.slug === propertyId ||
          stored.id === propertySlug;

        if (sameProperty && alive) {
          setSelectedProperty(stored);
        }
      }

      const lookup = propertySlug || propertyId;

      if (!lookup) return;

      try {
        const property = await getPublicPropertyBySlug(lookup);

        if (!alive || !property) return;

  const previousStored = parseStoredProperty();

const entradaReferencial =
  getEntradaReferencial(property) ||
  previousStored?.entradaReferencial ||
  (property.precio ? Math.round(Number(property.precio) * 0.1) : 0);

const mesesHastaEntrega =
  getMesesHastaEntrega(property) ||
  previousStored?.mesesHastaEntrega ||
  0;

const normalized = {
  ...previousStored,

  id: property.id || previousStored?.id,
  slug: property.slug || previousStored?.slug,
  titulo: property.titulo || previousStored?.titulo,
  proyecto: property.proyecto || previousStored?.proyecto,

  precio: property.precio || previousStored?.precio,
  precioLabel:
    property.precioLabel ||
    previousStored?.precioLabel ||
    formatPrice(property.precio || previousStored?.precio),

  ciudad: property.ciudad || previousStored?.ciudad,
  sector: property.sector || previousStored?.sector,

  m2: property.m2Construccion || property.m2 || previousStored?.m2 || 0,
  m2Construccion: property.m2Construccion || previousStored?.m2Construccion,
  dormitorios: property.dormitorios ?? previousStored?.dormitorios ?? null,
  banos: property.banos ?? previousStored?.banos ?? null,
  parqueaderos: property.parqueaderos ?? previousStored?.parqueaderos ?? null,

  imagen: getPropertyImage(property) || previousStored?.imagen || "",
  imageUrl: getPropertyImage(property) || previousStored?.imageUrl || "",

  // ✅ Campos clave para plan de entrada durante obra
  entradaReferencial,
  entradaMinima:
    property.entradaMinima ||
    property.entradaRequerida ||
    previousStored?.entradaMinima ||
    entradaReferencial,

  entradaRequerida:
    property.entradaRequerida ||
    property.entradaMinima ||
    previousStored?.entradaRequerida ||
    entradaReferencial,

  porcentajeEntrada: normalizePercent(
    property.porcentajeEntrada ||
      property.porcentajeEntradaRequerida ||
      property.porcentajeEntradaMinima ||
      property.downPaymentPercent ||
      property?.financing?.downPaymentPct ||
      previousStored?.porcentajeEntrada,
    0.1
  ),

  fechaEntrega:
    property.fechaEntrega ||
    property.fechaEntregaEstimada ||
    previousStored?.fechaEntrega ||
    null,

  mesesHastaEntrega,

  esProyectoEnConstruccion:
    property.esProyectoEnConstruccion === true ||
    previousStored?.esProyectoEnConstruccion === true ||
    isFutureProject(property) ||
    mesesHastaEntrega > 0,

  tipoVivienda:
    property.tipoVivienda ||
    property.tipoInmueble ||
    previousStored?.tipoVivienda ||
    null,

  estadoProyecto:
    property.estadoProyecto ||
    property.estadoComercial ||
    previousStored?.estadoProyecto ||
    null,

  etapaProyecto: property.etapaProyecto || previousStored?.etapaProyecto || null,
  tipoEntrega: property.tipoEntrega || previousStored?.tipoEntrega || null,
};

        setSelectedProperty(normalized);

        try {
          localStorage.setItem(
            "hl_selected_public_property",
            JSON.stringify(normalized)
          );
        } catch {}

        trackEvent("property_context_loaded_in_quickwin", {
          propertyId: property.id,
          propertySlug: property.slug,
          propertyTitle: property.titulo,
          price: property.precio,
          source: "simulador_page",
        });
      } catch (error) {
        console.error("[SimuladorPage] No se pudo cargar propiedad:", error);
      }
    }

    loadSelectedProperty();

    return () => {
      alive = false;
    };
  }, [hasPropertyContext, propertyId, propertySlug]);

  /**
   * ✅ Regla:
   * - journey + authed => normalmente mandamos a /progreso
   * - PERO si afinando=1 => NO redirigir (queremos abrir wizard completo para editar escenario)
   * - force=1 siempre permite ver wizard
   */
  useEffect(() => {
    if (mode === "journey" && isAuthed && !force && !afinando) {
      nav("/progreso", { replace: true });
    }
  }, [mode, isAuthed, force, afinando, nav]);

  const didReset = useRef(false);
  useEffect(() => {
    if (didReset.current) return;
    didReset.current = true;

    // ✅ si el modal está abierto, NO resetees (no lo mates)
    if (isOpen) return;

    /**
     * ✅ IMPORTANTE:
     * - En afinando NO reseteamos lead capture, porque el wizard (journey) debe
     *   auto-hidratar con la info existente (backend/snap) y NO volver al intake.
     * - En el resto de casos, sí reseteamos por modo para evitar mezclar estados.
     */
    if (afinando) return;

    resetLeadCapture(
      hasPropertyContext
        ? `enter_simulador_${mode}_property_context`
        : `enter_simulador_${mode}`
    );
  }, [resetLeadCapture, isOpen, mode, afinando, hasPropertyContext]);

  const handleBackToProperty = () => {
    const slug = selectedProperty?.slug || propertySlug || propertyId;

    if (slug) {
      nav(`/propiedades/${slug}`);
      return;
    }

    nav("/propiedades");
  };

  return (
    <div
      className={[
        "min-h-[100dvh] bg-slate-950",
        "flex items-start justify-center",
        "md:items-center",
        "px-4 py-8 md:py-10",
        "pb-[calc(env(safe-area-inset-bottom,0px)+32px)]",
      ].join(" ")}
    >
      <div className="w-full max-w-3xl">
        {hasPropertyContext && (
          <SelectedPropertyBanner
            property={selectedProperty}
            onBack={handleBackToProperty}
          />
        )}

        <div
          className={[
            "w-full",
            "bg-slate-900/60 rounded-3xl",
            "shadow-[0_24px_80px_rgba(15,23,42,0.9)]",
            "border border-slate-800/80",
            "px-5 py-6 md:px-8 md:py-8",
            "overflow-hidden",
          ].join(" ")}
        >
          {/* ✅ Pasamos contexto sin romper WizardHL.
              Si WizardHL todavía no usa estas props, no pasa nada. */}
          <WizardHL
            mode={mode}
            onboarding={onboarding}
            afinando={afinando}
            propertyContext={selectedProperty}
            propertyId={propertyId}
            propertySlug={propertySlug}
          />
        </div>
      </div>
    </div>
  );
}