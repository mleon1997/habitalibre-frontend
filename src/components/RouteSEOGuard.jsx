// src/components/RouteSEOGuard.jsx

import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const NOINDEX_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/unlock",

  "/progreso",
  "/capacidad",
  "/match",
  "/ruta",
  "/caso",
  "/siguiente-paso",
  "/perfil",
  "/hipoteca-detalle",
  "/property",

  "/gracias",
  "/leads",

  "/admin",
  "/dashboard",
  "/eliminar-cuenta",
];

const NOINDEX_EXACT = new Set([
  "/ads",
]);

function shouldNoIndex(pathname = "") {
  const cleanPath = pathname || "/";

  if (NOINDEX_EXACT.has(cleanPath)) return true;

  return NOINDEX_PREFIXES.some((prefix) => {
    return cleanPath === prefix || cleanPath.startsWith(`${prefix}/`);
  });
}

export default function RouteSEOGuard() {
  const location = useLocation();

  const noindex = shouldNoIndex(location.pathname);

  if (!noindex) return null;

  return (
    <Helmet>
      <meta name="robots" content="noindex,nofollow" />
      <meta name="googlebot" content="noindex,nofollow" />
    </Helmet>
  );
}