// src/pages/LandingAds.jsx
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

import HIcon from "../assets/HICON.png";
import HLogo from "../assets/HLOGO.png";
import { trackEvent, trackPageView } from "../lib/analytics";

function LandingAds({ onStart }) {
  useEffect(() => {
    trackPageView("landing_ads");
  }, []);

  const handleStart = (source = "unknown") => {
    trackEvent("cta_start_simulation_ads", { source });

    if (typeof onStart === "function") onStart();
    else window.location.hash = "#/simular";
  };

  const fadeUp = {
    initial: { opacity: 0, y: 14 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: "easeOut" },
    viewport: { once: true, amount: 0.4 },
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* HEADER simple */}
      <header className="border-b border-slate-800/70 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="
                h-12 w-12 rounded-2xl bg-slate-900/90 
                border border-emerald-400/60
                shadow-[0_0_25px_rgba(16,185,129,0.35)]
                flex items-center justify-center overflow-hidden
              "
            >
              <img
                src={HIcon}
                alt="HabitaLibre"
                className="h-7 w-7 object-contain"
              />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-lg text-white tracking-tight">
                HabitaLibre
              </div>
              <div className="text-[11px] text-emerald-300/90">
                Precalificación hipotecaria · VIS · VIP · BIESS
              </div>
            </div>
          </div>

          <button
            onClick={() => handleStart("navbar_ads")}
            className="px-5 py-2.5 rounded-full bg-blue-500 hover:bg-blue-400 text-slate-950 
                       font-semibold text-sm shadow-lg shadow-blue-500/40 transition"
          >
            Iniciar precalificación
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.10),transparent_55%),_radial-gradient(circle_at_bottom,_rgba(37,99,235,0.22),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center">
            {/* Copy */}
            <motion.div {...fadeUp}>
              <p className="text-[11px] tracking-[0.2em] uppercase text-slate-400 mb-3">
                ● Sin afectar tu buró · resultado en menos de 2 minutos
              </p>

              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-50 mb-4">
                Descubre si hoy ya puedes comprar tu casa en Ecuador
              </h1>

              <p className="text-sm md:text-[15px] text-slate-300 max-w-xl mb-6">
                Ingresa tu ingreso y tus deudas actuales. Te mostramos tu rango
                de compra y una cuota estimada (VIS/VIP/BIESS o banca privada)
                sin ir al banco.
              </p>

              <div className="flex flex-wrap gap-3 mb-3">
                <button
                  onClick={() => handleStart("hero_primary_ads")}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full
                             bg-emerald-400 text-slate-950 font-semibold text-sm
                             shadow-[0_18px_40px_rgba(16,185,129,0.45)] hover:bg-emerald-300 transition"
                >
                  Ver mi capacidad real <span className="ml-2">→</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400">
                Precalificación gratuita · Sin compromiso con ningún banco
              </div>
            </motion.div>

            {/* Preview simple */}
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.08 }}
            >
              <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-[0_24px_60px_rgba(15,23,42,0.9)] backdrop-blur-sm">
                <div className="flex items-start justify-between text-xs mb-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 border border-slate-700/70 px-2.5 py-1">
                    <div className="h-4 w-4 rounded-lg bg-slate-950 flex items-center justify-center border border-emerald-400/60 overflow-hidden">
                      <img
                        src={HLogo}
                        alt="HabitaLibre"
                        className="h-3.5 w-3.5 object-contain"
                      />
                    </div>
                    <span className="text-[11px] text-teal-300 font-medium">
                      Así verás tu resultado
                    </span>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-900/40 text-emerald-300 border border-emerald-500/40 text-[11px]">
                    No afecta tu buró
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-slate-400 text-[11px] mb-1">
                    Capacidad estimada de compra
                  </p>

                  {/* ✅ BULLET 3A: Etiqueta contextual encima del monto */}
                  <p className="text-[10px] text-slate-500 -mt-0.5 mb-1">
                    Ejemplo con ingresos desde{" "}
                    <span className="text-slate-300 font-semibold">
                      $ 1.600/mes
                    </span>{" "}
                    y deudas moderadas
                  </p>

                  <p className="text-3xl md:text-4xl font-bold tracking-tight">
                    $ 98.500
                  </p>

                  <p className="text-[11px] text-slate-500 mt-1">
                    Ejemplo referencial.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-5">
                  <div className="bg-slate-900 border border-slate-700/70 rounded-2xl p-4">
                    <p className="text-slate-400 text-[11px] mb-1">
                      Cuota estimada
                    </p>
                    <p className="font-semibold text-[16px]">$ 480 / mes</p>

                    {/* ✅ BULLET 3B: mini comparación renta vs cuota */}
                    <p className="text-[10px] text-slate-500 mt-1">
                      Similar a un arriendo promedio en Quito.
                    </p>
                  </div>

                  <div className="bg-slate-900 border border-slate-700/70 rounded-2xl p-4">
                    <p className="text-slate-400 text-[11px] mb-1">
                      Producto tentativo
                    </p>
                    <p className="font-semibold text-[15px]">
                      VIS / VIP / BIESS
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleStart("card_primary_ads")}
                  className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-semibold text-sm transition"
                >
                  Iniciar precalificación ahora
                </button>

                <p className="mt-2 text-[10px] text-slate-400 text-center">
                  No pedimos claves bancarias · No vendemos tus datos
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bloque confianza + pasos (corto) */}
      <section className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <motion.div {...fadeUp} className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheckIcon className="h-5 w-5 text-emerald-400" />
                <p className="font-semibold text-slate-50">
                  Tranquilo: no afecta tu buró
                </p>
              </div>
              <p className="text-xs text-slate-400">
                Simulas sin consulta a buró y sin mover tu historial.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5">
              <div className="flex items-center gap-2 mb-2">
                <SparklesIcon className="h-5 w-5 text-sky-400" />
                <p className="font-semibold text-slate-50">Hecho para Ecuador</p>
              </div>
              <p className="text-xs text-slate-400">
                VIS / VIP / BIESS y banca privada con lectura simple.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5">
              <div className="flex items-center gap-2 mb-2">
                <UserGroupIcon className="h-5 w-5 text-fuchsia-400" />
                <p className="font-semibold text-slate-50">
                  Acompañamiento humano
                </p>
              </div>
              <p className="text-xs text-slate-400">
                Si quieres, te guiamos con documentos y próximos pasos.
              </p>
            </div>
          </motion.div>

          <motion.div
            {...fadeUp}
            className="mt-8 rounded-3xl bg-slate-900/70 border border-slate-800 p-6"
          >
            <p className="text-sm font-semibold text-slate-50 mb-3">
              Cómo funciona
            </p>
            <ol className="text-sm text-slate-300 space-y-2">
              <li>1) Ingresas ingresos y deudas</li>
              <li>2) Calculamos tu capacidad real</li>
              <li>3) Te mostramos el mejor camino (VIS/VIP/BIESS)</li>
            </ol>

            <button
              onClick={() => handleStart("final_cta_ads")}
              className="mt-5 w-full md:w-auto px-6 py-3 rounded-full bg-emerald-400 text-slate-950 font-semibold text-sm
                         shadow-[0_18px_40px_rgba(16,185,129,0.45)] hover:bg-emerald-300 transition"
            >
              Ver mi capacidad real →
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer mini */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-[11px] text-slate-500">
          HabitaLibre © 2025 · Estimaciones referenciales · No afecta tu buró
        </div>
      </footer>
    </main>
  );
}

export default LandingAds;
