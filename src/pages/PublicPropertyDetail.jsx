// src/pages/PublicPropertyDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BanknotesIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  CheckCircleIcon,
  HomeModernIcon,
  MapPinIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

import { getPublicPropertyBySlug } from "../lib/publicPropertiesApi";
import { trackEvent, trackPageView } from "../lib/analytics";
import SEO from "../components/SEO.jsx";
import { SITE_URL } from "../seo/seoConfig.js";



function getPropertyImage(property) {
  return (
    property?.imageUrl ||
    property?.imagen ||
    property?.imagenes?.[0] ||
    property?.galeria?.[0] ||
    ""
  );
}

function getGallery(property) {
  const images = [
    property?.imageUrl,
    property?.imagen,
    ...(property?.imagenes || []),
    ...(property?.galeria || []),
  ].filter(Boolean);

  return [...new Set(images)];
}

function getArea(property) {
  return property?.m2Construccion || property?.m2 || 0;
}

function formatMoney(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n) || n <= 0) return "—";
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function normalizePercent(value, fallback = 0.1) {
  const n = Number(value || 0);

  if (!Number.isFinite(n) || n <= 0) return fallback;

  // Si viene 10, lo convertimos a 0.10
  if (n > 1) return n / 100;

  return n;
}

function getEntradaReferencial(property) {
  const explicit =
    Number(property?.entradaMinima || 0) ||
    Number(property?.entradaRequerida || 0) ||
    Number(property?.entradaReferencial || 0);

  if (explicit > 0) return explicit;

  const price = Number(property?.precio || 0);
  if (!price) return 0;

  const pct = normalizePercent(
    property?.porcentajeEntrada ||
      property?.porcentajeEntradaMinima ||
      property?.downPaymentPercent,
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
  property?.fechaEntrega ||
    property?.fechaEntregaEstimada ||
    ""
).toLowerCase().trim();
  if (!raw) return 0;

  const now = new Date();

  const yearMatch = raw.match(/20\d{2}/);
  const year = yearMatch ? Number(yearMatch[0]) : null;

  if (!year) return 0;

  let targetMonth = 11; // diciembre por default

  if (raw.includes("1t") || raw.includes("q1") || raw.includes("primer")) {
    targetMonth = 2; // marzo
  } else if (raw.includes("2t") || raw.includes("q2") || raw.includes("segundo")) {
    targetMonth = 5; // junio
  } else if (raw.includes("3t") || raw.includes("q3") || raw.includes("tercer")) {
    targetMonth = 8; // septiembre
  } else if (
    raw.includes("4t") ||
    raw.includes("q4") ||
    raw.includes("cuarto") ||
    raw.includes("4to")
  ) {
    targetMonth = 11; // diciembre
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
      property?.tipoVivienda ||
      property?.tipoInmueble ||
      ""
  ).toLowerCase();

  return (
    estado.includes("proyecto") ||
    estado.includes("construccion") ||
    estado.includes("construcción") ||
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
    .slice(0, 4);
}

function cleanText(value = "", maxLength = 155) {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "";

  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength - 1).trim()}…`;
}

function getPropertySEOTitle(property) {
  if (!property) {
    return "Propiedad en HabitaLibre | Simula tu crédito hipotecario";
  }

  if (property.seoTitle) return property.seoTitle;

  const price = property.precioLabel || formatMoney(property.precio);
  const location = [property.sector, property.ciudad].filter(Boolean).join(", ");

  return cleanText(
    `${property.titulo || "Propiedad"}${location ? ` en ${location}` : ""}${
      price && price !== "—" ? ` desde ${price}` : ""
    } | HabitaLibre`,
    62
  );
}

function getPropertySEODescription(property) {
  if (!property) {
    return "Explora propiedades reales en HabitaLibre y simula si están dentro de tu capacidad de compra.";
  }

  if (property.seoDescription) {
    return cleanText(property.seoDescription, 155);
  }

  const price = property.precioLabel || formatMoney(property.precio);
  const location = [property.sector, property.ciudad].filter(Boolean).join(", ");
  const credits = getCreditLabels(property).join(", ");

  return cleanText(
    `Explora ${property.titulo || "esta propiedad"}${
      location ? ` en ${location}` : ""
    }${price && price !== "—" ? ` desde ${price}` : ""}. Simula si calificas con rutas ${credits} usando HabitaLibre.`,
    155
  );
}

function getPropertySchema(property) {
  if (!property) return null;

  const image = getPropertyImage(property);
  const location = [property.sector, property.ciudad].filter(Boolean).join(", ");
  const price = Number(property.precio || 0);

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.titulo || "Propiedad HabitaLibre",
    description:
      property.publicDescription ||
      property.descripcion ||
      getPropertySEODescription(property),
    url: `${SITE_URL}/#/propiedades/${property.slug || ""}`,
    image: image || undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: property.ciudad || undefined,
      addressRegion: property.sector || undefined,
      addressCountry: "EC",
    },
    offers:
      price > 0
        ? {
            "@type": "Offer",
            price,
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          }
        : undefined,
    floorSize: getArea(property)
      ? {
          "@type": "QuantitativeValue",
          value: getArea(property),
          unitCode: "MTK",
        }
      : undefined,
  };
}

