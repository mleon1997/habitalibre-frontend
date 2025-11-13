// src/lib/report.js
import { jsPDF } from "jspdf";

/**
 * Genera y descarga el PDF con el resumen de precalificación HabitaLibre.
 *
 * @param {object} data    Respuesta de /precalificar (puede incluir data._echo con el payload enviado)
 * @param {object} cliente { nombre?: string }
 * @param {object} opts    { logoDataUrl?: string, brand?: { primary?: string }, qrDataUrl?: string }
 */
export function generarPDFResumen(data = {}, cliente = {}, opts = {}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  // === Branding / colores ===
  const brand = {
    primary: opts?.brand?.primary || "#4338CA", // Indigo-700
    soft: "#EEF2FF",        // Indigo-50
    text: "#0F172A",
    muted: "#64748B",
    slate: "#334155",
    line: "#E2E8F0",
    successBg: "#ECFDF5",
    successStroke: "#D1FAE5",
    warnBg: "#FFFBEB",
    warnStroke: "#FDE68A",
    biess: "#0EA5E9",
    vis: "#059669",
    vip: "#2563EB",
    privada: "#6B7280",
  };

  const page = { w: 595, h: 842, margin: 48 };
  const p = { x: page.margin, y: 60, w: page.w - page.margin * 2 };

  // === Helpers ===
  const H = (txt, x, y, size = 14, weight = "bold", color = brand.text) => {
    doc.setFont("helvetica", weight);
    doc.setFontSize(size);
    doc.setTextColor(color);
    doc.text(String(txt), x, y);
  };
  const T = (txt, x, y, size = 11, color = brand.slate) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(color);
    if (Array.isArray(txt)) doc.text(txt, x, y);
    else doc.text(String(txt), x, y);
  };
  const Box = (x, y, w, h, { stroke = brand.line, fill = "#FFFFFF" } = {}) => {
    doc.setDrawColor(stroke);
    doc.setFillColor(fill);
    doc.rect(x, y, w, h, "F");
    doc.rect(x, y, w, h);
  };
  const LabelValue = (label, value, x, y) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(brand.muted);
    doc.text(label, x, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(brand.text);
    doc.text(value, x, y + 16);
  };
  const fmtUSD = (n, d = 0) =>
    "$ " + (Number(n || 0)).toLocaleString("en-US", { maximumFractionDigits: d });
  const fmtPct = (n, d = 1) => {
    const v = Number(n);
    if (!Number.isFinite(v)) return "—";
    return (v * 100).toFixed(d) + " %";
  };

  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  // === HEADER con marca + logo + sello de tipo de crédito ===
  doc.setFillColor(brand.primary);
  doc.rect(p.x, 40, 5, 20, "F");

  if (opts?.logoDataUrl) {
    try { doc.addImage(opts.logoDataUrl, "PNG", p.x + 14, 36, 90, 28); }
    catch { H("HabitaLibre", p.x + 14, 56, 18, "bold", brand.primary); }
  } else {
    H("HabitaLibre", p.x + 14, 56, 18, "bold", brand.primary);
  }
  T("Plataforma de precalificación hipotecaria", p.x + 14, 70, 10, brand.muted);

  H("Resumen de Precalificación", p.x + 160, 56, 16, "bold", brand.text);
  T(`Cliente: ${cliente?.nombre || "—"}   •   Fecha: ${new Date().toLocaleDateString()}`, p.x, 98, 10, brand.muted);

  // Datos robustos
  const echo = data?._echo || {};
  const perfil = data?.perfil || {};

  const ingreso =
    num(echo.ingresoNetoMensual) ??
    num(data.ingresoNetoMensual) ??
    num(perfil.ingresoNetoMensual) ??
    num(perfil.ingreso) ?? 0;

  const valorVivienda =
    num(echo.valorVivienda) ??
    num(data.valorVivienda) ??
    num(perfil.valorVivienda) ?? 0;

  const tieneVivienda =
    typeof echo.tieneVivienda === "boolean"
      ? echo.tieneVivienda
      : (typeof perfil.tieneVivienda === "boolean" ? perfil.tieneVivienda : false);

  // Badge tipo de crédito (usa productoElegido del backend)
  const productoElegido = String(data?.productoElegido || "").toUpperCase();
  const tipoCredito =
    productoElegido.includes("VIS") ? "VIS" :
    productoElegido.includes("VIP") ? "VIP" :
    productoElegido.includes("BIESS") ? "BIESS" :
    "Banca Privada";

  const badge = (() => {
    const map = {
      VIS: { text: "Crédito VIS", color: brand.vis },
      VIP: { text: "Crédito VIP", color: brand.vip },
      BIESS: { text: "Crédito BIESS", color: brand.biess },
      "Banca Privada": { text: "Banca Privada", color: brand.privada },
    };
    return map[tipoCredito] || map["Banca Privada"];
  })();

  const badgeX = p.x + 160 + 220;
  doc.setFillColor("#FFFFFF");
  doc.setDrawColor(badge.color);
  doc.roundedRect(badgeX, 44, 150, 24, 6, 6, "F");
  doc.roundedRect(badgeX, 44, 150, 24, 6, 6, "S");
  doc.setTextColor(badge.color);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(badge.text, badgeX + 12, 61);

  let y = 112;

  // === Límites VIS/VIP (para advertencias) — sincronizado con backend
  const CONSTS = {
    VIS_MAX_VALOR: 83660,
    VIP_MAX_VALOR: 107630,
    VIS_MAX_INGRESO: 2070,
    VIP_MAX_INGRESO: 2900,
  };
  const inVISPrice = valorVivienda > 0 && valorVivienda <= CONSTS.VIS_MAX_VALOR;
  const inVIPPrice = valorVivienda > CONSTS.VIS_MAX_VALOR && valorVivienda <= CONSTS.VIP_MAX_VALOR;
  const overVISIncome = ingreso > CONSTS.VIS_MAX_INGRESO;
  const overVIPIncome = ingreso > CONSTS.VIP_MAX_INGRESO;

  // === Recomendación principal
  const recColors =
    tipoCredito === "VIS" || tipoCredito === "VIP"
      ? { fill: brand.successBg, stroke: brand.successStroke }
      : { fill: brand.soft, stroke: "#E0E7FF" };

  const recH = 96;
  Box(p.x, y, p.w, recH, recColors);
  H("Recomendación principal", p.x + 16, y + 26, 12, "bold");

  let recText = "Info: completa tus datos para obtener una recomendación precisa.";
  if (tipoCredito === "VIS")
    recText = "Aprobable: crédito VIS (~4.88%–4.99%) y entrada mínima ~5%. Requiere primera vivienda y proyecto VIS aprobado por MIDUVI.";
  if (tipoCredito === "VIP")
    recText = "Aprobable: crédito VIP (~4.99%). Solo para primera vivienda en proyectos VIP (MIDUVI).";
  if (tipoCredito === "BIESS")
    recText = "Aprobable: crédito hipotecario BIESS (tasa referencial según segmento), sujeto a aportes y capacidad de pago.";
  if (tipoCredito === "Banca Privada")
    recText = "Sugerido: banca privada (tasas típicas 8%–11%, entrada 10%–20%). Podemos ayudarte a comparar ofertas.";

  const recLines = doc.splitTextToSize(recText, p.w - 32);
  T(recLines, p.x + 16, y + 48, 11, brand.text);
  y += recH + 12;

  // === Resumen del solicitante
  const resumen = [
    `Ingreso neto: ${fmtUSD(ingreso, 0)}`,
    `Edad: ${perfil.edad ?? echo.edad ?? "—"} años`,
    `Tipo ingreso: ${perfil.tipoIngreso || echo.tipoIngreso || "—"}`,
    `Estabilidad: ${perfil.aniosEstabilidad ?? echo.aniosEstabilidad ?? "—"} años`,
    `Valor vivienda: ${fmtUSD(valorVivienda, 0)}`,
    `Primera vivienda: ${tieneVivienda ? "No" : "Sí"}`,
  ].join("  •  ");

  const resumeH = 60;
  Box(p.x, y, p.w, resumeH, { fill: "#F8FAFC", stroke: brand.line });
  H("Resumen del solicitante", p.x + 16, y + 22, 11, "bold");
  const resumeLines = doc.splitTextToSize(resumen, p.w - 32);
  T(resumeLines, p.x + 16, y + 40, 10, brand.slate);
  y += resumeH + 12;

  // === Advertencias VIS/VIP
  const warnings = [];
  if (!tieneVivienda && inVISPrice && overVISIncome) {
    warnings.push(`Ingreso (~${fmtUSD(ingreso)}/mes) supera el máximo VIS (~${fmtUSD(CONSTS.VIS_MAX_INGRESO)}/mes). No aplica tasa 4.99% VIS.`);
  }
  if (!tieneVivienda && inVIPPrice && overVIPIncome) {
    warnings.push(`Ingreso (~${fmtUSD(ingreso)}/mes) supera el máximo VIP (~${fmtUSD(CONSTS.VIP_MAX_INGRESO)}/mes). No aplica tasa 4.99% VIP.`);
  }
  if (tieneVivienda && (inVISPrice || inVIPPrice)) {
    warnings.push("VIS/VIP aplica únicamente para primera vivienda. Considera BIESS o banca privada.");
  }

  if (warnings.length) {
    const alertH = 66 + warnings.length * 14;
    Box(p.x, y, p.w, alertH, { fill: brand.warnBg, stroke: brand.warnStroke });
    H("Advertencias VIS/VIP", p.x + 16, y + 24, 12, "bold");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor("#78350F");
    let yy = y + 44;
    warnings.forEach((w) => {
      const lines = doc.splitTextToSize("• " + w, p.w - 32);
      doc.text(lines, p.x + 16, yy);
      yy += lines.length * 12;
    });
    y += alertH + 12;
  }

  // === KPIs financieros (usa nombres del backend)
  const kpis = [
    ["Capacidad de pago", fmtUSD(data.capacidadPago, 0)],
    ["Monto préstamo máx.", fmtUSD(data.montoMaximo, 0)],
    ["Precio máx. vivienda", fmtUSD(data.precioMaxVivienda, 0)],
    ["LTV", fmtPct(data.ltv, 1)],
    ["DTI con hipoteca", fmtPct(data.dtiConHipoteca, 1)],
    ["Cuota estimada", fmtUSD(data.cuotaEstimada, 0)],
    ["Stress (+2% tasa)", fmtUSD(data.cuotaStress, 0)],
    ["Plazo (años)", String(Math.round((data.plazoMeses || 0) / 12) || "—")],
  ];

  const colW = (p.w - 16) / 2;
  const rowH = 66;
  const gap = 8;
  let paintedRows = 0;

  for (let i = 0; i < kpis.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = p.x + col * (colW + gap);
    const yBox = y + row * (rowH + gap);
    // salto de página si se pasa
    if (yBox + rowH > page.h - page.margin - 80) {
      doc.addPage();
      y = page.margin;
    }
    Box(x, yBox, colW, rowH, { fill: "#FFFFFF", stroke: brand.line });
    LabelValue(kpis[i][0], kpis[i][1], x + 14, yBox + 22);
    paintedRows = row + 1;
  }
  y += paintedRows * (rowH + gap) + 8;

  // === Indicador visual de puntaje/riesgo (opcional)
  const phl = data?.puntajeHabitaLibre;
  if (phl && Number.isFinite(Number(phl.score))) {
    const categoria = String(phl.categoria || "").toLowerCase();
    const colores = {
      alto: { fill: "#DCFCE7", stroke: "#22C55E", texto: "Alto", colorTexto: "#166534" },
      medio: { fill: "#FEF9C3", stroke: "#FACC15", texto: "Medio", colorTexto: "#92400E" },
      bajo: { fill: "#FEE2E2", stroke: "#EF4444", texto: "Bajo", colorTexto: "#7F1D1D" },
    };
    const tone = colores[categoria] || colores.medio;
    const boxH = 60;

    if (y + boxH > page.h - page.margin - 60) {
      doc.addPage();
      y = page.margin;
    }
    Box(p.x, y, p.w, boxH, { fill: tone.fill, stroke: tone.stroke });

    H("Puntaje HabitaLibre", p.x + 16, y + 22, 12, "bold", tone.colorTexto);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor("#1E293B");
    doc.text("Estimación referencial basada en LTV y DTI simulados.", p.x + 16, y + 40);

    // Barra visual
    const barX = p.x + p.w - 200;
    const barY = y + 20;
    const barW = 160;
    const barH = 14;
    const score = Math.max(0, Math.min(100, Number(phl.score)));

    doc.setDrawColor("#CBD5E1");
    doc.setFillColor("#E2E8F0");
    doc.roundedRect(barX, barY, barW, barH, 7, 7, "F");
    doc.setFillColor(tone.stroke);
    doc.roundedRect(barX, barY, (barW * score) / 100, barH, 7, 7, "F");

    // Etiqueta
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(tone.colorTexto);
    doc.text(`${tone.texto.toUpperCase()} · ${Math.round(score)}/100`, barX + barW + 10, barY + 10);

    y += boxH + 12;
  }

  // === Opciones bancarias (si existieran en data.opciones)
  if (Array.isArray(data.opciones) && data.opciones.length) {
    if (y + 90 > page.h - page.margin) {
      doc.addPage();
      y = page.margin;
    }
    H("Opciones bancarias referenciales", p.x, y + 4, 12, "bold");
    y += 18;

    data.opciones.slice(0, 6).forEach((o) => {
      const tag = o.elegible ? "(Elegible)" : "(Revisar reglas)";
      const line = `${o.banco} · Tasa ${o.tasa}% · Plazo ${o.plazo}m · Cuota ${fmtUSD(o.cuota, 0)} ${tag}`;
      T(line, p.x, y + 14, 10, brand.slate);
      y += 16;

      // Motivos de no elegibilidad (si aplica)
      if (!o.elegible) {
        const razones = [];
        const ltvMax = o?.reglas?.ltvMax;
        const dtiMax = o?.reglas?.dtiMax;
        const minIngreso = o?.reglas?.minIngreso;

        if (typeof ltvMax === "number" && typeof o.ltv === "number" && o.ltv > ltvMax + 1e-6) {
          razones.push(`• LTV supera ${Math.round(ltvMax * 100)}%`);
        }
        if (typeof dtiMax === "number" && typeof o.dti === "number" && o.dti > dtiMax + 1e-6) {
          razones.push(`• DTI supera ${Math.round(dtiMax * 100)}%`);
        }
        if (o.dentroDeCapacidad === false) {
          razones.push("• La cuota excede tu capacidad de pago");
        }
        const ingresoPerfil = num(perfil?.ingreso || echo?.ingresoNetoMensual || ingreso);
        if (typeof minIngreso === "number" && Number(ingresoPerfil || 0) < minIngreso) {
          razones.push(`• Ingreso mínimo requerido: ${fmtUSD(minIngreso, 0)}/mes`);
        }

        if (razones.length) {
          const text = razones.join("  ");
          const lines = doc.splitTextToSize(text, p.w - 20);
          T(lines, p.x + 10, y + 10, 9, "#9CA3AF");
          y += lines.length * 11 + 6;
        }
      }

      if (y > page.h - page.margin - 80) {
        doc.addPage();
        y = page.margin;
      }
    });
  }

  // === CTA + QR opcional
  const ctaH = opts?.qrDataUrl ? 100 : 64;
  if (y + ctaH + 100 > page.h - page.margin) {
    doc.addPage();
    y = page.margin;
  }
  Box(p.x, y, p.w, ctaH, { fill: "#F1F5F9", stroke: brand.line });
  H("¿Quieres que gestionemos tu crédito por ti?", p.x + 16, y + 24, 12, "bold");
  T(
    "Te conectamos con la entidad más conveniente y te acompañamos en el proceso. Escríbenos a contacto@habitalibre.com.",
    p.x + 16,
    y + 44,
    10,
    brand.slate
  );

  if (opts?.qrDataUrl) {
    const qrSize = 80;
    const qrX = p.x + p.w - qrSize - 16;
    const qrY = y + 10;
    try {
      doc.addImage(opts.qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
      T("Escanéame", qrX + 10, qrY + qrSize + 12, 9, brand.muted);
    } catch {
      // ignore
    }
  }
  y += ctaH + 12;

  // === Footer / Legal
  if (y + 60 > page.h - page.margin) {
    doc.addPage();
    y = page.margin;
  }
  doc.setDrawColor(brand.line);
  doc.line(p.x, y, p.x + p.w, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(brand.muted);
  const nota =
    "Este reporte es referencial y no constituye una oferta vinculante. Sujeto a validación documental, políticas de cada entidad y disponibilidad de programas VIS/VIP según MIDUVI.";
  const notaLines = doc.splitTextToSize(nota, p.w);
  doc.text(notaLines, p.x, y);

  // Marca inferior
  H("HabitaLibre · Plataforma de precalificación hipotecaria", p.x, 812, 10, "bold", brand.primary);
  T("www.habitalibre.com", p.x, 828, 9, brand.muted);

  const filename = `HL_Resumen_${(cliente?.nombre || "cliente").replace(/\s+/g, "_")}.pdf`;
  try {
    doc.save(filename);
  } catch (e) {
    // Fallback para navegadores raros
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
