export const SITE_URL = "https://www.habitalibre.com";

export const defaultSEO = {
  title: "HabitaLibre | Hipoteca exprés VIS, VIP y BIESS en Ecuador",
  description:
    "Descubre en 2 minutos cuánto podrías comprar, qué crédito hipotecario podría aplicar para ti y qué propiedades calzan con tu perfil.",
  image: `${SITE_URL}/og-habitalibre.jpg`,
  siteName: "HabitaLibre",
  locale: "es_EC",
};

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "HabitaLibre",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  sameAs: [
    "https://www.instagram.com/habitalibre",
    "https://www.facebook.com/habitalibre",
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "HabitaLibre",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/propiedades?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};