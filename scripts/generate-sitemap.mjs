// scripts/generate-sitemap.mjs

import fs from "fs";
import path from "path";

const SITE_URL = "https://habitalibre.com";

const RAW_BACKEND_URL =
  process.env.VITE_API_URL || "https://habitalibre-backend.onrender.com";

const BACKEND_URL = RAW_BACKEND_URL.replace(/\/+$/, "").replace(/\/api$/, "");

const staticRoutes = [
  {
    loc: "/",
    changefreq: "weekly",
    priority: "1.00",
  },
  {
    loc: "/propiedades",
    changefreq: "daily",
    priority: "0.90",
  },
  {
    loc: "/precalificar",
    changefreq: "weekly",
    priority: "0.85",
  },
  {
    loc: "/soporte",
    changefreq: "monthly",
    priority: "0.50",
  },
  {
    loc: "/privacidad",
    changefreq: "yearly",
    priority: "0.30",
  },
  {
    loc: "/terminos",
    changefreq: "yearly",
    priority: "0.30",
  },
  {
    loc: "/cookies",
    changefreq: "yearly",
    priority: "0.30",
  },
];

function today() {
  return new Date().toISOString().split("T")[0];
}

function escapeXml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function slugify(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function urlEntry({ loc, changefreq = "weekly", priority = "0.80", lastmod }) {
  return `  <url>
    <loc>${escapeXml(`${SITE_URL}${loc}`)}</loc>
    <lastmod>${escapeXml(lastmod || today())}</lastmod>
    <changefreq>${escapeXml(changefreq)}</changefreq>
    <priority>${escapeXml(priority)}</priority>
  </url>`;
}

function normalizePropertiesResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.properties)) return data.properties;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

async function getPublicProperties() {
  const endpoint = `${BACKEND_URL}/api/properties/public`;

  try {
    const res = await fetch(endpoint);

    if (!res.ok) {
      console.warn(`⚠️ No se pudo leer propiedades públicas: ${res.status}`);
      return [];
    }

    const data = await res.json();
    return normalizePropertiesResponse(data);
  } catch (error) {
    console.warn(
      "⚠️ Error generando sitemap dinámico de propiedades:",
      error?.message || error
    );
    return [];
  }
}

function buildGeoRoutes(properties = []) {
  const cityMap = new Map();
  const sectorMap = new Map();

  properties.forEach((property) => {
    const citySlug = slugify(property?.ciudad);
    const sectorSlug = slugify(property?.sector);

    if (citySlug) {
      cityMap.set(citySlug, (cityMap.get(citySlug) || 0) + 1);
    }

    if (citySlug && sectorSlug) {
      const key = `${citySlug}/${sectorSlug}`;
      sectorMap.set(key, (sectorMap.get(key) || 0) + 1);
    }
  });

  const cityRoutes = [...cityMap.entries()].map(([citySlug]) => ({
    loc: `/propiedades/ciudad/${citySlug}`,
    changefreq: "weekly",
    priority: "0.82",
  }));

  const sectorRoutes = [...sectorMap.entries()]
    // Evitamos páginas muy delgadas de sector si solo tienen 1 propiedad.
    .filter(([, count]) => count >= 2)
    .map(([key]) => ({
      loc: `/propiedades/ciudad/${key}`,
      changefreq: "weekly",
      priority: "0.80",
    }));

  return [...cityRoutes, ...sectorRoutes];
}

async function main() {
  const properties = await getPublicProperties();

  const geoRoutes = buildGeoRoutes(properties);

  const propertyRoutes = properties
    .map((property) => {
      const slug = property?.slug || property?.id || property?._id;

      if (!slug) return null;

      return {
        loc: `/propiedades/${slug}`,
        changefreq: "weekly",
        priority: "0.75",
        lastmod:
          property?.updatedAt?.split?.("T")?.[0] ||
          property?.modifiedAt?.split?.("T")?.[0] ||
          today(),
      };
    })
    .filter(Boolean);

  const allRoutes = [...staticRoutes, ...geoRoutes, ...propertyRoutes];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(urlEntry).join("\n\n")}
</urlset>
`;

  const outputPath = path.resolve("dist", "sitemap.xml");

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, sitemap, "utf8");

  console.log(`✅ Sitemap generado: ${outputPath}`);
  console.log(`✅ Rutas estáticas: ${staticRoutes.length}`);
  console.log(`✅ Rutas ciudad/sector incluidas: ${geoRoutes.length}`);
  console.log(`✅ Propiedades incluidas: ${propertyRoutes.length}`);
  console.log(`✅ Total URLs: ${allRoutes.length}`);
}

main();