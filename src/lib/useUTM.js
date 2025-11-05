// src/lib/useUTM.js
import { useEffect } from "react";
export function usePersistUTM() {
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const keys = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content","gclid","fbclid"];
    const saved = JSON.parse(localStorage.getItem("hl_utm") || "{}");
    keys.forEach(k => { const v = p.get(k); if (v) saved[k] = v; });
    if (Object.keys(saved).length) localStorage.setItem("hl_utm", JSON.stringify(saved));
  }, []);
}
export function getUTM() {
  try { return JSON.parse(localStorage.getItem("hl_utm") || "{}"); } catch { return {}; }
}
