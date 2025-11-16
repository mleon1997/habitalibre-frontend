// src/pages/Landing.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  BoltIcon,
  ShieldCheckIcon,
  SparklesIcon,
  BanknotesIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: 0.08 * i,
      ease: [0.21, 0.8, 0.26, 0.99],
    },
  }),
};

function Hero({ onStart }) {
  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950/95 text-slate-50">
      {/* Glow de fondo */}
      <div className="pointer-events-none absolute -left-40 top-[-10rem] h-80 w-80 rounded-full bg-violet-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-24 h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />

      {/* Contenido */}
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 md:px-6 lg:px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-900/80 ring-1 ring-slate-700/70">
            <span className="text-sm font-semibold text-indigo-400">HL</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-50">HabitaLibre</p>
            <p className="text-[11px] text-slate-400">
              Hipoteca exprés · VIS · VIP · BIESS
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <button
            type="button"
            className="hover:text-slate-50"
            onClick={() =>
              document
                .getElementById("como-funciona")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Cómo funciona
          </button>
          <button
            type="button"
            className="hover:text-slate-50"
            onClick={() =>
              document
                .getElementById("beneficios")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Beneficios
          </button>
          <button
            type="button"
            onClick={onStart}
            className="rounded-full bg-indigo-500 px-4 py-1.5 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(129,140,248,0.6)] shadow-indigo-500/40 hover:bg-indigo-400"
          >
            Iniciar simulación
          </button>
        </nav>
      </header>

      {/* Hero principal */}
      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-5 pb-20 pt-6 md:flex-row md:items-center md:px-6 lg:px-4 lg:pt-10">
        {/* Columna izquierda */}
        <motion.div
          className="flex-1"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <p className="mb-4 text-[11px] font-semibold tracking-[0.25em] text-slate-400">
            PRECALIFICACIÓN SIN AFECTAR TU BURÓ
          </p>
          <h1 className="text-balance text-3xl font-semibold leading-tight text-slate-50 sm:text-4xl md:text-5xl">
            Tu camino fácil a la
            <br />
            vivienda propia 🏡
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 md:text-[15px]">
            Descubre en menos de 2 minutos cuánto puedes comprar hoy y con qué
            tipo de crédito: VIS, VIP, BIESS o banca privada. Sin filas, sin
            papeles y sin afectar tu historial crediticio.
          </p>

          {/* Botones */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onStart}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-emerald-950 shadow-[0_18px_55px_rgba(16,185,129,0.45)] hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Simular ahora
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-950/10 text-[11px]">
                →
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("como-funciona")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="inline-flex items-center justify-center rounded-full border border-slate-700/70 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500 hover:bg-slate-900/60"
            >
              Ver ejemplo de resultado
            </button>
          </div>

          {/* Bullets cortos */}
          <div className="mt-5 flex flex-wrap gap-4 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Datos cifrados
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              Enfoque VIS / VIP / BIESS
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              Asesoría sin costo
            </div>
          </div>
        </motion.div>

        {/* Columna derecha – tarjeta de ejemplo */}
        <motion.div
          className="flex-1"
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
        >
          <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-800/70 bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-slate-950/90 p-5 shadow-[0_22px_60px_rgba(15,23,42,0.9)]">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Vista previa de un resultado</span>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400">
                No afecta tu buró
              </span>
            </div>

            <p className="mt-3 text-[12px] font-medium text-slate-300">
              Perfil VIS / VIP simulado
            </p>

            <p className="mt-2 text-xs text-slate-400">Capacidad estimada</p>
            <p className="mt-1 text-3xl font-semibold text-slate-50">
              $98,500
            </p>
            <p className="text-[11px] text-slate-400">
              según tus ingresos y deudas
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-slate-900/70 p-3 text-xs text-slate-200">
              <div className="rounded-xl bg-slate-900/80 p-3">
                <p className="text-[11px] text-slate-400">Cuota estimada</p>
                <p className="mt-1 text-sm font-semibold">$480 / mes</p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  Plazo 20 años · tasa ref.
                </p>
              </div>
              <div className="rounded-xl bg-slate-900/80 p-3">
                <p className="text-[11px] text-slate-400">Producto tentativo</p>
                <p className="mt-1 text-sm font-semibold">VIS / VIP</p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  Ajustable según tu perfil real.
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-slate-400">
              <div>
                <p className="text-slate-500">Familias simuladas</p>
                <p className="mt-0.5 font-medium text-slate-200">+1,000</p>
              </div>
              <div>
                <p className="text-slate-500">Tiempo estimado</p>
                <p className="mt-0.5 font-medium text-slate-200">&lt; 2 min</p>
              </div>
              <div>
                <p className="text-slate-500">Enfoque</p>
                <p className="mt-0.5 font-medium text-slate-200">
                  VIS / VIP / BIESS
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onStart}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(79,70,229,0.8)] hover:bg-indigo-400"
            >
              Ver mi capacidad real
            </button>

            <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
              Este es un ejemplo ilustrativo. Al simular, calculamos tu
              resultado real con tus datos y diferentes escenarios de tasa /
              plazo.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function Landing({ onStart }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Hero onStart={onStart} />

      {/* ====== Sección: Cómo funciona ====== */}
      <section
        id="como-funciona"
        className="mx-auto max-w-6xl px-5 pb-12 pt-14 md:px-6 lg:px-4"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
        >
          <h2 className="text-2xl font-semibold tracking-tight text-slate-50 md:text-[26px]">
            ¿Cómo funciona HabitaLibre?
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-[15px]">
            No eres un formulario más. En 4 pasos analizamos tu perfil y te
            mostramos cuánto podrías comprar hoy y con qué tipo de crédito
            tiene sentido avanzar.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Responde 4 bloques claros",
              body: "Ingresos, deudas, ahorros y tu situación frente al IESS / BIESS. Nada de papeleo, solo datos que ya conoces.",
              icon: BoltIcon,
            },
            {
              title: "Calculamos tu capacidad real",
              body: "Aplicamos reglas específicas de VIS, VIP, BIESS y banca privada para estimar cuánto podrías comprar hoy.",
              icon: ChartBarIcon,
            },
            {
              title: "Comparamos productos por ti",
              body: "Te mostramos una ruta tentativamente ganadora: VIS, VIP, BIESS o banca privada según tu perfil y objetivos.",
              icon: SparklesIcon,
            },
            {
              title: "Te acompañamos hasta la firma",
              body: "Si quieres avanzar, un asesor HabitaLibre te ayuda a pulir tu caso y a negociar con la entidad adecuada.",
              icon: ChatBubbleLeftRightIcon,
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              custom={i + 1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={fadeUp}
              className="flex flex-col rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.6)]"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-800/90">
                <item.icon className="h-5 w-5 text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-50">
                {item.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
                {item.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ====== Sección: Beneficios ====== */}
      <section
        id="beneficios"
        className="mx-auto max-w-6xl px-5 pb-20 md:px-6 lg:px-4"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
        >
          <h2 className="text-2xl font-semibold tracking-tight text-slate-50 md:text-[26px]">
            Beneficios de simular con HabitaLibre
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-[15px]">
            Todo está diseñado para que entiendas tu situación real, sin humo y
            sin letras pequeñas.
          </p>
        </motion.div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Comparación inteligente",
              body: "No solo mostramos un número: ordenamos VIS, VIP, BIESS y banca privada según cuánto sentido tiene para ti.",
              icon: SparklesIcon,
            },
            {
              title: "Sin afectar tu buró",
              body: "Trabajamos con datos declarativos. El análisis no deja huella en tu historial crediticio.",
              icon: ShieldCheckIcon,
            },
            {
              title: "Acompañamiento humano",
              body: "Detrás del simulador hay un equipo que te acompaña en el proceso de punta a punta, en lenguaje claro.",
              icon: ChatBubbleLeftRightIcon,
            },
            {
              title: "Enfoque en VIS y VIP",
              body: "Tomamos en cuenta subsidios, límites de precio y reglas específicas del segmento social.",
              icon: BanknotesIcon,
            },
            {
              title: "Visión a largo plazo",
              body: "Te mostramos qué pasa si cambia la tasa, el plazo o tus ingresos. No es solo un número de hoy.",
              icon: ChartBarIcon,
            },
            {
              title: "Cero compromiso",
              body: "Puedes usar el simulador todas las veces que quieras. Si todavía no es tu momento, igual sales con claridad.",
              icon: BoltIcon,
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              custom={i + 1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              variants={fadeUp}
              className="flex flex-col rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-800/80">
                <item.icon className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-50">
                {item.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
                {item.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