function getBreadcrumbSchema(property) {
  if (!property) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Propiedades",
        item: `${SITE_URL}/#/propiedades`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: property.titulo || "Propiedad",
        item: `${SITE_URL}/#/propiedades/${property.slug || ""}`,
      },
    ],
  };
}

function PropertyHeroImage({ property }) {
  const image = getPropertyImage(property);
  const [hasError, setHasError] = useState(false);

  if (!image || hasError) {
    return (
      <div className="relative h-[320px] md:h-[440px] rounded-3xl overflow-hidden border border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.22),transparent_50%)]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-24 w-24 rounded-3xl border border-emerald-400/40 bg-slate-950/70 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.22)]">
            <BuildingOffice2Icon className="h-12 w-12 text-emerald-300" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[320px] md:h-[440px] rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-[0_28px_80px_rgba(15,23,42,0.85)]">
      <img
        src={image}
        alt={property?.titulo || "Propiedad HabitaLibre"}
        className="h-full w-full object-cover"
        loading="eager"
        onError={() => setHasError(true)}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />

      <div className="absolute left-5 bottom-5 right-5">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/80 border border-emerald-400/40 px-3 py-1 text-[11px] text-emerald-300 backdrop-blur">
          <HomeModernIcon className="h-3.5 w-3.5" />
          {property?.estadoProyecto || property?.estadoComercial || "Disponible"}
        </div>
      </div>
    </div>
  );
}

export default function PublicPropertyDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadProperty() {
      try {
        setLoading(true);
        setLoadError("");

        const data = await getPublicPropertyBySlug(slug);

        if (!alive) return;

        setProperty(data);

        trackPageView("public_property_detail", {
          propertyId: data?.id,
          propertySlug: data?.slug,
          propertyTitle: data?.titulo,
          project: data?.proyecto,
        });

      } catch (error) {
        console.error("[PublicPropertyDetail] Error:", error);

        if (!alive) return;

        setLoadError("No pudimos cargar esta propiedad.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadProperty();

    return () => {
      alive = false;
    };
  }, [slug]);

  const gallery = useMemo(() => getGallery(property), [property]);
  const credits = useMemo(() => getCreditLabels(property), [property]);
  const area = useMemo(() => getArea(property), [property]);

const seoTitle = useMemo(() => getPropertySEOTitle(property), [property]);
const seoDescription = useMemo(
  () => getPropertySEODescription(property),
  [property]
);
const seoImage = useMemo(() => getPropertyImage(property), [property]);
const propertySchema = useMemo(() => getPropertySchema(property), [property]);
const breadcrumbSchema = useMemo(() => getBreadcrumbSchema(property), [property]);


  const handleStartForProperty = (source = "public_property_detail") => {
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

  // ✅ Datos para property-fit sostenible
  entradaReferencial: getEntradaReferencial(property),
  entradaMinima: property.entradaMinima || property.entradaRequerida || null,
  entradaRequerida: property.entradaRequerida || property.entradaMinima || null,
  porcentajeEntrada: normalizePercent(
    property.porcentajeEntrada ||
      property.porcentajeEntradaMinima ||
      property.downPaymentPercent,
    0.1
  ),
  fechaEntrega: property.fechaEntrega || null,
  mesesHastaEntrega: getMesesHastaEntrega(property),
  esProyectoEnConstruccion: isFutureProject(property),
  tipoVivienda: property.tipoVivienda || property.tipoInmueble || null,
  estadoProyecto: property.estadoProyecto || property.estadoComercial || null,
})
      );
    } catch {}

  const params = new URLSearchParams({
  propertyId: property.id,
  propertySlug: property.slug || property.id,
  propertySource: "public_property_detail",
});

navigate(`/precalificar?${params.toString()}`);
  };

