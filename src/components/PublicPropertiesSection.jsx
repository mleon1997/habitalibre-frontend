// src/components/PublicPropertiesSection.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRightIcon,
  BuildingOffice2Icon,
  HomeModernIcon,
  MapPinIcon,
  SparklesIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

import { getFeaturedPublicProperties } from "../lib/publicPropertiesApi";
import { trackEvent } from "../lib/analytics";

function getPropertyImage(property) {
  return (
    property?.imageUrl ||
    property?.imagen ||
    property?.imagenes?.[0] ||
    property?.galeria?.[0] ||
    ""
  );
}

function getArea(property) {
  return property?.m2Construccion || property?.m2 || 0;
}

function normalizePercent(value, fallback = 0.1) {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  if (n > 1) return n / 100;
  return n;
}

function getEntradaReferencial(property) {
  const explicit =
    Number(property?.entradaMinima || 0) ||
    Number(property?.entradaRequerida || 0) ||
    Number(property?.entradaReferencial || 0) ||
    Number(property?.financing?.downPaymentAmount || 0);

  if (explicit > 0) return explicit;

  const price = Number(property?.precio || 0);
  if (!price) return 0;

  const pct = normalizePercent(
    property?.porcentajeEntrada ||
      property?.porcentajeEntradaRequerida ||
      property?.porcentajeEntradaMinima ||
      property?.financing?.downPaymentPct,
    0.1
  );

  return Math.round(price * pct);
}

