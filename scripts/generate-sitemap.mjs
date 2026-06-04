// scripts/generate-sitemap.mjs

import fs from "fs";
import path from "path";

const SITE_URL = "https://habitalibre.com";
const BACKEND_URL =
  process.env.VITE_API_URL || "https://habitalibre-backend.onrender.com";

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

async function main() {
  const properties = await getPublicProperties();

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

  const allRoutes = [...staticRoutes, ...propertyRoutes];

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
  console.log(`✅ Propiedades incluidas: ${propertyRoutes.length}`);
}

main();