if (loading) {
 return (
  <>
    <SEO
      title={seoTitle}
      description={seoDescription}
      image={seoImage}
      schema={[propertySchema, breadcrumbSchema]}
      disableCanonical
    />

    <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="h-6 w-36 rounded bg-slate-800 animate-pulse mb-8" />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="h-[420px] rounded-3xl bg-slate-900 border border-slate-800 animate-pulse" />
            <div className="space-y-4">
              <div className="h-10 w-3/4 rounded bg-slate-800 animate-pulse" />
              <div className="h-5 w-1/2 rounded bg-slate-800 animate-pulse" />
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-20 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
  </>
);
  }
if (loadError || !property) {
  return (
    <>
      <SEO
        title="Propiedad no encontrada | HabitaLibre"
        description="No encontramos esta propiedad. Explora otras viviendas disponibles en HabitaLibre."
        noindex
        disableCanonical
      />

      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <SparklesIcon className="mx-auto h-9 w-9 text-emerald-300 mb-4" />

          <h1 className="text-2xl font-semibold text-slate-50 mb-2">
            No encontramos esta propiedad
          </h1>

          <p className="text-sm text-slate-400 mb-6">
            Puede que ya no esté disponible o que el enlace haya cambiado.
          </p>

          <button
            type="button"
            onClick={() => navigate("/propiedades")}
            className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300 transition"
          >
            Ver propiedades disponibles
          </button>
        </div>
      </main>
    </>
  );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <section className="border-b border-slate-800 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),transparent_55%),radial-gradient(circle_at_bottom,_rgba(37,99,235,0.18),transparent_60%)]">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
          <button
            type="button"
            onClick={() => navigate("/propiedades")}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100 transition mb-7"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Volver a propiedades
          </button>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center">
            <PropertyHeroImage property={property} />

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-[11px] text-slate-300 mb-4">
                <HomeModernIcon className="h-3.5 w-3.5 text-emerald-400" />
                <span>{property.proyecto || "Propiedad HabitaLibre"}</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-50 mb-4">
                {property.titulo}
              </h1>

              <div className="flex flex-wrap gap-3 text-sm text-slate-300 mb-5">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1.5">
                  <MapPinIcon className="h-4 w-4 text-emerald-300" />
                  {[property.sector, property.ciudad].filter(Boolean).join(", ")}
                </div>

                {property.fechaEntrega ? (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1.5">
                    <CalendarDaysIcon className="h-4 w-4 text-sky-300" />
                    Entrega {property.fechaEntrega}
                  </div>
                ) : null}

                <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1.5">
                  <BanknotesIcon className="h-4 w-4 text-emerald-300" />
                  {property.precioLabel || formatMoney(property.precio)}
                </div>
              </div>

              <p className="text-sm md:text-base text-slate-400 mb-6 leading-relaxed">
                {property.publicDescription ||
                  property.descripcion ||
                  "Explora esta propiedad y descubre si está dentro de tu capacidad estimada con HabitaLibre."}
              </p>

              <div className="grid grid-cols-4 gap-2 mb-6 text-center text-[11px]">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-2 py-3">
                  <p className="text-slate-500">Área</p>
                  <p className="font-semibold text-slate-100">
                    {area ? `${area} m²` : "—"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-2 py-3">
                  <p className="text-slate-500">Dorm.</p>
                  <p className="font-semibold text-slate-100">
                    {property.tipoInmueble === "estudio"
                      ? "Est."
                      : property.dormitorios ?? "—"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-2 py-3">
                  <p className="text-slate-500">Baños</p>
                  <p className="font-semibold text-slate-100">
                    {property.banos ?? "—"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-2 py-3">
                  <p className="text-slate-500">Parq.</p>
                  <p className="font-semibold text-slate-100">
                    {property.parqueaderos ?? "—"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleStartForProperty("public_property_detail_primary")
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-300 transition shadow-[0_16px_40px_rgba(16,185,129,0.28)]"
                >
                  Ver si califico para esta propiedad
                  <ArrowRightIcon className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/precalificar")}
                  className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 hover:border-slate-400 hover:text-white transition"
                >
                  Simular sin elegir propiedad
                </button>
              </div>

              <p className="mt-3 text-[11px] text-slate-500">
                La compatibilidad real se calcula después con tus ingresos,
                deudas, entrada disponible y requisitos de cada entidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {gallery.length > 1 && (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid gap-3 md:grid-cols-3">
            {gallery.slice(0, 3).map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="h-48 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900"
              >
                <img
                  src={image}
                  alt={`${property.titulo} imagen ${index + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <aside className="space-y-5">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="text-lg font-semibold text-slate-50 mb-4">
                Resumen comercial
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-4">
                  <span className="text-slate-400">Proyecto</span>
                  <span className="font-semibold text-slate-100 text-right">
                    {property.proyecto || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-4">
                  <span className="text-slate-400">Promotor</span>
                  <span className="font-semibold text-slate-100 text-right">
                    {property.promotor ||
                      property.constructora ||
                      property.developer ||
                      "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-4">
                  <span className="text-slate-400">Tipo</span>
                  <span className="font-semibold text-slate-100 text-right">
                    {property.tipoPropiedad || property.tipoInmueble || "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-4">
                  <span className="text-slate-400">Precio</span>
                  <span className="font-semibold text-slate-100 text-right">
                    {property.precioLabel || formatMoney(property.precio)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-4">
                  <span className="text-slate-400">Entrada referencial</span>
                  <span className="font-semibold text-slate-100 text-right">
                    {formatMoney(property.entradaMinima || property.entradaRequerida)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-400">Rutas posibles</span>
                  <span className="font-semibold text-emerald-300 text-right">
                    {credits.join(" / ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-400/25 bg-emerald-400/5 p-5">
              <div className="flex items-start gap-3">
                <ShieldCheckIcon className="h-5 w-5 text-emerald-300 shrink-0 mt-0.5" />

                <div>
                  <h3 className="font-semibold text-emerald-300 mb-1">
                    Vista pública vs. match personalizado
                  </h3>

                  <p className="text-[12px] text-slate-300 leading-relaxed">
                    Esta vista muestra la información comercial de la propiedad.
                    Para saber si te alcanza, qué cuota podrías pagar y qué ruta
                    hipotecaria te conviene, debes completar la precalificación
                    HabitaLibre.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-50 mb-4">
                Lo más relevante
              </h2>

              <div className="grid gap-3">
                <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-300">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-300 shrink-0 mt-0.5" />
                  <p>
                    Propiedad disponible públicamente en HabitaLibre para
                    exploración inicial.
                  </p>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-300">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-300 shrink-0 mt-0.5" />
                  <p>
                    Precio referencial de{" "}
                    <span className="font-semibold text-slate-100">
                      {property.precioLabel || formatMoney(property.precio)}
                    </span>{" "}
                    con entrada estimada de{" "}
                    <span className="font-semibold text-slate-100">
                      {formatMoney(property.entradaMinima || property.entradaRequerida)}
                    </span>
                    .
                  </p>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-300">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-300 shrink-0 mt-0.5" />
                  <p>
                    Rutas de crédito potenciales:{" "}
                    <span className="font-semibold text-emerald-300">
                      {credits.join(" / ")}
                    </span>
                    . La viabilidad real depende de tu perfil.
                  </p>
                </div>

                {property.fechaEntrega ? (
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-300">
                    <CheckCircleIcon className="h-5 w-5 text-emerald-300 shrink-0 mt-0.5" />
                    <p>
                      Entrega estimada:{" "}
                      <span className="font-semibold text-slate-100">
                        {property.fechaEntrega}
                      </span>
                      .
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            {(property.amenidades?.length > 0 || property.amenities?.length > 0) && (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                <h2 className="text-xl font-semibold text-slate-50 mb-4">
                  Amenidades
                </h2>

                <div className="flex flex-wrap gap-2">
                  {(property.amenidades || property.amenities || []).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-700 bg-slate-950/50 px-3 py-1.5 text-[12px] text-slate-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(property.cercaDe?.length > 0 || property.nearby?.length > 0) && (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
                <h2 className="text-xl font-semibold text-slate-50 mb-4">
                  Cerca de
                </h2>

                <div className="flex flex-wrap gap-2">
                  {(property.cercaDe || property.nearby || []).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-slate-700 bg-slate-950/50 px-3 py-1.5 text-[12px] text-slate-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 flex items-center justify-center shrink-0">
                  <SparklesIcon className="h-5 w-5 text-emerald-300" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-50 mb-1">
                    ¿Quieres saber si esta propiedad está a tu alcance?
                  </h2>

                  <p className="text-sm text-slate-400 mb-4">
                    HabitaLibre calcula tu capacidad estimada de compra y te
                    muestra si esta propiedad encaja con tu realidad financiera.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      handleStartForProperty("public_property_detail_bottom")
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-blue-400 transition"
                  >
                    Precalificarme ahora
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center text-[11px] text-slate-500 leading-relaxed">
              HabitaLibre no es banco, cooperativa ni prestamista. La
              precalificación es referencial y no constituye aprobación de
              crédito. La aprobación final depende de cada entidad financiera.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}