function getMesesHastaEntrega(property) {
  const explicit =
    Number(property?.mesesHastaEntrega || 0) ||
    Number(property?.mesesConstruccionRestantes || 0) ||
    Number(property?.mesesConstruccion || 0) ||
    Number(property?.mesesEntrega || 0) ||
    Number(property?.numeroCuotasEntrada || 0) ||
    Number(property?.financing?.monthsConstruction || 0) ||
    Number(property?.financing?.entryInstallmentsCount || 0);

  if (explicit > 0) return explicit;

  const raw = String(property?.fechaEntrega || "").toLowerCase().trim();
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

function getCreditLabels(property) {
  const ids = property?.mortgageProfile?.productIds || [];

  if (!Array.isArray(ids) || ids.length === 0) {
    return ["VIS", "VIP", "BIESS"];
  }

  return ids
    .map((id) => {
      const value = String(id || "").toUpperCase();

      if (value === "PRIVATE") return "Banca privada";
      if (value === "BIESS") return "BIESS";
      if (value === "VIS") return "VIS";
      if (value === "VIP") return "VIP";

      return value;
    })
    .slice(0, 3);
}

function PropertyImage({ property }) {
  const image = getPropertyImage(property);
  const [hasError, setHasError] = useState(false);

  if (!image || hasError) {
    return (
      <div className="relative h-44 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.22),transparent_50%)] border-b border-slate-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-20 w-20 rounded-3xl border border-emerald-400/40 bg-slate-950/70 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.22)]">
            <BuildingOffice2Icon className="h-10 w-10 text-emerald-300" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-44 overflow-hidden border-b border-slate-800 bg-slate-900">
      <img
        src={image}
        alt={property?.titulo || "Propiedad HabitaLibre"}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        loading="lazy"
        onError={() => setHasError(true)}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />
    </div>
  );
}

export default function PublicPropertiesSection() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadProperties() {
      try {
        setLoading(true);
        setLoadError("");

        const data = await getFeaturedPublicProperties(3);

        if (!alive) return;

        setProperties(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("[PublicPropertiesSection] Error:", error);

        if (!alive) return;

        setLoadError("No pudimos cargar las propiedades por ahora.");
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    loadProperties();

    return () => {
      alive = false;
    };
  }, []);

  const hasProperties = useMemo(() => properties.length > 0, [properties]);

  const handleStartForProperty = (property, source = "landing_property_card") => {
    if (!property) return;

    trackEvent("cta_property_precalificar_click", {
      source,
      propertyId: property.id,
      propertySlug: property.slug,
      propertyTitle: property.titulo,
      price: property.precio,
      city: property.ciudad,
      sector: property.sector,
      project: property.proyecto,
    });

    try {
      localStorage.setItem("hl_entry_mode", "quick");

      localStorage.setItem(
        "hl_selected_public_property",
JSON.stringify({
  id: property.id,
  slug: property.slug,
  titulo: property.titulo,
  proyecto: property.proyecto,
  precio: property.precio,
  precioLabel: property.precioLabel,
  ciudad: property.ciudad,
  sector: property.sector,
  m2: property.m2Construccion || property.m2 || 0,
  dormitorios: property.dormitorios,
  banos: property.banos,
  parqueaderos: property.parqueaderos,
  imagen: getPropertyImage(property),

  // ✅ Datos para plan de entrada durante obra
  entradaReferencial: getEntradaReferencial(property),
  entradaMinima:
    property.entradaMinima ||
    property.entradaRequerida ||
    getEntradaReferencial(property),
  entradaRequerida:
    property.entradaRequerida ||
    property.entradaMinima ||
    getEntradaReferencial(property),
  porcentajeEntrada: normalizePercent(
    property.porcentajeEntrada ||
      property.porcentajeEntradaRequerida ||
      property.porcentajeEntradaMinima ||
      property?.financing?.downPaymentPct,
    0.1
  ),
  fechaEntrega: property.fechaEntrega || property.fechaEntregaEstimada || null,
  mesesHastaEntrega: getMesesHastaEntrega(property),
  esProyectoEnConstruccion: isFutureProject(property),
  tipoVivienda: property.tipoVivienda || property.tipoInmueble || null,
  estadoProyecto: property.estadoProyecto || property.estadoComercial || null,
  etapaProyecto: property.etapaProyecto || null,
  tipoEntrega: property.tipoEntrega || null,
})
      );
    } catch {}
const params = new URLSearchParams({
  propertyId: property.id,
  propertySlug: property.slug || property.id,
  propertySource: source,
});

    navigate(`/precalificar?${params.toString()}`);
  };

  if (!loading && !loadError && !hasProperties) {
    return null;
  }

  return (
    <section
      id="propiedades-destacadas"
      className="border-t border-slate-800 bg-slate-950 scroll-mt-20"
    >
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-[11px] text-slate-300 mb-3">
              <HomeModernIcon className="h-3.5 w-3.5 text-emerald-400" />
              <span>Propiedades reales · Match hipotecario después</span>
            </div>

            <h2 className="text-xl md:text-2xl font-semibold text-slate-50">
              Explora viviendas y descubre si están a tu alcance
            </h2>

            <p className="mt-2 text-sm text-slate-400 max-w-xl">
              Mira propiedades reales y luego precalifícate en 2 minutos para
              saber si tu perfil actual puede avanzar con VIS, VIP, BIESS o
              banca privada.
            </p>
          </div>

          <Link
            to="/propiedades"
            onClick={() =>
              trackEvent("cta_ver_todas_propiedades_click", {
                source: "landing_properties_section",
              })
            }
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-emerald-400 hover:text-emerald-300 transition"
          >
            Ver todas
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        {loading && (
          <div className="grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[430px] rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden animate-pulse"
              >
                <div className="h-44 bg-slate-800/70" />
                <div className="p-5 space-y-4">
                  <div className="h-5 w-2/3 rounded bg-slate-800" />
                  <div className="h-4 w-1/2 rounded bg-slate-800" />
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((box) => (
                      <div key={box} className="h-12 rounded-2xl bg-slate-800" />
                    ))}
                  </div>
                  <div className="h-10 rounded-full bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && loadError && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-300">
            {loadError}
          </div>
        )}

        {!loading && !loadError && hasProperties && (
          <div className="grid gap-5 md:grid-cols-3">
            {properties.map((property) => {
              const area = getArea(property);
              const credits = getCreditLabels(property);

              return (
                <article
                  key={property.id || property._id}
                  className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-[0_24px_60px_rgba(15,23,42,0.55)] hover:border-emerald-400/50 transition"
                >
                  <div className="relative">
                    <PropertyImage property={property} />

                    <div className="absolute top-4 left-4 rounded-full bg-slate-950/75 border border-emerald-400/40 px-3 py-1 text-[11px] text-emerald-300 backdrop-blur">
                      {property.estadoProyecto || property.estadoComercial || "Disponible"}
                    </div>

                    <div className="absolute top-4 right-4 rounded-full bg-blue-500/15 border border-blue-400/40 px-3 py-1 text-[11px] text-blue-100 backdrop-blur">
                      {credits.join(" / ")}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 mb-1">
                          {property.proyecto || "Proyecto"}
                        </p>

                        <h3 className="text-base md:text-lg font-semibold text-slate-50 leading-snug line-clamp-2">
                          {property.titulo}
                        </h3>

                        <div className="mt-1 flex items-center gap-1.5 text-[12px] text-slate-400">
                          <MapPinIcon className="h-4 w-4 text-emerald-300 shrink-0" />
                          <span className="truncate">
                            {[property.sector, property.ciudad].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[11px] text-slate-500">Precio</p>
                        <p className="text-base md:text-lg font-bold text-slate-50">
                          {property.precioLabel || `$${Number(property.precio || 0).toLocaleString("en-US")}`}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                      {property.publicDescription ||
                        property.descripcion ||
                        "Explora esta propiedad y descubre si está dentro de tu capacidad estimada."}
                    </p>

                    <div className="grid grid-cols-4 gap-2 mb-5 text-center text-[11px]">
                      <div className="rounded-2xl border border-slate-800 bg-slate-950/50 px-2 py-2">
                        <p className="text-slate-500">Área</p>
                        <p className="font-semibold text-slate-100">
                          {area ? `${area} m²` : "—"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-950/50 px-2 py-2">
                        <p className="text-slate-500">Dorm.</p>
                        <p className="font-semibold text-slate-100">
                          {property.tipoInmueble === "estudio"
                            ? "Est."
                            : property.dormitorios ?? "—"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-950/50 px-2 py-2">
                        <p className="text-slate-500">Baños</p>
                        <p className="font-semibold text-slate-100">
                          {property.banos ?? "—"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-800 bg-slate-950/50 px-2 py-2">
                        <p className="text-slate-500">Parq.</p>
                        <p className="font-semibold text-slate-100">
                          {property.parqueaderos ?? "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Link
                        to={`/propiedades/${property.slug || property.id}`}
                        onClick={() =>
                          trackEvent("cta_property_detail_click", {
                            source: "landing_property_card",
                            propertyId: property.id,
                            propertySlug: property.slug,
                          })
                        }
                        className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:border-slate-400 hover:text-white transition"
                      >
                        Ver propiedad
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          handleStartForProperty(property, "landing_property_card")
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300 transition"
                      >
                        Ver si califico
                        <ArrowRightIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-start gap-2 rounded-2xl border border-slate-800 bg-slate-950/40 p-3 text-[11px] text-slate-400">
                      <SparklesIcon className="h-4 w-4 text-emerald-300 mt-0.5 shrink-0" />
                      <p>
                        La compatibilidad real depende de tus ingresos, deudas,
                        entrada disponible y requisitos de cada producto financiero.
                      </p>
                    </div>

                    {property.entradaMinima ? (
                      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                        <BanknotesIcon className="h-4 w-4 text-slate-500" />
                        Entrada referencial:{" "}
                        <span className="text-slate-300 font-semibold">
                          ${Number(property.entradaMinima || 0).toLocaleString("en-US")}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}