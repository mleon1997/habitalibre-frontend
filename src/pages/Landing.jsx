// src/pages/Landing.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  SparklesIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  StarIcon,
  XMarkIcon,
  PresentationChartLineIcon,
  BuildingOffice2Icon,
  LockClosedIcon,
  Bars3Icon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

import HIcon from "../assets/HICON.png";
import HLogo from "../assets/HLOGO.png";
import { trackEvent, trackPageView } from "../lib/analytics";
import { useNavigate } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuthContext.jsx";
import WhatsAppFab from "../components/WhatsAppFab.jsx";


export default function Landing({ onStart }) {
  const [activeLegalSection, setActiveLegalSection] = useState(null);

  const navigate = useNavigate();
  const { token } = useCustomerAuth();

  // Page view
  useEffect(() => {
    trackPageView("landing_home");
  }, []);

  const handleStart = (source = "unknown") => {
    trackEvent("cta_iniciar_simulacion_click", { source });

    // ✅ Landing = maximiza precalificaciones (quick mode)
    try {
      localStorage.setItem("hl_entry_mode", "quick");
    } catch {}

    if (typeof onStart === "function") {
      onStart();
    } else {
     navigate("/precalificar");

    }
  };

  // ✅ CTA secundario (Guardar/Progreso) — mobile
  const handleMobileAccount = (source = "unknown") => {
    trackEvent("cta_guardar_progreso_click", { source });

    // Si ya está logueado → progreso
    if (token) {
      navigate("/progreso");
      return;
    }

    // Si no está logueado → register y volver al journey
    try {
      localStorage.setItem("hl_entry_mode", "journey");
    } catch {}

    const returnTo = "/precalificar?mode=journey";
    navigate(`/login?intent=register&returnTo=${encodeURIComponent(returnTo)}`);
  };

  const openLegal = (section) => {
    setActiveLegalSection(section);
    trackEvent("modal_legal_open", { section });
  };

  const closeLegal = () => {
    if (activeLegalSection) {
      trackEvent("modal_legal_close", { section: activeLegalSection });
    }
    setActiveLegalSection(null);
  };

  // Animación base suave
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" },
    viewport: { once: true, amount: 0.3 },
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* NAVBAR */}
      <header className="border-b border-slate-800/70 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          {/* Logo HabitaLibre */}
          <div className="flex items-center gap-3">
            <div
              className="
                h-12 w-12 md:h-14 md:w-14
                rounded-2xl bg-slate-900/90 
                border border-emerald-400/60
                shadow-[0_0_25px_rgba(16,185,129,0.4)]
                flex items-center justify-center overflow-hidden
              "
            >
              <img
                src={HIcon}
                alt="HabitaLibre"
                className="h-7 w-7 md:h-8 md:w-8 object-contain"
              />
            </div>

            <div className="leading-tight">
              <div className="font-bold text-lg md:text-xl text-white tracking-tight">
                HabitaLibre
              </div>
              <div className="text-[11px] md:text-xs text-emerald-300/90">
                Hipoteca exprés · VIS · VIP · BIESS
              </div>
            </div>
          </div>

          {/* NAV LINKS - DESKTOP */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#como-funciona" className="text-slate-300 hover:text-slate-50">
              Cómo funciona
            </a>

            <a href="#beneficios" className="text-slate-300 hover:text-slate-50">
              Beneficios
            </a>

            <a href="#nosotros" className="text-slate-300 hover:text-slate-50">
              Nosotros
            </a>

            <a href="#testimonios" className="text-slate-300 hover:text-slate-50">
              Testimonios
            </a>

            {/* 👤 LOGIN / PROGRESO */}
            <button
              onClick={() => navigate(token ? "/progreso" : "/login")}
              className="text-slate-200 hover:text-white transition text-sm"
            >
              {token ? "Mi progreso" : "Iniciar sesión"}
            </button>

            {/* CTA PRINCIPAL */}
            <button
              onClick={() => handleStart("navbar_primary")}
              className="px-5 py-2.5 rounded-full bg-blue-500 hover:bg-blue-400
               text-slate-950 font-semibold text-sm shadow-lg transition"
            >
              Iniciar precalificación
            </button>
          </nav>

          {/* CTA MOBILE */}
          <button
            onClick={() => handleStart("navbar_mobile")}
            className="md:hidden px-4 py-2 rounded-full bg-emerald-400 text-slate-950 text-xs font-semibold shadow-[0_12px_30px_rgba(16,185,129,0.55)] active:scale-[.97] transition"
          >
            Precalificar ahora
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),transparent_55%),_radial-gradient(circle_at_bottom,_rgba(37,99,235,0.25),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
            {/* LEFT – copy principal */}
            <motion.div {...fadeUp}>
              {/* Marca HabitaLibre en el hero */}
              <div className="inline-flex items-center gap-3 rounded-full bg-slate-900/80 border border-slate-800/80 px-3.5 py-1.5 mb-4 shadow-[0_14px_40px_rgba(15,23,42,0.85)]">
                <div
                  className="
                    h-9 w-9 md:h-10 md:w-10
                    rounded-2xl bg-slate-950
                    border border-emerald-400/60
                    shadow-[0_0_20px_rgba(16,185,129,0.5)]
                    flex items-center justify-center overflow-hidden
                  "
                >
                  <img
                    src={HIcon}
                    alt="HabitaLibre"
                    className="h-7 w-7 md:h-8 md:w-8 object-contain"
                  />
                </div>
                <span className="text-[11px] font-semibold tracking-[0.18em] text-slate-200">
                  HABITALIBRE
                </span>
                <span className="hidden sm:inline text-[11px] text-slate-400">
                  Precalificación hipotecaria digital en Ecuador
                </span>
              </div>

              <p className="text-[11px] tracking-[0.2em] uppercase text-slate-400 mb-3">
                ● Sin afectar tu buró · resultado en menos de 2 minutos
              </p>

              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-50 mb-4">
                Tu camino fácil a la
                <br />
                vivienda propia{" "}
                <span role="img" aria-label="house">
                  🏡
                </span>
              </h1>

              <p className="text-sm md:text-[15px] text-slate-300 max-w-xl mb-6">
                En menos de 2 minutos ves cuánto podrías comprar hoy y con qué
                tipo de crédito avanzar (VIS, VIP, BIESS o banca privada).
                Recibes un resumen claro en tu correo, sin ir al banco, sin
                papeleo y sin consultas a tu buró.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3 mb-4">
                <button
                  onClick={() => handleStart("hero_primary")}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-emerald-400 text-slate-950 font-semibold text-sm shadow-[0_18px_40px_rgba(16,185,129,0.45)] hover:bg-emerald-300 transition"
                >
                  Precalificar ahora
                  <span className="ml-1.5 text-base">→</span>
                </button>

                <button
                  type="button"
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-slate-600/80 text-slate-200 text-sm hover:border-slate-400 hover:text-slate-50 transition"
                  onClick={() => {
                    trackEvent("cta_ver_ejemplo_resultado_click", { source: "hero" });
                    const el = document.getElementById("preview");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                >
                  Ver ejemplo de resultado
                </button>
              </div>

              {/* ✅ CTA secundario SOLO mobile */}
<div className="md:hidden">
  <button
    type="button"
    onClick={() => handleMobileAccount("hero_mobile_secondary")}
    className="w-full inline-flex items-center justify-center px-5 py-2.5 rounded-2xl
      border border-emerald-400/35 bg-slate-950/30 text-slate-100 font-semibold text-sm
      shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_18px_50px_rgba(2,6,23,0.55)]
      hover:border-emerald-300/60 hover:bg-emerald-500/10 hover:text-white
      transition active:scale-[.99]"
  >
    {token ? "Ver mi progreso" : "Crear Cuenta/Iniciar Sesión"}
  </button>

  <p className="mt-2 text-[11px] text-slate-500 text-center">
    guarda tu plan
  </p>
</div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-slate-400 mt-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Datos cifrados
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  Enfoque VIS / VIP / BIESS
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
                  Asesoría sin costo
                </div>
              </div>
            </motion.div>

            {/* RIGHT – result card */}
            <motion.div id="preview" {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
              <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-[0_24px_60px_rgba(15,23,42,0.9)] backdrop-blur-sm">
                <div className="flex items-start justify-between text-xs mb-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 border border-slate-700/70 px-2.5 py-1 mb-2">
                      <div className="h-4 w-4 rounded-lg bg-slate-950 flex items-center justify-center border border-emerald-400/60 overflow-hidden">
                        <img src={HLogo} alt="HabitaLibre" className="h-3.5 w-3.5 object-contain" />
                      </div>
                      <span className="text-[11px] text-teal-300 font-medium">
                        Precalificación HabitaLibre
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">Vista previa de tu resultado</p>
                    <p className="text-slate-500 mt-0.5 text-[11px]">
                      Ejemplo con ingresos de $1.600 y deudas moderadas
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-900/40 text-emerald-300 border border-emerald-500/40 text-[11px]">
                    No afecta tu buró
                  </span>
                </div>

                <div className="mb-5">
                  <p className="text-slate-400 text-[11px] mb-1">Capacidad estimada de compra</p>
                  <p className="text-3xl md:text-4xl font-bold tracking-tight">$ 98.500</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Monto referencial de vivienda según tus datos declarados.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="bg-slate-900 border border-slate-700/70 rounded-2xl p-4">
                    <p className="text-slate-400 text-[11px] mb-1">Cuota estimada</p>
                    <p className="font-semibold text-[17px]">$ 480 / mes</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Incluye capital + intereses · Plazo 20 años.
                    </p>
                  </div>

                  <div className="bg-slate-900 border border-slate-700/70 rounded-2xl p-4">
                    <p className="text-slate-400 text-[11px] mb-1">Producto tentativo</p>
                    <p className="font-semibold text-[15px]">VIS / VIP</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Ajustamos según si calificas a subsidio o BIESS.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-[11px] mb-5">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                    <p className="text-slate-400 text-[10px] mb-0.5">Tasa referencial</p>
                    <p className="text-slate-100 font-semibold text-sm">4,87%*</p>
                    <p className="text-slate-500 text-[9px] mt-0.5">Varía por banco y producto.</p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                    <p className="text-slate-400 text-[10px] mb-0.5">Plazo estimado</p>
                    <p className="text-slate-100 font-semibold text-sm">20 años</p>
                    <p className="text-slate-500 text-[9px] mt-0.5">Buscamos balance entre cuota y costo total.</p>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                    <p className="text-slate-400 text-[10px] mb-0.5">Score HabitaLibre</p>
                    <p className="text-slate-100 font-semibold text-sm">82 / 100</p>
                    <p className="text-emerald-400 text-[9px] mt-0.5">Perfil sólido para iniciar tu proceso.</p>
                  </div>
                </div>

                <div className="mb-5 bg-slate-900 border border-slate-700/70 rounded-2xl p-3 flex gap-2 items-start">
                  <div className="mt-0.5 h-6 w-6 rounded-full bg-emerald-500/10 border border-emerald-500/50 flex items-center justify-center text-[13px] text-emerald-300">
                    i
                  </div>
                  <div className="text-[11px] leading-snug text-slate-200">
                    <span className="font-semibold text-emerald-300">Ejemplo:</span>{" "}
                    si reduces tus otras deudas en <span className="font-semibold">$ 150/mes</span>, tu
                    capacidad podría subir hasta aprox. <span className="font-semibold">$ 112.000</span>. En el
                    reporte real te mostramos estos escenarios con tus propios datos.
                  </div>
                </div>

                <button
                  onClick={() => handleStart("card_ver_capacidad_real_button")}
                  className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-semibold text-sm transition flex items-center justify-center gap-2"
                >
                  <div className="h-5 w-5 rounded-lg bg-slate-950 flex items-center justify-center border border-emerald-400/60 overflow-hidden">
                    <img src={HLogo} alt="" className="h-4 w-4 object-contain" />
                  </div>
                  <span>Ver mi capacidad real</span>
                </button>

                <p className="mt-2 text-[10px] text-slate-400 text-center">
                  Precalificación gratuita, sin compromiso con ningún banco.
                </p>

                <p className="text-[9px] text-slate-500 mt-3 leading-snug">
                  *Tasa y condiciones referenciales. Tu resultado real se calcula con tus datos y puede variar según
                  entidad financiera, producto y regulación vigente en Ecuador.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <motion.section
        id="como-funciona"
        className="border-t border-slate-800 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950 scroll-mt-20"
        {...fadeUp}
      >
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-[11px] text-slate-300 mb-3">
                <SparklesIcon className="h-3.5 w-3.5 text-emerald-400" />
                <span>Proceso guiado en menos de 2 minutos</span>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-50">
                ¿Cómo funciona HabitaLibre?
              </h2>
              <p className="mt-2 text-sm text-slate-400 max-w-xl">
                No es solo un simulador. Es una primera lectura realista de
                cuánto podrías comprar y con qué tipo de crédito tiene más
                sentido avanzar.
              </p>
            </div>

            <div className="flex gap-4 text-xs text-slate-400">
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 px-4 py-3">
                <div className="text-[11px] text-slate-500 mb-1">Tiempo promedio</div>
                <div className="text-sm font-semibold text-slate-50">1–2 min</div>
              </div>
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 px-4 py-3">
                <div className="text-[11px] text-slate-500 mb-1">Información requerida</div>
                <div className="text-sm font-semibold text-slate-50">Solo ingresos y deudas</div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3 text-sm">
            {/* Paso 1 */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-emerald-400/60 hover:bg-slate-900">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.16),transparent_55%)]" />
              <div className="relative flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Paso 1</p>
                  <p className="font-semibold text-slate-50">
                    Simulas sin papeles ni claves bancarias
                  </p>
                </div>
              </div>
              <p className="relative text-xs text-slate-400">
                Llenas 4 pasos sencillos con tus ingresos, deudas y si aportas
                o no al IESS. No pedimos claves bancarias ni acceso a tu buró,
                solo datos que tú nos das.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-emerald-400/60 hover:bg-slate-900">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),transparent_55%)]" />
              <div className="relative flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <BanknotesIcon className="h-5 w-5 text-sky-400" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Paso 2</p>
                  <p className="font-semibold text-slate-50">
                    Ves tu rango de compra y tipo de crédito
                  </p>
                </div>
              </div>
              <p className="relative text-xs text-slate-400">
                Calculamos cuánto podrías pagar al mes, tu rango de vivienda y
                qué tipo de crédito tiene más sentido para ti hoy: VIS, VIP,
                BIESS o banca privada, con un score hipotecario fácil de
                entender.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-emerald-400/60 hover:bg-slate-900">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.16),transparent_55%)]" />
              <div className="relative flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <UserGroupIcon className="h-5 w-5 text-fuchsia-400" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Paso 3</p>
                  <p className="font-semibold text-slate-50">
                    Si quieres, te acompañamos hasta el crédito
                  </p>
                </div>
              </div>
              <p className="relative text-xs text-slate-400">
                Si te gusta tu resultado, un asesor HabitaLibre puede ayudarte
                sin costo a ordenar tus documentos, comparar bancos y llegar a
                la opción que mejor combine cuota, plazo y seguridad para tu
                familia.
              </p>
            </div>
          </div>

          {/* CTA MOBILE sección Cómo funciona */}
          <div className="mt-8 flex justify-center md:hidden">
            <button
              onClick={() => handleStart("como_funciona_mobile")}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-emerald-400 text-slate-950 text-sm font-semibold shadow-[0_16px_40px_rgba(16,185,129,0.55)] active:scale-[.97] transition"
            >
              Simular mi capacidad ahora
            </button>
          </div>
        </div>
      </motion.section>

      {/* 4 RAZONES DE RECHAZO */}
      <motion.section
        id="rechazos"
        className="border-t border-slate-800 bg-slate-950 scroll-mt-20"
        {...fadeUp}
      >
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-[11px] text-slate-300 mb-3">
                <SparklesIcon className="h-3.5 w-3.5 text-emerald-400" />
                <span>Lo que normalmente no te explican</span>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-50">
                4 razones típicas de rechazo
              </h2>
              <p className="mt-2 text-sm text-slate-400 max-w-xl">
                La mayoría de veces el banco dice “no” por detalles técnicos
                (DTI, LTV, aportes al IESS, formalidad de ingresos) que se
                pueden trabajar. HabitaLibre identifica cuál es tu bloqueo y te
                muestra cómo corregirlo.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 px-4 py-3 text-xs text-slate-300 max-w-xs">
              <p className="font-semibold text-slate-50 mb-1">Nuestro enfoque</p>
              <p className="text-slate-400">
                No es “te aprobaron / te rechazaron”. Es:{" "}
                <span className="text-emerald-300 font-semibold">qué cambiar</span>{" "}
                para que tu perfil sí pueda ser viable.
              </p>
            </div>
          </div>

          {/* Cards */}
          <div className="grid gap-5 md:grid-cols-2 text-sm">
            {/* Razón 1 */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <BanknotesIcon className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Motivo 1</p>
                  <p className="font-semibold text-slate-50">
                    La cuota no cabe en tu ingreso (DTI alto)
                  </p>
                </div>
              </div>
              <div className="text-[12px] text-slate-400 space-y-2">
                <div>
                  <p className="font-semibold text-slate-200 mb-0.5">Por qué el banco rechaza:</p>
                  <p>
                    Si el porcentaje de tu ingreso ya comprometido en deudas
                    supera ~40–45%, el sistema de riesgo automáticamente bloquea
                    la operación.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-emerald-300 mb-0.5">Cómo HabitaLibre lo corrige:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Calculamos tu DTI real con tus deudas actuales.</li>
                    <li>
                      Te mostramos cuánto bajar en deudas o cuánto subir en
                      ingresos para que la cuota sí sea sostenible.
                    </li>
                    <li>
                      Ajustamos rango de vivienda y plazo para que el crédito
                      vuelva a ser viable.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Razón 2 */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <PresentationChartLineIcon className="h-5 w-5 text-sky-400" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Motivo 2</p>
                  <p className="font-semibold text-slate-50">
                    La entrada es muy baja para el valor de la vivienda (LTV)
                  </p>
                </div>
              </div>
              <div className="text-[12px] text-slate-400 space-y-2">
                <div>
                  <p className="font-semibold text-slate-200 mb-0.5">Por qué el banco rechaza:</p>
                  <p>
                    Con poca entrada, el préstamo cubre casi todo el valor
                    (LTV 90–95%+), el riesgo sube y muchas veces el banco
                    prefiere no aprobar.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-emerald-300 mb-0.5">Cómo HabitaLibre lo corrige:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Calculamos tu LTV y lo comparamos con rangos VIS/VIP,
                      BIESS y banca privada.
                    </li>
                    <li>
                      Te mostramos cuánta entrada adicional necesitas para bajar
                      el riesgo.
                    </li>
                    <li>
                      Te damos un rango de precio de vivienda más realista para
                      tu situación actual.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Razón 3 */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-fuchsia-400" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Motivo 3</p>
                  <p className="font-semibold text-slate-50">
                    No cumples los requisitos formales (BIESS / estabilidad)
                  </p>
                </div>
              </div>
              <div className="text-[12px] text-slate-400 space-y-2">
                <div>
                  <p className="font-semibold text-slate-200 mb-0.5">Por qué el banco rechaza:</p>
                  <p>
                    BIESS y los bancos piden cierto número de aportes,
                    estabilidad laboral y documentación ordenada. Si algo falta,
                    el sistema te bloquea aunque el ingreso sea bueno.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-emerald-300 mb-0.5">Cómo HabitaLibre lo corrige:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Te indicamos cuántos aportes o meses de estabilidad te faltan.</li>
                    <li>Te damos un timeline estimado para ser elegible a BIESS o cierto producto.</li>
                    <li>Te mostramos opciones alternativas mientras completas esos requisitos.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Razón 4 */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <LockClosedIcon className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Motivo 4</p>
                  <p className="font-semibold text-slate-50">
                    Ingresos informales o mal documentados
                  </p>
                </div>
              </div>
              <div className="text-[12px] text-slate-400 space-y-2">
                <div>
                  <p className="font-semibold text-slate-200 mb-0.5">Por qué el banco rechaza:</p>
                  <p>
                    Si eres independiente o tienes ingresos mixtos pero sin RUC,
                    roles o declaraciones claras, el banco no puede justificar
                    ese ingreso y lo descarta.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-emerald-300 mb-0.5">Cómo HabitaLibre lo corrige:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Te damos un checklist según tu tipo de ingreso (empleado, independiente, mixto).</li>
                    <li>Te mostramos cómo ordenar tus extractos y respaldos para que el banco sí los tome en cuenta.</li>
                    <li>Te ayudamos a pasar de “rechazado hoy” a un perfil trabajable en los próximos meses.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-[12px] text-slate-400 max-w-md">
              Si ya intentaste con algún banco y no fue claro el motivo del
              rechazo, HabitaLibre puede ayudarte a traducir tu caso a números
              concretos y darte un plan de acción.
            </p>
            <button
              onClick={() => handleStart("rechazos_section")}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-emerald-400 text-slate-950 text-sm font-semibold shadow-[0_16px_40px_rgba(16,185,129,0.55)] active:scale-[.97] transition"
            >
              Entender mi caso con números
              <span className="ml-1.5 text-base">→</span>
            </button>
          </div>
        </div>
      </motion.section>

      {/* BENEFICIOS */}
      <motion.section
        id="beneficios"
        className="border-t border-slate-800 bg-slate-950 pb-14 scroll-mt-20"
        {...fadeUp}
      >
        <div className="mx-auto max-w-6xl px-4 pt-10 md:pt-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-50">
                Beneficios de simular con HabitaLibre
              </h2>
              <p className="mt-2 text-sm text-slate-400 max-w-xl">
                En lugar de darte un número suelto, conectamos tu realidad con
                el tipo de crédito, el rango de vivienda y los pasos concretos
                para llegar a tu hipoteca.
              </p>
            </div>

            <div className="flex gap-3 text-[11px] text-slate-400">
              <div className="rounded-full bg-slate-900/70 border border-slate-800 px-3 py-1.5 flex items-center gap-2">
                <ShieldCheckIcon className="h-4 w-4 text-emerald-400" />
                Sin afectar tu buró
              </div>
              <div className="rounded-full bg-slate-900/70 border border-slate-800 px-3 py-1.5 flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-sky-400" />
                Enfoque VIS / VIP / BIESS
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3 text-sm">
            {/* Beneficio 1 */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <SparklesIcon className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="font-semibold text-slate-50">
                  Comparación realmente inteligente
                </p>
              </div>
              <p className="text-xs text-slate-400 mb-2">
                No eres un número más en el banco. Con tu ingreso, deudas y
                aporte al IESS comparamos escenarios VIS, VIP, BIESS y banca
                privada para mostrarte qué opción se adapta mejor a tu realidad
                hoy.
              </p>
              <ul className="text-[11px] text-slate-400 space-y-1.5">
                <li>• Te damos un rango de precio realista, no una cifra aislada.</li>
                <li>• Score hipotecario que te dice qué tan listo estás para el banco.</li>
              </ul>
            </div>

            {/* Beneficio 2 */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <ShieldCheckIcon className="h-5 w-5 text-sky-400" />
                </div>
                <p className="font-semibold text-slate-50">
                  Sin riesgo para tu historial
                </p>
              </div>
              <p className="text-xs text-slate-400 mb-2">
                Simulas sin asustarte por el buró. No revisamos tu historial ni
                tus movimientos bancarios, así que puedes ver tu capacidad con
                total tranquilidad.
              </p>
              <ul className="text-[11px] text-slate-400 space-y-1.5">
                <li>• Ideal si todavía no quieres sentarte frente al banco.</li>
                <li>• Puedes probar diferentes montos, plazos y cuotas antes de decidir.</li>
              </ul>
            </div>

            {/* Beneficio 3 */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-fuchsia-400" />
                </div>
                <p className="font-semibold text-slate-50">
                  Acompañamiento humano cuando tú quieras
                </p>
              </div>
              <p className="text-xs text-slate-400 mb-2">
                Detrás del simulador hay un equipo real. Si tu resultado te
                convence, un asesor puede ayudarte sin costo a ordenar tus
                papeles y preparar tu mejor versión para el banco o el BIESS.
              </p>
              <ul className="text-[11px] text-slate-400 space-y-1.5">
                <li>• Te explicamos el reporte en lenguaje simple, sin jerga bancaria.</li>
                <li>• Te mostramos qué cambiar (deudas, entrada, plazo) para subir tu score.</li>
              </ul>
            </div>
          </div>

          {/* CTA MOBILE sección Beneficios */}
          <div className="mt-8 flex justify-center md:hidden">
            <button
              onClick={() => handleStart("beneficios_mobile")}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-blue-500 text-slate-950 text-sm font-semibold shadow-[0_16px_40px_rgba(37,99,235,0.55)] active:scale-[.97] transition"
            >
              Probar mi simulación gratis
            </button>
          </div>
        </div>
      </motion.section>

      {/* NOSOTROS – HL-SCORE */}
      <motion.section
        id="nosotros"
        className="border-t border-slate-800 bg-slate-950 scroll-mt-20"
        {...fadeUp}
      >
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-[11px] text-slate-300 mb-6">
            <PresentationChartLineIcon className="h-3.5 w-3.5 text-emerald-400" />
            Algoritmo HabitaLibre · HL-Score®
          </div>

          <h2 className="text-2xl md:text-3xl font-semibold text-slate-50 mb-3">
            Un motor diseñado para la realidad hipotecaria ecuatoriana
          </h2>

          <p className="text-sm text-slate-400 max-w-2xl mb-8">
            HL-Score® combina tu nivel de ingresos, deudas, relación con el IESS
            y parámetros VIS/VIP/BIESS para darte una lectura honesta de qué tan
            cerca estás de tu hipoteca y qué ajustes tienen más impacto.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <div className="flex items-center gap-2 rounded-full bg-slate-900 border border-slate-700 px-4 py-1.5 text-[11px]">
              <SparklesIcon className="h-4 w-4 text-emerald-400" />
              Algoritmo HL-Score® propio
            </div>

            <div className="flex items-center gap-2 rounded-full bg-slate-900 border border-slate-700 px-4 py-1.5 text-[11px]">
              <ChartBarIcon className="h-4 w-4 text-sky-400" />
              Escenarios multi-banco
            </div>

            <div className="flex items-center gap-2 rounded-full bg-slate-900 border border-slate-700 px-4 py-1.5 text-[11px]">
              <Bars3Icon className="h-4 w-4 text-emerald-300" />
              Decisiones claras
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-[12px] text-slate-300">
              <p className="font-semibold mb-2">Escenarios con varios bancos</p>
              <ul className="space-y-1 text-slate-400">
                <li>• Comparamos rangos de tasa, plazo y entrada según tu perfil.</li>
                <li>• Ajustamos el modelo si aplicas a VIS, VIP, BIESS o banca privada.</li>
                <li>• Te mostramos un rango de vivienda, no una cifra aislada.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-[12px] text-slate-300">
              <p className="font-semibold mb-2">Decisiones claras, sin jerga</p>
              <ul className="space-y-1 text-slate-400">
                <li>• Te mostramos qué pasa si bajas deudas, cambias plazo o aumentas entrada.</li>
                <li>• Usamos gráficos y mensajes simples, sin letras pequeñas.</li>
                <li>• El modelo se entrena con casos reales de familias en Ecuador.</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.section>

      {/* OFICINAS */}
      <motion.section className="border-t border-slate-800 bg-slate-950/95" {...fadeUp}>
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-[11px] text-slate-300 mb-3">
                <BuildingOffice2Icon className="h-3.5 w-3.5 text-emerald-300" />
                <span>Oficinas físicas · Zona financiera de Quito</span>
              </div>

              <h3 className="text-xl md:text-2xl font-semibold text-slate-50 mb-3">
                Una proptech real, con equipo y oficinas en Quito
              </h3>

              <p className="text-sm text-slate-400 max-w-xl mb-6">
                HabitaLibre nace en Ecuador, para la realidad de familias
                ecuatorianas. Operamos desde oficinas en la zona financiera de
                Quito, con experiencia en proyectos VIS/VIP, BIESS y banca
                privada.
              </p>

              <ul className="text-sm text-slate-300 space-y-2 mb-6">
                <li>• Documentación alineada a requisitos de bancos y BIESS.</li>
              </ul>

              <div className="mt-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 p-4 flex items-start gap-3">
                <LockClosedIcon className="h-5 w-5 text-emerald-300 mt-0.5" />
                <div className="text-[12px] text-slate-300">
                  <p className="font-semibold mb-1">Centro de confianza HabitaLibre</p>
                  <p className="text-slate-400 mb-3">
                    Tus datos se usan solo para construir tu simulación y, si
                    nos lo autorizas, ayudarte a contactar bancos o proyectos de
                    vivienda. No vendemos tu información.
                  </p>
                  <button
                    onClick={() => openLegal("politica")}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-600 px-3 py-1.5 text-[11px] text-slate-200 hover:border-emerald-400 hover:text-emerald-300 transition"
                  >
                    <ShieldCheckIcon className="h-3.5 w-3.5 text-emerald-400" />
                    Ver cómo cuidamos tus datos
                  </button>
                </div>
              </div>
            </div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.4 }}
            >
              <div className="relative rounded-3xl bg-slate-900/80 border border-slate-700/70 shadow-[0_30px_80px_rgba(15,23,42,0.95)] overflow-hidden backdrop-blur-lg">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-sky-500/5 to-transparent pointer-events-none" />
                <div className="relative p-5 md:p-6">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-2xl bg-slate-950 border border-emerald-400/60 flex items-center justify-center">
                        <BuildingOffice2Icon className="h-5 w-5 text-emerald-300" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-50">Oficinas HabitaLibre</p>
                        <p className="text-[11px] text-slate-400">Quito · Zona financiera</p>
                      </div>
                    </div>
                    <div className="rounded-full bg-emerald-500/10 border border-emerald-400/60 px-3 py-1 text-[11px] text-emerald-300">
                      Proptech ecuatoriana
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/80">
                    <img
                      src="/ofcHL.jpeg"
                      alt="Oficinas HabitaLibre en Quito"
                      className="h-60 w-full object-cover"
                    />
                  </div>

                  <div className="mt-4 text-[12px] text-slate-300">
                    <p className="mb-1 font-semibold">Aquí se conectan proyectos, bancos y familias.</p>
                    <p className="text-slate-400">
                      En estas oficinas afinamos el HL-Score®, recibimos a
                      aliados y acompañamos a personas que están dando el paso
                      hacia su vivienda propia.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* TESTIMONIOS */}
      <motion.section
        id="testimonios"
        className="border-t border-slate-800 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950/95 scroll-mt-20"
        {...fadeUp}
      >
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-[11px] text-slate-300 mb-3">
                <ChatBubbleOvalLeftEllipsisIcon className="h-3.5 w-3.5 text-emerald-400" />
                <span>Personas reales, procesos reales</span>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-50">
                Lo que dicen quienes ya simularon
              </h2>
              <p className="mt-2 text-sm text-slate-400 max-w-xl">
                Historias de personas que usaron HabitaLibre como primer paso
                para entender su capacidad real antes de ir al banco.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <StarIcon className="h-4 w-4 text-amber-400" />
              <span>
                <span className="text-slate-50 font-semibold">4.9/5</span>{" "}
                satisfacción promedio en experiencias piloto
              </span>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3 text-sm">
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="absolute inset-0 pointer-events-none opacity-60 bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.15),transparent_55%)]" />
              <div className="relative flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 text-slate-950 flex items-center justify-center text-xs font-semibold">
                  MA
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-50">Mateo &amp; Alejandra</p>
                  <p className="text-[11px] text-slate-400">Primera vivienda · Quito</p>
                </div>
              </div>
              <p className="relative text-xs text-slate-300">
                “Siempre nos decían cosas distintas en cada banco. Con el
                reporte de HabitaLibre entendimos de una vez nuestro rango de
                compra y qué tipo de crédito nos convenía. Llegamos a la cita
                con el banco mucho más seguros.”
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="absolute inset-0 pointer-events-none opacity-60 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),transparent_55%)]" />
              <div className="relative flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center text-xs font-semibold">
                  CR
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-50">Carolina R.</p>
                  <p className="text-[11px] text-slate-400">
                    Migrando de arriendo a dueño · VIS/VIP
                  </p>
                </div>
              </div>
              <p className="relative text-xs text-slate-300">
                “Pensé que no calificaba. El simulador me mostró que sí podía,
                pero ajustando plazo y entrada. El acompañamiento después del
                resultado fue clave para ordenar mis documentos y saber por
                dónde arrancar.”
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="absolute inset-0 pointer-events-none opacity-60 bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.16),transparent_55%)]" />
              <div className="relative flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center text-xs font-semibold">
                  JP
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-50">Jorge P.</p>
                  <p className="text-[11px] text-slate-400">
                    Cambio de banco · Refinanciamiento
                  </p>
                </div>
              </div>
              <p className="relative text-xs text-slate-300">
                “Yo ya tenía hipoteca, pero quería una mejor tasa. El stress
                test del reporte me ayudó a ver cuánto me ahorraba cambiando de
                producto y en cuánto tiempo se pagaba el esfuerzo de hacer el
                trámite.”
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section id="faq" className="border-t border-slate-800 bg-slate-950 scroll-mt-20" {...fadeUp}>
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-[11px] text-slate-300 mb-3">
                <SparklesIcon className="h-3.5 w-3.5 text-emerald-400" />
                <span>Resolvemos tus dudas clave</span>
              </div>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-50">
                Preguntas frecuentes
              </h2>
              <p className="mt-2 text-sm text-slate-400 max-w-xl">
                Antes de avanzar con tu hipoteca, es normal tener preguntas.
                Aquí respondemos las más comunes sobre cómo funciona HabitaLibre.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <details className="group rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-medium text-slate-100">¿HabitaLibre afecta mi buró de crédito?</span>
                <span className="ml-3 text-slate-500 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-2 text-xs text-slate-300">
                No. La precalificación de HabitaLibre es referencial y se realiza
                sin consultar tu buró de crédito, por lo que no genera impactos
                negativos. Puedes simular tu hipoteca todas las veces que quieras
                sin afectar tu historial.
              </p>
            </details>

            <details className="group rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-medium text-slate-100">¿Con qué tipos de crédito trabaja HabitaLibre?</span>
                <span className="ml-3 text-slate-500 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-2 text-xs text-slate-300">
                Hoy te ayudamos a estimar si calificas para un crédito hipotecario
                VIS, VIP, BIESS o banca privada tradicional en Ecuador. El
                simulador sugiere qué tipo de crédito se adapta mejor a tu perfil.
              </p>
            </details>

            <details className="group rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-medium text-slate-100">¿Tiene algún costo usar HabitaLibre?</span>
                <span className="ml-3 text-slate-500 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-2 text-xs text-slate-300">
                No. Usar HabitaLibre y obtener tu precalificación es totalmente gratuito.
              </p>
            </details>

            <details className="group rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-medium text-slate-100">¿Qué información necesito para precalificarme?</span>
                <span className="ml-3 text-slate-500 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-2 text-xs text-slate-300">
                Solo necesitas ingresar tu ingreso mensual, si tienes deudas
                vigentes, el plazo aproximado del crédito que te interesa y algunos
                datos básicos de contacto. No solicitamos claves bancarias ni
                información sensible.
              </p>
            </details>

            <details className="group rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-medium text-slate-100">¿La precalificación es una aprobación definitiva del banco?</span>
                <span className="ml-3 text-slate-500 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-2 text-xs text-slate-300">
                No. La precalificación de HabitaLibre es una estimación orientativa
                basada en criterios habituales de los bancos en Ecuador. La
                aprobación definitiva del crédito siempre depende de cada entidad
                financiera tras analizar tu documentación completa.
              </p>
            </details>

            <details className="group rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-medium text-slate-100">¿Puedo usar el resultado para negociar con un promotor o banco?</span>
                <span className="ml-3 text-slate-500 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-2 text-xs text-slate-300">
                Sí. El reporte de HabitaLibre resume tu capacidad de compra y el
                tipo de crédito más probable, por lo que es una base útil para
                conversar con promotores de vivienda y bancos sobre opciones
                concretas.
              </p>
            </details>
          </div>
        </div>
      </motion.section>

      {/* FOOTER REDES */}
      <footer className="mt-20 py-10 border-t border-slate-800 text-center text-slate-400">
        <p className="mb-4 text-sm">Síguenos en nuestras redes</p>

        <div className="flex justify-center gap-6 text-slate-300">
          <a
            href="https://www.instagram.com/habitalibre.ec/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            <i className="fa-brands fa-instagram text-2xl"></i>
          </a>

          <a
            href="https://www.facebook.com/profile.php?id=61584282855630"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition"
          >
            <i className="fa-brands fa-facebook text-2xl"></i>
          </a>
        </div>
      </footer>

      {/* FOOTER DISCLAIMER */}
      <footer className="border-t border-slate-800 bg-slate-950 py-7 mt-4">
        <div className="mx-auto max-w-6xl px-4 text-center text-[11px] text-slate-500 leading-relaxed">
          <p className="text-slate-400 font-semibold mb-1">HabitaLibre © 2025</p>

          <p className="mb-3 max-w-2xl mx-auto">
            Las estimaciones son referenciales y pueden variar según verificación
            bancaria. No afecta tu buró ni solicitamos claves bancarias. Tus
            datos se procesan de forma segura y no se comparten sin tu
            autorización.
          </p>

          <div className="flex justify-center gap-6 mt-2 text-[11px]">
            <button
              onClick={() => openLegal("politica")}
              className="text-slate-400 hover:text-slate-200 transition underline-offset-4 hover:underline"
            >
              Política de Privacidad
            </button>

            <button
              onClick={() => openLegal("terminos")}
              className="text-slate-400 hover:text-slate-200 transition underline-offset-4 hover:underline"
            >
              Términos de Uso
            </button>

            <a
              href="#/cookies"
              className="text-slate-400 hover:text-slate-200 transition underline-offset-4 hover:underline"
            >
              Cookies
            </a>
          </div>
        </div>
      </footer>

      {/* LEGAL MODAL */}
      {activeLegalSection && (
        <div className="hl-modal-overlay" onClick={closeLegal}>
          <div
            className="hl-modal-panel bg-slate-950 border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <ShieldCheckIcon className="h-4 w-4 text-emerald-400" />
                <span>Centro de confianza HabitaLibre</span>
              </div>

              <button
                onClick={closeLegal}
                className="p-1.5 rounded-full border border-slate-700 text-slate-300 hover:bg-slate-800/70 transition"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>

            {activeLegalSection === "politica" && (
              <div className="text-slate-300 text-sm leading-relaxed space-y-4">
                <h2 className="text-xl font-semibold text-slate-50">
                  Centro de Confianza HabitaLibre
                </h2>

                <p className="text-xs text-slate-500">
                  Queremos que tengas claridad total sobre cómo usamos tu información.
                </p>

                <div className="space-y-3 text-sm">
                  <div>
                    <h3 className="font-semibold text-slate-100">1. Qué datos pedimos</h3>
                    <p>
                      Solo solicitamos los datos necesarios para simular tu capacidad
                      hipotecaria: ingresos, deudas, relación con el IESS y tu información
                      de contacto para enviarte tu resultado.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-100">2. Cómo usamos tu información</h3>
                    <p>
                      Calculamos tu HL-Score®, te mostramos escenarios de crédito
                      personalizados y, solo si tú lo autorizas, compartimos tus datos
                      con bancos, cooperativas o desarrolladores inmobiliarios aliados
                      para acompañarte en tu proceso de compra de vivienda.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-100">3. Seguridad y almacenamiento</h3>
                    <p>
                      Protegemos tu información con prácticas de seguridad modernas y la
                      conservamos únicamente mientras sea necesaria para tu proceso o lo
                      que exija la ley.
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Puedes solicitar la eliminación de tus datos en cualquier momento. Lee
                  la versión completa en nuestra{" "}
                  <a
                    href="#/privacidad"
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2 text-slate-300 hover:text-slate-100"
                  >
                    Política de Privacidad
                  </a>
                  .
                </p>
              </div>
            )}

            {activeLegalSection === "terminos" && (
              <div className="text-slate-300 text-sm leading-relaxed space-y-4">
                <h2 className="text-xl font-semibold text-slate-50">Términos de Uso</h2>
                <p className="text-xs text-slate-500">
                  Al usar el simulador de HabitaLibre aceptas estos términos de forma previa
                  y consciente.
                </p>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-slate-100">1. Naturaleza del servicio</h3>
                    <p>
                      HabitaLibre es una herramienta educativa y de orientación financiera
                      inicial. Los resultados son estimaciones referenciales basadas en los
                      datos que tú ingresas y no constituyen una oferta formal de crédito,
                      una aprobación hipotecaria, ni asesoría financiera, legal o tributaria
                      personalizada.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-100">2. Responsabilidad sobre la información ingresada</h3>
                    <p>
                      La precisión de las estimaciones depende de la veracidad y actualización
                      de los datos que proporcionas. Las decisiones tomadas únicamente sobre
                      la base del simulador deben ser contrastadas con las políticas y
                      evaluaciones internas de cada institución financiera.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-100">3. Relación con bancos y terceros</h3>
                    <p>
                      HabitaLibre no representa a ningún banco o cooperativa en particular. Con
                      tu autorización expresa, podemos compartir tu caso con entidades financieras
                      o desarrolladores inmobiliarios aliados para análisis o contacto, pero la
                      aprobación final dependerá exclusivamente de sus políticas internas, análisis
                      de riesgo y documentación que ellos requieran.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-100">4. Uso permitido y limitaciones</h3>
                    <p>
                      El simulador está destinado a uso personal e informativo. No se permite su uso
                      automatizado, fraudulento, con fines ilícitos o para reproducir, copiar o revender
                      el servicio sin autorización previa por escrito de HabitaLibre. El algoritmo HL-Score®
                      y el diseño de la plataforma son propiedad intelectual de HabitaLibre.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-100">5. Modificaciones</h3>
                    <p>
                      Podemos actualizar estos Términos de Uso para reflejar cambios normativos o mejoras del
                      servicio. Publicaremos la versión vigente y su fecha de actualización en nuestros canales oficiales.
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Última actualización: 27 de noviembre de 2025.
                  <br />
                  Puedes leer la versión completa en nuestros{" "}
                  <a
                    href="#/terminos"
                    className="underline underline-offset-2 text-slate-300 hover:text-slate-100"
                  >
                    Términos de Uso completos
                  </a>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <WhatsAppFab />

    </main>
  );
}
