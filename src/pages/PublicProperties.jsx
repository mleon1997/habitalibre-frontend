// src/pages/PublicProperties.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BuildingOffice2Icon,
  FunnelIcon,
  HomeModernIcon,
  MapPinIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

import { getPublicProperties } from "../lib/publicPropertiesApi";
import { trackEvent, trackPageView } from "../lib/analytics";
import SEO from "../components/SEO.jsx";
import { SITE_URL } from "../seo/seoConfig.js";

function toTitleCase(value = "") {
  return String(value || "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();

      if (["de", "del", "la", "el", "los", "las"].includes(lower)) {
        return lower;
      }

      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function getGeoPath(ciudadParam, sectorParam) {
  if (ciudadParam && sectorParam) {
    return `/propiedades/ciudad/${ciudadParam}/${sectorParam}`;
  }

  if (ciudadParam) {
    return `/propiedades/ciudad/${ciudadParam}`;
  }

  return "/propiedades";
}

function getGeoSEO({ ciudadLabel, sectorLabel }) {
  if (ciudadLabel && sectorLabel) {
    return {
      title: `Propiedades en venta en ${sectorLabel}, ${ciudadLabel} | HabitaLibre`,
      description: `Explora casas y departamentos en venta en ${sectorLabel}, ${ciudadLabel}, y simula si puedes comprarlos según tu ingreso, entrada, deudas y rutas hipotecarias.`,
      heading: `Propiedades en ${sectorLabel}, ${ciudadLabel}`,
      intro: `Mira viviendas disponibles en ${sectorLabel}, ${ciudadLabel}. Para saber si una propiedad está realmente a tu alcance, precalifícate en 2 minutos.`,
    };
  }

  if (ciudadLabel) {
    return {
      title: `Propiedades en venta en ${ciudadLabel} | Casas y departamentos`,
      description: `Explora casas y departamentos en venta en ${ciudadLabel} y simula si están dentro de tu capacidad de compra con rutas VIS, VIP, BIESS o banca privada.`,
      heading: `Propiedades en venta en ${ciudadLabel}`,
      intro: `Explora viviendas reales disponibles en ${ciudadLabel}. Luego simula tu capacidad de compra para saber qué propiedades podrían encajar con tu perfil.`,
    };
  }

  return {
    title: "Propiedades en venta para comprar con crédito hipotecario | HabitaLibre",
    description:
      "Explora casas y departamentos disponibles y simula si puedes comprarlos según tu ingreso, entrada, deudas y rutas VIS, VIP, BIESS o banca privada.",
    heading: "Explora propiedades antes de precalificar",
    intro:
      "Mira viviendas reales disponibles en HabitaLibre. Para saber si una propiedad está realmente a tu alcance, precalifícate en 2 minutos y activamos tu match personalizado.",
  };
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

function getArea(property) {
  return property?.m2Construccion || property?.m2 || 0;
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

function cleanText(value = "", maxLength = 155) {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "";

  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength - 1).trim()}…`;
}

function getPropertiesPageSchema(properties = [], seo = {}, path = "/propiedades") {
  const visibleProperties = Array.isArray(properties) ? properties.slice(0, 20) : [];

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: seo.title || "Propiedades en venta | HabitaLibre",
    description:
      seo.description ||
      "Explora propiedades reales disponibles en HabitaLibre y simula si están dentro de tu capacidad de compra.",
    url: `${SITE_URL}${path}`,
    inLanguage: "es-EC",
    isPartOf: {
      "@type": "WebSite",
      name: "HabitaLibre",
      url: SITE_URL,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: visibleProperties.length,
      itemListElement: visibleProperties.map((property, index) => {
        const location = [property?.sector, property?.ciudad]
          .filter(Boolean)
          .join(", ");

        return {
          "@type": "ListItem",
          position: index + 1,
          url: `${SITE_URL}/propiedades/${property?.slug || property?.id || ""}`,
          name: property?.titulo || `Propiedad ${index + 1}`,
          description: cleanText(
            property?.publicDescription ||
              property?.descripcion ||
              `${property?.titulo || "Propiedad"}${location ? ` en ${location}` : ""}`,
            120
          ),
        };
      }),
    },
  };
}

function getPropertiesBreadcrumbSchema({ ciudadLabel, sectorLabel, path }) {
  const items = [
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
      item: `${SITE_URL}/propiedades`,
    },
  ];

  if (ciudadLabel) {
    items.push({
      "@type": "ListItem",
      position: 3,
      name: ciudadLabel,
      item: `${SITE_URL}${sectorLabel ? `/propiedades/ciudad/${String(ciudadLabel).toLowerCase().replaceAll(" ", "-")}` : path}`,
    });
  }

  if (sectorLabel) {
    items.push({
      "@type": "ListItem",
      position: 4,
      name: sectorLabel,
      item: `${SITE_URL}${path}`,
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

function PropertyImage({ property }) {
  const image = getPropertyImage(property);
  const [hasError, setHasError] = useState(false);

  if (!image || hasError) {
    return (
      <div className="relative h-52 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.22),transparent_50%)] border-b border-slate-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-20 w-20 rounded-3xl border border-emerald-400/40 bg-slate-950/70 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.22)]">
            <BuildingOffice2Icon className="h-10 w-10 text-emerald-300" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-52 overflow-hidden border-b border-slate-800 bg-slate-900">
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

export default function PublicProperties() {
  const navigate = useNavigate();

  const { ciudad: ciudadParam, sector: sectorParam } = useParams();

const ciudadLabel = useMemo(() => toTitleCase(ciudadParam), [ciudadParam]);
const sectorLabel = useMemo(() => toTitleCase(sectorParam), [sectorParam]);

const geoPath = useMemo(
  () => getGeoPath(ciudadParam, sectorParam),
  [ciudadParam, sectorParam]
);

const seo = useMemo(
  () => getGeoSEO({ ciudadLabel, sectorLabel }),
  [ciudadLabel, sectorLabel]
);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

const [filters, setFilters] = useState({
  ciudad: ciudadLabel || "",
  sector: sectorLabel || "",
  maxPrecio: "",
});

useEffect(() => {
  setFilters((prev) => ({
    ...prev,
    ciudad: ciudadLabel || "",
    sector: sectorLabel || "",
  }));
}, [ciudadLabel, sectorLabel]);

  useEffect(() => {
    trackPageView("public_properties");
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadProperties() {
      try {
        setLoading(true);
        setLoadError("");

        const data = await getPublicProperties({
          limit: 50,
          filters: {
            ciudad: filters.ciudad,
            sector: filters.sector,
            maxPrecio: filters.maxPrecio,
          },
        });

        if (!alive) return;

        setProperties(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("[PublicProperties] Error:", error);

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
  }, [filters.ciudad, filters.sector, filters.maxPrecio]);

  const totalLabel = useMemo(() => {
    if (loading) return "Cargando propiedades...";
    if (properties.length === 1) return "1 propiedad disponible";
    return `${properties.length} propiedades disponibles`;
  }, [loading, properties.length]);

const propertiesPageSchema = useMemo(
  () => getPropertiesPageSchema(properties, seo, geoPath),
  [properties, seo, geoPath]
);

const breadcrumbSchema = useMemo(
  () =>
    getPropertiesBreadcrumbSchema({
      ciudadLabel,
      sectorLabel,
      path: geoPath,
    }),
  [ciudadLabel, sectorLabel, geoPath]
);

  const handleStartForProperty = (property, source = "public_properties_page") => {
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
        })
      );
    } catch {}

    const params = new URLSearchParams({
      propertyId: property.id,
      propertySlug: property.slug || property.id,
    });

    navigate(`/precalificar?${params.toString()}`);
  };

  const clearFilters = () => {
  if (ciudadParam || sectorParam) {
    navigate("/propiedades");
    return;
  }

  setFilters({
    ciudad: "",
    sector: "",
    maxPrecio: "",
  });
};

return (
  <>
<SEO
  title={seo.title}
  description={seo.description}
  path={geoPath}
  schema={[propertiesPageSchema, breadcrumbSchema]}
/>

    <main className="min-h-screen bg-slate-950 text-slate-50">
      <section className="border-b border-slate-800 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),transparent_55%),radial-gradient(circle_at_bottom,_rgba(37,99,235,0.18),transparent_60%)]">
        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-100 transition mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Volver al inicio
          </button>

          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-[11px] text-slate-300 mb-4">
            <HomeModernIcon className="h-3.5 w-3.5 text-emerald-400" />
            <span>Propiedades reales · Match hipotecario después</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-50 mb-4 max-w-3xl">
  {seo.heading}
</h1>

<p className="text-sm md:text-base text-slate-400 max-w-2xl">
  {seo.intro}
</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <div className="mb-8 rounded-3xl border border-slate-800 bg-slate-900/70 p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-100 md:w-44">
              <FunnelIcon className="h-5 w-5 text-emerald-300" />
              Filtros rápidos
            </div>

            <div className="grid flex-1 gap-3 md:grid-cols-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Ciudad
                </label>
                <input
                  value={filters.ciudad}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, ciudad: e.target.value }))
                  }
                  placeholder="Quito"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Sector
                </label>
                <input
                  value={filters.sector}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, sector: e.target.value }))
                  }
                  placeholder="Tababela, Centro Norte..."
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Precio máximo
                </label>
                <input
                  value={filters.maxPrecio}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      maxPrecio: e.target.value.replace(/[^\d]/g, ""),
                    }))
                  }
                  placeholder="90000"
                  inputMode="numeric"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500 hover:text-white transition"
            >
              Limpiar
            </button>
          </div>
        </div>

        <div className="mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-100">{totalLabel}</p>
            <p className="text-[12px] text-slate-500">
              La compatibilidad real se calcula después con tus datos.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/precalificar")}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300 transition"
          >
            Precalificar sin elegir propiedad
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>

        {loading && (
          <div className="grid gap-5 md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-[450px] rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden animate-pulse"
              >
                <div className="h-52 bg-slate-800/70" />
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

        {!loading && !loadError && properties.length === 0 && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 text-center">
            <SparklesIcon className="mx-auto h-8 w-8 text-emerald-300 mb-3" />
            <h2 className="text-lg font-semibold text-slate-50 mb-2">
              No encontramos propiedades con esos filtros
            </h2>
            <p className="text-sm text-slate-400 mb-5">
              Prueba limpiando los filtros o simula tu capacidad para recibir
              una recomendación más amplia.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center rounded-full border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:border-slate-400 hover:text-white transition"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {!loading && !loadError && properties.length > 0 && (
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
                      {property.estadoProyecto ||
                        property.estadoComercial ||
                        "Disponible"}
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

                        <h2 className="text-base md:text-lg font-semibold text-slate-50 leading-snug line-clamp-2">
                          {property.titulo}
                        </h2>

                        <div className="mt-1 flex items-center gap-1.5 text-[12px] text-slate-400">
                          <MapPinIcon className="h-4 w-4 text-emerald-300 shrink-0" />
                          <span className="truncate">
                            {[property.sector, property.ciudad]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[11px] text-slate-500">Precio</p>
                        <p className="text-base md:text-lg font-bold text-slate-50">
                          {property.precioLabel ||
                            `$${Number(property.precio || 0).toLocaleString(
                              "en-US"
                            )}`}
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
                            source: "public_properties_page",
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
                          handleStartForProperty(property, "public_properties_page")
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300 transition"
                      >
                        Ver si califico
                        <ArrowRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  </>
);
}