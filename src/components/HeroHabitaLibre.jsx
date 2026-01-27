// src/components/HeroHabitaLibre.jsx
import React from "react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: 0.1, duration: 0.6, ease: "easeOut" },
  },
};

const chipsVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.3, duration: 0.4, ease: "easeOut" },
  },
};

export default function HeroHabitaLibre({ onStart, onViewExample }) {
  const handleStart = () => {
    if (onStart) onStart();
  };

  const handleViewExample = () => {
    if (onViewExample) onViewExample();
  };

  return (
    <div className="relative overflow-hidden bg-slate-950 text-slate-50">
      {/* Glow de fondo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-64 top-10 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute -right-40 top-32 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute inset-x-0 bottom-[-18rem] h-[28rem] bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
      </div>

      {/* Contenido */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto flex min-h-[560px] max-w-6xl flex-col gap-10 px-4 pb-20 pt-10 md:flex-row md:items-center md:pb-24 md:pt-16 lg:px-6"
      >
        {/* Columna izquierda */}
        <div className="relative z-10 flex-1">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium tracking-[0.3em] text-slate-400 uppercase">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Precalificación sin afectar tu buró
          </div>

          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-50 sm:text-[2.75rem] sm:leading-[1.05] lg:text-[3rem]">
            Tu camino fácil a la vivienda propia{" "}
            <span className="inline-block align-middle">🏡</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-[15px]">
            Descubre en menos de 2 minutos cuánto puedes comprar hoy y con qué
            tipo de crédito: VIS, VIP, BIESS o banca privada. Sin filas, sin
            papeles y sin afectar tu historial crediticio.
          </p>

          {/* Botones */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-emerald-950 shadow-[0_18px_45px_rgba(16,185,129,0.45)] transition hover:bg-emerald-400 hover:shadow-[0_16px_40px_rgba(16,185,129,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80"
            >
              Precalifica ahora
              <span className="ml-2 text-[13px]">→</span>
            </button>

            <button
              type="button"
              onClick={handleViewExample}
              className="inline-flex items-center justify-center rounded-full border border-slate-600/70 bg-slate-900/40 px-5 py-2.5 text-sm font-medium text-slate-100 shadow-[0_0_0_1px_rgba(15,23,42,0.8)] transition hover:border-slate-400/80 hover:bg-slate-900/70"
            >
              Ver ejemplo de resultado
            </button>
          </div>

          {/* Chips inferiores */}
          <motion.div
            variants={chipsVariants}
            className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400"
          >
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
              Datos cifrados
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400/80" />
              Enfoque VIS / VIP / BIESS
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400/80" />
              Asesoría sin costo
            </div>
          </motion.div>
        </div>

        {/* Columna derecha: card de resultado */}
        <motion.div
          variants={cardVariants}
          className="relative z-10 flex-1 md:max-w-md lg:max-w-lg"
        >
          {/* Glow detrás de la card */}
          <div className="pointer-events-none absolute inset-0 -left-6 -right-4 top-4 translate-y-6 rounded-[32px] bg-indigo-500/25 blur-3xl" />

          <div className="relative rounded-[32px] border border-slate-700/70 bg-slate-900/80 px-6 py-6 shadow-[0_26px_80px_rgba(15,23,42,0.95)] backdrop-blur-lg sm:px-7 sm:py-7">
            {/* Badge superior */}
            <div className="mb-4 flex items-center justify-between text-[11px] text-slate-300">
              <div className="space-y-0.5">
                <div className="text-[10px] uppercase tracking-[0.25em] text-slate-400">
                  Vista previa de un resultado
                </div>
                <div className="font-medium text-slate-100">
                  Perfil VIS / VIP simulado
                </div>
              </div>

              <div className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-medium text-emerald-300 ring-1 ring-emerald-500/40">
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                No afecta tu buró
              </div>
            </div>

            {/* Capacidad estimada */}
            <div className="mb-6">
              <div className="text-xs text-slate-400">Capacidad estimada</div>
              <div className="mt-1 flex items-baseline gap-1">
                <div className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-[2.2rem]">
                  $98,500
                </div>
                <div className="text-[11px] text-slate-400">
                  según tus ingresos y deudas
                </div>
              </div>
            </div>

            {/* Bloques centrales */}
            <div className="mb-6 grid gap-3 rounded-2xl bg-slate-900/60 p-3 ring-1 ring-slate-700/80 sm:grid-cols-2 sm:gap-4 sm:p-4">
              <div className="space-y-1.5 rounded-xl bg-slate-900/80 px-3 py-2.5">
                <div className="text-[11px] text-slate-400">Cuota estimada</div>
                <div className="text-[17px] font-semibold text-slate-50">
                  $480 / mes
                </div>
                <div className="text-[11px] text-slate-400">
                  Plazo 20 años · tasa ref.
                </div>
              </div>

              <div className="space-y-1.5 rounded-xl bg-slate-900/80 px-3 py-2.5">
                <div className="text-[11px] text-slate-400">
                  Producto tentativo
                </div>
                <div className="text-[15px] font-semibold text-slate-50">
                  VIS / VIP
                </div>
                <div className="text-[11px] text-slate-400">
                  Ajustable según tu perfil real.
                </div>
              </div>
            </div>

            {/* Métricas pequeñas */}
            <div className="mb-6 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-slate-300 sm:grid-cols-4">
              <div>
                <div className="text-slate-400">Familias simuladas</div>
                <div className="font-semibold text-slate-50">+1,000</div>
              </div>
              <div>
                <div className="text-slate-400">Tiempo estimado</div>
                <div className="font-semibold text-slate-50">&lt; 2 min</div>
              </div>
              <div>
                <div className="text-slate-400">Enfoque</div>
                <div className="font-semibold text-slate-50">
                  VIS / VIP / BIESS
                </div>
              </div>
              <div>
                <div className="text-slate-400">Seguridad</div>
                <div className="font-semibold text-slate-50">AES-256</div>
              </div>
            </div>

            {/* CTA dentro de la card */}
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex w-full items-center justify-center rounded-full bg-sky-500 px-5 py-2.5 text-sm font-semibold text-sky-950 shadow-[0_18px_45px_rgba(56,189,248,0.55)] transition hover:bg-sky-400 hover:shadow-[0_16px_40px_rgba(56,189,248,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              Ver mi capacidad real
            </button>

            {/* Nota legal pequeña */}
            <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
              Este es un ejemplo ilustrativo. Al simular, calculamos tu
              resultado real con tus datos y diferentes escenarios de tasa /
              plazo.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
