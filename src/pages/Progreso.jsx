// src/pages/Progreso.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { readJourneyLocal, clearJourneyLocal } from "../lib/journeyLocal";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";
import { API_BASE } from "../lib/api"; // ✅ FIX: IMPORT REAL (evita pegarle a habitalibre.com/api)
import HIcon from "../assets/HICON.png";
import AdvisorPanel from "../components/AdvisorPanel.jsx";
import HLScoreCard from "../components/HLScoreCard.jsx";

/* =========================
   Utils
========================= */
function toNum(v) {
  const n = Number((v ?? "").toString().replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function fmtMoney(n) {
  return `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function chipClass(type) {
  if (type === "ok") return "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/25";
  if (type === "warn") return "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/25";
  if (type === "bad") return "bg-red-500/15 text-red-200 ring-1 ring-red-500/25";
  return "bg-slate-500/10 text-slate-300 ring-1 ring-slate-600/30";
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function gradeFromProgress(p) {
  if (p >= 85) return { label: "Alta", type: "ok", hint: "Tu perfil está bastante listo para aplicar." };
  if (p >= 70) return { label: "Media", type: "warn", hint: "Estás cerca. Enfócate en 1–2 mejoras clave." };
  if (p >= 50) return { label: "En construcción", type: "neutral", hint: "Aún faltan piezas para mejorar aprobación." };
  return { label: "Baja", type: "bad", hint: "Primero construyamos base (entrada/estabilidad/deudas)." };
}

function fmtPct(n) {
  const x = Number(n || 0);
  return `${Math.round(x)}%`;
}

function safeNameFromEmail(email) {
  const s = String(email || "").trim();
  if (!s.includes("@")) return "";
  const left = s.split("@")[0] || "";
  const clean = left.replace(/[0-9._-]+/g, " ").trim();
  const first = clean.split(" ").filter(Boolean)[0] || "";
  if (!first) return "";
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

// helpers para leer formatos distintos
function pick(obj, keys, fallback = undefined) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return fallback;
}
function pickNum(obj, keys, fallback = 0) {
  const v = pick(obj, keys, null);
  if (v === null) return fallback;
  return toNum(v);
}
function pickStr(obj, keys, fallback = "") {
  const v = pick(obj, keys, null);
  return v == null ? fallback : String(v);
}
function pickBoolIess(obj) {
  const raw = pick(obj, ["afiliadoIESS", "afiliadoIess", "afiliado_iess", "iess", "afiliado"], null);
  if (raw == null) return false;
  if (typeof raw === "boolean") return raw;

  const s = String(raw).trim().toLowerCase();
  if (s === "si" || s === "sí" || s === "true" || s === "1") return true;
  if (s === "no" || s === "false" || s === "0") return false;
  return false;
}

/**
 * ✅ merge seguro (no pisa con vacíos / 0 innecesarios)
 */
function mergePreferValues(...objs) {
  const out = {};
  for (const o of objs) {
    if (!o || typeof o !== "object") continue;

    for (const [k, v] of Object.entries(o)) {
      if (v === undefined || v === null) continue;

      // strings vacíos no pisan
      if (typeof v === "string" && v.trim() === "") continue;

      // si llega 0 pero ya existe un valor "real" (no 0), NO pises
      if (typeof v === "number" && v === 0) {
        const prev = out[k];
        if (typeof prev === "number" && prev !== 0) continue;
      }

      out[k] = v;
    }
  }
  return out;
}

/* =========================
   ✅ Local fallback seguro (por usuario y recencia)
========================= */
const LS_TASKS = "hl_progress_tasks_v1";

const SIM_JOURNEY = "/simulador?mode=journey";
const SIM_JOURNEY_AMORT = "/simulador?mode=journey&tab=amort";


const LS_JOURNEY_OWNER_EMAIL = "hl_journey_owner_email_v1";
const LS_JOURNEY_TS = "hl_journey_ts_v1";

function normalizeEmail(s) {
  return String(s || "").trim().toLowerCase();
}

function extractLocalSnapEmail(localSnap) {
  return (
    localSnap?.userEmail ||
    localSnap?.email ||
    localSnap?.customerEmail ||
    localSnap?.meta?.email ||
    localSnap?.meta?.userEmail ||
    localSnap?.entrada?.email ||
    localSnap?.input?.email ||
    ""
  );
}

function extractLocalSnapTs(localSnap) {
  const raw =
    localSnap?.ts ||
    localSnap?.timestamp ||
    localSnap?.createdAt ||
    localSnap?.updatedAt ||
    localSnap?.meta?.ts ||
    localSnap?.meta?.timestamp ||
    null;

  const n = raw ? Number(new Date(raw).getTime()) : 0;
  return Number.isFinite(n) ? n : 0;
}

function isRecent(ts, days = 14) {
  if (!ts || !Number.isFinite(ts)) return false;
  const maxAge = days * 24 * 60 * 60 * 1000;
  return Date.now() - ts <= maxAge;
}

function shouldUseLocalFallback(localSnap, currentEmail) {
  if (!localSnap) return false;

  const hasResult = localSnap?.resultado && Object.keys(localSnap.resultado || {}).length > 0;
  if (!hasResult) return false;

  const emailNow = normalizeEmail(currentEmail);
  if (!emailNow) return false;

  // 1) si el snap trae email, debe coincidir
  const snapEmail = normalizeEmail(extractLocalSnapEmail(localSnap));
  if (snapEmail && snapEmail !== emailNow) return false;

  // 2) si NO trae email, usamos owner guardado como “candado”
  // 🚫 OJO: esto SOLO funciona si currentEmail viene de SESIÓN real
  const owner = normalizeEmail(localStorage.getItem(LS_JOURNEY_OWNER_EMAIL));
  if (owner && owner !== emailNow) return false;

  // 3) recencia: si el snap trae ts úsalo; si no, usa LS_JOURNEY_TS; si no, NO confíes
  const tsFromSnap = extractLocalSnapTs(localSnap);
  const tsFromLS = toNum(localStorage.getItem(LS_JOURNEY_TS));
  const ts = tsFromSnap || tsFromLS || 0;
  if (!isRecent(ts, 14)) return false;

  return true;
}

/* =========================
   Amortización (preview liviano)
========================= */
function pmt(principal, annualRate, years) {
  const n = Math.max(1, Math.round(years * 12));
  const r = annualRate / 100 / 12;
  if (!Number.isFinite(principal) || principal <= 0) return 0;
  if (!Number.isFinite(r) || r <= 0) return principal / n;

  const pow = Math.pow(1 + r, n);
  return (principal * (r * pow)) / (pow - 1);
}

function buildAmortSchedulePreview({ principal, annualRate, years }) {
  const n = Math.max(1, Math.round(years * 12));
  const r = annualRate / 100 / 12;
  const payment = pmt(principal, annualRate, years);

  let balance = principal;
  let totalInt = 0;
  let totalPrin = 0;

  const rows = [];

  for (let m = 1; m <= Math.min(12, n); m++) {
    const interest = r > 0 ? balance * r : 0;
    const principalPay = Math.max(0, payment - interest);
    balance = Math.max(0, balance - principalPay);

    totalInt += interest;
    totalPrin += principalPay;

    rows.push({
      mes: m,
      pago: payment,
      interes: interest,
      capital: principalPay,
      saldo: balance,
    });
  }

  return {
    payment,
    rows,
    totals: {
      pagoTotal: payment * rows.length,
      interesTotal: totalInt,
      capitalTotal: totalPrin,
      saldoFinal: balance,
    },
  };
}

function inferTasaForModal(data) {
  const rr =
    data?.resultado?.rutaRecomendada ||
    data?.resultado?.ruta ||
    data?.resultado?.recomendacion ||
    data?.rutaRecomendada ||
    null;

  const min = toNum(rr?.tasaMin ?? data?.resultado?.tasaMin ?? data?.tasaMin);
  const max = toNum(rr?.tasaMax ?? data?.resultado?.tasaMax ?? data?.tasaMax);
  if (min > 0 && max > 0) return { min, max, mid: (min + max) / 2, source: "data" };

  const tipoRaw =
    data?.resultado?.productoSugerido ||
    data?.resultado?.producto ||
    data?.resultado?.tipoCredito ||
    data?.resultado?.programa ||
    data?.productoSugerido ||
    data?.suggestedCredit ||
    data?.input?.productoSugerido ||
    data?.input?.tipoCredito ||
    "";

  let tipo = String(tipoRaw || "").toLowerCase();

  if (tipo.includes("biess")) return { min: 4.8, max: 6.5, mid: 5.6, source: "heur" };
  if (tipo.includes("vip")) return { min: 4.8, max: 7.0, mid: 6.0, source: "heur" };
  if (tipo.includes("vis")) return { min: 5.0, max: 7.8, mid: 6.6, source: "heur" };

  return { min: 8.5, max: 10.8, mid: 9.7, source: "heur" };
}

/* =========================
   Normalización de data desde snap
========================= */
function buildDataFromSnap(snap) {
  if (!snap) return { hasSnap: false };

  const input = snap?.input || snap?.entrada || {};
  const resultado = snap?.resultado || {};

  const estadoCivil = pickStr(input, ["estadoCivil"], "soltero");
  const esParejaFormal = ["casado", "union_de_hecho"].includes(String(estadoCivil || "").toLowerCase());

  const ingreso = pickNum(input, ["ingreso", "ingresoNetoMensual"], 0);
  const ingresoPareja = esParejaFormal ? pickNum(input, ["ingresoPareja"], 0) : 0;

  const deudas = pickNum(input, ["deudas", "otrasDeudasMensuales"], 0);

  const valor = pickNum(
    input,
    ["valor", "valorVivienda", "precioVivienda", "valorInmueble", "precioInmueble", "houseValue", "valorPropiedad"],
    0
  );

  const entrada = pickNum(
    input,
    ["entrada", "entradaDisponible", "downPayment", "enganche", "cuotaInicial", "entradaAprox"],
    0
  );

  const valorFinal = valor > 0 ? valor : pickNum(resultado, ["valor", "valorVivienda", "precioVivienda"], 0);
  const entradaFinal = entrada > 0 ? entrada : pickNum(resultado, ["entrada", "entradaDisponible"], 0);

  const afiliadoIESS = pickBoolIess(input);

  const aportesTotales = pickNum(input, ["aportesTotales", "iessAportesTotales"], 0);
  const aportesConsecutivos = pickNum(input, ["aportesConsecutivos", "iessAportesConsecutivos"], 0);

  const tipoIngreso = pickStr(input, ["tipoIngreso"], "");
  const aniosEstabilidad = pickNum(input, ["aniosEstabilidad"], 0);
  const sustentoIndependiente = pickStr(input, ["sustentoIndependiente"], "");

  const horizonteCompra = pickStr(input, ["horizonteCompra", "tiempoCompra"], "");

  const capacidadPago = resultado?.capacidadPago ?? null;
  const montoMaximo = resultado?.montoMaximo ?? null;
  const precioMaxVivienda = resultado?.precioMaxVivienda ?? null;
  const cuotaEstimada = resultado?.cuotaEstimada ?? null;
  const productoSugerido = resultado?.productoSugerido ?? null;
  const bancoSugerido = resultado?.bancoSugerido ?? null;

  const entradaPct = valorFinal > 0 ? Math.round((entradaFinal / valorFinal) * 100) : 0;

  const entradaObjetivoPct = 10;
  const entradaObjetivo = valorFinal > 0 ? Math.round((valorFinal * entradaObjetivoPct) / 100) : 0;
  const faltanteEntrada = Math.max(0, entradaObjetivo - entradaFinal);

  let progreso = 0;

  const ingresoTotal = ingreso + ingresoPareja;
  if (ingresoTotal >= 800) progreso += 25;
  else if (ingresoTotal >= 400) progreso += 15;
  else progreso += 5;

  if (entradaPct >= 10) progreso += 30;
  else if (entradaPct >= 5) progreso += 20;
  else if (entradaPct > 0) progreso += 10;

  if (!afiliadoIESS) progreso += 5;
  else {
    if (aportesTotales >= 36) progreso += 20;
    else if (aportesTotales >= 12) progreso += 12;
    else progreso += 6;

    if (aportesConsecutivos >= 13) progreso += 10;
    else if (aportesConsecutivos >= 6) progreso += 6;
    else progreso += 2;
  }

  if (tipoIngreso === "Dependiente" || tipoIngreso === "Mixto") {
    if (aniosEstabilidad >= 1) progreso += 15;
    else progreso += 5;
  } else {
    if (sustentoIndependiente === "ambos") progreso += 15;
    else if (sustentoIndependiente === "declaracion" || sustentoIndependiente === "movimientos") progreso += 10;
    else progreso += 5;
  }

  progreso = clamp(progreso, 0, 100);

  const palancaEntrada =
    entradaPct >= 10
      ? { type: "ok", label: "OK" }
      : entradaPct > 0
      ? { type: "warn", label: "Mejorable" }
      : { type: "bad", label: "Pendiente" };

  const palancaIess = !afiliadoIESS
    ? { type: "neutral", label: "Opcional" }
    : aportesConsecutivos >= 13 && aportesTotales >= 36
    ? { type: "ok", label: "OK" }
    : { type: "warn", label: "Mejorable" };

  const palancaEstabilidad =
    tipoIngreso === "Dependiente" || tipoIngreso === "Mixto"
      ? aniosEstabilidad >= 1
        ? { type: "ok", label: "OK" }
        : { type: "warn", label: "Mejorable" }
      : sustentoIndependiente === "ambos" || sustentoIndependiente === "declaracion" || sustentoIndependiente === "movimientos"
      ? { type: "ok", label: "OK" }
      : { type: "warn", label: "Mejorable" };

  const probAprobacion = clamp(Math.round(progreso * 0.95 + 5), 0, 100);
  const probGrade = gradeFromProgress(progreso);

  const suggestedCredit =
    productoSugerido ||
    (afiliadoIESS && aportesTotales >= 12 ? "BIESS / VIS" : entradaPct >= 10 ? "VIS / VIP" : "VIS (perfil en construcción)");

  const nextBestAction =
    entradaPct < 10
      ? { title: "Sube tu entrada al 10%", desc: "Es la palanca más rápida para mejorar aprobación y tasa.", impact: "Alto" }
      : deudas > 0
      ? { title: "Reduce deudas mensuales", desc: "Bajar deudas sube tu capacidad y baja el DTI.", impact: "Alto" }
      : !afiliadoIESS
      ? { title: "Evalúa IESS (abre BIESS)", desc: "Podría desbloquear escenarios adicionales según aportes.", impact: "Medio" }
      : { title: "Prepara documentos y aplica", desc: "Tu perfil ya está bien encaminado para avanzar.", impact: "Alto" };

  return {
    hasSnap: true,
    input,
    resultado,

    ingresoTotal,
    deudas,
    valor: valorFinal,
    entrada: entradaFinal,
    entradaPct,
    entradaObjetivoPct,
    entradaObjetivo,
    faltanteEntrada,
    afiliadoIESS,
    aportesTotales,
    aportesConsecutivos,
    tipoIngreso,
    aniosEstabilidad,
    sustentoIndependiente,
    horizonteCompra,

    capacidadPago,
    montoMaximo,
    precioMaxVivienda,
    cuotaEstimada,
    productoSugerido,
    bancoSugerido,

    progreso,
    probAprobacion,
    probGrade,
    suggestedCredit,
    nextBestAction,

    palancaEntrada,
    palancaIess,
    palancaEstabilidad,
  };
}

/* =========================
   Checklist / Tasks
========================= */
function buildSuggestedTasks(d) {
  const tasks = [];

  if (d.entradaPct < 10) {
    tasks.push({
      id: "entrada",
      title: "Subir entrada para mejorar aprobación",
      desc:
        d.faltanteEntrada > 0
          ? `Hoy tienes ${fmtMoney(d.entrada)} (${d.entradaPct}%). Para llegar a ${d.entradaObjetivoPct}% te faltan aprox. ${fmtMoney(
              d.faltanteEntrada
            )}.`
          : `Hoy tienes ${fmtMoney(d.entrada)} (${d.entradaPct}%).`,
      ctaText: "Ajustar datos",
      ctaHref: SIM_JOURNEY,
      badge: "Impacto alto",
      impact: "alto",
    });
  } else {
    tasks.push({
      id: "entrada_ok",
      title: "Entrada en buen nivel",
      desc: `Tienes ${fmtMoney(d.entrada)} (${d.entradaPct}%). Esto te ayuda mucho en aprobación.`,
      ctaText: "Actualizar datos",
      ctaHref: SIM_JOURNEY,
      badge: "OK",
      impact: "bajo",
    });
  }

  if (d.afiliadoIESS) {
    const ok = d.aportesTotales >= 36 && d.aportesConsecutivos >= 13;
    tasks.push({
      id: "iess",
      title: ok ? "Aportes IESS sólidos" : "Mejorar elegibilidad BIESS",
      desc: ok
        ? `Vas bien: ${d.aportesTotales} aportes totales y ${d.aportesConsecutivos} consecutivos.`
        : `Referencia común BIESS: 36 totales + 13 consecutivos. Hoy: ${d.aportesTotales} / ${d.aportesConsecutivos}.`,
      ctaText: "Comparar",
      ctaHref: SIM_JOURNEY,
      badge: ok ? "OK" : "Impacto medio",
      impact: ok ? "bajo" : "medio",
    });
  } else {
    tasks.push({
      id: "iess_opcional",
      title: "Evaluar afiliación IESS (abre BIESS)",
      desc: "Si te afilias y acumulas aportes, podrías abrir opciones BIESS según tu perfil.",
      ctaText: "Comparar",
      ctaHref: SIM_JOURNEY,
      badge: "Opcional",
      impact: "medio",
    });
  }

  const estOk = d.palancaEstabilidad.type === "ok";
  tasks.push({
    id: "estabilidad",
    title: estOk ? "Estabilidad/sustento bien respaldado" : "Fortalecer sustento (documentos)",
    desc:
      d.tipoIngreso === "Dependiente" || d.tipoIngreso === "Mixto"
        ? `Tipo ingreso: ${d.tipoIngreso || "—"}. Estabilidad: ${d.aniosEstabilidad || 0} años.`
        : `Tipo ingreso: ${d.tipoIngreso || "—"}. Sustento: ${d.sustentoIndependiente || "—"}.`,
    ctaText: "Ver checklist",
    ctaHref: "#docs",
    badge: estOk ? "OK" : "Impacto alto",
    impact: estOk ? "bajo" : "alto",
  });

  tasks.push({
    id: "asesor",
    title: "Hablar con un asesor HabitaLibre",
    desc: "Te guiamos para elegir banco/programa y armar tu carpeta. Te respondemos en minutos.",
    ctaText: "WhatsApp",
    ctaHref: "whatsapp",
    badge: "Recomendado",
    impact: "alto",
  });

  return tasks;
}

function buildDocumentChecklist(d) {
  const items = [];
  const isDependiente = d.tipoIngreso === "Dependiente" || d.tipoIngreso === "Mixto";

  items.push({ id: "docs_identidad", title: "Cédula + papeleta de votación", desc: "Documento básico para apertura de trámite.", status: "todo" });
  items.push({ id: "docs_servicios", title: "Planilla de servicios (domicilio)", desc: "Agua/luz/teléfono (según banco).", status: "todo" });

  if (isDependiente) {
    items.push({
      id: "docs_roles",
      title: "Roles de pago / certificado laboral",
      desc: "Normalmente 3–6 meses + certificado.",
      status: d.aniosEstabilidad >= 1 ? "ok" : "warn",
    });
    items.push({
      id: "docs_estabilidad",
      title: "Antigüedad laboral",
      desc: "Ideal: 2–3 años para maximizar aprobación.",
      status: d.aniosEstabilidad >= 1 ? "ok" : "warn",
    });
  } else {
    items.push({
      id: "docs_ruc",
      title: "RUC + actividad económica",
      desc: "Independiente: sustento formal ayuda mucho.",
      status: d.sustentoIndependiente ? "warn" : "todo",
    });
    items.push({
      id: "docs_movimientos",
      title: "Movimientos bancarios",
      desc: "6–12 meses según entidad.",
      status: d.sustentoIndependiente === "movimientos" || d.sustentoIndependiente === "ambos" ? "ok" : "warn",
    });
    items.push({
      id: "docs_declaracion",
      title: "Declaración de impuestos / facturación",
      desc: "Fortalece sustento. (depende del banco)",
      status: d.sustentoIndependiente === "declaracion" || d.sustentoIndependiente === "ambos" ? "ok" : "warn",
    });
  }

  items.push({
    id: "docs_iess",
    title: "Historia laboral IESS (si aplica)",
    desc: "Útil demostración de estabilidad y para BIESS.",
    status: d.afiliadoIESS ? (d.aportesTotales >= 12 ? "ok" : "warn") : "neutral",
  });

  return items;
}

function statusPill(status) {
  if (status === "ok") return { type: "ok", label: "Listo" };
  if (status === "warn") return { type: "warn", label: "Mejorable" };
  if (status === "neutral") return { type: "neutral", label: "Opcional" };
  return { type: "bad", label: "Pendiente" };
}

/* =========================
   Background premium wrapper
========================= */
function PremiumBg({ children }) {
  return (
    <main className="relative min-h-screen text-slate-50 bg-slate-950 overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_0%,rgba(56,189,248,0.14),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(700px_420px_at_15%_15%,rgba(16,185,129,0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(700px_420px_at_85%_35%,rgba(59,130,246,0.12),transparent_55%)]" />
        <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-black/35 to-transparent" />
      </div>
      <div className="relative">{children}</div>
    </main>
  );
}

/* =========================
   ✅ Mobile Sticky CTA
========================= */
function MobileStickyCTA({ waHref, onAfinar, onPlan }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] sm:hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
      <div className="pointer-events-auto mx-auto max-w-[1100px] px-4 pb-[max(14px,env(safe-area-inset-bottom,0px))] pt-3">
        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/80 backdrop-blur shadow-[0_20px_60px_rgba(0,0,0,0.55)] p-2">
          <div className="grid grid-cols-2 gap-2">
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="h-12 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-sm inline-flex items-center justify-center"
            >
              WhatsApp →
            </a>
            <button
              type="button"
              onClick={onAfinar}
              className="h-12 rounded-2xl border border-slate-700 bg-slate-900/40 hover:bg-slate-900/60 text-slate-100 font-semibold text-sm"
            >
              Afinar
            </button>
          </div>

          <button
            type="button"
            onClick={onPlan}
            className="mt-2 h-11 w-full rounded-2xl border border-slate-800/70 bg-slate-950/30 hover:bg-slate-950/40 text-slate-200 font-semibold text-sm"
          >
            Ver mi plan
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Modal Amortización
========================= */
function AmortModal({ open, onClose, data, onGoSimular }) {
  const preview = useMemo(() => {
    if (!open) return null;

    const base = data?.input || data?.entrada || {};
    const root = data || {};
    const resultado = data?.resultado || data?.result || data?.resultadoNormalizado || {};

    const valor = toNum(
      base?.valorVivienda ??
        base?.precioVivienda ??
        base?.valor ??
        root?.valorVivienda ??
        root?.valor ??
        resultado?.valorVivienda ??
        resultado?.valor ??
        0
    );

    const entrada = toNum(
      base?.entradaDisponible ??
        base?.entrada ??
        root?.entradaDisponible ??
        root?.entrada ??
        resultado?.entradaDisponible ??
        resultado?.entrada ??
        0
    );

    const principal = Math.max(0, valor - entrada);

    const years =
      toNum(
        resultado?.plazoAnios ??
          resultado?.plazo ??
          base?.plazoAnios ??
          base?.plazo ??
          root?.plazoAnios ??
          root?.plazo ??
          25
      ) || 25;

    if (principal <= 0) {
      return { error: "No tenemos monto a financiar (valor - entrada) para generar la amortización." };
    }

    // ✅ Preferir tasa FIJA del backend si viene en resultado
    const tasaRaw =
      resultado?.tasaAnual ??
      resultado?.tasa ??
      resultado?.tasaFija ??
      resultado?.tasaInteres ??
      data?.tasaAnual ??
      data?.tasa ??
      null;

    // Normaliza: 4.99 -> 4.99 | 0.0499 -> 4.99
    const tasaBackendPct = (() => {
      const x = toNum(tasaRaw);
      if (!Number.isFinite(x) || x <= 0) return null;
      return x > 1.5 ? x : x * 100;
    })();

    let tasaUI = null;
    let annualRateToUse = null;

    if (tasaBackendPct) {
      annualRateToUse = tasaBackendPct; // %
      tasaUI = {
        mode: "exacta",
        labelMain: `${tasaBackendPct.toFixed(2)}%`,
        labelSub: "Tasa fija (backend)",
      };
    } else {
      const t = inferTasaForModal(data); // %
      annualRateToUse = t.mid;
      tasaUI = {
        mode: "rango",
        labelMain: `${t.min.toFixed(1)}% – ${t.max.toFixed(1)}%`,
        labelSub: `Usando punto medio: ${t.mid.toFixed(1)}%`,
      };
    }

    const sched = buildAmortSchedulePreview({
      principal,
      annualRate: annualRateToUse,
      years,
    });

    return {
      principal,
      years,
      tasaUI,
      ...sched,
    };
  }, [open, data]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center">
      <button type="button" aria-label="Cerrar" onClick={onClose} className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

      <div className="relative w-full sm:max-w-[980px] m-0 sm:m-6 rounded-t-3xl sm:rounded-3xl border border-slate-800/80 bg-slate-950/90 shadow-[0_30px_120px_rgba(0,0,0,0.65)]">
        <div className="p-5 sm:p-6 border-b border-slate-800/70 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-slate-400">Tabla de amortización (preview)</p>
            <h3 className="mt-2 text-xl sm:text-2xl font-semibold text-slate-50">Primer año: así se repartiría tu cuota</h3>
            <p className="mt-2 text-[12px] text-slate-400">Orientativo. La tasa real y condiciones finales las confirma el banco.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:border-slate-500"
          >
            Cerrar
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {preview?.error ? (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
              {preview.error}
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-4">
                  <p className="text-[11px] text-slate-400">Monto a financiar</p>
                  <p className="mt-1 text-lg font-semibold">{fmtMoney(preview?.principal)}</p>
                </div>

                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-4">
                  <p className="text-[11px] text-slate-400">Tasa estimada</p>
                  <p className="mt-1 text-lg font-semibold">{preview?.tasaUI?.labelMain || "—"}</p>
                  {preview?.tasaUI?.labelSub ? <p className="mt-1 text-[11px] text-slate-500">{preview.tasaUI.labelSub}</p> : null}
                </div>

                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-4">
                  <p className="text-[11px] text-slate-400">Plazo</p>
                  <p className="mt-1 text-lg font-semibold">{preview?.years} años</p>
                </div>

                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-4">
                  <p className="text-[11px] text-slate-400">Cuota estimada</p>
                  <p className="mt-1 text-lg font-semibold">{fmtMoney(preview?.payment)}/mes</p>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800/70">
                <div className="max-h-[360px] overflow-auto bg-slate-950/20">
                  <table className="min-w-full text-left text-[12px]">
                    <thead className="sticky top-0 bg-slate-950/90 backdrop-blur border-b border-slate-800/70">
                      <tr className="text-slate-300">
                        <th className="px-4 py-3 font-semibold">Mes</th>
                        <th className="px-4 py-3 font-semibold">Pago</th>
                        <th className="px-4 py-3 font-semibold">Interés</th>
                        <th className="px-4 py-3 font-semibold">Capital</th>
                        <th className="px-4 py-3 font-semibold">Saldo</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-200">
                      {(preview?.rows || []).map((r) => (
                        <tr key={r.mes} className="border-b border-slate-900/60">
                          <td className="px-4 py-3 text-slate-300">{r.mes}</td>
                          <td className="px-4 py-3">{fmtMoney(r.pago)}</td>
                          <td className="px-4 py-3">{fmtMoney(r.interes)}</td>
                          <td className="px-4 py-3">{fmtMoney(r.capital)}</td>
                          <td className="px-4 py-3">{fmtMoney(r.saldo)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-950/40 border-t border-slate-800/70 grid gap-3 sm:grid-cols-4">
                  <div>
                    <p className="text-[11px] text-slate-400">Pago total (12 meses)</p>
                    <p className="mt-1 font-semibold">{fmtMoney(preview?.totals?.pagoTotal)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Interés total (12 meses)</p>
                    <p className="mt-1 font-semibold">{fmtMoney(preview?.totals?.interesTotal)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Capital total (12 meses)</p>
                    <p className="mt-1 font-semibold">{fmtMoney(preview?.totals?.capitalTotal)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Saldo fin año 1</p>
                    <p className="mt-1 font-semibold">{fmtMoney(preview?.totals?.saldoFinal)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose?.();
                    onGoSimular?.();
                  }}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-semibold text-sm transition"
                >
                  Ajustar escenario (tasa/plazo/entrada) →
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center px-5 py-3 rounded-2xl border border-slate-700 text-slate-100 font-semibold text-sm hover:border-slate-500 transition"
                >
                  Volver al resumen
                </button>
              </div>

              <p className="mt-3 text-[11px] text-slate-500">Nota: no incluye seguros/costos del banco. Asume tasa fija para estimación.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================
   Progreso (Page)
========================= */
export default function Progreso() {
  const nav = useNavigate();
  const { token, logout, user } = useCustomerAuth();

  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("unknown"); // "backend" | "local" | "none"
  const [snap, setSnap] = useState(null);
  const [error, setError] = useState("");

  const [taskDone, setTaskDone] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_TASKS) || "{}");
    } catch {
      return {};
    }
  });

  const [advisorOpen, setAdvisorOpen] = useState(false);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [amortOpen, setAmortOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(LS_TASKS, JSON.stringify(taskDone || {}));
  }, [taskDone]);

  // ✅ NAV HELPERS (IMPORTANTE): asegura que "Afinar" NUNCA caiga al formulario/quick
  const goAfinar = (path = SIM_JOURNEY) => {
    try {
      localStorage.setItem("hl_entry_mode", "journey");
    } catch {}
    nav(path);
  };

  const goQuick = () => {
    try {
      localStorage.setItem("hl_entry_mode", "quick");
    } catch {}
    nav("/simulador?mode=quick");
  };

  // ✅ Regla: Progreso es SOLO Journey (requiere login)
  useEffect(() => {
    if (!token) {
      nav("/login", { replace: true, state: { returnTo: "/progreso", from: "progreso" } });
    }
  }, [token, nav]);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError("");

      if (!token) {
        setSnap(null);
        setSource("none");
        setLoading(false);
        return;
      }

      try {
        // 1) Validar sesión y obtener email real
        const meRes = await fetch(`${API_BASE}/api/customer-auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (meRes.status === 401) {
          logout();
          nav("/login", { replace: true, state: { returnTo: "/progreso", from: "progreso" } });
          return;
        }
        if (!meRes.ok) throw new Error(`Error sesión (${meRes.status})`);

        const meJson = await meRes.json().catch(() => null);

        const meEmail =
          meJson?.email ||
          meJson?.customer?.email ||
          meJson?.user?.email ||
          meJson?.data?.email ||
          user?.email ||
          "";

        const meEmailNorm = normalizeEmail(meEmail);

        // 2) Cargar lead del journey (backend)
        const leadRes = await fetch(`${API_BASE}/api/customer/leads/mine`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (leadRes.status === 401) {
          logout();
          nav("/login", { replace: true, state: { returnTo: "/progreso", from: "progreso" } });
          return;
        }

        if (leadRes.status === 404) {
          // ✅ No hay lead: NO mostrar datos viejos
          try {
            clearJourneyLocal?.();
          } catch {}
          if (!alive) return;
          setSnap(null);
          setSource("none");
          setLoading(false);
          return;
        }

        if (!leadRes.ok) throw new Error(`No se pudo cargar lead (${leadRes.status})`);

        const leadData = await leadRes.json().catch(() => null);
        const lead = leadData?.lead || leadData?.data || leadData;

        // algunos backends guardan entrada dentro de lead.entrada.entrada
        const entradaObj =
          lead?.entrada &&
          typeof lead.entrada === "object" &&
          lead.entrada.entrada &&
          typeof lead.entrada.entrada === "object"
            ? lead.entrada.entrada
            : lead?.entrada || {};

        const mergedInput = mergePreferValues(
          lead?.input && typeof lead.input === "object" ? lead.input : {},
          lead?.metadata?.input && typeof lead.metadata.input === "object" ? lead.metadata.input : {},
          entradaObj && typeof entradaObj === "object" ? entradaObj : {}
        );

        const backendResult =
          lead?.resultado ||
          lead?.resultadoNormalizado ||
          lead?.resultadoSimulacion ||
          lead?.result ||
          lead?.resultadoV1 ||
          lead?.entrada?.resultado ||
          {};

        const hasBackendResult = backendResult && Object.keys(backendResult || {}).length > 0;

        if (!hasBackendResult) {
          if (!alive) return;
          setSnap(null);
          setSource("none");
          setLoading(false);
          return;
        }

        // ✅ SOLO AQUÍ sellamos owner + ts (porque ya hay lead real)
        if (meEmailNorm) {
          try {
            localStorage.setItem(LS_JOURNEY_OWNER_EMAIL, meEmailNorm);
            localStorage.setItem(LS_JOURNEY_TS, String(Date.now()));
          } catch {}
        }

        // ✅ backendSnap “sellado”
        const backendSnap = {
          input: mergedInput,
          resultado: backendResult,
          userEmail: meEmailNorm || "",
          ts: Date.now(),
        };

        if (!alive) return;
        setSnap(backendSnap);
        setSource("backend");
      } catch (e) {
        // 3) Fallback local SOLO si:
        // - tenemos email real de SESIÓN (no usamos owner LS como sustituto)
        const localSnap = readJourneyLocal?.() || null;

        if (!alive) return;

        const currentEmail = normalizeEmail(user?.email); // ✅ solo sesión real

        if (currentEmail && shouldUseLocalFallback(localSnap, currentEmail)) {
          setSnap(localSnap);
          setSource("local");
          setError("No pudimos cargar tu progreso sincronizado. Mostrando tu guardado local (de tu cuenta) por ahora.");
        } else {
          try {
            clearJourneyLocal?.();
          } catch {}

          setSnap(null);
          setSource("none");
          setError(e?.message || "No se pudo cargar tu progreso");
        }
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [token, logout, nav, user?.email]);

  const data = useMemo(() => buildDataFromSnap(snap), [snap]);
  const sourceLabel = source === "backend" ? "Sincronizado" : source === "local" ? "Guardado local" : "—";

  const suggestedTasks = useMemo(() => (data.hasSnap ? buildSuggestedTasks(data) : []), [data]);
  const completedCount = suggestedTasks.reduce((acc, t) => acc + (taskDone?.[t.id] ? 1 : 0), 0);

  const displayName = useMemo(() => {
    const raw =
      user?.firstName ||
      user?.nombre ||
      user?.name ||
      user?.fullName ||
      user?.displayName ||
      safeNameFromEmail(user?.email) ||
      "👋";
    return String(raw || "").trim();
  }, [user]);

  const greeting = displayName === "👋" ? "Hola" : `Hola, ${displayName}`;

  const waMessage = useMemo(() => {
    const parts = [];
    parts.push("Hola HabitaLibre, quiero ayuda con mi precalificación.");
    if (user?.email) parts.push(`Mi correo: ${user.email}`);
    if (data?.precioMaxVivienda != null) parts.push(`Precio máximo estimado: ${fmtMoney(data.precioMaxVivienda)}`);
    if (data?.cuotaEstimada != null) parts.push(`Cuota estimada: ${fmtMoney(data.cuotaEstimada)}/mes`);
    if (data?.suggestedCredit) parts.push(`Crédito sugerido: ${data.suggestedCredit}`);
    if (data?.probAprobacion != null) parts.push(`Probabilidad estimada hoy: ${data.probAprobacion}%`);
    parts.push("¿Me pueden orientar con los siguientes pasos?");
    return encodeURIComponent(parts.join("\n"));
  }, [user?.email, data?.precioMaxVivienda, data?.cuotaEstimada, data?.suggestedCredit, data?.probAprobacion]);

  const WHATSAPP_NUMBER = "593985476936"; // 👈 cambia esto
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`;

  const docChecklist = useMemo(() => (data.hasSnap ? buildDocumentChecklist(data) : []), [data]);

  const topTasks = useMemo(() => {
    const weight = (x) => (x.impact === "alto" ? 3 : x.impact === "medio" ? 2 : 1);
    const sorted = [...suggestedTasks].sort((a, b) => weight(b) - weight(a));
    return sorted.slice(0, 3);
  }, [suggestedTasks]);

  const tasksToRender = showAllTasks ? suggestedTasks : topTasks;

  const goJourney = () => {
    try {
      localStorage.setItem("hl_entry_mode", "journey");
    } catch {}
    nav(SIM_JOURNEY);
  };

  if (loading) {
    return (
      <PremiumBg>
        <div className="mx-auto max-w-[1100px] px-5 sm:px-6 py-10">
          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/50 p-6">
            <h1 className="text-xl font-semibold">Camino hacia tu aprobación</h1>
            <p className="mt-2 text-sm text-slate-400">Cargando tu información…</p>
          </div>
        </div>
      </PremiumBg>
    );
  }

  // ✅ EMPTY STATE
  if (!data?.hasSnap) {
    return (
      <PremiumBg>
        <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-xl">
          <div className="mx-auto max-w-[1100px] px-5 sm:px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div
                className="h-11 w-11 rounded-2xl bg-slate-900/90 border border-emerald-400/60
                           shadow-[0_0_25px_rgba(16,185,129,0.35)]
                           flex items-center justify-center overflow-hidden"
              >
                <img src={HIcon} alt="HabitaLibre" className="h-7 w-7 object-contain" />
              </div>
              <div className="leading-tight">
                <div className="font-bold text-lg text-white tracking-tight">HabitaLibre</div>
                <div className="text-[11px] text-emerald-300/90">Camino hacia tu aprobación</div>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline rounded-full bg-slate-900/70 px-3 py-1 text-[11px] text-slate-300 ring-1 ring-slate-700/70">
                {sourceLabel}
              </span>

              <button
                type="button"
                onClick={() => {
                  logout();
                  nav("/login", { replace: true });
                }}
                className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-200 hover:border-slate-600"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1100px] px-5 sm:px-6 py-8">
          {error ? (
            <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
              {error}
            </div>
          ) : null}

          <div className="rounded-3xl border border-slate-800/70 bg-slate-950/40 shadow-[0_20px_80px_-40px_rgba(0,0,0,0.8)]">
            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-slate-400">Tu tablero personal</div>
                  <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-50">
                    Tu Camino HabitaLibre comienza aquí
                  </h1>
                  <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl">
                    En menos de 2 minutos analizamos tu perfil y te damos un plan claro para aumentar tu probabilidad de aprobación.
                  </p>
                  {user?.email ? <p className="mt-2 text-[12px] text-slate-500">Sesión: {user.email}</p> : null}
                </div>

                <span className="shrink-0 rounded-full border border-slate-700/70 bg-slate-900/60 px-3 py-1 text-[11px] text-slate-300">
                  Nuevo
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { t: "Probabilidad real", d: "Un estimado claro según tu perfil." },
                  { t: "Ruta óptima", d: "VIS / VIP / BIESS / banca privada." },
                  { t: "Plan 30-60-90", d: "Acciones concretas para mejorar." },
                  { t: "Progreso guardado", d: "Vuelves cuando quieras sin empezar de cero." },
                ].map((x) => (
                  <div key={x.t} className="rounded-2xl border border-slate-800/70 bg-slate-900/30 px-4 py-3">
                    <div className="text-sm font-semibold text-slate-100">{x.t}</div>
                    <div className="mt-0.5 text-[12px] text-slate-400">{x.d}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[12px] text-emerald-100">Completa tu Camino y desbloquea tu checklist + plan personalizado.</div>
                  <div className="flex items-center gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={[
                          "h-2.5 w-2.5 rounded-full border",
                          i === 0 ? "bg-emerald-400 border-emerald-300" : "bg-transparent border-emerald-500/30",
                        ].join(" ")}
                      />
                    ))}
                    <span className="ml-2 text-[11px] text-emerald-200/80">0/4</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={goJourney}
                  className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:opacity-95 active:scale-[0.99] transition"
                >
                  Iniciar mi Camino →
                  <span className="block text-[11px] font-medium opacity-80">guarda tu progreso y tu plan</span>
                </button>

                <div className="sm:ml-auto text-[11px] text-slate-500 leading-relaxed">
                  HabitaLibre no es un banco. Te ayudamos a prepararte para que el banco te diga que sí.
                </div>
              </div>

              {/* Mantengo goQuick si luego quieres usarlo en UI */}
              {/* <button onClick={goQuick}>Modo quick</button> */}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              className="text-[11px] text-slate-400 hover:text-slate-200 underline"
              onClick={() => {
                clearJourneyLocal?.();
                localStorage.removeItem(LS_TASKS);
                try {
                  localStorage.removeItem(LS_JOURNEY_OWNER_EMAIL);
                  localStorage.removeItem(LS_JOURNEY_TS);
                } catch {}
              }}
            >
              Borrar progreso local
            </button>
            <span className="text-[11px] text-slate-600">Tip: completa el Journey para ver tu tablero.</span>
          </div>
        </div>
      </PremiumBg>
    );
  }

  return (
    <PremiumBg>
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto max-w-[1100px] px-5 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div
              className="h-11 w-11 rounded-2xl bg-slate-900/90 border border-emerald-400/60
                         shadow-[0_0_25px_rgba(16,185,129,0.35)]
                         flex items-center justify-center overflow-hidden"
            >
              <img src={HIcon} alt="HabitaLibre" className="h-7 w-7 object-contain" />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-lg text-white tracking-tight">HabitaLibre</div>
              <div className="text-[11px] text-emerald-300/90">Camino hacia tu aprobación</div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline rounded-full bg-slate-900/70 px-3 py-1 text-[11px] text-slate-300 ring-1 ring-slate-700/70">
              {sourceLabel}
            </span>

            {/* ✅ CTA PRIMARIO (desktop) */}
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold text-xs transition"
              title="Hablar con un asesor por WhatsApp"
            >
              Hablar con asesor →
            </a>

            {/* ✅ AFINAR: usa helper para forzar journey */}
            <button
              type="button"
              onClick={() => goAfinar(SIM_JOURNEY)}
              className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-slate-700 text-slate-100 font-semibold text-xs hover:border-slate-500 transition"
              title="Ajusta tu escenario para mejorar tu resultado"
            >
              Afinar
            </button>

            <button
              type="button"
              onClick={() => setAdvisorOpen(true)}
              className="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-full border border-slate-700/70 bg-slate-950/20 text-slate-200 font-semibold text-xs hover:bg-slate-950/30 transition"
              title="Ver tu plan y checklist"
            >
              Ver mi plan
            </button>

            <button
              type="button"
              onClick={() => {
                logout();
                nav("/login", { replace: true });
              }}
              className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-200 hover:border-slate-600"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-[1100px] px-5 sm:px-6 pb-4">
          <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 px-4 py-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[11px] ${chipClass(data.probGrade.type)}`}>
                  Probabilidad {data.probGrade.label}: {data.probAprobacion}%
                </span>
                <span className="text-[11px] text-slate-400">{data.probGrade.hint}</span>
              </div>
              <div className="text-[11px] text-slate-400">{greeting}</div>
            </div>
          </div>
        </div>
      </header>

      {/* ✅ pb-32 en mobile para que el sticky CTA no tape el contenido */}
      <div className="mx-auto max-w-[1100px] px-5 sm:px-6 py-8 pb-32 sm:pb-8">
        {error ? (
          <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
            {error}. Mostrando <span className="font-semibold">{sourceLabel.toLowerCase()}</span>.
          </div>
        ) : null}

        <section className="rounded-3xl border border-slate-800/70 bg-slate-900/50 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.9)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.2em] uppercase text-slate-400">Tu resumen de hoy</p>
              <h1 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">{greeting}</h1>
              <p className="mt-2 text-[12px] text-slate-400">Te mostramos lo esencial para avanzar sin complicarte.</p>
              {user?.email ? <p className="mt-2 text-[12px] text-slate-500">Sesión: {user.email}</p> : null}
            </div>

            <span
              title="Esto no es aprobación bancaria. Es una lectura referencial."
              className="rounded-full bg-slate-900/70 px-3 py-1 text-[11px] text-slate-300 ring-1 ring-slate-700/70"
            >
              Precalificación
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-4">
              <p className="text-[11px] text-slate-400">Precio máximo estimado</p>
              <p className="mt-1 text-xl font-semibold">{data.precioMaxVivienda != null ? fmtMoney(data.precioMaxVivienda) : "—"}</p>
            </div>

            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-4">
              <p className="text-[11px] text-slate-400">Cuota mensual estimada</p>
              <p className="mt-1 text-xl font-semibold">{data.cuotaEstimada != null ? `${fmtMoney(data.cuotaEstimada)}/mes` : "—"}</p>
            </div>

            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-4">
              <p className="text-[11px] text-slate-400">Crédito sugerido</p>
              <p className="mt-1 text-xl font-semibold">{data.suggestedCredit || "—"}</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-800/70 bg-slate-950/20 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-slate-400">Tu siguiente paso</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">{data.nextBestAction.title}</p>
                <p className="mt-1 text-[12px] text-slate-400">{data.nextBestAction.desc}</p>
                <p className="mt-2 text-[11px] text-slate-500">
                  Tip: con 1–2 ajustes puedes mejorar condiciones. Si quieres, te guiamos en WhatsApp.
                </p>
              </div>
              <span className="self-start sm:self-auto rounded-full bg-slate-900/70 px-3 py-1 text-[11px] text-slate-300 ring-1 ring-slate-700/70">
                Impacto {data.nextBestAction.impact}
              </span>
            </div>
          </div>

          <div className="mt-5 hidden sm:flex flex-col sm:flex-row gap-3">
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-emerald-400 text-slate-950 font-semibold text-sm hover:bg-emerald-300 transition"
            >
              Hablar con un asesor →
            </a>

            {/* ✅ AFINAR (CTA) */}
            <button
              type="button"
              onClick={() => goAfinar(SIM_JOURNEY)}
              className="inline-flex items-center justify-center px-6 py-3 rounded-2xl border border-slate-700 text-slate-100 font-semibold text-sm hover:border-slate-500 transition"
            >
              Afinar mi resultado
            </button>

            <button
              type="button"
              onClick={() => setAdvisorOpen(true)}
              className="inline-flex items-center justify-center px-6 py-3 rounded-2xl border border-slate-800/70 bg-slate-950/20 text-slate-200 font-semibold text-sm hover:bg-slate-950/30 transition"
            >
              Ver mi plan
            </button>
          </div>

          <p className="mt-3 text-[11px] text-slate-400">Estimación basada en tu información declarada. No es aprobación bancaria.</p>
        </section>

        <div className="mt-4">
          <HLScoreCard
            data={data}
            onGoSimular={() => goAfinar(SIM_JOURNEY)}
            onOpenAmortizacion={() => setAmortOpen(true)}
            onOpenAsesor={() => window.open(waHref, "_blank", "noreferrer")}
          />
        </div>

        <section id="mejoras" className="mt-5 rounded-3xl border border-slate-800/70 bg-slate-900/50 p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-100">Tu plan (simple)</h2>
              <p className="mt-1 text-[12px] text-slate-400">
                Enfócate en lo que más sube tu probabilidad.{" "}
                <span className="text-slate-200 font-semibold">
                  {completedCount}/{suggestedTasks.length}
                </span>{" "}
                completadas
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAllTasks((v) => !v)}
              className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-slate-700 text-slate-100 text-xs hover:border-slate-500 transition"
            >
              {showAllTasks ? "Ver menos" : "Ver todas"}
            </button>
          </div>

          <div className="mt-4 grid gap-3">
            {tasksToRender.map((t) => {
              const done = !!taskDone?.[t.id];

              const impactPill =
                t.impact === "alto"
                  ? { type: "warn", label: "Impacto alto" }
                  : t.impact === "medio"
                  ? { type: "neutral", label: "Impacto medio" }
                  : { type: "ok", label: "OK" };

              const isPrimaryWhatsApp = t.ctaHref === "whatsapp";

              return (
                <div
                  key={t.id}
                  className="rounded-2xl border border-slate-800/70 bg-slate-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => setTaskDone((prev) => ({ ...(prev || {}), [t.id]: !done }))}
                      className={`mt-1 h-5 w-5 rounded border ${done ? "bg-emerald-400 border-emerald-300" : "border-slate-600"}`}
                      aria-label={done ? "Marcar como pendiente" : "Marcar como hecho"}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-semibold ${done ? "text-slate-400 line-through" : "text-slate-100"}`}>{t.title}</p>
                        <span className="rounded-full bg-slate-900/70 px-2.5 py-0.5 text-[10px] text-slate-300 ring-1 ring-slate-700/70">
                          {t.badge}
                        </span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] ${chipClass(impactPill.type)}`}>
                          {impactPill.label}
                        </span>
                      </div>
                      <p className={`mt-1 text-[12px] ${done ? "text-slate-500" : "text-slate-400"}`}>{t.desc}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {t.ctaHref === "whatsapp" ? (
                      <a
                        href={waHref}
                        target="_blank"
                        rel="noreferrer"
                        className={[
                          "inline-flex items-center justify-center px-4 py-2 rounded-full font-semibold text-xs transition",
                          isPrimaryWhatsApp
                            ? "bg-emerald-400 hover:bg-emerald-300 text-slate-950"
                            : "bg-blue-500 hover:bg-blue-400 text-slate-950",
                        ].join(" ")}
                      >
                        {t.ctaText}
                      </a>
                    ) : t.ctaHref?.startsWith("#") ? (
                      <button
                        type="button"
                        onClick={() => {
                          const id = String(t.ctaHref).replace("#", "");
                          const el = document.getElementById(id);
                          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-400 text-slate-950 font-semibold text-xs transition"
                      >
                        {t.ctaText}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          // ✅ FIX CLAVE: si el CTA manda a journey, forzamos entry_mode=journey
                          if (t.ctaHref === SIM_JOURNEY || String(t.ctaHref || "").startsWith("/simular?mode=journey")) {
                            goAfinar(t.ctaHref);
                            return;
                          }
                          nav(t.ctaHref);
                        }}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-400 text-slate-950 font-semibold text-xs transition"
                      >
                        {t.ctaText}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px] text-slate-500">
              {source === "backend" ? "Tu progreso está sincronizado con tu cuenta." : "Mostrando guardado local (fallback)."}
            </p>

            <button
              type="button"
              className="text-[11px] text-slate-400 hover:text-slate-200 underline"
              onClick={() => {
                clearJourneyLocal?.();
                localStorage.removeItem(LS_TASKS);
                try {
                  localStorage.removeItem(LS_JOURNEY_OWNER_EMAIL);
                  localStorage.removeItem(LS_JOURNEY_TS);
                } catch {}
                window.location.reload();
              }}
            >
              Borrar progreso local
            </button>
          </div>
        </section>

        <div className="mt-5 space-y-3">
          <details className="rounded-3xl border border-slate-800/70 bg-slate-900/50 p-6">
            <summary className="cursor-pointer list-none">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-100">Producto recomendado</h2>
                  <p className="mt-1 text-[12px] text-slate-400">Solo si quieres ver el detalle del “por qué”.</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[11px] ${chipClass(data.probGrade.type)}`}>
                  {data.suggestedCredit} • {data.probAprobacion}% estimado
                </span>
              </div>
            </summary>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-800/70 bg-slate-950/20 p-4">
                <p className="text-[11px] tracking-[0.2em] uppercase text-slate-400">Por qué sí</p>
                <ul className="mt-2 space-y-2 text-[12px] text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-300">•</span> Entrada: {fmtPct(data.entradaPct)} (meta ref: {fmtPct(data.entradaObjetivoPct)})
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-300">•</span> Ingreso considerado: {fmtMoney(data.ingresoTotal)}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-300">•</span> Estabilidad: {data.tipoIngreso || "—"}
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-800/70 bg-slate-950/20 p-4">
                <p className="text-[11px] tracking-[0.2em] uppercase text-slate-400">Riesgos típicos</p>
                <ul className="mt-2 space-y-2 text-[12px] text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-300">•</span> Deudas mensuales: {fmtMoney(data.deudas || 0)} (si aplica)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-300">•</span> Documentación incompleta o inconsistencias
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-300">•</span> Antigüedad laboral baja en algunos bancos
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-800/70 bg-slate-950/20 p-4">
                <p className="text-[11px] tracking-[0.2em] uppercase text-slate-400">Siguiente paso</p>
                <p className="mt-2 text-[12px] text-slate-300">
                  Afinar tu simulación para elegir el mejor escenario (entrada/plazo/deudas) y preparar carpeta.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => goAfinar(SIM_JOURNEY)}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-400 text-slate-950 font-semibold text-xs transition"
                  >
                    Afinar ahora →
                  </button>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-slate-700 text-slate-100 font-semibold text-xs hover:border-slate-500 transition"
                  >
                    Asesor
                  </a>
                </div>
              </div>
            </div>
          </details>

          <details id="docs" className="rounded-3xl border border-slate-800/70 bg-slate-900/50 p-6">
            <summary className="cursor-pointer list-none">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-100">Checklist de documentos</h2>
                  <p className="mt-1 text-[12px] text-slate-400">Ábrelo cuando estés listo para armar carpeta.</p>
                </div>
                <span className="rounded-full bg-slate-900/70 px-3 py-1 text-[11px] text-slate-300 ring-1 ring-slate-700/70">
                  Tip: carpeta completa = menos fricción
                </span>
              </div>
            </summary>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {docChecklist.map((it) => {
                const pill = statusPill(it.status);
                return (
                  <div key={it.id} className="rounded-2xl border border-slate-800/70 bg-slate-950/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-100">{it.title}</p>
                        <p className="mt-1 text-[12px] text-slate-400">{it.desc}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] ${chipClass(pill.type)}`}>{pill.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </details>
        </div>
      </div>

      <AdvisorPanel
        open={advisorOpen}
        onClose={() => setAdvisorOpen(false)}
        data={data}
        userEmail={user?.email}
        onNavigate={(href) => {
          if (!href) return;
          if (href.startsWith("http")) {
            window.open(href, "_blank", "noreferrer");
            return;
          }
          // ✅ si el panel manda a journey, fuerza entry_mode=journey
          if (href === SIM_JOURNEY || String(href || "").startsWith("/simular?mode=journey")) {
            goAfinar(href);
            setAdvisorOpen(false);
            return;
          }
          nav(href);
          setAdvisorOpen(false);
        }}
        onAnchor={(href) => {
          if (!href) return;
          const id = String(href).replace("#", "");
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
          setAdvisorOpen(false);
        }}
      />

      <AmortModal
        open={amortOpen}
        onClose={() => setAmortOpen(false)}
        data={snap}
        onGoSimular={() => goAfinar(SIM_JOURNEY_AMORT)}
      />

      {/* ✅ Sticky CTA solo mobile */}
      <MobileStickyCTA waHref={waHref} onAfinar={() => goAfinar(SIM_JOURNEY)} onPlan={() => setAdvisorOpen(true)} />
    </PremiumBg>
  );
}
