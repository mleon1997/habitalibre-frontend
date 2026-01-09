// src/lib/decisionEngine.js

function money(n) {
  const x = Number(n ?? 0);
  if (!Number.isFinite(x)) return "—";
  return `$${x.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function pct(n) {
  const x = Number(n ?? 0);
  if (!Number.isFinite(x)) return "—";
  return `${Math.round(x)}%`;
}

/**
 * Genera una respuesta tipo "advisor" en base a data normalizada del Progreso.jsx
 * Retorna:
 *  {
 *    message: string,
 *    state: {...},
 *    quickActions: [{id,label,action:{type,href}}]
 *  }
 */
export function buildAdvisorReply({ data, userEmail } = {}) {
  const d = data || {};

  const progreso = Number(d.progreso ?? 0);
  const prob = Number(d.probAprobacion ?? 0);

  const entradaPct = Number(d.entradaPct ?? 0);
  const faltanteEntrada = Number(d.faltanteEntrada ?? 0);
  const deudas = Number(d.deudas ?? 0);

  const suggested = d.suggestedCredit || d.productoSugerido || "—";
  const precioMax = d.precioMaxVivienda;
  const cuota = d.cuotaEstimada;

  let headline = "Tu plan, en simple";
  let foco = "";

  if (entradaPct < 10) foco = `Subir tu entrada al 10% (te faltan aprox. ${money(faltanteEntrada)}).`;
  else if (deudas > 0) foco = "Bajar deudas mensuales para mejorar tu DTI.";
  else if (!d.afiliadoIESS) foco = "Evaluar afiliación IESS si quieres abrir ruta BIESS (según aportes).";
  else foco = "Ya estás bien encaminado: prepara carpeta y elige banco/programa.";

  const lines = [];
  lines.push(`Hola${userEmail ? ` (${userEmail})` : ""}. ${headline}`);
  lines.push("");
  lines.push(`• Probabilidad estimada hoy: ${pct(prob)}`);
  lines.push(`• Progreso del perfil: ${pct(progreso)}`);
  lines.push(`• Crédito sugerido: ${suggested}`);
  if (precioMax != null) lines.push(`• Precio máximo estimado: ${money(precioMax)}`);
  if (cuota != null) lines.push(`• Cuota estimada: ${money(cuota)}/mes`);
  lines.push("");
  lines.push(`Siguiente mejor acción: ${foco}`);

  const quickActions = [
    { id: "simular", label: "Afinar simulación", action: { type: "go", href: "/simular" } },
    { id: "docs", label: "Checklist documentos", action: { type: "anchor", href: "#docs" } },
    { id: "mejoras", label: "Ver mejoras", action: { type: "anchor", href: "#mejoras" } },
  ];

  return {
    message: lines.join("\n"),
    state: {
      progreso,
      probAprobacion: prob,
      suggestedCredit: suggested,
      foco,
    },
    quickActions,
  };
}

// También lo exporto como default por compatibilidad (si luego lo quieres importar sin llaves)
export default buildAdvisorReply;
