// src/lib/format.js

// 💰 Formatea números como dinero en USD con separadores y símbolo
export function formatMoney(value, currency = "USD") {
  if (isNaN(value)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
