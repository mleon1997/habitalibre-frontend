// src/components/SEO.jsx

import React from "react";
import { Helmet } from "react-helmet-async";
import { defaultSEO, SITE_URL } from "../seo/seoConfig.js";

export default function SEO({
  title,
  description,
  path = "/",
  image,
  noindex = false,
  schema = [],
  disableCanonical = false,
}) {
  const finalTitle = title || defaultSEO.title;
  const finalDescription = description || defaultSEO.description;
  const finalImage = image || defaultSEO.image;
  const canonicalUrl = `${SITE_URL}${path}`;

  const schemas = Array.isArray(schema) ? schema : [schema];

  return (
    <Helmet>
      <title>{finalTitle}</title>

      <meta name="description" content={finalDescription} />
{!disableCanonical && <link rel="canonical" href={canonicalUrl} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      <meta property="og:type" content="website" />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:site_name" content={defaultSEO.siteName} />
      <meta property="og:locale" content={defaultSEO.locale} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {schemas.filter(Boolean).map((item, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
}