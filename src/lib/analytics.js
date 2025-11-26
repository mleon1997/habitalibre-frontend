// src/lib/analytics.js

// Helper genérico: funciona hoy aunque no tengas GA4/GTM
export function trackEvent(eventName, params = {}) {
  if (typeof window === "undefined") return;

  // 1) Si mañana usas Google Tag Manager
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: eventName,
      ...params,
    });
  }

  // 2) Si usas GA4 directo (gtag)
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }

  // 3) En desarrollo: ver en consola qué está disparando
  if (import.meta?.env?.DEV) {
    // eslint-disable-next-line no-console
    console.log("[analytics] event:", eventName, params);
  }
}

export function trackPageView(pageName = "landing") {
  if (typeof window === "undefined") return;

  if (typeof window.gtag === "function") {
    window.gtag("event", "page_view", {
      page_title: pageName,
      page_location: window.location.href,
    });
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: "page_view",
      page: pageName,
      url: window.location.href,
    });
  }

  if (import.meta?.env?.DEV) {
    // eslint-disable-next-line no-console
    console.log("[analytics] page_view:", pageName);
  }
}
